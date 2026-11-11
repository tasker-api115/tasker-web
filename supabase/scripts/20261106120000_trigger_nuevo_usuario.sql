-- Función que se ejecuta al insertar un nuevo usuario en auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.usuario (id_usuario, nombre)
  VALUES (
    new.id,
    -- Extrae el 'nombre completo' que el frontend envía en los metadatos.
    -- Si no viene, asigna un valor por defecto.
    COALESCE(new.raw_user_meta_data->>'full_name', 'Usuario Nuevo')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que vigila la tabla de autenticación
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
