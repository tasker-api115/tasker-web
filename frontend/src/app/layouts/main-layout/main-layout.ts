import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideHouse,
  lucideFolder,
  lucideSquareCheck,
  lucideCheck,
  lucideLogOut,
} from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
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
    ZardBadgeComponent,
  ],
  viewProviders: [
    provideIcons({ lucideHouse, lucideFolder, lucideSquareCheck, lucideCheck, lucideLogOut }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-layout.html',
})
export class MainLayout {
  protected readonly settings = inject(APP_SETTINGS);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly signingOut = signal(false);

  protected async signOut(): Promise<void> {
    this.signingOut.set(true);
    await this.auth.signOut();
    await this.router.navigateByUrl('/login');
    this.signingOut.set(false);
  }
}
