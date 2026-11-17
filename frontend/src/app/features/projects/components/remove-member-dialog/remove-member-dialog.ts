import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';
import { ProjectMember } from '../../data/project-detail.model';
import { ProjectMembersService, RemoveMemberResult } from '../../data/project-members.service';

type RemoveFailure = Extract<RemoveMemberResult, { ok: false }>['reason'];

const REMOVE_ERROR_MESSAGES: Record<RemoveFailure, string> = {
  'not-authenticated': 'Tu sesión expiró. Inicia sesión de nuevo e inténtalo otra vez.',
  'not-configured': 'La conexión con Supabase no está configurada en este ambiente.',
  'not-allowed': 'Solo el propietario del proyecto puede quitar integrantes.',
  owner: 'El propietario no puede ser removido del proyecto.',
  'not-member': 'Esta persona ya no es integrante del proyecto.',
  partial:
    'Se quitaron sus asignaciones en las tareas, pero no se pudo quitar del proyecto. Inténtalo de nuevo.',
  unknown: 'No se pudo quitar al integrante. No se hizo ningún cambio. Inténtalo de nuevo.',
};

/** Confirmación para quitar un integrante y sus asignaciones (HU-51 / SCRUM-37). */
@Component({
  selector: 'app-remove-member-dialog',
  imports: [ZardDialogImports, ZardButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './remove-member-dialog.html',
  styleUrl: '../member-dialog.css',
})
export class RemoveMemberDialog {
  private readonly members = inject(ProjectMembersService);
  private wasOpen = false;

  readonly projectId = input.required<string>();
  readonly projectName = input('');
  readonly member = input<ProjectMember | null>(null);
  /** Visibilidad del modal, enlazable con `[(open)]`. */
  readonly open = model(false);
  /** Se emite con el integrante ya quitado en Supabase. */
  readonly removed = output<ProjectMember>();

  protected readonly removing = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly firstName = computed(
    () => this.member()?.name.trim().split(/\s+/)[0] || 'este integrante',
  );

  constructor() {
    effect(() => {
      const isOpen = this.open();
      untracked(() => {
        if (isOpen && !this.wasOpen) {
          this.errorMessage.set(null);
        }
        this.wasOpen = isOpen;
      });
    });
  }

  protected async confirm(): Promise<void> {
    const member = this.member();
    if (this.removing() || !member) {
      return;
    }
    this.removing.set(true);
    this.errorMessage.set(null);

    const result = await this.members.remove(this.projectId(), member.id);
    this.removing.set(false);

    // Si ya no era integrante, el resultado es el mismo que se buscaba: se refleja en la lista.
    if (result.ok || result.reason === 'not-member') {
      this.removed.emit(member);
      this.open.set(false);
      return;
    }
    this.errorMessage.set(REMOVE_ERROR_MESSAGES[result.reason]);
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
}
