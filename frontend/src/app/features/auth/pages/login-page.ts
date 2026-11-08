import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { AuthService } from '../../../core/auth/auth.service';

const INPUT_CLASSES =
  'h-9 w-full rounded-md border border-input bg-input/30 px-2.5 text-sm text-foreground ' +
  'placeholder:text-muted-foreground outline-none transition-colors ' +
  'focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 ' +
  'aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20';

@Component({
  selector: 'app-login-page',
  imports: [ReactiveFormsModule, ZardButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login-page.html',
})
export class LoginPage {
  private readonly fb = inject(FormBuilder).nonNullable;
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly inputClasses = INPUT_CLASSES;
  protected readonly loading = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly submitted = signal(false);

  protected readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  protected get emailInvalid(): boolean {
    const c = this.form.controls.email;
    return c.invalid && (c.touched || this.submitted());
  }

  protected get passwordInvalid(): boolean {
    const c = this.form.controls.password;
    return c.invalid && (c.touched || this.submitted());
  }

  protected async onSubmit(): Promise<void> {
    if (this.loading()) {
      return;
    }
    this.submitted.set(true);
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    const { email, password } = this.form.getRawValue();
    const result = await this.auth.signIn(email.trim(), password);
    this.loading.set(false);

    if (result.ok) {
      await this.router.navigateByUrl('/inicio');
      return;
    }
    this.errorMessage.set(
      result.reason === 'invalid-credentials'
        ? 'Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.'
        : 'No pudimos iniciar sesión. Inténtalo de nuevo en unos minutos.',
    );
  }
}