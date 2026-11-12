import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { ProjectMember } from '../../data/project-detail.model';

@Component({
  selector: 'app-project-members',
  standalone: true,
  imports: [NgIcon, ZardButtonComponent, ZardBadgeComponent],
  viewProviders: [provideIcons({ lucideUserPlus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-members.html', 
  styleUrl: '../project-detail-content.css',
})
export class ProjectMembers {
  readonly members = input.required<readonly ProjectMember[]>();
  readonly isOwner = input(false);

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