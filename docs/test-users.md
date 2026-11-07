# Datos semilla de desarrollo — HU-52

Los usuarios de Auth creados localmente no se sincronizan con supabase.com al
hacer commit, push o desplegar migraciones. Cada entorno mantiene sus cuentas.
El script crea las cuentas mediante Supabase Auth Admin y usa la API REST
para cargar perfiles, proyectos, membresías, tareas y asignaciones. Las
relaciones usan los UUID de usuario devueltos por Auth en el entorno destino.

## Ejecutar desde la raíz del repositorio

Requisito: Python 3 y la migración inicial del modelo de datos aplicada en el
destino. Para local, iniciar antes `npx supabase start`. Después de
`npx supabase db reset`, volver a ejecutar el script para cargar los datos.

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
| propietario@test.com | Ana Propietaria | TestAdmin123 |
| integrante@test.com | Luis Integrante | TestUser123 |
| sinproyecto@test.com | Carlos Solitario | TestNone123 |
| ana@example.com | Ana | Tasker-Prueba2026! |
| carlos@example.com | Carlos | Tasker-Prueba2026! |
| maria@example.com | María | Tasker-Prueba2026! |

Las cuentas nuevas tienen el correo confirmado. Al repetir la carga se reutilizan
los correos existentes sin cambiar su contraseña, confirmación ni metadatos.
Las filas existentes se conservan. Si una operación falla, las anteriores
pueden haber quedado guardadas. Corrige el problema y repite la carga.
Las cuentas que ya existían mantienen sus credenciales, incluso si se cargaron
mediante el procedimiento anterior.

Estos datos corresponden a desarrollo (HU-52), no a evidencias de QA (HU-53).
No ejecutar en producción. El script no está conectado al despliegue automático
ni se incluye en migraciones de esquema.

## Comprobar en el proyecto destino

En **Authentication → Users**, verifica los seis correos. En **Table Editor**,
comprueba que cada cuenta tenga su perfil en `usuario` y que Ana Propietaria
sea dueña de Proyecto Alpha y Proyecto Beta. Luis Integrante debe figurar como
colaborador de Alpha y responsable de la tarea vencida «Desarrollar login».
«Configurar repo» queda sin asignar y «Definir BD» queda completada y asignada
a Ana Propietaria. Carlos Solitario no debe tener proyectos en un entorno limpio.

Referencias: [crear usuarios con Auth](https://supabase.com/docs/reference/javascript/auth-admin-createuser)
y [claves de API](https://supabase.com/docs/guides/api/api-keys).
