import { ProjectTask } from '../../projects/data/project-detail.model';

export interface TaskDraft {
  readonly name: string;
  readonly description: string | null;
  readonly startDate: string | null;
  readonly dueDate: string | null;
}

export interface CreatedProjectTask extends ProjectTask {
  readonly projectId: string;
}

export type CreateTaskResult =
  | {
      readonly ok: true;
      readonly task: CreatedProjectTask;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };