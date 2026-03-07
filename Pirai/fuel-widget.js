/***********************
 * CONFIG
 ***********************/
const STATION_NAME = "PIRAI";
const URL =
  "http://ec2-3-22-240-207.us-east-2.compute.amazonaws.com/guiasaldos/main/donde/134";

/***********************
 * FETCH HTML
 ***********************/
const req = new Request(URL);
req.allowInsecureLoads = true;
req.headers = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS like Mac OS X)",
  Accept: "text/html",
};

let html = "";
try {
  html = await req.loadString();
} catch (_) {}

/***********************
 * PARSEO
 ***********************/
function extractLiters(html, stationName) {
  if (!html) return null;

  const clean = html.replace(/\s+/g, " ");
  const re = new RegExp(
    stationName +
      "[\\s\\S]*?Volumen disponible[\\s\\S]*?(\\d{1,3}(?:,\\d{3})*)\\s*Lts",
    "i"
  );

  const m = clean.match(re);
  return m ? Number(m[1].replace(/,/g, "")) : null;
}

const litros = extractLiters(html, STATION_NAME) ?? 0;
const now = new Date();

/***********************
 * WIDGET – APPLE HIG
 ***********************/
const w = new ListWidget();

// Fondo sistema (light / dark)
w.backgroundColor = Color.dynamic(
  new Color("#FFFFFF"),
  new Color("#000000")
);

// Padding (título más arriba)
w.setPadding(8, 16, 16, 16);

// ── TÍTULO
const title = w.addText("Pirai");
title.font = Font.semiboldSystemFont(22);
title.textColor = Color.dynamic(
  new Color("#000000"),
  new Color("#FFFFFF")
);

// Espacio mínimo
w.addSpacer(4);

// ── VOLUMEN
const value = w.addText(
  litros > 0
    ? `${litros.toLocaleString("es-BO")} Lts`
    : "0 Lts"
);
value.font = Font.systemFont(22);
value.textColor =
  litros > 0
    ? Color.dynamic(new Color("#000000"), new Color("#FFFFFF"))
    : new Color("#FF3B30");

// Espacio grande antes de la metadata
w.addSpacer(28);

// ── METADATA (hora 24 h)
const meta = w.addText(
  `Consulta ${now.toLocaleTimeString("es-BO", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  })}`
);
meta.font = Font.systemFont(11);
meta.textColor = Color.dynamic(
  new Color("#6D6D72"),
  new Color("#8E8E93")
);

// Estado solo si no hay dato
if (litros === 0) {
  w.addSpacer(2);
  const status = w.addText("Dato no disponible");
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
