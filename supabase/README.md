# Datos semilla de desarrollo

HU-52 carga las cuentas mediante Supabase Auth Admin y los datos relacionados
mediante la API REST de Supabase. Ejecuta el script después de aplicar las
migraciones o reiniciar la base local.

Consulta el [procedimiento de carga y verificación](../docs/test-users.md).

## Autenticación y Registro (HU-54)

Para el correcto funcionamiento del registro de usuarios en el entorno de desarrollo, se han establecido las siguientes configuraciones en Supabase Auth:

- **Política de contraseñas:** La longitud mínima es de 6 caracteres (valor por defecto). No se exigen caracteres especiales.
- **Confirmación por correo (Confirm Email):** Se encuentra **desactivada temporalmente** en el entorno de desarrollo. Esto se debe a que el servidor SMTP por defecto de Supabase limita el envío a ~3 correos por hora, lo que bloquea las pruebas de QA y Frontend. El registro permite el acceso directo.
- **Privacidad (Identity Enumeration):** Si se intenta registrar un correo duplicado, Supabase no devuelve un error explícito por seguridad, simulando un registro exitoso.
- **Creación de perfil:** Un Trigger en PostgreSQL (`handle_new_user`) copia automáticamente el UUID y el nombre del usuario desde `auth.users` hacia `public.usuario` al registrarse.
