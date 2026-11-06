import { InjectionToken } from '@angular/core';
import { environment } from '../../../environments/environment';
export const APP_SETTINGS = new InjectionToken<typeof environment>('APP_SETTINGS', {
  providedIn: 'root',
  factory: () => environment,
});
