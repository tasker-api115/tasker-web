import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { PageHeading } from '../../../shared/components/page-heading/page-heading';
@Component({ selector: 'app-home-page', imports: [RouterLink, PageHeading], template: `
  <app-page-heading eyebrow="TU ESPACIO, EN ORDEN" heading="Cada gran idea empieza con un paso." description="Bienvenido a Tasker. Este será tu espacio para organizar tareas y avanzar en tus proyectos." />
  <section class="hero-card" aria-labelledby="start-title">
    <div><span class="badge">Comienza aquí</span><h2 id="start-title">Haz espacio para lo importante.</h2><p>Explora la sección de tareas y conoce tu nuevo espacio de trabajo.</p><a class="button" routerLink="/tareas">Explorar tareas <span aria-hidden="true">→</span></a></div>
    <div class="hero-symbol" aria-hidden="true">✓</div>
  </section>
  <section class="info-grid" aria-label="Acerca del espacio">
    <article class="card"><span class="step">01</span><h2>Organiza</h2><p>Un espacio dedicado a tus próximas tareas.</p></article>
    <article class="card"><span class="step">02</span><h2>Enfócate</h2><p>Una interfaz sencilla para encontrar lo que necesitas.</p></article>
    <article class="card"><span class="step">03</span><h2>Avanza</h2><p>Las funciones de gestión llegarán en próximas entregas.</p></article>
  </section>` })
export class HomePage {}
