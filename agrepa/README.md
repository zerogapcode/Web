# Agrepa Asfalcem — sitio web

Sitio corporativo de **AGREPA ASFALCEM**, constructora vial con planta de asfalto propia
(asfaltado, repavimentación, obras civiles y alquiler de maquinaria).

Es un sitio estático: HTML, CSS e imágenes, sin build ni dependencias. Se publica solo
en GitHub Pages con cada `push` a `main`.

- **Preview actual:** https://zerogapcode.github.io/agrepa-web/
- **Dominio propio:** pendiente de compra ([ver abajo](#cambiar-el-dominio))

---

## Estructura

```
index.html      La portada (CSS y JS embebidos; una sola petición)
equipo.html     Equipo y contactos directos — GENERADA, no editar a mano
404.html        Página de error con la identidad de la marca
img/            Imágenes del sitio
img/equipo/     Retratos del personal + avatar genérico
js/config.js    URL del Worker de Cloudflare + memoria de conversación del bot
robots.txt      Permite indexación, apunta al sitemap
sitemap.xml     Una entrada por página; agregar aquí cada página nueva
scripts/        Datos, generador, validador y utilidades
docs/           Notas técnicas (bloque del asistente Daniel Bot)
.github/workflows/static.yml   Despliegue automático a GitHub Pages
```

## Antes de publicar

```bash
node scripts/validar.mjs
```

Revisa las tres páginas: etiquetas HTML balanceadas, llaves de CSS, JSON-LD que
parsee, que exista cada archivo referenciado y que el JavaScript embebido compile.
Termina con código de salida distinto de cero si algo falla, así que sirve igual
en un hook de git.

## Ver el sitio en local

```bash
python3 -m http.server 8000
```

Y abrir http://localhost:8000. Sirve el sitio por HTTP real, así que las rutas y el
asistente se comportan igual que en producción (abrir el `index.html` con doble clic
no es equivalente).

## Cambiar el dominio

Al comprar el dominio, un solo comando actualiza todo — canonical, Open Graph, JSON-LD,
enlaces internos, `robots.txt`, `sitemap.xml` — y escribe el `CNAME` que necesita Pages:

```bash
./scripts/set-dominio.sh agrepaasfalcem.com
git add -A && git commit -m "Apuntar el sitio al dominio propio" && git push
```

Después, del lado del registrador y de GitHub:

1. **DNS del registrador** — para el dominio raíz (`agrepaasfalcem.com`), cuatro registros `A`:
   `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   Para `www`, un `CNAME` a `zerogapcode.github.io`.
2. **GitHub → Settings → Pages** — poner el dominio en *Custom domain*, esperar la
   verificación y marcar **Enforce HTTPS** (el certificado tarda unos minutos).

El script es repetible: lee el dominio actual del `<link rel="canonical">`, así que puede
correrse otra vez para corregir o cambiar de dominio.

---

## La página de equipo

`equipo.html` **se genera**; editarla a mano se pierde en la siguiente corrida.
Los datos de las personas viven en un solo archivo:

```bash
$EDITOR scripts/equipo-datos.mjs     # nombres, teléfonos, correos, cargos, fotos
node scripts/generar-equipo.mjs      # reescribe equipo.html
```

El generador toma el encabezado, el menú móvil, el pie, la barra de contacto, el
fondo de hexágonos con parallax y el widget de Daniel Bot **desde `index.html`**,
de modo que las dos páginas no se desincronizan: al cambiar el encabezado en la
portada, basta volver a generar.

La única pieza del fondo que cambia aquí es el hexágono grande con foto: en la
portada vive a la altura del hero, pero en esta página esa franja la ocupa la
colmena, así que el generador lo baja a la altura del directorio
(`bajarHexGrande`). En `index.html` sigue donde estaba.

El panal es una rejilla hexagonal en coordenadas axiales `(q, r)`: `q` y `r` en
`scripts/equipo-datos.mjs` colocan a cada persona. El centro lo ocupa el hexágono
de marca y una celda rayada completa el círculo.

El relieve es un **campo continuo**, no tres estados fijos. Cada hexágono recibe
una variable CSS `--f` de 0 a 1 según lo cerca que esté el puntero de *su* centro,
con una caída gaussiana (1 en el centro, ~0.44 a un hexágono de distancia, casi 0
a dos). De `--f` salen a la vez el tamaño, el color de la foto y el grosor y color
del trazo, así que el énfasis se reparte entre los vecinos y se mueve con el ratón.
Entre dos hexágonos, ambos suben por igual.

Tres números en `scripts/equipo.js` gobiernan la sensación —`ALCANCE` (qué tan
lejos llega), `SUAVIDAD` (cuánto persigue al objetivo en cada cuadro)— y el
crecimiento máximo, que está en el `transform` de `.celda` en `scripts/equipo.css`.

**Latido en reposo.** Cada 10 s sin actividad sobre la colmena sale una onda desde
el hexágono central hacia afuera: un frente que avanza y levanta cada corona a su
paso. Va en su propia variable `--p`, aparte del relieve del puntero, y solo suma
tamaño y un pelo de trazo — el color queda reservado para el hover. La cresta es
0.10 frente a los 0.26 del hover, para que se lea como respiración y no compita.
Se ajusta con las constantes `PULSO_*` en `scripts/equipo.js`.

No pulsa si el panal no está en pantalla, si la pestaña está en segundo plano, si
el puntero está encima o si el sistema pide «menos movimiento». Un pulso ya lanzado
no se corta al llegar el ratón: dura menos de segundo y medio y cortarlo daría un
salto, así que los dos efectos simplemente se suman.

Los centros se calculan con la misma fórmula que los coloca en el CSS, no midiendo
el DOM: las celdas están escaladas y medirlas devolvería tamaños que cambian con el
propio efecto. Con pantalla táctil o con «menos movimiento» activado el script no
toma el control y queda un realce simple del CSS.

Sin JavaScript los hexágonos siguen siendo enlaces al **directorio** de abajo, que
lleva los teléfonos, WhatsApp y correos reales. Esa lista es también lo que leen
los buscadores.

### Datos del personal: qué falta confirmar

Todo salió de `personal.pages`. Tres cosas quedaron marcadas:

- [ ] **Cargos.** El documento no trae ninguno. El campo `cargo` está vacío para
      las 17 personas; al rellenarlo aparece bajo el nombre en las tres vistas.
- [ ] **La foto de Roselis Orama es la misma de Kelin Cardozo** en el documento
      original (comprobado comparando los píxeles). Va con el avatar genérico
      hasta tener la suya: publicar la cara de otra persona bajo su nombre sería
      un error, no un detalle.
- [ ] **Dos correos no corresponden al nombre:** Victor Tachon figura con
      `corihernandez.2780@gmail.com` y Jimmy Machado con
      `nanniegutierrez@gmail.com`. Puede ser correcto, pero conviene confirmarlo
      antes de que alguien escriba a la persona equivocada.

Además: son **teléfonos y correos personales** publicados en una página abierta.
Quedan expuestos a robots de spam. Si el cliente prefiere, se pueden cambiar por
extensiones y correos corporativos sin tocar el diseño — solo cambia
`scripts/equipo-datos.mjs`.

---

## Asistente virtual (Daniel Bot)

El botón flotante habla con un Worker de Cloudflare compartido, definido en
`js/config.js`, enviando `{ message, assistant: "daniel", session_id }`.

> **Pendiente y bloqueante:** el Worker todavía no tiene el caso `daniel`. Hasta que se
> agregue, Daniel responde con la personalidad genérica de ProtonLab en vez de la de
> Agrepa. El bloque a pegar está en [`docs/daniel-bot-worker.js`](docs/daniel-bot-worker.js);
> va justo antes de `} else if (assistantType === "carlitos") {`.

El historial de conversación se guarda en el `localStorage` del visitante (últimas 14
intervenciones), no en el servidor.

---

## Pendientes antes de publicar en el dominio propio

Datos por confirmar con el cliente:

- [ ] **Teléfono y dirección.** `(0414) 174-5646` y la sede de Santa Lucía del Tuy salieron
      de un registro mercantil público, no de una fuente oficial de la empresa.
- [ ] **Correo de contacto.** Hoy es el marcador `correo@dominio.com`.
- [ ] **Cifras entre corchetes** en el texto (`[X] km`, `[X] días`): reemplazar por datos
      reales o quitar la frase.

Contenido y rendimiento:

- [ ] **Fotos reales de obra.** Las actuales son de stock y no muestran trabajos de Agrepa.
- [ ] **Versiones WebP** de las imágenes, servidas con `<picture>`. Bajan bastante el peso;
      se generan al desplegar (`cwebp -q 82`).
- [ ] Agregar el sitio a **Google Search Console** y enviar el `sitemap.xml`.

## Notas de mantenimiento

- El CSS y el JS viven dentro del HTML a propósito: así cada página carga en una sola
  petición, sin render bloqueado. El precio es que `equipo.html` arrastra el CSS
  completo de la portada, incluido el que no usa (~10 KB sin comprimir, ~2 KB con
  gzip). Si el sitio llega a tres o cuatro páginas, conviene extraer el CSS común
  a `css/base.css`.
- El diseño es **mobile-first** — la mayoría de quienes lo aprueban lo ven en el teléfono.
  Probar siempre a 375 px de ancho antes de dar algo por terminado.
- Los hexágonos del fondo son SVG sin relleno con parallax por scroll; el grosor del trazo
  escala con el tamaño para dar profundidad. Respetan `prefers-reduced-motion`.
- Las imágenes llevan `width`/`height` explícitos para evitar saltos de maquetación (CLS).
