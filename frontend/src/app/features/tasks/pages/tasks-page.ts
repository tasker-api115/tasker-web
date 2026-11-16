import { ChangeDetectionStrategy, Component } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideSquareCheck } from '@ng-icons/lucide';
import { ZardEmptyComponent } from '@/shared/components/empty/empty.component';
import { ZardBadgeComponent } from '@/shared/components/badge/badge.component';
import { PageHeading } from '@/shared/components/page-heading/page-heading';
@Component({
  selector: 'app-tasks-page',
  imports: [PageHeading, ZardEmptyComponent, ZardBadgeComponent, NgIcon],
  viewProviders: [provideIcons({ lucideSquareCheck })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-page-heading
      eyebrow="Espacio de trabajo"
      heading="Tus tareas"
      description="Aquí podrás consultar y organizar tus pendientes."
    />
    <z-empty
      [zTitle]="emptyTitle"
      zDescription="La creación y gestión de tareas estarán disponibles en una próxima entrega."
    >
      <ng-icon name="lucideSquareCheck" size="24" aria-hidden="true" />
      <z-badge zType="secondary">Próximamente</z-badge>
    </z-empty>
    <ng-template #emptyTitle><h2>Tu espacio está listo</h2></ng-template>
  `,
})
export class TasksPage {}
