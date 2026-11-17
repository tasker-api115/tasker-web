import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  DOCUMENT,
  ElementRef,
  OnDestroy,
  ViewEncapsulation,
  inject,
  input,
  output,
  viewChild,
} from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePrinter } from '@ng-icons/lucide';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { TASK_STATUS_LABELS } from '../../../tasks/data/task.model';
import { ProjectDetail } from '../../data/project-detail.model';
import { ProjectReport, overdueLabel } from '../../data/project-report';
import { formatProjectDate } from '../../utils/format-project-date';

/** Clase en <html> mientras la vista está abierta: activa los estilos de impresión. */
const PRINTING_CLASS = 'tasker-printing';

/**
 * Vista de impresión del reporte (HU-37 / SCRUM-52), según el frame «Impresión» de HU-13.
 *
 * Muestra una hoja blanca con los datos del proyecto, el resumen y el listado completo. Al
 * imprimir (o «Guardar como PDF» del navegador) solo sale la hoja: los estilos `@media print`
 * ocultan la aplicación, la barra de la vista y los botones. Los estilos son globales
 * (encapsulación desactivada) porque deben alcanzar al documento completo; todas las clases
 * usan el prefijo `tasker-print-`.
 */
@Component({
  selector: 'app-project-report-print',
  imports: [NgIcon, ZardButtonComponent],
  viewProviders: [provideIcons({ lucidePrinter })],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './project-report-print.html',
  styleUrl: './project-report-print.css',
  host: {
    class: 'tasker-print-view',
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': 'tasker-print-title',
    '(document:keydown.escape)': 'closed.emit()',
  },
})
export class ProjectReportPrint implements AfterViewInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly title = viewChild<ElementRef<HTMLElement>>('viewTitle');

  readonly detail = input.required<ProjectDetail>();
  readonly report = input.required<ProjectReport>();
  readonly closed = output<void>();

  protected readonly labels = TASK_STATUS_LABELS;
  protected readonly formatDate = formatProjectDate;
  protected readonly overdueLabel = overdueLabel;
  /** La fecha de emisión se genera al abrir la vista. */
  protected readonly issuedAt = formatProjectDate(new Date().toLocaleDateString('en-CA'));

  constructor() {
    this.document.documentElement.classList.add(PRINTING_CLASS);
  }

  ngAfterViewInit(): void {
    this.title()?.nativeElement.focus();
  }

  ngOnDestroy(): void {
    this.document.documentElement.classList.remove(PRINTING_CLASS);
  }

  protected print(): void {
    this.document.defaultView?.print();
  }
}
