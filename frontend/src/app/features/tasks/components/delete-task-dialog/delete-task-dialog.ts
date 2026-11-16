import {
  ChangeDetectionStrategy,
  Component,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
} from '@angular/core';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardDialogImports } from '@/shared/components/dialog/dialog.imports';
import { Task } from '../../data/task.model';
import { DeleteTaskResult, TaskBoardService } from '../../data/task-board.service';

type DeleteTaskFailure = Extract<DeleteTaskResult, { ok: false }>['reason'];

const DELETE_ERROR_MESSAGES: Record<DeleteTaskFailure, string> = {
  'not-configured': 'La conexión con Supabase no está configurada en este ambiente.',
  'not-allowed': 'No se pudo eliminar: la tarea ya no existe o no tienes permiso.',
  'has-dependencies': 'No se pudo eliminar: otras tareas dependen de esta.',
  unknown: 'No se pudo eliminar la tarea. Inténtalo de nuevo.',
};

/** Confirmación para eliminar una tarea (HU-29 / SCRUM-42). */
@Component({
  selector: 'app-delete-task-dialog',
  imports: [ZardDialogImports, ZardButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './delete-task-dialog.html',
})
export class DeleteTaskDialog {
  private readonly board = inject(TaskBoardService);
  private wasOpen = false;

  readonly task = input<Task | null>(null);
  readonly open = model(false);
  /** Se emite con la tarea ya eliminada en Supabase. */
  readonly deleted = output<Task>();

  protected readonly deleting = signal(false);
  protected readonly deleteError = signal<string | null>(null);

  constructor() {
    // Cada vez que el modal se abre, se limpia el error anterior.
    effect(() => {
      const isOpen = this.open();
      untracked(() => {
        if (isOpen && !this.wasOpen) {
          this.deleteError.set(null);
        }
        this.wasOpen = isOpen;
      });
    });
  }

  protected async confirm(): Promise<void> {
    const task = this.task();
    if (this.deleting() || !task) {
      return;
    }
    this.deleting.set(true);
    this.deleteError.set(null);

    const result = await this.board.remove(task.id);
    this.deleting.set(false);

    if (result.ok) {
      this.deleted.emit(task);
      this.open.set(false);
      return;
    }
    this.deleteError.set(DELETE_ERROR_MESSAGES[result.reason]);
  }
}