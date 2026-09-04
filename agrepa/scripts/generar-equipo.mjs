// Genera equipo.html.
//
// El encabezado, el menu movil, el pie, la barra movil, el fondo de hexagonos y
// el widget de Daniel Bot NO se escriben aqui: se levantan de index.html, de modo
// que las dos paginas no se desincronicen. Al tocar cualquiera de esas partes en
// index.html, basta con volver a correr:
//
//   node scripts/generar-equipo.mjs
//
// Los datos de las personas viven en scripts/equipo-datos.mjs.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { EQUIPO, DECORATIVA } from './equipo-datos.mjs';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indice = fs.readFileSync(path.join(raiz, 'index.html'), 'utf8');

/* ---------- utilidades ---------- */

function trozo(desde, hasta, incluirFinal = true) {
  const i = indice.indexOf(desde);
  if (i === -1) throw new Error(`No encuentro el inicio: ${desde.slice(0, 60)}`);
  const j = indice.indexOf(hasta, i + desde.length);
  if (j === -1) throw new Error(`No encuentro el final: ${hasta.slice(0, 60)}`);
  return indice.slice(i, incluirFinal ? j + hasta.length : j);
}

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const slug = s => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const e164 = tel => '+58' + tel.replace(/\D/g, '').replace(/^0/, '');

/* ---------- partes compartidas, tomadas de index.html ---------- */

const estilos     = trozo('<style>', '</style>');
const fondoHex    = trozo('<div class="hexes"', '</div>');
const cabecera    = trozo('<header class="cabecera">', '</header>');
const menuMovil   = trozo('<!-- Menú móvil -->', '</div>\n\n<main');
const pie         = trozo('<footer class="pie">', '</footer>');
const barraMovil  = trozo('<!-- ================= BARRA MÓVIL ================= -->\n<div class="barra-movil"', '</div>');
const jsMenu      = trozo('<script>\n(function () {\n  var menu = document.getElementById(\'menuMovil\');', '</script>');
const jsParallax  = trozo('<script>\n(function () {\n  var hexes =', '</script>');
const danielBot   = trozo('<!-- ================= DANIEL BOT', '</script>\n\n</body>', false);

/* El hexagono grande con foto se cruzaba con el panal: en la portada esta a la
   altura del hero, pero aqui esa franja la ocupa la colmena. Se baja a la altura
   del directorio, donde no compite. Solo en esta pagina — en index.html sigue
   donde estaba. Medido: cero solape con el panal a 1440px y a 390px. */
const bajarHexGrande = html => html.replace('style="top:20%;left:68%"', 'style="top:64%;left:70%"');

// En esta pagina los enlaces del menu deben volver a la portada.
const aPortada = html => html
  .replace(/href="#(servicios|obras|planta|preguntas|presupuesto|inicio)"/g, 'href="index.html#$1"')
  .replace(/href="equipo\.html"/g, 'href="equipo.html" aria-current="page"');

/* ---------- panal ---------- */

const celda = (p) => {
  const x = p.q + p.r / 2;
  const foto = p.foto
    ? `<img src="img/equipo/${p.foto}" width="600" height="693" alt="Retrato de ${esc(p.nombre)}" loading="lazy" decoding="async">`
    : `<img src="img/equipo/avatar-generico.svg" width="100" height="116" alt="" loading="lazy" decoding="async">`;
  // Es un enlace, no un boton: sin JavaScript lleva a esa persona en el
  // directorio de abajo, que si tiene los enlaces de contacto reales.
  return `      <a class="celda" href="#p-${slug(p.nombre)}" style="--x:${x};--r:${p.r};--pos:${p.pos}"
              data-q="${p.q}" data-r="${p.r}"
              data-nombre="${esc(p.nombre)}" data-cargo="${esc(p.cargo)}"
              data-tel="${esc(p.tel)}" data-e164="${e164(p.tel)}" data-mail="${esc(p.mail)}"
              data-foto="${p.foto ? 'img/equipo/' + p.foto : 'img/equipo/avatar-generico.svg'}"
              aria-label="Ver el contacto de ${esc(p.nombre)}">
        <span class="celda__hex">${foto}</span>
        <svg class="celda__borde" viewBox="0 0 100 115.47" aria-hidden="true"><polygon points="50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87"></polygon></svg>
      </a>`;
};

const marca = `      <span class="celda celda--marca" style="--x:0;--r:0" data-q="0" data-r="0" aria-hidden="true">
        <span class="celda__hex"><img src="img/equipo/isotipo-agrepa.png" width="300" height="255" alt="" decoding="async"></span>
        <svg class="celda__borde" viewBox="0 0 100 115.47"><polygon points="50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87"></polygon></svg>
      </span>`;

const deco = `      <span class="celda celda--deco" style="--x:${DECORATIVA.q + DECORATIVA.r / 2};--r:${DECORATIVA.r}" data-q="${DECORATIVA.q}" data-r="${DECORATIVA.r}" aria-hidden="true">
        <span class="celda__hex"></span>
        <svg class="celda__borde" viewBox="0 0 100 115.47"><polygon points="50,0 100,28.87 100,86.6 50,115.47 0,86.6 0,28.87"></polygon></svg>
      </span>`;

const panal = [marca, deco, ...EQUIPO.map(celda)].join('\n');

/* ---------- directorio (funciona sin JavaScript) ---------- */

const iconos = {
  tel: '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.4-1.2a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2Z"></path></svg>',
  wa:  '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5 4.9 16A8.3 8.3 0 1 1 8 19.1l-4.5 1.4Z"></path><path d="M9 9.2c.3 1.3 1.1 2.6 2 3.4.9.9 2.1 1.6 3.4 1.9l1-1.3 1.9.9c-.2 1-.9 1.6-2 1.6-1.7 0-3.6-1-5-2.4-1.4-1.4-2.4-3.3-2.4-5 0-1.1.6-1.8 1.6-2l.9 1.9-1.4 1Z"></path></svg>',
  mail:'<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="2.5" y="4.5" width="19" height="15"></rect><path d="m3 6 9 7 9-7"></path></svg>',
};

