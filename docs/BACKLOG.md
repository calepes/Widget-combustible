# Backlog — Combustible

Registro de ideas, bugs y mejoras. Cada ítem tiene estado y prioridad para mapear ejecución.

**Estados:** `pendiente` · `en progreso` · `hecho` · `descartado`
**Prioridad:** `alta` · `media` · `baja`

---

## Bugs

| # | Descripción | Prioridad | Estado | Notas |
|---|-------------|-----------|--------|-------|
| B1 | Distancia no coincide con Waze real | alta | pendiente | OSRM da ~8 km cuando Waze marca 15+. Ver opciones en [#M1](#m1-migrar-api-de-distancias) |
| B2 | Timeline desalineado con dots | baja | pendiente | `left: 9px` vs centro de dots. Cosmético |
| B3 | Coordenadas estimadas en 19 estaciones | media | pendiente | Berea, La Teca, Lucyfer, Monteverde, Parapetí, Sur Central con baja confianza |

## Mejoras

| # | Descripción | Prioridad | Estado | Notas |
|---|-------------|-----------|--------|-------|
| M1 | Migrar API de distancias | alta | pendiente | Opciones: OpenRouteService (corto plazo), OSRM self-hosted (largo plazo), Mapbox (mejor free tier) |
| M2 | Validar colores de icono 3D en móvil | media | pendiente | hue-rotate verde/naranja/rojo/gris — verificar que se ven bien en cel |
| M3 | Limpiar deploy duplicado | baja | pendiente | Eliminar copia vieja en `calepes.github.io/combustible/pwa/` |
| M4 | SW: network-first para index.html | baja | pendiente | Actualmente cache-first requiere bump manual de `CACHE_NAME` (v8) |

## Ideas

| # | Descripción | Prioridad | Estado | Notas |
|---|-------------|-----------|--------|-------|
| I1 | | | pendiente | |

## Historial

| Fecha | Ítem | Cambio |
|-------|------|--------|
| 2026-03-13 | — | Backlog creado. Migrado desde PENDIENTES.md |
| 2026-03-13 | — | Journey view, 29 estaciones, icono 3D, deploy en Pages — todo completado |
