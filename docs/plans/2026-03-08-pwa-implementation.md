# PWAs Combustible — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Crear dos PWAs (list y cards) que replican los widgets de Scriptable, con un Cloudflare Worker como proxy CORS.

**Architecture:** HTML/CSS/JS vanilla sin build. Módulos compartidos en `pwa/shared/` (config estaciones, lógica fetch/parseo). Cada PWA en su carpeta con index.html, manifest.json y service worker. Un Cloudflare Worker recibe URLs como parámetro, hace fetch server-side y devuelve con headers CORS.

**Tech Stack:** HTML + CSS + JS (ES modules), Cloudflare Workers, GitHub Pages

---

## Task 1: Cloudflare Worker (proxy CORS)

**Files:**
- Create: `proxy/worker.js`
- Create: `proxy/wrangler.toml`

**Step 1: Crear `proxy/wrangler.toml`**

```toml
name = "combustible-proxy"
main = "worker.js"
compatibility_date = "2024-01-01"
```

**Step 2: Crear `proxy/worker.js`**

```js
const ALLOWED_DOMAINS = [
  'genex.com.bo',
  'gasgroup.com.bo',
  'compute.amazonaws.com',
  'docs.google.com',
  'router.project-osrm.org',
];

function isAllowed(url) {
  try {
    const host = new URL(url).hostname;
    return ALLOWED_DOMAINS.some(d => host.endsWith(d));
  } catch {
    return false;
  }
}

export default {
  async fetch(request) {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        },
      });
    }

    const url = new URL(request.url);
    const target = url.searchParams.get('url');

    if (!target) {
      return new Response(JSON.stringify({ error: 'Missing ?url= parameter' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    if (!isAllowed(target)) {
      return new Response(JSON.stringify({ error: 'Domain not allowed' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    try {
      const resp = await fetch(target, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS like Mac OS X)',
          'Accept': 'text/html, application/json',
        },
      });
      const body = await resp.text();

      return new Response(body, {
        status: resp.status,
        headers: {
          'Content-Type': resp.headers.get('Content-Type') || 'text/plain',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60',
        },
      });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }
  },
};
```

**Step 3: Commit**

```bash
git add proxy/
git commit -m "feat: add Cloudflare Worker CORS proxy for station APIs"
```

**Step 4: Deploy (manual, con usuario)**

Requiere cuenta Cloudflare + `npx wrangler deploy` desde `proxy/`. Anotar la URL resultante para usarla en las PWAs.

---

## Task 2: Módulos compartidos (`pwa/shared/`)

**Files:**
- Create: `pwa/shared/stations.js`
- Create: `pwa/shared/fetchers.js`

**Step 1: Crear `pwa/shared/stations.js`**

Extraer la config de estaciones de `widget/all-stations-widget.js` y `widget/cards-widget.js`. Array de objetos con: name, type, company, lat, lon, url, key/fuel/product, waze.

```js
// pwa/shared/stations.js
export const STATIONS = [
  {
    name: "Genex Banzer",
    type: "genex",
    company: "Genex",
    lat: -17.7580, lon: -63.1783,
    url: "https://genex.com.bo/estaciones/?3142_product_cat%5B0%5D=294&3142_tax_product_tag%5B0%5D=314&3142_orderby=option_1&3142_filtered=true",
    key: "GENEX I",
    fuel: "G. ESPECIAL+",
    waze: "https://waze.com/ul?q=Genex%20Banzer%203er%20Anillo%20Santa%20Cruz%20Bolivia&navigate=yes",
  },
  // ... resto de estaciones (copiar de cards-widget.js que tiene lat/lon)
];

export const GASGROUP_MIN_LITROS = 1500;
```

**Step 2: Crear `pwa/shared/fetchers.js`**

Portar la lógica de fetch/parseo de los widgets. Usa el proxy CORS.

```js
// pwa/shared/fetchers.js
const PROXY_URL = 'https://combustible-proxy.<subdomain>.workers.dev';

function proxyFetch(url) {
  return fetch(`${PROXY_URL}/?url=${encodeURIComponent(url)}`);
}

// Portar: normalizeLiters, parseGenex, parseEC2, parseGasGroup, parseChartJson
// Portar: haversineKm, osrmDistances (usando proxyFetch para OSRM)
// Export: fetchAllStations(stations) → Promise<results[]>
// Export: getDistances(userLat, userLon, stations) → Promise<number[]|null>
```

La lógica de parseo es idéntica a los widgets. La única diferencia es que `fetch` pasa por el proxy.

**Step 3: Commit**

```bash
git add pwa/shared/
git commit -m "feat: add shared stations config and fetch/parse modules"
```

---

## Task 3: PWA List

**Files:**
- Create: `pwa/list/index.html`
- Create: `pwa/list/manifest.json`
- Create: `pwa/list/sw.js`

**Step 1: Crear `pwa/list/manifest.json`**

