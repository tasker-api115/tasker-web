import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideHouse, lucideSquareCheck, lucideCheck } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { APP_SETTINGS } from '../../core/config/app-settings';
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
  viewProviders: [provideIcons({ lucideHouse, lucideSquareCheck, lucideCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './main-layout.html',
})
export class MainLayout {
  protected readonly settings = inject(APP_SETTINGS);
}
