import { ChangeDetectionStrategy, Component, input, model } from '@angular/core';

/** Integrante que se puede elegir como responsable. */
export interface AssignableMember {
  readonly id: string;
  readonly name: string;
}

@Component({
  selector: 'app-assignee-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <fieldset class="m-0 flex flex-col gap-2 border-0 p-0" [disabled]="disabled()">
      <legend class="mb-2 p-0 text-sm font-medium">{{ label() }}</legend>

      @if (members().length === 0) {
        <p class="text-sm text-muted-foreground">
          El proyecto todavía no tiene integrantes para asignar.
        </p>
      } @else {
        <ul class="m-0 flex max-h-48 list-none flex-col gap-1 overflow-y-auto rounded-md border p-2">
          @for (member of members(); track member.id) {
            <li>
              <label
                class="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  class="size-4 accent-primary"
                  [checked]="selected().includes(member.id)"
                  (change)="toggle(member.id, $event)"
                />
                {{ member.name }}
              </label>
            </li>
          }
        </ul>

        <p class="text-xs text-muted-foreground" aria-live="polite">
          @switch (selected().length) {
            @case (0) { Sin responsables seleccionados. }
            @case (1) { 1 responsable seleccionado. }
            @default { {{ selected().length }} responsables seleccionados. }
          }
        </p>
      }
    </fieldset>
  `,
})
export class AssigneePicker {
  readonly members = input.required<readonly AssignableMember[]>();
  readonly selected = model<readonly string[]>([]);
  readonly disabled = input(false);
  readonly label = input('Responsables');

  protected toggle(id: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.selected.update((ids) =>
      checked ? (ids.includes(id) ? ids : [...ids, id]) : ids.filter((value) => value !== id),
    );
  }
}