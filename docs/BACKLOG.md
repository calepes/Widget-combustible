# Backlog — Combustible

Registro de ideas, bugs y mejoras. Cada ítem tiene estado y prioridad para mapear ejecución.

**Estados:** `pendiente` · `en progreso` · `hecho` · `descartado`
**Prioridad:** `alta` · `media` · `baja`

---

## Bugs

| # | Descripción | Prioridad | Estado | Notas |
|---|-------------|-----------|--------|-------|
| B1 | Distancia no coincide con Waze real | alta | pendiente | OSRM da ~8 km cuando Waze marca 15+. Ver opciones en [#M1](#mejoras) |
| B2 | Timeline desalineado con dots (cards) | baja | pendiente | `left: 9px` vs centro de dots. Cosmético |
| B3 | Coordenadas estimadas en estaciones | media | en progreso | Pirai y López corregidas. Pendientes: Berea, La Teca, Lucyfer, Monteverde, Parapetí, Sur Central y otras |

## Mejoras

| # | Descripción | Prioridad | Estado | Notas |
|---|-------------|-----------|--------|-------|
| M1 | Migrar API de distancias | alta | pendiente | Opciones: Google Directions (ya tenemos API key), OpenRouteService, OSRM self-hosted |
| M2 | Validar colores de icono 3D en móvil | media | pendiente | hue-rotate verde/naranja/rojo/gris — verificar que se ven bien en cel |
| M3 | Limpiar deploy duplicado | baja | pendiente | Eliminar copia vieja en `calepes.github.io/combustible/pwa/` |
| M4 | SW: network-first para index.html | baja | pendiente | Actualmente cache-first requiere bump manual de `CACHE_NAME` |

## Ideas

| # | Descripción | Prioridad | Estado | Notas |
|---|-------------|-----------|--------|-------|
| I1 | Vista mapa con Google Directions API | media | pendiente | Usar Directions API para distancias reales (resolvería B1 y M1) |

## Hecho

| # | Descripción | Fecha |
|---|-------------|-------|
| ~~I1~~ | PWA: icono app con bomba 3D | 2026-03-14 |
| ~~I2~~ | Vista mapa con Google Maps | 2026-03-14 |

## Historial

| Fecha | Ítem | Cambio |
|-------|------|--------|
| 2026-03-13 | — | Backlog creado. Migrado desde PENDIENTES.md |
| 2026-03-13 | — | Journey view, 29 estaciones, icono 3D, deploy en Pages |
| 2026-03-14 | I1 | Icono PWA bomba 3D implementado (favicon, manifest, apple-touch-icon) |
| 2026-03-14 | — | Ajuste hue-rotate de iconos para coincidir con barra de stock |
| 2026-03-14 | — | Vista mapa PWA: Leaflet → Google Maps JS API |
| 2026-03-14 | B3 | Coordenadas Pirai y López corregidas |
| 2026-03-14 | M1 | Google Maps API key creada — abre opción de usar Directions API para distancias |
