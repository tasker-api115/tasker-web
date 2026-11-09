import { Injectable, computed, inject, signal } from '@angular/core';
import { Session } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../supabase/supabase-client';

export type SignInResult =
  | { readonly ok: true }
  | {
      readonly ok: false;
      readonly reason: 'invalid-credentials' | 'not-configured' | 'unknown';
    };

export type SignUpResult =
  | {
      readonly ok: true;
      readonly requiresEmailConfirmation: boolean;
    }
  | {
      readonly ok: false;
      readonly message: string;
    };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly client = inject(SUPABASE_CLIENT);
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

  async signUp(
    fullName: string,
    email: string,
    password: string,
  ): Promise<SignUpResult> {
    if (!this.client) {
      return {
        ok: false,
        message: 'El servicio de registro no está configurado.',
      };
    }

    await this.ready;

    try {
      const { data, error } = await this.client.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
        },
      });

      if (error) {
        switch (error.code) {
          case 'user_already_exists':
          case 'email_exists':
            return {
              ok: false,
              message:
                'Este correo ya está registrado. Inicia sesión con tu cuenta.',
            };

          case 'weak_password':
            return {
              ok: false,
              message:
                'La contraseña no cumple los requisitos de seguridad del sistema. Usa una contraseña más larga y compleja.',
            };

          case 'email_address_invalid':
          case 'email_address_not_authorized':
            return {
              ok: false,
              message:
                'No podemos registrar este correo. Revisa la dirección o utiliza otra.',
            };

          case 'over_request_rate_limit':
          case 'over_email_send_rate_limit':
            return {
              ok: false,
              message:
                'Se realizaron demasiados intentos. Espera unos minutos antes de volver a intentarlo.',
            };

          case 'signup_disabled':
          case 'email_provider_disabled':
            return {
              ok: false,
              message:
                'El registro de nuevas cuentas no está disponible en este momento.',
            };

          default:
            return {
              ok: false,
              message:
                'No pudimos completar el registro. Inténtalo de nuevo en unos minutos.',
            };
        }
      }

      if (!data.user) {
        return {
          ok: false,
          message:
            'No pudimos confirmar el registro. Inténtalo de nuevo en unos minutos.',
        };
      }

      if (data.session) {
        this.sessionState.set(data.session);
      }

      return {
        ok: true,
        requiresEmailConfirmation: data.session === null,
      };
    } catch {
      return {
        ok: false,
        message:
          'No pudimos conectar con el servicio. Revisa tu conexión e inténtalo nuevamente.',
      };
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
