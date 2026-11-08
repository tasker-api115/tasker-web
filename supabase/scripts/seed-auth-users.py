"""Carga los datos ficticios de desarrollo mediante las API de Supabase."""

import argparse
from datetime import date, timedelta
import getpass
import json
import os
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

PASSWORD = "Tasker-Prueba2026!"
OWNER = "propietario@test.com"
MEMBER = "integrante@test.com"
USERS = (
    (OWNER, "Ana", "Propietaria", "TestAdmin123"),
    (MEMBER, "Luis", "Integrante", "TestUser123"),
    ("sinproyecto@test.com", "Carlos", "Solitario", "TestNone123"),
    ("ana@example.com", "Ana", None, PASSWORD),
    ("carlos@example.com", "Carlos", None, PASSWORD),
    ("maria@example.com", "María", None, PASSWORD),
)
ALPHA = "aaaaa111-1111-1111-1111-111111111111"
BETA = "bbbbb222-2222-2222-2222-222222222222"
LOGIN_TASK = "dddd4444-4444-4444-4444-444444444444"
DATABASE_TASK = "eeee5555-5555-5555-5555-555555555555"


class NoRedirects(HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


class Api:
    def __init__(self, url, key):
        self.url = url
        self.headers = {"apikey": key, "Content-Type": "application/json"}
        if not key.startswith("sb_secret_"):
            self.headers["Authorization"] = f"Bearer {key}"
        self.opener = build_opener(NoRedirects)

    def request(self, method, path, body=None, headers=None):
        request = Request(
            self.url + path,
            data=json.dumps(body).encode() if body is not None else None,
            headers={**self.headers, **(headers or {})}, method=method,
        )
        try:
            with self.opener.open(request, timeout=30) as response:
                payload = response.read()
                return json.loads(payload) if payload else None
        except HTTPError as error:
            # No imprimir claves, respuestas completas ni tokens de sesión.
            raise RuntimeError(f"{method} {path}: HTTP {error.code}") from None
        except URLError:
            raise RuntimeError("No se pudo conectar con Supabase.") from None


    def insert_missing(self, table, conflict, rows):
        self.request("POST", f"/rest/v1/{table}?on_conflict={conflict}", rows,
                     {"Prefer": "resolution=ignore-duplicates,return=minimal"})


def seed_users(api):
    # Comprobar el modelo antes de crear cuentas que necesiten perfiles.
    api.request("GET", "/rest/v1/usuario?select=id_usuario&limit=0")
    existing = {}
    page = 1
    while True:
        users = api.request("GET", f"/auth/v1/admin/users?page={page}&per_page=100")["users"]
        existing.update((u["email"].lower(), u) for u in users if u.get("email"))
        if len(users) < 100:
            break
        page += 1

    user_ids = {}
    for email, name, surname, password in USERS:
        user = existing.get(email)
        created = user is None
        if created:
            user = api.request("POST", "/auth/v1/admin/users", {
                "email": email, "password": password, "email_confirm": True,
                "user_metadata": {"nombre": name, "apellido": surname},
            })
        user_ids[email] = user["id"]
        api.insert_missing("usuario", "id_usuario", {
            "id_usuario": user["id"], "nombre": name, "apellido": surname,
        })
        profiles = api.request("GET", f"/rest/v1/usuario?id_usuario=eq.{user['id']}&select=id_usuario")
        if len(profiles) != 1:
            raise RuntimeError(f"No se pudo verificar el perfil de {email}.")
        print(f"{email}: {'cuenta creada' if created else 'cuenta existente'}; perfil verificado.")

    return user_ids


def seed(api):
    user_ids = seed_users(api)
    owner = user_ids[OWNER]
    member = user_ids[MEMBER]
    api.insert_missing("proyecto", "id_proyecto", [
        {"id_proyecto": ALPHA, "id_usuario_propietario": owner,
         "nombre": "Proyecto Alpha", "descripcion": "Proyecto principal"},
        {"id_proyecto": BETA, "id_usuario_propietario": owner,
         "nombre": "Proyecto Beta", "descripcion": "Proyecto secundario"},
    ])
    api.insert_missing("miembro_proyecto", "id_proyecto,id_usuario", [
        {"id_proyecto": ALPHA, "id_usuario": owner, "rol_proyecto": "administrador"},
        {"id_proyecto": ALPHA, "id_usuario": member, "rol_proyecto": "colaborador"},
        {"id_proyecto": BETA, "id_usuario": owner, "rol_proyecto": "administrador"},
    ])
    today = date.today()
    api.insert_missing("tarea", "id_tarea", [
        {"id_tarea": "cccc3333-3333-3333-3333-333333333333", "id_proyecto": ALPHA,
         "numero_tarea": 1, "nombre": "Configurar repo", "estado": "pendiente",
         "fecha_fin": (today + timedelta(days=5)).isoformat()},
        {"id_tarea": LOGIN_TASK, "id_proyecto": ALPHA,
         "numero_tarea": 2, "nombre": "Desarrollar login", "estado": "en_progreso",
         "fecha_fin": (today - timedelta(days=5)).isoformat()},
        {"id_tarea": DATABASE_TASK, "id_proyecto": BETA,
         "numero_tarea": 1, "nombre": "Definir BD", "estado": "completada",
         "fecha_fin": today.isoformat()},
    ])
    api.insert_missing("ejecuta", "id_usuario,id_tarea", [
        {"id_usuario": member, "id_tarea": LOGIN_TASK, "rol_tarea": "responsable"},
        {"id_usuario": owner, "id_tarea": DATABASE_TASK, "rol_tarea": "responsable"},
    ])
    print("Carga completada: usuarios, perfiles, proyectos, membresías, tareas y asignaciones.")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="http://127.0.0.1:54321")
    parser.add_argument("--allow-remote", action="store_true",
                        help="Permite cargar datos ficticios en un proyecto alojado de desarrollo.")
    args = parser.parse_args()
    url = args.url.rstrip("/")
    local = re.fullmatch(r"http://(127\.0\.0\.1|localhost):[0-9]+", url)
    remote = re.fullmatch(r"https://[a-z0-9]+\.supabase\.co", url)
    if not local and not (remote and args.allow_remote):
        parser.error("Usa una URL local o https://<ref>.supabase.co con --allow-remote.")
    key = os.environ.get("SUPABASE_SECRET_KEY") or getpass.getpass("Clave Secret del proyecto destino: ")
    if not key or key.startswith("sb_publishable_"):
        parser.error("Se necesita una clave Secret o service_role del proyecto destino.")
    try:
        seed(Api(url, key))
    except (RuntimeError, ValueError, KeyError) as error:
        print(f"No se completó la carga: {error}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
