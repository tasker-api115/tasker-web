import { InjectionToken, inject } from '@angular/core';
import { SupabaseClient, createClient } from '@supabase/supabase-js';
import { APP_SETTINGS } from '../config/app-settings';

/**
 * Cliente único de Supabase para toda la aplicación.
 *
 * Autenticación y servicios de datos comparten esta instancia para usar la misma sesión.
 * Vale `null` cuando el ambiente no tiene URL o clave publicable configuradas.
 */
export const SUPABASE_CLIENT = new InjectionToken<SupabaseClient | null>('SUPABASE_CLIENT', {
  providedIn: 'root',
  factory: () => {
    const { supabaseUrl, supabasePublishableKey } = inject(APP_SETTINGS);
    if (!supabaseUrl || !supabasePublishableKey) {
      return null;
    }
    return createClient(supabaseUrl, supabasePublishableKey);
  },
});
