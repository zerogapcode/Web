with open("privacidad.html", "r") as f:
    lines = f.readlines()

start = -1
end = -1
for i, line in enumerate(lines):
    if '<main id="top">' in line:
        start = i
    if '</main>' in line:
        end = i
        break

new_main = """<main id="top">
  <section class="sec wrap">
    <div class="sec-head">
      <span class="eyebrow">Legal</span>
      <h2>Políticas de Privacidad</h2>
      <p>Última actualización: Septiembre 2026</p>
    </div>
    
    <div style="max-width: 800px; color: var(--ink-2); font-size: 16px; display: flex; flex-direction: column; gap: 24px;">
      
      <div>
        <h3 style="color: var(--ink); margin-bottom: 12px; font-size: 24px;">1. Información que recopilamos</h3>
        <p>En Condo, recopilamos información personal mínima y estrictamente necesaria para la correcta administración y operatividad de tu condominio. Esta información puede incluir:</p>
        <ul style="margin-top: 10px; margin-left: 20px; display: flex; flex-direction: column; gap: 8px;">
          <li><b>Datos de cuenta:</b> Nombre, correo electrónico y número de teléfono de los residentes.</li>
          <li><b>Datos de la unidad:</b> Número de casa o departamento y coeficiente de participación.</li>
          <li><b>Datos de visitantes:</b> Nombres de los visitantes o personal recurrente autorizados mediante pases QR.</li>
        </ul>
      </div>

      <div>
        <h3 style="color: var(--ink); margin-bottom: 12px; font-size: 24px;">2. Uso de la información</h3>
        <p>La información recopilada se utiliza exclusivamente para:</p>
        <ul style="margin-top: 10px; margin-left: 20px; display: flex; flex-direction: column; gap: 8px;">
          <li>Permitir el acceso a la plataforma (app y panel administrativo).</li>
          <li>Distribuir cuotas y mantener un registro transparente de las finanzas del condominio.</li>
          <li>Generar y validar pases de acceso QR en la garita.</li>
          <li>Enviar comunicados oficiales y notificaciones de emergencia.</li>
        </ul>
      </div>

      <div>
        <h3 style="color: var(--ink); margin-bottom: 12px; font-size: 24px;">3. Compartición de datos</h3>
        <p>Tus datos son privados y pertenecen a tu comunidad. <b>Condo no vende, alquila ni comparte tu información personal con terceros con fines comerciales o publicitarios.</b> La información solo es accesible por:</p>
        <ul style="margin-top: 10px; margin-left: 20px; display: flex; flex-direction: column; gap: 8px;">
          <li>El comité y/o empresa administradora del condominio (según sus permisos).</li>
          <li>El personal de garita (únicamente la información de acceso y alertas autorizadas).</li>
        </ul>
      </div>

      <div>
        <h3 style="color: var(--ink); margin-bottom: 12px; font-size: 24px;">4. Tus derechos (Control y Eliminación)</h3>
        <p>Como usuario, tienes derecho a acceder, modificar o eliminar tu información personal en cualquier momento. Puedes solicitar la exportación de tus datos o la eliminación definitiva de tu cuenta desde la sección de Ajustes de la aplicación, o contactando al administrador de tu condominio.</p>
      </div>

      <div>
        <h3 style="color: var(--ink); margin-bottom: 12px; font-size: 24px;">5. Contacto</h3>
        <p>Si tienes alguna pregunta o inquietud sobre estas políticas o el manejo de tus datos, por favor contáctanos en <a href="mailto:gapcode@protonmail.com" style="color: var(--brand-text); font-weight: 500;">gapcode@protonmail.com</a>.</p>
      </div>

    </div>
  </section>
</main>
"""
if start != -1 and end != -1:
    lines[start:end+1] = [new_main]

content = "".join(lines)
content = content.replace("<title>Condo — Administración de condominios para residentes, garita y administración</title>", "<title>Políticas de Privacidad — Condo</title>")

# Fix nav links to absolute paths or just #
content = content.replace('href="#como-funciona"', 'href="condo.html#como-funciona"')
content = content.replace('href="#pases"', 'href="condo.html#pases"')
content = content.replace('href="#cuentas"', 'href="condo.html#cuentas"')
content = content.replace('href="#contacto"', 'href="condo.html#contacto"')
content = content.replace('href="#top"', 'href="condo.html#top"')

with open("privacidad.html", "w") as f:
    f.write(content)
