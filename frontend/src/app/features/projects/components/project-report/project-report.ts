import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideChartNoAxesCombined,
  lucideCircleAlert,
  lucidePrinter,
  lucideRefreshCcw,
} from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { TaskStatusBadge } from '../../../tasks/components/task-status-badge/task-status-badge';
import { TaskBoardService } from '../../../tasks/data/task-board.service';
import { ProjectDetail } from '../../data/project-detail.model';
import { buildProjectReport, overdueLabel } from '../../data/project-report';
import { formatProjectDate } from '../../utils/format-project-date';
import { ProjectReportPrint } from '../project-report-print/project-report-print';

/**
 * Reporte de tareas del proyecto (HU-36 / SCRUM-51), según los frames de HU-13.
 *
 * Usa las tareas guardadas en Supabase que también muestra el tablero: avance, recuentos por
 * estado, alerta de vencidas y tabla con tarea, responsable, estado, fecha límite y
 * vencimiento. «Imprimir reporte» abre la vista de impresión (HU-37).
 */
@Component({
  selector: 'app-project-report',
  imports: [NgIcon, ZardButtonComponent, TaskStatusBadge, ProjectReportPrint],
  viewProviders: [
    provideIcons({ lucideChartNoAxesCombined, lucideCircleAlert, lucidePrinter, lucideRefreshCcw }),
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-report.html',
  styleUrl: './project-report.css',
})
export class ProjectReport {
  private readonly store = inject(TaskBoardService);
  private readonly printButton = viewChild<string, ElementRef<HTMLButtonElement>>('printButton', {
    read: ElementRef,
  });

  readonly detail = input.required<ProjectDetail>();

  protected readonly status = this.store.status;
  protected readonly report = computed(() => buildProjectReport(this.store.tasks()));
  protected readonly overdueText = computed(() => overdueLabel(this.report().overdue));
  protected readonly formatDate = formatProjectDate;

  protected readonly printOpen = signal(false);

  protected openPrint(): void {
    this.printOpen.set(true);
  }

  protected closePrint(): void {
    this.printOpen.set(false);
    // Devuelve el foco al botón que abrió la vista de impresión.
    queueMicrotask(() => this.printButton()?.nativeElement.focus());
  }

  protected retry(): void {
    void this.store.loadByProject(this.detail().project.id);
  }
}
