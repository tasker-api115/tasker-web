import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideArrowRight, lucideFolder, lucideUsers, lucideSquareCheck } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardCardImports } from '@/shared/components/card/card.imports';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { PageHeading } from '@/shared/components/page-heading/page-heading';
@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    NgIcon,
    ZardButtonComponent,
    ZardCardImports,
    ZardBadgeComponent,
    PageHeading,
  ],
  viewProviders: [provideIcons({ lucideArrowRight, lucideFolder, lucideUsers, lucideSquareCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './home-page.html',
})
export class HomePage {}
