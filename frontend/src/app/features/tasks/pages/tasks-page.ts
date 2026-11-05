import { Component } from '@angular/core';
import { PageHeading } from '../../../shared/components/page-heading/page-heading';
@Component({ selector: 'app-tasks-page', imports: [PageHeading], template: `
  <app-page-heading eyebrow="ESPACIO DE TRABAJO" heading="Tus tareas" description="Aquí podrás consultar y organizar tus pendientes." />
  <section class="empty-state"><span class="empty-icon" aria-hidden="true">☰</span><h2>Tu espacio está listo</h2><p>La creación y gestión de tareas estarán disponibles en una próxima entrega.</p><span class="badge">Próximamente</span></section>` })
export class TasksPage {}
