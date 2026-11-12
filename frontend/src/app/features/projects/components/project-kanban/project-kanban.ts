import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';

import { Project } from '../../data/project.model';

@Component({
  selector: 'app-project-kanban',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-kanban.html',
  styleUrl: '../project-detail-content.css',
})
export class ProjectKanban {
  readonly project = input.required<Project>();
}