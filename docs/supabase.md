# Configuración de Supabase — SCRUM-17

## Configuración versionada

El directorio `supabase/` se regeneró desde cero con `npx supabase init`
(Supabase CLI 3.0.0). `config.toml` contiene la configuración local generada.
Esta inicialización no crea un proyecto alojado ni vincula el repositorio al panel.
El SQL anterior se eliminó por solicitud del responsable; las nuevas migraciones
se incorporarán en la historia de base de datos correspondiente.

## Proyecto alojado y accesos del equipo

1. Crear o seleccionar el proyecto del equipo en el panel de Supabase.
2. Invitar a los integrantes mediante la gestión de miembros de la organización,
   con el rol y alcance mínimos disponibles según el plan. Cada integrante usa
   su propia cuenta; no se comparte la contraseña del propietario.
3. Cada integrante acepta la invitación y verifica que puede abrir el proyecto.
4. Obtener la URL y la clave pública publishable desde las opciones de conexión
   y API Keys del proyecto. Compartir los valores por el canal privado del equipo.

## Variables individuales

Desde la raíz del repositorio:

```bash
cp .env.example .env
```

| Variable | Uso |
| --- | --- |
| `SUPABASE_URL` | URL de la API del proyecto seleccionado. |
| `SUPABASE_PUBLISHABLE_KEY` | Clave pública para el cliente; requiere políticas RLS correctas. |
| `SUPABASE_PROJECT_REF` | Identificador del proyecto para vincular el CLI. |

El archivo `.env` está ignorado por Git. La aplicación Angular todavía no está
inicializada en esta rama: estas variables documentan el contrato de configuración,
pero Angular no carga `.env` automáticamente. Su integración debe realizarse al
configurar el frontend.

No colocar contraseñas de PostgreSQL, tokens personales, claves secretas ni
`service_role` en Angular o en archivos versionados. Si el CLI necesita una
contraseña de base de datos, introducirla en su solicitud interactiva. Cada
integrante utiliza su propio inicio de sesión del CLI.

## Vinculación y comprobación remota

```bash
npx supabase login
npx supabase link --project-ref <project-ref>
```

Reemplazar `<project-ref>` con el identificador del proyecto real. La vinculación
se guarda en `supabase/.temp/`, excluido de Git. No ejecuta migraciones.
Para comprobar la API desde desarrollo, cargar los valores de `.env` en la sesión
de shell y ejecutar:

```bash
curl --fail --silent --show-error "$SUPABASE_URL/auth/v1/health" \
  -H "apikey: $SUPABASE_PUBLISHABLE_KEY"
```

Una respuesta HTTP satisfactoria verifica el acceso al servicio Auth; no demuestra
las políticas RLS ni los permisos de las tablas. Registrar el resultado sin claves
ni encabezados sensibles en la evidencia de Jira.

## Entorno local opcional

Con Docker instalado, iniciado y accesible para el usuario:

```bash
npx supabase start
npx supabase status
```

Usar las URL y claves locales que muestre el CLI para trabajar con ese entorno.
Son distintas de las del proyecto alojado. La configuración generada usa el puerto
3000 para redirecciones de Auth; ajustarlo cuando se defina la URL del frontend.
La migración inicial del modelo está en `supabase/migrations/`. Para crear las tres
cuentas ficticias en Auth y sus perfiles, seguir [Usuarios de prueba](test-users.md).
La carga es manual por entorno; un commit no copia usuarios locales al proyecto alojado.

## Verificaciones y pendientes

- Realizado: regeneración con `npx supabase init`.
- `npx supabase status` falló por falta de permisos sobre `/var/run/docker.sock`;
  no se verificó la conexión local.
- El CLI no tiene proyecto remoto vinculado (`linked_project: null`).
- Pendiente de evidencia: proyecto alojado creado, invitaciones aceptadas,
  acceso de cada integrante al panel, distribución privada de configuración y
  comprobación de conexión remota. No se consideran completados estos criterios.

Referencias: [desarrollo local](https://supabase.com/docs/guides/local-development/cli/getting-started),
[vinculación y migraciones](https://supabase.com/docs/guides/local-development/cli-workflows)
y [claves de API](https://supabase.com/docs/guides/api/api-keys).
