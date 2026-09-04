// Revisa las paginas del sitio antes de publicar:
//   - etiquetas HTML balanceadas
//   - llaves de CSS balanceadas
//   - JSON-LD que parsea
//   - que exista cada archivo referenciado (src, href, srcset, url())
//   - que el JavaScript embebido parsee
//
//   node scripts/validar.mjs

import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const paginas = fs.readdirSync(raiz).filter(f => f.endsWith('.html')).sort();

const VACIAS = new Set(['meta','link','img','br','hr','input','source','path','polygon','use','circle','area','col','embed','track','wbr','rect','line','ellipse','stop','base','param']);

let fallas = 0;
const falla = m => { fallas++; console.log('  FALLA ' + m); };

// Quita el contenido de <script> y <style> para que su texto no se lea como HTML.
const sinCodigo = t => t
  .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '<script></script>')
  .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '<style></style>')
  .replace(/<!--[\s\S]*?-->/g, '');

for (const pagina of paginas) {
  console.log(pagina);
  const t = fs.readFileSync(path.join(raiz, pagina), 'utf8');

  // 1. etiquetas
  const pila = [];
  for (const m of sinCodigo(t).matchAll(/<(\/?)([a-zA-Z][\w-]*)([^>]*?)(\/?)>/g)) {
    const [, cierre, bruto, , solo] = m;
    const nombre = bruto.toLowerCase();
    if (VACIAS.has(nombre) || solo === '/' || nombre === '!doctype') continue;
    if (cierre) {
      if (!pila.length) falla(`</${nombre}> sin apertura`);
      else if (pila[pila.length - 1] !== nombre) falla(`</${nombre}> cierra <${pila[pila.length - 1]}>`);
      else pila.pop();
    } else pila.push(nombre);
  }
  if (pila.length) falla(`etiquetas sin cerrar: ${pila.join(', ')}`);

  // 2. CSS
  for (const [, css] of t.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)) {
    const limpio = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const a = (limpio.match(/{/g) || []).length, b = (limpio.match(/}/g) || []).length;
    if (a !== b) falla(`llaves de CSS descuadradas: ${a} { frente a ${b} }`);
  }

  // 3. JSON-LD
  for (const [, j] of t.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try { JSON.parse(j); } catch (e) { falla(`JSON-LD no parsea: ${e.message}`); }
  }

  // 4. archivos referenciados (fuera de <script>)
  const html = t.replace(/<script\b(?![^>]*ld\+json)[^>]*>[\s\S]*?<\/script>/gi, '');
  const refs = new Set();
  for (const [, u] of html.matchAll(/(?:src|href)="([^"]+)"/g)) refs.add(u);
  for (const [, u] of html.matchAll(/url\(([^)]+)\)/g)) refs.add(u.replace(/^['"]|['"]$/g, ''));
  for (const [, lista] of html.matchAll(/(?:srcset|imagesrcset)="([^"]+)"/g))
    for (const parte of lista.split(',')) refs.add(parte.trim().split(/\s+/)[0]);
  for (const u of refs) {
    if (/^(https?:|mailto:|tel:|data:|#|\/)/.test(u)) continue;
    const rel = u.split('?')[0].split('#')[0];
    if (rel && !fs.existsSync(path.join(raiz, rel))) falla(`archivo que no existe: ${rel}`);
  }

  // 5. JavaScript embebido
  const js = [...t.matchAll(/<script(?![^>]*\bsrc=)(?![^>]*ld\+json)[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]).join('\n;\n');
  if (js.trim()) {
    const tmp = path.join(raiz, '.validar-tmp.js');
    fs.writeFileSync(tmp, js);
    try { execFileSync(process.execPath, ['--check', tmp], { stdio: 'pipe' }); }
    catch (e) { falla('JavaScript no parsea: ' + String(e.stderr).split('\n').slice(0, 3).join(' ')); }
    fs.unlinkSync(tmp);
  }
}

// Los scripts sueltos tambien
for (const f of ['js/config.js', 'scripts/equipo.js']) {
  try { execFileSync(process.execPath, ['--check', path.join(raiz, f)], { stdio: 'pipe' }); }
  catch (e) { falla(`${f} no parsea`); }
}

console.log(fallas ? `\n${fallas} falla(s).` : '\nTodo en orden.');
process.exit(fallas ? 1 : 0);
