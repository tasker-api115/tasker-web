## 🌱 Datos Semilla (Desarrollo)

Para contar con datos realistas durante el desarrollo sin afectar producción, utilizamos el archivo `seed.sql`.

**Cómo ejecutar la carga:**
1. Ingresa a la plataforma web de Supabase y selecciona el proyecto de **Desarrollo** (nunca el de Producción).
2. Ve a la sección **SQL Editor** en el menú lateral.
3. Abre un nuevo query (`New query`).
4. Copia todo el contenido del archivo `seed.sql` de este repositorio y pégalo en el editor.
5. Haz clic en **Run** (Ejecutar).

**Cómo reiniciar o actualizar los datos:**
El script es seguro e idempotente. Si alguien borra un registro por error y necesitas recuperar los datos semilla, simplemente vuelve a ejecutar el script completo en el SQL Editor. No creará duplicados ni arrojará errores gracias a las reglas `ON CONFLICT DO NOTHING`.
