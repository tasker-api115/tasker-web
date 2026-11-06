import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ZardButtonComponent } from '@/shared/components/button/button.component';
import { ZardEmptyComponent } from '@/shared/components/empty/empty.component';
@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink, ZardButtonComponent, ZardEmptyComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<p class="page-eyebrow">Error 404</p>
    <z-empty
      [zTitle]="title"
      zDescription="Revisa la dirección o vuelve a tu espacio de trabajo."
      [zActions]="[back]"
    />
    <ng-template #title><h1>No encontramos esta página</h1></ng-template>
    <ng-template #back
      ><a z-button zSize="lg" routerLink="/inicio">Volver al inicio</a></ng-template
    >`,
})
export class NotFoundPage {}
