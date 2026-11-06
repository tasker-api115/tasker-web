"""Crea cuentas ficticias de desarrollo mediante las API de Supabase."""

import argparse
import getpass
import json
import os
import re
import sys
from urllib.error import HTTPError, URLError
from urllib.request import HTTPRedirectHandler, Request, build_opener

USERS = (("ana@example.com", "Ana"), ("carlos@example.com", "Carlos"),
         ("maria@example.com", "María"))
PASSWORD = "Tasker-Prueba2026!"


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


def seed(api):
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

    for email, name in USERS:
        user = existing.get(email)
        created = user is None
        if created:
            user = api.request("POST", "/auth/v1/admin/users", {
                "email": email, "password": PASSWORD, "email_confirm": True,
                "user_metadata": {"nombre": name},
            })
        api.request("POST", "/rest/v1/usuario?on_conflict=id_usuario", {
            "id_usuario": user["id"], "nombre": name,
        }, {"Prefer": "resolution=ignore-duplicates,return=minimal"})
        profiles = api.request("GET", f"/rest/v1/usuario?id_usuario=eq.{user['id']}&select=id_usuario")
        if len(profiles) != 1:
            raise RuntimeError(f"No se pudo verificar el perfil de {email}.")
        print(f"{email}: {'cuenta creada' if created else 'cuenta existente'}; perfil verificado.")


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
