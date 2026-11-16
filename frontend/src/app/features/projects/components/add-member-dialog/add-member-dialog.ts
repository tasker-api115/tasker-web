import {
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSearch, lucideUserPlus } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';
import { ZardFieldImports } from '@/shared/components/field/field.imports';
import { ZardInputComponent } from '@/shared/components/input/input.component';
import { ProjectMember } from '../../data/project-detail.model';
import {
  AddMemberResult,
  MemberCandidate,
  ProjectMembersService,
  SearchMemberResult,
} from '../../data/project-members.service';

type SearchFailure = Extract<SearchMemberResult, { ok: false }>['reason'];
type AddFailure = Extract<AddMemberResult, { ok: false }>['reason'];

/** Resultado visible de la última búsqueda. */
type SearchState =
  | { readonly kind: 'idle' }
  | { readonly kind: 'not-found' }
  | { readonly kind: 'duplicate'; readonly candidate: MemberCandidate }
  | { readonly kind: 'found'; readonly candidate: MemberCandidate };

const SEARCH_ERROR_MESSAGES: Record<SearchFailure, string> = {
  'not-authenticated': 'Tu sesión expiró. Inicia sesión de nuevo e inténtalo otra vez.',
  'not-configured': 'La conexión con Supabase no está configurada en este ambiente.',
  'not-allowed': 'Solo el propietario del proyecto puede agregar integrantes.',
  unknown: 'No se pudo realizar la búsqueda. Inténtalo de nuevo.',
};

const ADD_ERROR_MESSAGES: Record<Exclude<AddFailure, 'duplicate'>, string> = {
  'not-authenticated': 'Tu sesión expiró. Inicia sesión de nuevo. No se agregó a nadie.',
  'not-configured': 'La conexión con Supabase no está configurada en este ambiente.',
  'not-allowed':
    'Solo el propietario del proyecto puede agregar integrantes. No se agregó a nadie.',
  unknown: 'No se pudo agregar el integrante. No se agregó a nadie. Puedes volver a intentarlo.',
};

/**
 * Modal para agregar un integrante buscándolo por correo (HU-51 / SCRUM-37).
 *
 * Solo se puede agregar a usuarios ya registrados. El correo se valida al buscar y, desde
 * ese momento, en vivo (DESIGN.md). Si el correo cambia, el resultado anterior se descarta
 * para no agregar a una persona distinta de la que se escribió.
 */
@Component({
  selector: 'app-add-member-dialog',
  imports: [
    ReactiveFormsModule,
    NgIcon,
    ZardDialogImports,
    ZardButtonComponent,
    ZardFieldImports,
    ZardInputComponent,
  ],
  viewProviders: [provideIcons({ lucideSearch, lucideUserPlus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-member-dialog.html',
  styleUrl: '../member-dialog.css',
})
export class AddMemberDialog {
  private readonly members = inject(ProjectMembersService);
  private wasOpen = false;
  /** Evita que una búsqueda lenta pise el resultado de una más reciente. */
  private searchId = 0;

  readonly projectId = input.required<string>();
  readonly projectName = input('');
  /** Visibilidad del modal, enlazable con `[(open)]`. */
  readonly open = model(false);
  /** Se emite con el integrante ya guardado en Supabase. */
  readonly added = output<ProjectMember>();

  private readonly emailInput = viewChild('emailInput', {
    read: ElementRef<HTMLInputElement>,
  });

  protected readonly form = new FormGroup({
    email: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.email],
    }),
  });
  protected readonly email = this.form.controls.email;

  protected readonly submitted = signal(false);
  protected readonly searching = signal(false);
  protected readonly adding = signal(false);
  protected readonly result = signal<SearchState>({ kind: 'idle' });
  protected readonly errorMessage = signal<string | null>(null);

  /** Usuario encontrado, sea que se pueda agregar o que ya sea integrante. */
  protected readonly candidate = computed(() => {
    const state = this.result();
    return state.kind === 'found' || state.kind === 'duplicate' ? state.candidate : null;
  });

  constructor() {
    effect(() => {
      const isOpen = this.open();
      untracked(() => {
        if (isOpen && !this.wasOpen) {
          this.reset();
        }
        this.wasOpen = isOpen;
      });
    });

    // Un resultado solo vale para el correo con el que se buscó.
    this.email.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      this.searchId++;
      this.searching.set(false);
      if (this.result().kind !== 'idle') {
        this.result.set({ kind: 'idle' });
      }
      this.errorMessage.set(null);
    });
  }

  protected get emailInvalid(): boolean {
    return this.submitted() && this.email.invalid;
  }

  protected get emailErrorMessage(): string {
    return this.email.hasError('required')
      ? 'Ingresa el correo del usuario.'
      : 'Ingresa un correo válido, por ejemplo nombre@ejemplo.com.';
  }

  protected async search(): Promise<void> {
    if (this.searching() || this.adding()) {
      return;
    }
    this.submitted.set(true);
    this.errorMessage.set(null);

    if (this.email.invalid) {
      this.emailInput()?.nativeElement.focus();
      return;
    }

    const id = ++this.searchId;
    this.searching.set(true);
    const response = await this.members.search(this.projectId(), this.email.value);
    if (id !== this.searchId) {
      return;
    }
    this.searching.set(false);

    if (!response.ok) {
      this.result.set({ kind: 'idle' });
      this.errorMessage.set(SEARCH_ERROR_MESSAGES[response.reason]);
      return;
    }

    const candidate = response.candidate;
    this.result.set(
      !candidate
        ? { kind: 'not-found' }
        : candidate.isMember
          ? { kind: 'duplicate', candidate }
          : { kind: 'found', candidate },
    );
  }

  protected async add(): Promise<void> {
    const state = this.result();
    if (state.kind !== 'found' || this.adding()) {
      return;
    }
    this.adding.set(true);
    this.errorMessage.set(null);

    const response = await this.members.add(this.projectId(), state.candidate);
    this.adding.set(false);

    if (response.ok) {
      this.added.emit(response.member);
      this.open.set(false);
      return;
    }

    if (response.reason === 'duplicate') {
      // Otra sesión lo agregó mientras tanto: se informa igual que en la búsqueda.
      this.result.set({ kind: 'duplicate', candidate: { ...state.candidate, isMember: true } });
      return;
    }
    this.errorMessage.set(ADD_ERROR_MESSAGES[response.reason]);
  }

  protected initials(name: string): string {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part.charAt(0))
      .join('')
      .toLocaleUpperCase('es');
  }

  private reset(): void {
    this.searchId++;
    this.email.reset('', { emitEvent: false });
    this.submitted.set(false);
    this.searching.set(false);
    this.adding.set(false);
    this.result.set({ kind: 'idle' });
    this.errorMessage.set(null);
  }
}
