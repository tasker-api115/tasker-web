import { Component, input } from '@angular/core';
@Component({ selector: 'app-page-heading', template: `<p class="eyebrow">{{ eyebrow() }}</p><h1>{{ heading() }}</h1><p class="subtitle">{{ description() }}</p>` })
export class PageHeading {
  readonly eyebrow = input('TASKER');
  readonly heading = input.required<string>();
  readonly description = input('');
}
