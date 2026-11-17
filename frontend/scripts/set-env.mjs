import { writeFileSync } from 'node:fs';

const { SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY } = process.env;

if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  console.error('Faltan SUPABASE_URL o SUPABASE_PUBLISHABLE_KEY');
  process.exit(1);
}

const targetPath = new URL('../src/environments/environment.ts', import.meta.url);

const content = `// Archivo generado durante el build de Vercel (scripts/set-env.mjs). No editar a mano.
// Configuración pública: nunca colocar contraseñas o claves privadas aquí.
export const environment = {
  production: true,
  appName: 'Tasker',
  supabaseUrl: ${JSON.stringify(SUPABASE_URL)},
  supabasePublishableKey: ${JSON.stringify(SUPABASE_PUBLISHABLE_KEY)},
} as const;
`;

writeFileSync(targetPath, content);
console.log('environment.ts generado para producción.');
