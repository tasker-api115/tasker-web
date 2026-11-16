import { ChangeDetectionStrategy, Component, input } from '@angular/core';
@Component({
  selector: 'app-page-heading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'page-heading' },
  template: `<p class="page-eyebrow">{{ eyebrow() }}</p>
    <h1>{{ heading() }}</h1>
    <p class="page-description">{{ description() }}</p>`,
})
export class PageHeading {
  readonly eyebrow = input('Tasker');
  readonly heading = input.required<string>();
  readonly description = input('');
}
