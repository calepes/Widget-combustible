/***********************
 * CONFIG
 ***********************/
const STATION_NAME = "Rivero";
const CHART_URL =
  "https://docs.google.com/spreadsheets/u/1/d/e/" +
  "2CAIWO3els60V5S1vVAh0cccQxdcZ1MYZhD9A1pQ-ojCNPoNh-" +
  "vJjHhJaUalVsDLQivYf_Z23Un8mEaePxSg" +
  "/gviz/chartiframe?oid=970629425&resourcekey";
const PRODUCT = "ESPECIAL";

/***********************
 * FETCH
 ***********************/
const req = new Request(CHART_URL);
req.timeoutInterval = 15;
req.headers = {
  "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS like Mac OS X)",
  Accept: "text/html,*/*",
};

let html = "";
try {
  html = await req.loadString();
} catch (_) {}

/***********************
 * PARSEO
 ***********************/
function normalizeLiters(raw) {
  if (!raw) return 0;
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function parseChartIframe(html, product) {
  if (!html) return 0;
  const upper = product.toUpperCase();

  // Strategy 1: find setResponse({...}) with table data
  const jsonMatch = html.match(/setResponse\(([\s\S]+?)\);/);
  if (jsonMatch) {
    try {
      const data = JSON.parse(jsonMatch[1]);
      const rows = data?.table?.rows;
      if (rows) {
        for (const row of rows) {
          const cells = row.c || [];
          const hasProduct = cells.some(
            (c) => typeof c?.v === "string" && c.v.toUpperCase().includes(upper)
          );
          if (!hasProduct) continue;
          for (const c of cells) {
            if (typeof c?.v === "number" && c.v > 0) return Math.round(c.v);
          }
        }
      }
    } catch (_) {}
  }

  // Strategy 2: find data arrays like ["ESPECIAL",55000]
  const re = new RegExp(
    `["']([^"']*${upper}[^"']*)["'][\\s,]*[,\\]]\\s*(\\d[\\d.,]*)`,
    "i"
  );
  const m = html.match(re);
  if (m) return normalizeLiters(m[2]);

  // Strategy 3: brute force - product name near a number
  const clean = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
  const re2 = new RegExp(
    `${upper}[\\s\\S]{0,80}?(\\d{1,3}(?:[.,]\\d{3})*(?:\\.\\d+)?)`,
    "i"
  );
  const m2 = clean.match(re2);
  if (m2) {
    const val = normalizeLiters(m2[1]);
    if (val >= 100) return val;
  }

  return 0;
}

const litros = parseChartIframe(html, PRODUCT);
const now = new Date();

/***********************
 * WIDGET – APPLE HIG
 ***********************/
const w = new ListWidget();

w.backgroundColor = Color.dynamic(
  new Color("#FFFFFF"),
  new Color("#000000")
);

w.setPadding(8, 16, 16, 16);

const title = w.addText(STATION_NAME);
title.font = Font.semiboldSystemFont(22);
title.textColor = Color.dynamic(
  new Color("#000000"),
  new Color("#FFFFFF")
);

w.addSpacer(4);

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

w.addSpacer(28);

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

if (litros === 0) {
  w.addSpacer(2);
  const status = w.addText("Dato no disponible");
  status.font = Font.systemFont(11);
  status.textColor = new Color("#FF3B30");
}

/***********************
 * PRESENTACION
 ***********************/
if (config.runsInWidget) {
  Script.setWidget(w);
} else {
  await w.presentSmall();
}

Script.complete();
