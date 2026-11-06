SET local check_function_bodies = off;

CREATE SCHEMA "tasker_privado";

CREATE TABLE "public"."dependencia_tarea" (
  "id_tarea"             uuid NOT NULL,
  "id_tarea_predecesora" uuid NOT NULL,
  CONSTRAINT "dependencia_tarea_check" CHECK ((id_tarea <> id_tarea_predecesora)),
  CONSTRAINT "dependencia_tarea_pkey" PRIMARY KEY (id_tarea, id_tarea_predecesora)
);

ALTER TABLE "public"."dependencia_tarea"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."dependencia_tarea" FROM "anon";

CREATE TABLE "public"."ejecuta" (
  "id_usuario"       uuid                     NOT NULL,
  "id_tarea"         uuid                     NOT NULL,
  "fecha_asignacion" timestamp with time zone NOT NULL DEFAULT now(),
  "rol_tarea"        text                     NOT NULL,
  CONSTRAINT "ejecuta_pkey" PRIMARY KEY (id_usuario, id_tarea),
  CONSTRAINT "ejecuta_rol_tarea_check" CHECK ((rol_tarea = ANY (ARRAY['responsable'::text, 'colaborador'::text])))
);

ALTER TABLE "public"."ejecuta"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."ejecuta" FROM "anon";

CREATE TABLE "public"."miembro_proyecto" (
  "id_proyecto"  uuid                     NOT NULL,
  "id_usuario"   uuid                     NOT NULL,
  "rol_proyecto" text                     NOT NULL,
  "fecha_union"  timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "miembro_proyecto_pkey" PRIMARY KEY (id_proyecto, id_usuario),
  CONSTRAINT "miembro_proyecto_rol_proyecto_check" CHECK ((rol_proyecto = ANY (ARRAY['administrador'::text, 'colaborador'::text])))
);

ALTER TABLE "public"."miembro_proyecto"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."miembro_proyecto" FROM "anon";

CREATE TABLE "public"."proyecto" (
  "id_proyecto"            uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "id_usuario_propietario" uuid                     NOT NULL,
  "nombre"                 text                     NOT NULL,
  "descripcion"            text,
  "fecha_inicio"           date,
  "fecha_fin"              date,
  "created_at"             timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"             timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "proyecto_fechas_check" CHECK ((fecha_fin >= fecha_inicio)),
  CONSTRAINT "proyecto_pkey" PRIMARY KEY (id_proyecto)
);

ALTER TABLE "public"."proyecto"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."proyecto" FROM "anon";

CREATE TABLE "public"."tarea" (
  "id_tarea"     uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "id_proyecto"  uuid                     NOT NULL,
  "numero_tarea" integer                  NOT NULL,
  "nombre"       text                     NOT NULL,
  "descripcion"  text,
  "fecha_inicio" date,
  "fecha_fin"    date,
  "estado"       text                     NOT NULL DEFAULT 'pendiente'::text,
  "prioridad"    text                     NOT NULL DEFAULT 'media'::text,
  "complejidad"  text,
  "created_at"   timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at"   timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "tarea_complejidad_check" CHECK ((complejidad = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text]))),
  CONSTRAINT "tarea_estado_check" CHECK ((estado = ANY (ARRAY['pendiente'::text, 'en_progreso'::text, 'en_revision'::text, 'completada'::text, 'cancelada'::text]))),
  CONSTRAINT "tarea_fechas_check" CHECK ((fecha_fin >= fecha_inicio)),
  CONSTRAINT "tarea_id_proyecto_numero_tarea_key" UNIQUE (id_proyecto, numero_tarea),
  CONSTRAINT "tarea_numero_tarea_check" CHECK ((numero_tarea > 0)),
  CONSTRAINT "tarea_pkey" PRIMARY KEY (id_tarea),
  CONSTRAINT "tarea_prioridad_check" CHECK ((prioridad = ANY (ARRAY['baja'::text, 'media'::text, 'alta'::text, 'urgente'::text])))
);

ALTER TABLE "public"."tarea"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."tarea" FROM "anon";

CREATE TABLE "public"."usuario" (
  "id_usuario" uuid                     NOT NULL,
  "nombre"     text                     NOT NULL,
  "apellido"   text,
  "avatar_url" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT now(),
  "updated_at" timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT "usuario_pkey" PRIMARY KEY (id_usuario)
);

ALTER TABLE "public"."usuario"
  ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON TABLE "public"."usuario" FROM "anon";

