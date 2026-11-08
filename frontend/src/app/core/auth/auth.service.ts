import { Injectable, computed, inject, signal } from '@angular/core';
import { Session, SupabaseClient, createClient } from '@supabase/supabase-js';
import { APP_SETTINGS } from '../config/app-settings';

export type SignInResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: 'invalid-credentials' | 'not-configured' | 'unknown';
    };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly settings = inject(APP_SETTINGS);
  private readonly client: SupabaseClient | null = this.createSupabaseClient();
  private readonly sessionState = signal<Session | null>(null);

  readonly session = this.sessionState.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionState() !== null);

  /** Se resuelve cuando ya se sabe si hay una sesión guardada (la usa la guarda de rutas). */
  readonly ready: Promise<void> = this.restoreSession();

  async signIn(email: string, password: string): Promise<SignInResult> {
    if (!this.client) {
      return { ok: false, reason: 'not-configured' };
    }
    try {
      const { error } = await this.client.auth.signInWithPassword({ email, password });
      if (!error) {
        return { ok: true };
      }
      return {
        ok: false,
        reason: error.code === 'invalid_credentials' ? 'invalid-credentials' : 'unknown',
      };
    } catch {
      return { ok: false, reason: 'unknown' };
    }
  }

  async signOut(): Promise<void> {
    if (this.client) {
      try {
        await this.client.auth.signOut();
      } catch {
        // Aunque falle la red, se limpia la sesión local de abajo.
      }
    }
    this.sessionState.set(null);
  }

  private createSupabaseClient(): SupabaseClient | null {
    const { supabaseUrl, supabasePublishableKey } = this.settings;
    if (!supabaseUrl || !supabasePublishableKey) {
      return null;
    }
    return createClient(supabaseUrl, supabasePublishableKey);
  }

  private async restoreSession(): Promise<void> {
    if (!this.client) {
      return;
    }
    try {
      const { data } = await this.client.auth.getSession();
      this.sessionState.set(data.session);
    } catch {
      this.sessionState.set(null);
    }
    this.client.auth.onAuthStateChange((_event, session) => {
      this.sessionState.set(session);
    });
  }
}