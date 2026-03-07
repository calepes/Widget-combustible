/***********************
 * CONFIG
 ***********************/
const FUEL_URL =
  "https://genex.com.bo/estaciones/" +
  "?3142_product_cat%5B0%5D=294" +
  "&3142_tax_product_tag%5B0%5D=314" +
  "&3142_orderby=option_1" +
  "&3142_filtered=true";

const STATION = "GENEX I";
const STATION_TITLE = "Genex Banzer";

/***********************
 * FETCH HTML
 ***********************/
const req = new Request(FUEL_URL);
req.timeoutInterval = 15;
req.headers = {
  "User-Agent":
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) " +
    "AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  Accept: "text/html",
};

let html = "";
try {
  html = await req.loadString();
} catch (_) {
  html = "";
}

/***********************
 * PARSEO
 ***********************/
function stripTags(s) {
  return s.replace(/<[^>]*>/g, " ");
}

function normalizeLiters(raw) {
  if (!raw) return null;
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

function extractStationData(html) {
  if (!html) return null;

  // Limpiar HTML: quitar tags, normalizar espacios
  const clean = stripTags(html)
    .replace(/\u00A0/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ");

  // Buscar bloque de GENEX I con litros
  // Formato real: "GENEX I ... G. ESPECIAL+ ... 3.921 litros"
  const reBlock = new RegExp(
    STATION +
      "\\b" +
      "([\\s\\S]*?)" +          // captura todo entre GENEX I y litros
      "(\\d[\\d.,]*)\\s*litros",
    "i"
  );

  const m = clean.match(reBlock);
  if (!m) return null;

  const block = m[1] + m[2] + " litros";
  const litros = normalizeLiters(m[2]);

  // Extraer info de cola / disponibilidad
  const colaMatch = block.match(/(Mucha cola|Poca cola|Sin cola)/i);
  const dispMatch = block.match(/disponible\s+(\d+h?\s*\d*m?)/i);
  const paraMatch = block.match(/para\s+([\d.,]+)\s*/i);
  const esperaMatch = block.match(/espera\s+(\d+m?\s*\d*s?)/i);

  return {
    litros: litros,
    cola: colaMatch ? colaMatch[1] : null,
    disponible: dispMatch ? dispMatch[1] : null,
    para: paraMatch ? paraMatch[1] : null,
    espera: esperaMatch ? esperaMatch[1] : null,
  };
}

const data = extractStationData(html);
const litros = data ? data.litros ?? 0 : 0;
const now = new Date();

/***********************
 * WIDGET – Apple HIG
 ***********************/
const w = new ListWidget();
w.backgroundColor = Color.dynamic(
  new Color("#FFFFFF"),
  new Color("#000000")
);
w.setPadding(6, 16, 12, 16);

// ── TÍTULO
const title = w.addText(STATION_TITLE);
title.font = Font.semiboldSystemFont(17);
title.textColor = Color.dynamic(
  new Color("#000000"),
  new Color("#FFFFFF")
);
title.lineLimit = 1;
title.minimumScaleFactor = 0.8;

w.addSpacer(4);

// ── VOLUMEN
const value = w.addText(
  litros > 0
    ? `${litros.toLocaleString("es-BO")} Lts`
    : html === ""
      ? "Sin conexión"
      : "Sin datos"
);
value.font = Font.systemFont(20);
value.textColor =
  litros > 0
    ? Color.dynamic(new Color("#000000"), new Color("#FFFFFF"))
    : new Color("#FF3B30");

// ── INFO EXTRA (cola + disponible)
if (data && litros > 0) {
  w.addSpacer(2);
  const parts = [];
  if (data.cola) parts.push(data.cola);
  if (data.disponible) parts.push(`⏱ ${data.disponible}`);

  if (parts.length > 0) {
    const info = w.addText(parts.join(" · "));
    info.font = Font.systemFont(10);
    info.textColor = Color.dynamic(
      new Color("#6D6D72"),
      new Color("#8E8E93")
    );
    info.lineLimit = 1;
    info.minimumScaleFactor = 0.7;
  }
}

w.addSpacer(null);

// ── CONSULTA (24h)
const hh = String(now.getHours()).padStart(2, "0");
const mm = String(now.getMinutes()).padStart(2, "0");

const meta = w.addText(`Consulta ${hh}:${mm}`);
meta.font = Font.systemFont(11);
meta.textColor = Color.dynamic(
  new Color("#6D6D72"),
  new Color("#8E8E93")
);

if (litros === 0 && html !== "") {
  w.addSpacer(2);
  const status = w.addText("Especial no disponible");
  status.font = Font.systemFont(11);
  status.textColor = new Color("#FF3B30");
}

/***********************
 * PRESENTACIÓN
 ***********************/
if (config.runsInWidget) {
  Script.setWidget(w);
} else {
  await w.presentSmall();
}

Script.complete();
