import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
@Component({ selector: 'app-not-found-page', imports: [RouterLink], template: `<section class="empty-state"><p class="eyebrow">ERROR 404</p><h1>No encontramos esta página</h1><p>Revisa la dirección o vuelve a tu espacio de trabajo.</p><a class="button" routerLink="/inicio">Volver al inicio</a></section>` })
export class NotFoundPage {}
