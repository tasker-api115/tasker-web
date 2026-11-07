-- Habilitar extensión para cifrado de contraseñas de prueba
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Crear Usuarios de prueba en auth.users (Requisito de Supabase)
INSERT INTO auth.users (id, instance_id, role, aud, email, encrypted_password, email_confirmed_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'propietario@test.com', crypt('TestAdmin123', gen_salt('bf')), now()),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'integrante@test.com', crypt('TestUser123', gen_salt('bf')), now()),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sinproyecto@test.com', crypt('TestNone123', gen_salt('bf')), now())
ON CONFLICT (id) DO NOTHING;

-- 2. Crear perfiles en public.usuario
INSERT INTO public.usuario (id_usuario, nombre, apellido)
VALUES
  ('11111111-1111-1111-1111-111111111111', 'Ana', 'Propietaria'),
  ('22222222-2222-2222-2222-222222222222', 'Luis', 'Integrante'),
  ('33333333-3333-3333-3333-333333333333', 'Carlos', 'Solitario')
ON CONFLICT (id_usuario) DO NOTHING;

-- 3. Crear 2 Proyectos
INSERT INTO public.proyecto (id_proyecto, id_usuario_propietario, nombre, descripcion)
VALUES
  ('aaaaa111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'Proyecto Alpha', 'Proyecto principal'),
  ('bbbbb222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Proyecto Beta', 'Proyecto secundario')
ON CONFLICT (id_proyecto) DO NOTHING;

-- 4. Asignar Miembros a los proyectos
INSERT INTO public.miembro_proyecto (id_proyecto, id_usuario, rol_proyecto)
VALUES
  ('aaaaa111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'administrador'),
  ('aaaaa111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'colaborador'),
  ('bbbbb222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'administrador')
ON CONFLICT (id_proyecto, id_usuario) DO NOTHING;

-- 5. Crear Tareas (1 pendiente/sin asignar, 1 en progreso/vencida, 1 completada)
INSERT INTO public.tarea (id_tarea, id_proyecto, numero_tarea, nombre, estado, fecha_fin)
VALUES
  ('cccc3333-3333-3333-3333-333333333333', 'aaaaa111-1111-1111-1111-111111111111', 1, 'Configurar repo', 'pendiente', CURRENT_DATE + INTERVAL '5 days'),
  ('dddd4444-4444-4444-4444-444444444444', 'aaaaa111-1111-1111-1111-111111111111', 2, 'Desarrollar login', 'en_progreso', CURRENT_DATE - INTERVAL '5 days'),
  ('eeee5555-5555-5555-5555-555555555555', 'bbbbb222-2222-2222-2222-222222222222', 1, 'Definir BD', 'completada', CURRENT_DATE)
ON CONFLICT (id_tarea) DO NOTHING;

-- 6. Asignar responsables a las tareas
INSERT INTO public.ejecuta (id_usuario, id_tarea, rol_tarea)
VALUES
  ('22222222-2222-2222-2222-222222222222', 'dddd4444-4444-4444-4444-444444444444', 'responsable'),
  ('11111111-1111-1111-1111-111111111111', 'eeee5555-5555-5555-5555-555555555555', 'responsable')
ON CONFLICT (id_usuario, id_tarea) DO NOTHING;
