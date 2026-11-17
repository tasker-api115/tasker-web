import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';

import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { ProjectMember } from '../../data/project-detail.model';
import { AddMemberDialog } from '../add-member-dialog/add-member-dialog';
import { RemoveMemberDialog } from '../remove-member-dialog/remove-member-dialog';

/**
 * Integrantes del proyecto. Todos ven la lista; solo el propietario puede agregar o quitar
 * (HU-51 / SCRUM-37). RLS y las funciones de Supabase vuelven a validar cada cambio.
 */
@Component({
  selector: 'app-project-members',
  standalone: true,
  imports: [NgIcon, ZardButtonComponent, ZardBadgeComponent, AddMemberDialog, RemoveMemberDialog],
  viewProviders: [provideIcons({ lucideUserPlus })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-members.html',
  styleUrl: '../project-detail-content.css',
})
export class ProjectMembers {
  readonly projectId = input.required<string>();
  readonly projectName = input('');
  readonly members = input.required<readonly ProjectMember[]>();
  readonly isOwner = input(false);

  readonly memberAdded = output<ProjectMember>();
  readonly memberRemoved = output<ProjectMember>();

  protected readonly addOpen = signal(false);
  protected readonly removeOpen = signal(false);
  protected readonly removingMember = signal<ProjectMember | null>(null);

  /** Integrante recién agregado: se resalta para ubicarlo en la lista. */
  protected readonly highlightedId = signal<string | null>(null);

  protected openAdd(): void {
    this.addOpen.set(true);
  }

  protected openRemove(member: ProjectMember): void {
    this.removingMember.set(member);
    this.removeOpen.set(true);
  }

  protected onAdded(member: ProjectMember): void {
    this.highlightedId.set(member.id);
    this.memberAdded.emit(member);
  }

  protected onRemoved(member: ProjectMember): void {
    if (this.highlightedId() === member.id) {
      this.highlightedId.set(null);
    }
    this.memberRemoved.emit(member);
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
