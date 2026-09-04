import re

with open('equipo.html', 'r') as f:
    content = f.read()

# Look for data-nombre="...", data-cargo="...", data-tel="...", data-mail="..."
matches = re.findall(r'data-nombre="(.*?)"\s+data-cargo="(.*?)"\s+data-tel="(.*?)"\s+data-e164=".*?"\s+data-mail="(.*?)"', content)

for m in matches:
    print(f"- Nombre: {m[0]}\n  Cargo: {m[1]}\n  Teléfono: {m[2]}\n  Correo: {m[3]}\n")