CREATE OR REPLACE FUNCTION tasker_privado.accede_tarea (
  p_tarea uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
    SELECT EXISTS (SELECT 1 FROM public.tarea t
      WHERE t.id_tarea = p_tarea AND tasker_privado.es_miembro(t.id_proyecto));
$function$;

CREATE OR REPLACE FUNCTION tasker_privado.administra (
  p_proyecto uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
    SELECT tasker_privado.es_propietario(p_proyecto) OR EXISTS (
      SELECT 1 FROM public.miembro_proyecto WHERE id_proyecto = p_proyecto
      AND id_usuario = (SELECT auth.uid()) AND rol_proyecto = 'administrador');
$function$;

CREATE OR REPLACE FUNCTION tasker_privado.asegurar_propietario()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
BEGIN
    INSERT INTO public.miembro_proyecto(id_proyecto, id_usuario, rol_proyecto)
    VALUES (NEW.id_proyecto, NEW.id_usuario_propietario, 'administrador')
    ON CONFLICT (id_proyecto, id_usuario) DO UPDATE SET rol_proyecto = 'administrador';
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION tasker_privado.auditoria()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SET search_path TO ''
  AS $function$
BEGIN
    NEW.created_at := OLD.created_at;
    NEW.updated_at := clock_timestamp();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION tasker_privado.comparte_proyecto (
  p_usuario uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
    SELECT EXISTS (SELECT 1 FROM public.miembro_proyecto a
      JOIN public.miembro_proyecto b USING (id_proyecto)
      WHERE a.id_usuario = (SELECT auth.uid()) AND b.id_usuario = p_usuario);
$function$;

CREATE OR REPLACE FUNCTION tasker_privado.es_miembro (
  p_proyecto uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
    SELECT EXISTS (SELECT 1 FROM public.miembro_proyecto
      WHERE id_proyecto = p_proyecto AND id_usuario = (SELECT auth.uid()));
$function$;

CREATE OR REPLACE FUNCTION tasker_privado.es_propietario (
  p_proyecto uuid
)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
    SELECT EXISTS (SELECT 1 FROM public.proyecto
      WHERE id_proyecto = p_proyecto AND id_usuario_propietario = (SELECT auth.uid()));
$function$;

CREATE OR REPLACE FUNCTION tasker_privado.validar_asignacion()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE proyecto uuid;
BEGIN
    -- Bloquear la tarea evita que cambie de proyecto durante la validación.
    SELECT id_proyecto INTO proyecto FROM public.tarea WHERE id_tarea = NEW.id_tarea FOR SHARE;
    -- La FK compuesta conceptual se valida y bloquea para impedir retirar al miembro.
    PERFORM 1 FROM public.miembro_proyecto
      WHERE id_proyecto = proyecto AND id_usuario = NEW.id_usuario FOR KEY SHARE;
    IF NOT FOUND THEN
        RAISE EXCEPTION 'El usuario asignado debe ser miembro del proyecto de la tarea.';
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION tasker_privado.validar_dependencia()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE proyecto uuid; proyecto_predecesora uuid;
BEGIN
    -- Serializar escrituras del grafo; evita ciclos por inserciones simultáneas.
    -- Diseñado para el aislamiento READ COMMITTED predeterminado de Supabase.
    PERFORM pg_catalog.pg_advisory_xact_lock(726153, 1);
    IF TG_OP = 'DELETE' THEN RETURN OLD; END IF;
    IF TG_OP = 'UPDATE' AND (NEW.id_tarea <> OLD.id_tarea OR
      NEW.id_tarea_predecesora <> OLD.id_tarea_predecesora) THEN
        RAISE EXCEPTION 'Para cambiar una dependencia, elimine la relación y cree otra.';
    END IF;
    SELECT id_proyecto INTO proyecto FROM public.tarea WHERE id_tarea = NEW.id_tarea FOR SHARE;
    SELECT id_proyecto INTO proyecto_predecesora FROM public.tarea
      WHERE id_tarea = NEW.id_tarea_predecesora FOR SHARE;
    IF proyecto IS NULL OR proyecto_predecesora IS NULL OR proyecto <> proyecto_predecesora THEN
        RAISE EXCEPTION 'Ambas tareas deben existir y pertenecer al mismo proyecto.';
    END IF;
    IF NEW.id_tarea = NEW.id_tarea_predecesora THEN
        RAISE EXCEPTION 'Una tarea no puede depender de sí misma.';
    END IF;
    IF EXISTS (
      WITH RECURSIVE cadena(id) AS (
        SELECT NEW.id_tarea_predecesora
        UNION
        SELECT d.id_tarea_predecesora FROM public.dependencia_tarea d
          JOIN cadena c ON d.id_tarea = c.id
      ) SELECT 1 FROM cadena WHERE id = NEW.id_tarea
    ) THEN
        RAISE EXCEPTION 'La dependencia produciría un ciclo.';
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION tasker_privado.validar_miembro()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
DECLARE propietario uuid;
BEGIN
    IF TG_OP = 'UPDATE' AND (NEW.id_usuario <> OLD.id_usuario OR NEW.id_proyecto <> OLD.id_proyecto) THEN
        RAISE EXCEPTION 'Las claves de membresía son inmutables; elimine y cree la membresía.';
    END IF;
    IF TG_OP = 'INSERT' THEN
        PERFORM 1 FROM public.proyecto WHERE id_proyecto = NEW.id_proyecto FOR UPDATE;
        RETURN NEW;
    END IF;
    SELECT id_usuario_propietario INTO propietario FROM public.proyecto
      WHERE id_proyecto = OLD.id_proyecto FOR UPDATE;
    -- En el CASCADE de eliminación de un proyecto su fila ya no existe.
    IF propietario = OLD.id_usuario AND
      (TG_OP = 'DELETE' OR NEW.rol_proyecto <> 'administrador') THEN
        RAISE EXCEPTION 'El propietario debe conservar su membresía de administrador.';
    END IF;
    IF TG_OP = 'DELETE' THEN
        IF EXISTS (SELECT 1 FROM public.ejecuta e JOIN public.tarea t USING (id_tarea)
          WHERE e.id_usuario = OLD.id_usuario AND t.id_proyecto = OLD.id_proyecto) THEN
            RAISE EXCEPTION 'Retire las asignaciones del usuario antes de eliminar su membresía.';
        END IF;
        RETURN OLD;
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION tasker_privado.validar_proyecto()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
BEGIN
    IF NEW.id_proyecto <> OLD.id_proyecto THEN RAISE EXCEPTION 'id_proyecto es inmutable.'; END IF;
    IF NEW.id_usuario_propietario <> OLD.id_usuario_propietario
      AND auth.uid() IS NOT NULL AND auth.uid() <> OLD.id_usuario_propietario THEN
        RAISE EXCEPTION 'Solo el propietario puede transferir la propiedad.';
    END IF;
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION tasker_privado.validar_tarea()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.id_tarea <> OLD.id_tarea THEN
        RAISE EXCEPTION 'id_tarea es inmutable.';
    END IF;
    IF TG_OP = 'UPDATE' AND NEW.id_proyecto <> OLD.id_proyecto THEN
        IF EXISTS (SELECT 1 FROM public.ejecuta WHERE id_tarea = OLD.id_tarea)
          OR EXISTS (SELECT 1 FROM public.dependencia_tarea
             WHERE id_tarea = OLD.id_tarea OR id_tarea_predecesora = OLD.id_tarea) THEN
            RAISE EXCEPTION 'Retire asignaciones y dependencias antes de cambiar el proyecto de la tarea.';
        END IF;
    END IF;
    RETURN NEW;
END;
$function$;

ALTER TABLE "public"."miembro_proyecto"
  ADD CONSTRAINT "miembro_proyecto_id_proyecto_fkey" FOREIGN KEY (id_proyecto) REFERENCES public.proyecto(id_proyecto) ON DELETE CASCADE;

ALTER TABLE "public"."tarea"
  ADD CONSTRAINT "tarea_id_proyecto_fkey" FOREIGN KEY (id_proyecto) REFERENCES public.proyecto(id_proyecto) ON DELETE RESTRICT;

ALTER TABLE "public"."dependencia_tarea"
  ADD CONSTRAINT "dependencia_tarea_id_tarea_fkey" FOREIGN KEY (id_tarea) REFERENCES public.tarea(id_tarea) ON DELETE RESTRICT;

ALTER TABLE "public"."dependencia_tarea"
  ADD CONSTRAINT "dependencia_tarea_id_tarea_predecesora_fkey" FOREIGN KEY (id_tarea_predecesora) REFERENCES public.tarea(id_tarea) ON DELETE RESTRICT;

ALTER TABLE "public"."ejecuta"
  ADD CONSTRAINT "ejecuta_id_tarea_fkey" FOREIGN KEY (id_tarea) REFERENCES public.tarea(id_tarea) ON DELETE CASCADE;

ALTER TABLE "public"."usuario"
  ADD CONSTRAINT "usuario_id_usuario_fkey" FOREIGN KEY (id_usuario) REFERENCES auth.users(id) ON DELETE RESTRICT;

ALTER TABLE "public"."ejecuta"
  ADD CONSTRAINT "ejecuta_id_usuario_fkey" FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE RESTRICT;

ALTER TABLE "public"."miembro_proyecto"
  ADD CONSTRAINT "miembro_proyecto_id_usuario_fkey" FOREIGN KEY (id_usuario) REFERENCES public.usuario(id_usuario) ON DELETE RESTRICT;

ALTER TABLE "public"."proyecto"
  ADD CONSTRAINT "proyecto_id_usuario_propietario_fkey" FOREIGN KEY (id_usuario_propietario) REFERENCES public.usuario(id_usuario) ON DELETE RESTRICT;

CREATE INDEX dependencia_predecesora_idx ON public.dependencia_tarea USING btree (id_tarea_predecesora);

CREATE INDEX ejecuta_tarea_idx ON public.ejecuta USING btree (id_tarea);

CREATE INDEX miembro_proyecto_usuario_idx ON public.miembro_proyecto USING btree (id_usuario);

CREATE INDEX proyecto_propietario_idx ON public.proyecto USING btree (id_usuario_propietario);

CREATE INDEX tarea_estado_idx ON public.tarea USING btree (estado);

CREATE TRIGGER dependencia_validar
  BEFORE INSERT OR DELETE OR UPDATE ON public.dependencia_tarea
  FOR EACH ROW
  EXECUTE FUNCTION tasker_privado.validar_dependencia();

CREATE TRIGGER ejecuta_validar
  BEFORE INSERT OR UPDATE ON public.ejecuta
  FOR EACH ROW
  EXECUTE FUNCTION tasker_privado.validar_asignacion();

CREATE TRIGGER miembro_validar
  BEFORE INSERT OR DELETE OR UPDATE ON public.miembro_proyecto
  FOR EACH ROW
  EXECUTE FUNCTION tasker_privado.validar_miembro();

CREATE TRIGGER proyecto_asegurar_propietario
  AFTER INSERT OR UPDATE OF id_usuario_propietario ON public.proyecto
  FOR EACH ROW
  EXECUTE FUNCTION tasker_privado.asegurar_propietario();

CREATE TRIGGER proyecto_auditoria
  BEFORE UPDATE ON public.proyecto
  FOR EACH ROW
  EXECUTE FUNCTION tasker_privado.auditoria();

CREATE TRIGGER proyecto_validar
  BEFORE UPDATE ON public.proyecto
  FOR EACH ROW
  EXECUTE FUNCTION tasker_privado.validar_proyecto();

CREATE TRIGGER tarea_auditoria
  BEFORE UPDATE ON public.tarea
  FOR EACH ROW
  EXECUTE FUNCTION tasker_privado.auditoria();

CREATE TRIGGER tarea_validar
  BEFORE UPDATE ON public.tarea
  FOR EACH ROW
  EXECUTE FUNCTION tasker_privado.validar_tarea();

CREATE TRIGGER usuario_auditoria
  BEFORE UPDATE ON public.usuario
  FOR EACH ROW
  EXECUTE FUNCTION tasker_privado.auditoria();

CREATE POLICY "dependencia_tarea_acceso" ON "public"."dependencia_tarea"
  FOR ALL
  TO "authenticated"
  USING ((tasker_privado.accede_tarea(id_tarea) AND tasker_privado.accede_tarea(id_tarea_predecesora)))
  WITH CHECK ((tasker_privado.accede_tarea(id_tarea) AND tasker_privado.accede_tarea(id_tarea_predecesora)));

CREATE POLICY "ejecuta_acceso" ON "public"."ejecuta"
  FOR ALL
  TO "authenticated"
  USING (tasker_privado.accede_tarea(id_tarea))
  WITH CHECK (tasker_privado.accede_tarea(id_tarea));

CREATE POLICY "miembro_delete" ON "public"."miembro_proyecto"
  FOR DELETE
  TO "authenticated"
  USING (tasker_privado.es_propietario(id_proyecto));

CREATE POLICY "miembro_insert" ON "public"."miembro_proyecto"
  FOR INSERT
  TO "authenticated"
  WITH CHECK (tasker_privado.es_propietario(id_proyecto));

CREATE POLICY "miembro_leer" ON "public"."miembro_proyecto"
  FOR SELECT
  TO "authenticated"
  USING (tasker_privado.es_miembro(id_proyecto));

CREATE POLICY "miembro_update" ON "public"."miembro_proyecto"
  FOR UPDATE
  TO "authenticated"
  USING (tasker_privado.es_propietario(id_proyecto))
  WITH CHECK (tasker_privado.es_propietario(id_proyecto));

CREATE POLICY "proyecto_crear" ON "public"."proyecto"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((id_usuario_propietario = ( SELECT auth.uid() AS uid)));

CREATE POLICY "proyecto_editar" ON "public"."proyecto"
  FOR UPDATE
  TO "authenticated"
  USING (tasker_privado.administra(id_proyecto))
  WITH CHECK (tasker_privado.administra(id_proyecto));

CREATE POLICY "proyecto_eliminar" ON "public"."proyecto"
  FOR DELETE
  TO "authenticated"
  USING (tasker_privado.es_propietario(id_proyecto));

CREATE POLICY "proyecto_leer" ON "public"."proyecto"
  FOR SELECT
  TO "authenticated"
  USING ((tasker_privado.es_miembro(id_proyecto) OR (id_usuario_propietario = ( SELECT auth.uid() AS uid))));

CREATE POLICY "tarea_acceso" ON "public"."tarea"
  FOR ALL
  TO "authenticated"
  USING (tasker_privado.es_miembro(id_proyecto))
  WITH CHECK (tasker_privado.es_miembro(id_proyecto));

CREATE POLICY "usuario_crear" ON "public"."usuario"
  FOR INSERT
  TO "authenticated"
  WITH CHECK ((id_usuario = ( SELECT auth.uid() AS uid)));

CREATE POLICY "usuario_editar" ON "public"."usuario"
  FOR UPDATE
  TO "authenticated"
  USING ((id_usuario = ( SELECT auth.uid() AS uid)))
  WITH CHECK ((id_usuario = ( SELECT auth.uid() AS uid)));

CREATE POLICY "usuario_leer" ON "public"."usuario"
  FOR SELECT
  TO "authenticated"
  USING (((id_usuario = ( SELECT auth.uid() AS uid)) OR tasker_privado.comparte_proyecto(id_usuario)));

REVOKE ALL ON FUNCTION "tasker_privado"."accede_tarea"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "tasker_privado"."accede_tarea"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "tasker_privado"."administra"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "tasker_privado"."administra"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "tasker_privado"."asegurar_propietario"() FROM PUBLIC;

REVOKE ALL ON FUNCTION "tasker_privado"."auditoria"() FROM PUBLIC;

REVOKE ALL ON FUNCTION "tasker_privado"."comparte_proyecto"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "tasker_privado"."comparte_proyecto"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "tasker_privado"."es_miembro"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "tasker_privado"."es_miembro"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "tasker_privado"."es_propietario"(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION "tasker_privado"."es_propietario"(uuid) TO "authenticated";

REVOKE ALL ON FUNCTION "tasker_privado"."validar_asignacion"() FROM PUBLIC;

REVOKE ALL ON FUNCTION "tasker_privado"."validar_dependencia"() FROM PUBLIC;

REVOKE ALL ON FUNCTION "tasker_privado"."validar_miembro"() FROM PUBLIC;

REVOKE ALL ON FUNCTION "tasker_privado"."validar_proyecto"() FROM PUBLIC;

REVOKE ALL ON FUNCTION "tasker_privado"."validar_tarea"() FROM PUBLIC;

GRANT USAGE ON SCHEMA "tasker_privado" TO "authenticated";

REVOKE ALL ON TABLE "public"."dependencia_tarea" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."dependencia_tarea" TO "authenticated";

REVOKE ALL ON TABLE "public"."dependencia_tarea" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."dependencia_tarea" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."dependencia_tarea" TO "service_role";

REVOKE ALL ON TABLE "public"."ejecuta" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."ejecuta" TO "authenticated";

REVOKE ALL ON TABLE "public"."ejecuta" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ejecuta" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."ejecuta" TO "service_role";

REVOKE ALL ON TABLE "public"."miembro_proyecto" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."miembro_proyecto" TO "authenticated";

REVOKE ALL ON TABLE "public"."miembro_proyecto" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."miembro_proyecto" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."miembro_proyecto" TO "service_role";

REVOKE ALL ON TABLE "public"."proyecto" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."proyecto" TO "authenticated";

REVOKE ALL ON TABLE "public"."proyecto" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."proyecto" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."proyecto" TO "service_role";

REVOKE ALL ON TABLE "public"."tarea" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."tarea" TO "authenticated";

REVOKE ALL ON TABLE "public"."tarea" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tarea" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."tarea" TO "service_role";

REVOKE ALL ON TABLE "public"."usuario" FROM "authenticated";

GRANT DELETE, INSERT, SELECT, UPDATE ON TABLE "public"."usuario" TO "authenticated";

REVOKE ALL ON TABLE "public"."usuario" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."usuario" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."usuario" TO "service_role";