const persona = (p) => {
  const img = p.foto
    ? `<img src="img/equipo/${p.foto}" width="600" height="693" alt="" loading="lazy" decoding="async">`
    : `<img src="img/equipo/avatar-generico.svg" width="100" height="116" alt="" loading="lazy" decoding="async">`;
  return `      <li class="persona" id="p-${slug(p.nombre)}">
        <span class="persona__hex" style="--pos:${p.pos}">${img}</span>
        <span class="persona__id">
          <b>${esc(p.nombre)}</b>
          ${p.cargo ? `<span>${esc(p.cargo)}</span>` : ''}<span class="persona__tel">${esc(p.tel)}</span>
        </span>
        <span class="persona__acc">
          <a href="tel:${e164(p.tel)}" aria-label="Llamar a ${esc(p.nombre)}">${iconos.tel}</a>
          <a href="https://wa.me/${e164(p.tel).replace('+', '')}" rel="noopener" aria-label="Escribir por WhatsApp a ${esc(p.nombre)}">${iconos.wa}</a>
          <a href="mailto:${esc(p.mail)}" aria-label="Enviar correo a ${esc(p.nombre)}">${iconos.mail}</a>
        </span>
      </li>`;
};

const directorio = EQUIPO.map(persona).join('\n');

const jsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  name: 'Equipo y contactos directos — Agrepa Asfalcem',
  url: 'https://zerogapcode.github.io/agrepa-web/equipo.html',
  about: {
    '@type': 'GeneralContractor',
    name: 'Agrepa Asfalcem',
    url: 'https://zerogapcode.github.io/agrepa-web/',
    employee: EQUIPO.map(p => ({ '@type': 'Person', name: p.nombre, ...(p.cargo ? { jobTitle: p.cargo } : {}) })),
  },
}, null, 2);

/* ---------- CSS propio de esta pagina ---------- */

const cssEquipo = fs.readFileSync(path.join(raiz, 'scripts', 'equipo.css'), 'utf8');
const jsEquipo  = fs.readFileSync(path.join(raiz, 'scripts', 'equipo.js'), 'utf8');

/* ---------- armado ---------- */

const salida = `<!doctype html>
<html lang="es-VE">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

<!-- ===== SEO ===== -->
<title>Equipo y Contactos Directos | Agrepa Asfalcem</title>
<meta name="description" content="Hable directamente con el personal de Agrepa Asfalcem. Teléfono, WhatsApp y correo de cada responsable de obra, planta y administración.">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="author" content="Inversiones Agrepa, C.A. — Constructora Asfalcem 1981, C.A.">
<meta name="theme-color" content="#0B0B0C">
<!-- Generado por scripts/generar-equipo.mjs — no editar a mano. -->
<link rel="canonical" href="https://zerogapcode.github.io/agrepa-web/equipo.html">

<meta property="og:type" content="website">
<meta property="og:locale" content="es_VE">
<meta property="og:site_name" content="Agrepa Asfalcem">
<meta property="og:title" content="Equipo y Contactos Directos | Agrepa Asfalcem">
<meta property="og:description" content="Hable directamente con el personal de Agrepa Asfalcem. Teléfono, WhatsApp y correo de cada responsable.">
<meta property="og:url" content="https://zerogapcode.github.io/agrepa-web/equipo.html">
<meta property="og:image" content="https://zerogapcode.github.io/agrepa-web/img/og-agrepa.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">

<link rel="icon" href="img/favicon.svg" type="image/svg+xml">

<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo+Black&family=Barlow+Condensed:wght@500;600;700&family=Barlow:wght@400;500;600&display=swap">

${estilos}

<style>
${cssEquipo}</style>
</head>
<body>

${bajarHexGrande(fondoHex)}

<a class="saltar lbl" href="#contenido">Saltar al contenido</a>

<!-- ================= CABECERA ================= -->
${aPortada(cabecera)}

${aPortada(menuMovil)}

<main id="contenido">

  <section class="equipo seccion">
    <div class="contenedor">
      <div class="equipo__enc">
        <p class="eyebrow lbl">Contacto directo</p>
        <h1>Hable con la persona indicada</h1>
        <p>Cada hexágono es un integrante del equipo de Agrepa Asfalcem. Toque el suyo para llamar, escribir por WhatsApp o enviar un correo, sin pasar por una centralita.</p>
      </div>

      <div class="panal-caja">
        <div class="panal" id="panal">
${panal}
        </div>

        <p class="panal__lectura" id="lectura" aria-live="polite">
          <b data-nom>Elija a una persona</b>
          <span data-sub>Toque un hexágono para ver el teléfono, el WhatsApp y el correo de esa persona.</span>
        </p>
      </div>

      <div class="directorio">
        <div class="directorio__enc">
          <h2>Directorio</h2>
          <p>El mismo equipo, en lista.</p>
        </div>
        <ul class="directorio__lista">
${directorio}
        </ul>
      </div>
    </div>
  </section>

</main>

${pie}

${barraMovil}

<dialog class="ficha" id="ficha" aria-labelledby="fichaNombre"></dialog>

<script type="application/ld+json">
${jsonLd}
</script>

${jsMenu}

${jsParallax}

<script>
${jsEquipo}</script>

${danielBot}</script>

</body>
</html>
`;

fs.writeFileSync(path.join(raiz, 'equipo.html'), salida);
console.log(`equipo.html generado — ${EQUIPO.length} personas, ${salida.length} bytes`);
