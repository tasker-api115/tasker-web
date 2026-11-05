import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { APP_SETTINGS } from '../../core/config/app-settings';
@Component({ selector: 'app-main-layout', imports: [RouterLink, RouterLinkActive, RouterOutlet], templateUrl: './main-layout.html' })
export class MainLayout { protected readonly settings = inject(APP_SETTINGS); }
