#!/usr/bin/env bash
# Cambia el dominio del sitio en TODOS los archivos de una sola vez.
#
#   ./scripts/set-dominio.sh agrepaasfalcem.com
#   ./scripts/set-dominio.sh www.agrepaasfalcem.com
#
# Hace tres cosas:
#   1. Reemplaza la URL base actual por la nueva en index.html, 404.html,
#      robots.txt y sitemap.xml (canonical, Open Graph, JSON-LD, enlaces).
#   2. Escribe el archivo CNAME que GitHub Pages necesita para el dominio propio.
#   3. Actualiza la fecha <lastmod> del sitemap.
#
# Luego: git add -A && git commit -m "dominio propio" && git push
set -euo pipefail

cd "$(dirname "$0")/.."

if [ $# -ne 1 ]; then
  echo "Uso: $0 <dominio>   (ej: agrepaasfalcem.com)" >&2
  exit 1
fi

# Acepta "ejemplo.com" o "https://ejemplo.com"; normaliza a https sin barra final.
NUEVO_HOST="${1#http://}"; NUEVO_HOST="${NUEVO_HOST#https://}"; NUEVO_HOST="${NUEVO_HOST%/}"
NUEVA_BASE="https://${NUEVO_HOST}"

# La URL base actual se lee del canonical, para que el script sea repetible.
BASE_ACTUAL=$(sed -n 's|.*<link rel="canonical" href="\(https://[^"]*\)/".*|\1|p' index.html | head -1)
if [ -z "$BASE_ACTUAL" ]; then
  echo "No pude leer la URL base del <link rel=\"canonical\"> de index.html." >&2
  exit 1
fi

if [ "$BASE_ACTUAL" = "$NUEVA_BASE" ]; then
  echo "El sitio ya apunta a $NUEVA_BASE. Sin cambios."
  exit 0
fi

echo "Base actual : $BASE_ACTUAL"
echo "Base nueva  : $NUEVA_BASE"

for f in index.html 404.html robots.txt sitemap.xml; do
  [ -f "$f" ] || continue
  # El delimitador | es seguro: no aparece en URLs.
  sed -i.bak "s|${BASE_ACTUAL}|${NUEVA_BASE}|g" "$f"
  rm -f "$f.bak"
  echo "  actualizado: $f"
done

# GitHub Pages sirve el dominio propio a partir de este archivo.
printf '%s\n' "$NUEVO_HOST" > CNAME
echo "  escrito: CNAME -> $NUEVO_HOST"

HOY=$(date +%F)
sed -i.bak "s|<lastmod>[^<]*</lastmod>|<lastmod>${HOY}</lastmod>|" sitemap.xml
rm -f sitemap.xml.bak
echo "  sitemap lastmod -> $HOY"

RESTOS=$(grep -rl "$BASE_ACTUAL" --include='*.html' --include='*.xml' --include='*.txt' . 2>/dev/null || true)
if [ -n "$RESTOS" ]; then
  echo "AVISO: quedaron referencias a la base anterior en:" >&2
  echo "$RESTOS" >&2
  exit 1
fi

echo
echo "Listo. Ahora:"
echo "  git add -A && git commit -m 'Apuntar el sitio a ${NUEVO_HOST}' && git push"
echo "y en GitHub: Settings > Pages > Custom domain = ${NUEVO_HOST} (marcar Enforce HTTPS)."
