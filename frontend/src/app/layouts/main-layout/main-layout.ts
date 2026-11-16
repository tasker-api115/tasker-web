import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideLogOut } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { APP_SETTINGS } from '../../core/config/app-settings';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-main-layout',
  imports: [
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
    NgIcon,
    ZardButtonComponent,
  ],
  viewProviders: [provideIcons({ lucideLogOut })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
})
export class MainLayout {
  protected readonly settings = inject(APP_SETTINGS);

  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly signingOut = signal(false);
  protected readonly signOutError = signal<string | null>(null);

  protected readonly displayName = computed(() => {
    const user = this.auth.session()?.user;

    // El registro que implementamos guarda el nombre en full_name.
    const fullName: unknown = user?.user_metadata?.['full_name'];

    if (typeof fullName === 'string' && fullName.trim()) {
      return fullName.trim();
    }

    return 'Mi cuenta';
  });

  protected async signOut(): Promise<void> {
    if (this.signingOut()) {
      return;
    }

    this.signingOut.set(true);
    this.signOutError.set(null);

    try {
      await this.auth.signOut();
      await this.router.navigateByUrl('/login', { replaceUrl: true });
    } catch {
      this.signOutError.set(
        'No pudimos completar el cierre de sesión. Inténtalo nuevamente.',
      );
    } finally {
      this.signingOut.set(false);
    }
  }
}