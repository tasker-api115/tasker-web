import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {
  FormBuilder,
  ReactiveFormsModule,
  Validators,
  type ValidatorFn,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { AuthService } from '../../../core/auth/auth.service';

const INPUT_CLASSES =
  'h-9 w-full rounded-md border border-input bg-input/30 px-2.5 text-sm text-foreground ' +
  'placeholder:text-muted-foreground outline-none transition-colors ' +
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ' +
  'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20';

const passwordsMatchValidator: ValidatorFn = (control) => {
  const password = control.get('password')?.value;
  const confirmation = control.get('confirmPassword')?.value;

  if (!password || !confirmation) {
    return null;
  }

  return password === confirmation ? null : { passwordMismatch: true };
};

type RegisterField = 'fullName' | 'email' | 'password' | 'confirmPassword';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink, ZardButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register-page.html',
})
export class RegisterPage {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly inputClasses = INPUT_CLASSES;
  protected readonly loading = signal(false);
  protected readonly submitted = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  protected readonly form = this.fb.group(
    {
      fullName: ['', [Validators.required, Validators.pattern(/\S/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      confirmPassword: ['', [Validators.required]],
    },
    {
      validators: passwordsMatchValidator,
    },
  );

  protected isInvalid(field: RegisterField): boolean {
    const control = this.form.controls[field];

    return control.invalid && (control.touched || this.submitted());
  }

  protected get confirmationInvalid(): boolean {
    const control = this.form.controls.confirmPassword;

    return (
      (control.invalid || this.form.hasError('passwordMismatch')) &&
      (control.touched || this.submitted())
    );
  }

  protected async onSubmit(): Promise<void> {
    if (this.loading()) {
      return;
    }

    this.submitted.set(true);
    this.errorMessage.set(null);

    // Normalizar estos campos antes de validarlos.
    // Las contraseñas se conservan exactamente como fueron escritas.
    this.form.patchValue({
      fullName: this.form.controls.fullName.value.trim(),
      email: this.form.controls.email.value.trim(),
    });

    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    try {
      const { fullName, email, password } = this.form.getRawValue();
      const result = await this.auth.signUp(fullName, email, password);

      if (!result.ok) {
        this.errorMessage.set(result.message);
        return;
      }

      this.form.reset();

      if (result.requiresEmailConfirmation) {
        await this.router.navigate(['/login'], {
          queryParams: { registro: 'confirmar' },
          replaceUrl: true,
        });
        return;
      }

      await this.router.navigateByUrl('/inicio', { replaceUrl: true });
    } catch {
      this.errorMessage.set(
        'No pudimos completar la operación. Si ya creaste tu cuenta, intenta iniciar sesión.',
      );
    } finally {
      this.loading.set(false);
    }
  }
}