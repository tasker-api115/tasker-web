-- HU-51 (SCRUM-37): perfiles y correos completos para buscar integrantes.
--
-- La búsqueda de integrantes usa public.usuario.correo, y un integrante debe
-- existir en public.usuario (miembro_proyecto_id_usuario_fkey). Este script:
--   1. Hace que el trigger de registro guarde también el correo.
--   2. Crea el perfil de las cuentas que no lo tienen (creadas antes del trigger).
--   3. Completa el correo de los perfiles que lo tienen vacío.
--
-- Es idempotente: se puede ejecutar varias veces sin duplicar ni sobrescribir.
-- Requiere la columna creada en 20261113000002_hu51_gestionar_integrantes.sql.

-- 1. Trigger de registro: mismo comportamiento que HU-54, más el correo --------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuario (id_usuario, nombre, correo)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuario Nuevo'),
    new.email
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 2. Perfiles faltantes ---------------------------------------------------------
INSERT INTO public.usuario (id_usuario, nombre, correo)
SELECT
    au.id,
    COALESCE(
        NULLIF(trim(au.raw_user_meta_data->>'full_name'), ''),
        NULLIF(split_part(au.email, '@', 1), ''),
        'Usuario Nuevo'
    ),
    au.email
FROM auth.users au
LEFT JOIN public.usuario u ON u.id_usuario = au.id
WHERE u.id_usuario IS NULL;

-- 3. Correos vacíos -------------------------------------------------------------
UPDATE public.usuario u
SET correo = au.email
FROM auth.users au
WHERE au.id = u.id_usuario
  AND (u.correo IS NULL OR trim(u.correo) = '');
