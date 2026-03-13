# Diseño: PWAs Combustible

## Resumen

Dos PWAs separadas que replican los widgets de Scriptable para browser/móvil. Un Cloudflare Worker como proxy CORS para las APIs de estaciones.

## Estructura

```
pwa/
├── list/
│   ├── index.html        ← PWA lista (replica all-stations-widget)
│   ├── manifest.json
│   └── sw.js             ← Service Worker para offline
├── cards/
│   ├── index.html        ← PWA cards (replica cards-widget)
│   ├── manifest.json
│   └── sw.js
└── shared/
    ├── stations.js       ← Config de estaciones (compartido)
    ├── fetchers.js       ← Lógica de fetch + parseo (compartido)
    └── icons/            ← Iconos PWA

proxy/
└── worker.js             ← Cloudflare Worker (CORS proxy)
```

## Stack

- HTML + CSS + JS vanilla (sin framework, sin build)
- Cloudflare Workers (proxy CORS, plan free: 100k req/día)
- GitHub Pages para hosting (desde repo `combustible`)

## Proxy CORS (Cloudflare Worker)

- Endpoint: `https://combustible-proxy.<subdomain>.workers.dev/?url=<encoded-url>`
- Whitelist de dominios: genex.com.bo, gasgroup.com.bo, ec2-*.compute.amazonaws.com, docs.google.com
- Flujo: PWA → Worker → API destino → Worker → PWA (con headers CORS)
- Sin auth, rate limiting del plan free

## PWA List (replica `main`)

### Visual
- Fondo: `#F2F2F7` / `#000` (light/dark via `prefers-color-scheme`)
- Header: "Combustible" bold 16pt + "Gasolina Especial · Santa Cruz" 11pt + pill azul conteo
- Lista en card blanca (`#FFF` / `#1C1C1E`), corner radius 12px
- Cada fila: dot verde/rojo + nombre semibold 13pt + empresa terciaria 11pt + litros 13pt
- Separadores 0.5px alineados (después del dot)
- Footer: "Actualizado HH:MM"

### Interacción
- Tap en estación → abre Waze deep link
- Botón/pull-to-refresh para actualizar datos
- Ordenamiento por disponibilidad (mayor primero)

### Colores
- textPrimary: `#000` / `#FFF`
- textSecondary: `#6D6D72` / `#8E8E93`
- textTertiary: `#AEAEB2` / `#636366`
- systemBlue: `#007AFF` / `#0A84FF`
- verde: `#34C759`, rojo: `#FF3B30`
- separador: `#C6C6C8` / `#38383A`

## PWA Cards (replica `cards-v2`)

### Visual
- Mismo header que list
- Grid 2x3 de tarjetas, gap 8px, corner radius 12px, padding 10px
- Cada tarjeta:
  - Nombre semibold 13pt + chip estado (Disponible/Sin dato)
  - Litros bold 18pt + "L" secondary 13pt
  - Barra de stock: track gris, fill color semántico (verde/naranja/rojo), porcentaje 9pt
  - Footer: pin icon + distancia azul + empresa terciaria

### Interacción
- Tap en tarjeta → abre Waze deep link
- Geolocation API para distancia (OSRM ruta real, fallback Haversine)
- Ordenamiento por distancia si hay ubicación, sino por litros

### Colores adicionales (cards)
- cardBg: `#FFF` / `#1C1C1E`
- barBg: `#E5E5EA` / `#38383A`
- stock verde: `#34C759`, naranja: `#FF9500`, rojo: `#FF3B30`
- chip bg: color semántico con 12% opacidad

## Funcionalidad compartida

- Dark mode automático con `prefers-color-scheme`
- Service Worker: cachea última respuesta, funciona offline con datos previos
- Manifest: nombre, iconos, theme_color para "Add to Home Screen"
- Código de fetch/parseo compartido en `shared/`
- Misma lógica de parseo que los widgets (Genex HTML, EC2 HTML, Gasgroup JSON, GSheets chartJson)

## Fuentes de datos

| Estación | Tipo | URL |
|----------|------|-----|
| Genex Banzer, Vangas | HTML scraping | genex.com.bo/estaciones/ |
| Urubó | JSON API | gasgroup.com.bo/api/... |
| Equipetrol, Pirai, Alemana, López, Viru Viru, Gasco | HTML scraping | ec2-3-22-240-207...amazonaws.com |
| Rivero | GSheets chart | docs.google.com/spreadsheets/... |
