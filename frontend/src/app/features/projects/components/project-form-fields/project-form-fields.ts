import { ChangeDetectionStrategy, Component, DOCUMENT, inject, input } from '@angular/core';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';
import { ZardFieldImports } from '@/shared/components/field/field.imports';
import { ZardInputComponent } from '@/shared/components/input/input.component';
import { ZardTextareaComponent } from '@/shared/components/textarea/textarea.component';
import { ProjectForm } from '../project-form/project-form';

/**
 * Campos del proyecto (nombre, descripción y fechas) con sus errores y la alerta de guardado.
 *
 * Lo usan los modales de crear y editar. Los errores se muestran después del primer intento
 * de envío (`submitted`) y se corrigen en vivo, como pide DESIGN.md.
 */
@Component({
  selector: 'app-project-form-fields',
  imports: [ReactiveFormsModule, ZardFieldImports, ZardInputComponent, ZardTextareaComponent],
  // Los `formControlName` se registran en el `<form [formGroup]>` del modal que contiene estos campos.
  viewProviders: [
    { provide: ControlContainer, useFactory: () => inject(ControlContainer, { skipSelf: true }) },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-form-fields.html',
  styleUrl: './project-form-fields.css',
})
export class ProjectFormFields {
  private readonly document = inject(DOCUMENT);

  readonly form = input.required<ProjectForm>();
  /** Prefijo de los `id`, para que los modales de crear y editar no compartan identificadores. */
  readonly idPrefix = input.required<string>();
  readonly submitted = input(false);
  readonly saveError = input<string | null>(null);

  protected get nameInvalid(): boolean {
    return this.submitted() && this.form().controls.name.invalid;
  }

  protected get dateRangeInvalid(): boolean {
    return this.submitted() && this.form().hasError('dateRange');
  }

  protected id(field: string): string {
    return `${this.idPrefix()}-${field}`;
  }

  /** Lleva el foco al primer campo con error tras un envío inválido. */
  focusFirstInvalid(): void {
    const form = this.form();
    const field = form.controls.name.invalid
      ? 'name'
      : form.hasError('dateRange')
        ? 'end-date'
        : null;
    if (field) {
      this.document.getElementById(this.id(field))?.focus();
    }
  }
}
