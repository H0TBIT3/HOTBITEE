# Configuración de Supabase

La tienda usa Supabase Auth para iniciar sesión y Supabase Database para compartir disponibilidad y ventas entre dispositivos. La clave `anon`/publishable del navegador es pública; la seguridad depende de las políticas RLS de `supabase-schema.sql`. Nunca pongas una clave `service_role` en el sitio.

## Preparar el proyecto

1. Crea un proyecto en Supabase y espera a que la base de datos esté lista.
2. En **SQL Editor**, ejecuta el contenido de `supabase-schema.sql`.
3. En **Authentication → Users**, crea el usuario administrador con su correo y contraseña. Desactiva el registro público si no necesitas más usuarios.
4. Copia el UUID de ese usuario y autorízalo en **SQL Editor**:

   ```sql
   insert into public.admin_users (user_id)
   values ('UUID_DEL_USUARIO')
   on conflict (user_id) do nothing;
   ```

5. En **Project Settings → API**, copia el Project URL y la clave `anon`/publishable a `supabase-config.js`:

   ```js
   window.HOTBITE_SUPABASE_CONFIG = Object.freeze({
     url: "https://TU-PROYECTO.supabase.co",
     anonKey: "TU_CLAVE_ANON_O_PUBLISHABLE"
   });
   ```

6. Publica los archivos del sitio por HTTPS. Abre `admin.html` y entra con el correo y la contraseña creados en Supabase.

La disponibilidad actualizada se consulta en la tienda y se sincroniza en tiempo real cuando el navegador está conectado. Las ventas se guardan y consultan en la base de datos compartida.

Los registros guardados por la versión local anterior permanecen en el almacenamiento del navegador donde se crearon; no se migran automáticamente a Supabase.
