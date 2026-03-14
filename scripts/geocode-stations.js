#!/usr/bin/env node
/**
 * Geocodifica todas las estaciones usando Google Places API (Text Search)
 *
 * Uso:
 *   node scripts/geocode-stations.js --key=YOUR_GOOGLE_API_KEY
 *
 * La key necesita tener habilitado "Places API" (o "Places API New") en Google Cloud Console.
 * No puede tener restricción de dominio HTTP — usar restricción por IP o sin restricción.
 *
 * Output: tabla comparativa con coords actuales vs Google Places, y diff en metros.
 */

const STATIONS = [
  { name: "Genex Banzer", company: "Genex", lat: -17.7642, lon: -63.1807, query: "Estación Genex Banzer 3er Anillo Santa Cruz Bolivia" },
  { name: "Vangas", company: "Genex", lat: -17.7776, lon: -63.2160, query: "Estación Vangas Hernando Sanabria 4to Anillo Santa Cruz Bolivia" },
  { name: "Genex Guaracachi", company: "Genex", lat: -17.7772, lon: -63.1399, query: "Estación Genex Guaracachi Virgen de Cotoca Santa Cruz Bolivia" },
  { name: "Genex Trompillo", company: "Genex", lat: -17.8072, lon: -63.1708, query: "Estación Genex Trompillo 3er Anillo Santa Cruz Bolivia" },
  { name: "Genex III", company: "Genex", lat: -17.7752, lon: -63.1653, query: "Estación Genex III 2do Anillo Paragua Santa Cruz Bolivia" },
  { name: "Genex Mutualista", company: "Genex", lat: -17.7605, lon: -63.1578, query: "Estación Genex Mutualista 3er Anillo Santa Cruz Bolivia" },
  { name: "Genex V", company: "Genex", lat: -17.8013, lon: -63.1895, query: "Estación Genex V 2do Anillo Escuadrón Velasco Santa Cruz Bolivia" },
  { name: "Genex IV", company: "Genex", lat: -17.7902, lon: -63.1649, query: "Estación Genex IV 2do Anillo Santa Cruz Bolivia" },
  { name: "Genex II", company: "Genex", lat: -17.7928, lon: -63.1940, query: "Estación Genex II 2do Anillo 26 de Febrero Santa Cruz Bolivia" },
  { name: "Jarajorechi", company: "Genex", lat: -17.3194, lon: -63.2691, query: "Estación Jarajorechi Montero Santa Cruz Bolivia" },
  { name: "Aracataca", company: "Genex", lat: -17.3286, lon: -63.2632, query: "Estación Aracataca Montero Santa Cruz Bolivia" },
  { name: "Equipetrol", company: "Biopetrol", lat: -17.7542, lon: -63.1967, query: "Surtidor Biopetrol Equipetrol 4to Anillo Santa Cruz Bolivia" },
  { name: "Pirai", company: "Biopetrol", lat: -17.7819, lon: -63.2039, query: "Surtidor Biopetrol Pirai Roca y Coronado 3er Anillo Santa Cruz Bolivia" },
  { name: "Alemana", company: "Biopetrol", lat: -17.7691, lon: -63.1711, query: "Surtidor Biopetrol Alemana 2do Anillo Santa Cruz Bolivia" },
  { name: "López", company: "Biopetrol", lat: -17.7256, lon: -63.1653, query: "Surtidor Biopetrol López Banzer 7mo Anillo Santa Cruz Bolivia" },
  { name: "Viru Viru", company: "Biopetrol", lat: -17.6760, lon: -63.1592, query: "Surtidor Biopetrol Viru Viru Banzer Km 10 Santa Cruz Bolivia" },
  { name: "Gasco", company: "Biopetrol", lat: -17.7580, lon: -63.1783, query: "Surtidor Gasco Santa Cruz Bolivia" },
  { name: "Beni", company: "Biopetrol", lat: -17.7695, lon: -63.1788, query: "Surtidor Biopetrol Beni 2do Anillo Santa Cruz Bolivia" },
  { name: "Berea", company: "Biopetrol", lat: -17.8377, lon: -63.2383, query: "Surtidor Biopetrol Berea Santa Cruz Bolivia" },
  { name: "Cabezas", company: "Biopetrol", lat: -18.7863, lon: -63.3093, query: "Surtidor Biopetrol Cabezas Santa Cruz Bolivia" },
  { name: "La Teca", company: "Biopetrol", lat: -17.7661, lon: -63.1098, query: "Surtidor Biopetrol La Teca Santa Cruz Bolivia" },
  { name: "Lucyfer", company: "Biopetrol", lat: -17.7900, lon: -63.1900, query: "Surtidor Lucyfer Santa Cruz Bolivia" },
  { name: "Montecristo", company: "Biopetrol", lat: -17.8350, lon: -63.1320, query: "Surtidor Biopetrol Montecristo Santa Cruz Bolivia" },
  { name: "Monteverde", company: "Biopetrol", lat: -17.8050, lon: -63.2100, query: "Surtidor Biopetrol Monteverde Santa Cruz Bolivia" },
  { name: "Paraguá", company: "Biopetrol", lat: -17.7650, lon: -63.1494, query: "Surtidor Biopetrol Paragua 4to Anillo Santa Cruz Bolivia" },
  { name: "Parapetí", company: "Biopetrol", lat: -17.8000, lon: -63.1600, query: "Surtidor Biopetrol Parapetí Santa Cruz Bolivia" },
  { name: "Sur Central", company: "Biopetrol", lat: -17.7999, lon: -63.1805, query: "Surtidor Biopetrol Sur Central Santa Cruz Bolivia" },
  { name: "Urubó", company: "Orsa", lat: -17.7533, lon: -63.2213, query: "Surtidor Orsa Urubó Santa Cruz Bolivia" },
  { name: "Orsa Alemana", company: "Orsa", lat: -17.7530, lon: -63.1630, query: "Surtidor Orsa Alemana 4to Anillo Santa Cruz Bolivia" },
  { name: "Rivero", company: "Rivero", lat: -17.7625, lon: -63.1805, query: "Surtidor Rivero Banzer Km 1.5 Santa Cruz Bolivia" },
];

function haversineMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function geocodeGoogle(station, apiKey) {
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(station.query)}&key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();

  if (data.status !== "OK" || !data.results?.length) {
    return { found: false, error: data.status };
  }

  const place = data.results[0];
  return {
    found: true,
    lat: place.geometry.location.lat,
    lon: place.geometry.location.lng,
    placeName: place.name,
    address: place.formatted_address,
  };
}

async function main() {
  // Leer key de --key=, variable de entorno, o .env
  const keyArg = process.argv.find((a) => a.startsWith("--key="));
  let apiKey = keyArg ? keyArg.split("=")[1] : process.env.GOOGLE_API_KEY;

  if (!apiKey) {
    try {
      const { readFileSync } = await import("fs");
      const { join } = await import("path");
      const envPath = join(process.cwd(), ".env");
      const env = readFileSync(envPath, "utf-8");
      const match = env.match(/GOOGLE_API_KEY=(.+)/);
      if (match) apiKey = match[1].trim();
    } catch {}
  }

  if (!apiKey) {
    console.error("Uso: node scripts/geocode-stations.js --key=YOUR_GOOGLE_API_KEY");
    console.error("  o creá .env con GOOGLE_API_KEY=...");
    process.exit(1);
  }
  const results = [];

  for (const station of STATIONS) {
    process.stderr.write(`Buscando: ${station.name}...`);
    const result = await geocodeGoogle(station, apiKey);

    if (result.found) {
      const diffM = haversineMeters(station.lat, station.lon, result.lat, result.lon);
      results.push({
        name: station.name,
        company: station.company,
        currentLat: station.lat,
        currentLon: station.lon,
        newLat: result.lat,
        newLon: result.lon,
        diffM: Math.round(diffM),
        placeName: result.placeName,
        address: result.address,
      });
      process.stderr.write(` ✓ (${Math.round(diffM)}m diff)\n`);
    } else {
      results.push({
        name: station.name,
        company: station.company,
        currentLat: station.lat,
        currentLon: station.lon,
        newLat: null,
        newLon: null,
        diffM: null,
        placeName: null,
        address: result.error,
      });
      process.stderr.write(` ✗ (${result.error})\n`);
    }

    // Rate limit: 100ms entre requests
    await new Promise((r) => setTimeout(r, 100));
  }

  // Output JSON para procesar después
  console.log(JSON.stringify(results, null, 2));

  // Resumen en stderr
  const found = results.filter((r) => r.newLat);
  const big = found.filter((r) => r.diffM > 200);
  console.error(`\n── Resumen ──`);
  console.error(`Encontradas: ${found.length}/${results.length}`);
  console.error(`Con diff > 200m: ${big.length}`);
  if (big.length) {
    console.error(`\nEstaciones con diferencia significativa:`);
    for (const r of big.sort((a, b) => b.diffM - a.diffM)) {
      console.error(`  ${r.name} (${r.company}): ${r.diffM}m — Google: "${r.placeName}"`);
      console.error(`    Actual: ${r.currentLat}, ${r.currentLon}`);
      console.error(`    Google: ${r.newLat}, ${r.newLon}`);
    }
  }
}

main();
