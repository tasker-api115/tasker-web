import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-project-kanban',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './project-kanban.html',
  styleUrl: '../project-detail-content.css',
})
export class ProjectKanban {}