```json
{
  "name": "Combustible",
  "short_name": "Combustible",
  "start_url": ".",
  "display": "standalone",
  "background_color": "#F2F2F7",
  "theme_color": "#F2F2F7",
  "icons": [
    { "src": "../shared/icons/icon-192.png", "sizes": "192x192", "type": "image/png" },
    { "src": "../shared/icons/icon-512.png", "sizes": "512x512", "type": "image/png" }
  ]
}
```

**Step 2: Crear `pwa/list/sw.js`**

Service worker que cachea la app shell y las últimas respuestas de datos. Estrategia: network-first para datos, cache-first para assets.

**Step 3: Crear `pwa/list/index.html`**

Archivo HTML único con CSS inline y JS en `<script type="module">`. Replica exactamente el diseño de `widget/all-stations-widget.js`:

- CSS: variables para colores light/dark con `@media (prefers-color-scheme: dark)`
- Fuente: `-apple-system, SF Pro Text, system-ui` (equivalente a Font.systemFont de Scriptable)
- Layout: contenedor max-width ~400px centrado (tamaño widget Large)
- Header: título + subtítulo + pill
- Lista: flexbox rows con dot, nombre, empresa, litros
- Separadores: `border-bottom: 0.5px solid var(--sep)`
- Footer: hora de actualización
- Tap en fila: `window.open(station.waze)`
- Botón refresh en header o pull-to-refresh
- Al cargar: import `stations.js` y `fetchers.js`, fetch datos, render, registrar SW

**Step 4: Probar localmente**

```bash
cd pwa/list && python3 -m http.server 8080
```

Abrir `http://localhost:8080` y verificar que el layout replica el widget.
Nota: los fetches fallarán sin el proxy desplegado — usar datos mock temporalmente si es necesario.

**Step 5: Commit**

```bash
git add pwa/list/
git commit -m "feat: add PWA list view replicating main widget"
```

---

## Task 4: PWA Cards

**Files:**
- Create: `pwa/cards/index.html`
- Create: `pwa/cards/manifest.json`
- Create: `pwa/cards/sw.js`

**Step 1: Crear `pwa/cards/manifest.json`**

Igual que list pero con nombre "Combustible Cards".

**Step 2: Crear `pwa/cards/sw.js`**

Igual que list.

**Step 3: Crear `pwa/cards/index.html`**

Replica `widget/cards-widget.js`:

- CSS Grid 2 columnas para las tarjetas
- Cada tarjeta: card con border-radius 12px, padding 10px, fondo cardBg
  - Top row: nombre semibold + chip estado (con color semántico al 12% opacity)
  - Litros: bold 18pt + "L" secondary
  - Barra de stock: div track + div fill (width por porcentaje) + texto %
  - Footer card: SVG pin icon + distancia azul + empresa
- Geolocation API: `navigator.geolocation.getCurrentPosition()` para obtener posición
- OSRM via proxy para distancias por ruta, fallback Haversine
- Ordenar por distancia si hay ubicación, sino por litros
- Top 6 estaciones en grid, tap en tarjeta abre Waze

**Step 4: Probar localmente**

```bash
cd pwa/cards && python3 -m http.server 8081
```

**Step 5: Commit**

```bash
git add pwa/cards/
git commit -m "feat: add PWA cards view replicating cards-v2 widget"
```

---

## Task 5: Iconos PWA

**Files:**
- Create: `pwa/shared/icons/icon-192.png`
- Create: `pwa/shared/icons/icon-512.png`

**Step 1: Generar iconos**

Crear iconos simples (puede ser un SVG convertido a PNG o placeholder). Ícono de bomba de gasolina naranja sobre fondo blanco, estilo iOS.

**Step 2: Commit**

```bash
git add pwa/shared/icons/
git commit -m "feat: add PWA icons"
```

---

## Task 6: Deploy y verificación

**Step 1: Deploy Cloudflare Worker**

```bash
cd proxy && npx wrangler deploy
```

Anotar URL del worker y actualizar `PROXY_URL` en `pwa/shared/fetchers.js`.

**Step 2: Push a GitHub**

```bash
git push origin main
```

**Step 3: Configurar GitHub Pages**

Si no está habilitado, activar Pages desde el repo apuntando a la rama `main` y carpeta raíz (o `/pwa`).

**Step 4: Verificar URLs**

- List: verificar que carga y muestra datos
- Cards: verificar que carga, pide ubicación, muestra tarjetas con distancia
- Dark mode: verificar en ambas PWAs
- Add to Home Screen: verificar que el manifest funciona
- Offline: apagar wifi, verificar que muestra datos cacheados

**Step 5: Commit final**

```bash
git commit -m "chore: update proxy URL for production"
git push origin main
```

---

## Orden de dependencias

```
Task 1 (proxy) → Task 2 (shared) → Task 3 (list) ─┐
                                   Task 4 (cards) ──┤→ Task 6 (deploy)
                                   Task 5 (icons) ──┘
```

Tasks 3, 4 y 5 son independientes entre sí y pueden ejecutarse en paralelo.
