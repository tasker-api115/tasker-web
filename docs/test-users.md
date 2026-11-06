# Usuarios ficticios de desarrollo — HU-52

Los usuarios de Auth creados localmente no se sincronizan con supabase.com al
hacer commit, push o desplegar migraciones. Cada entorno mantiene sus cuentas.
Este procedimiento crea las mismas cuentas mediante la API administrativa de
Auth y sus perfiles en `public.usuario`, utilizando los UUID de cada entorno.
No inserta directamente en `auth.users` ni `auth.identities`.

## Ejecutar desde la raíz del repositorio

Requisito: Python 3 y la migración inicial del modelo de datos aplicada en el
destino. Para local, iniciar antes `npx supabase start`.

```bash
python3 supabase/scripts/seed-auth-users.py
```

Para el proyecto alojado **de desarrollo o pruebas**, indicar su URL explícita:

```bash
python3 supabase/scripts/seed-auth-users.py \
  --url https://<project-ref>.supabase.co --allow-remote
```

El script solicita de forma oculta la clave Secret del proyecto destino. También
acepta `SUPABASE_SECRET_KEY` como variable de entorno. Soporta claves secretas
modernas y `service_role` antiguas. No guardar claves en Git ni en Angular.

| Correo ficticio | Nombre | Contraseña inicial de prueba |
| --- | --- | --- |
| ana@example.com | Ana | Tasker-Prueba2026! |
| carlos@example.com | Carlos | Tasker-Prueba2026! |
| maria@example.com | María | Tasker-Prueba2026! |

Las cuentas nuevas tienen el correo confirmado. Al repetir la carga se reutilizan
los correos existentes sin cambiar su contraseña, confirmación ni metadatos.
Los perfiles existentes tampoco se sobrescriben. Si una operación falla, las
anteriores pueden haber quedado guardadas; corregir el problema y repetir.

Estos datos corresponden a desarrollo (HU-52), no a evidencias de QA (HU-53).
No ejecutar en producción. El script no está conectado al despliegue automático
ni se incluye en migraciones de esquema.

## Comprobar en el proyecto destino

Abrir **Authentication → Users** y buscar los tres correos. En SQL Editor:

```sql
SELECT a.email, a.email_confirmed_at, u.id_usuario, u.nombre
FROM auth.users AS a
LEFT JOIN public.usuario AS u ON u.id_usuario = a.id
WHERE a.email IN (
  'ana@example.com', 'carlos@example.com', 'maria@example.com'
);
```

Deben aparecer tres cuentas y sus respectivos perfiles. Esto comprueba la carga,
no sustituye una prueba de inicio de sesión ni la validación de las políticas RLS.

Referencias: [crear usuarios con Auth](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
y [claves de API](https://supabase.com/docs/guides/api/api-keys).
