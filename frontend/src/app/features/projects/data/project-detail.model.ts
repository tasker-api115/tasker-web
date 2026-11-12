import { Project } from './project.model';

export interface ProjectMember {
  readonly id: string;
  readonly name: string;
  readonly email: string | null;
  readonly role: 'Propietario' | 'Integrante';
}

export interface ProjectTask {
  readonly id: string;
  readonly number: number;
  readonly name: string;
  readonly status: string;
  readonly priority: string;
  readonly endDate: string | null;
}

export interface ProjectDetail {
  readonly project: Project;
  readonly ownerName: string;
  readonly members: readonly ProjectMember[];
  readonly tasks: readonly ProjectTask[];
}

export type ProjectDetailResult =
  | { readonly ok: true; readonly detail: ProjectDetail }
  | {
      readonly ok: false;
      readonly reason: 'not-configured' | 'unavailable' | 'unknown';
    };