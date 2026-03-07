/***********************
 * CONFIG
 ***********************/
const STATION_NAME = "Rivero";
const SHEET_BASE =
  "https://docs.google.com/spreadsheets/d/e/" +
  "2CAIWO3els60V5S1vVAh0cccQxdcZ1MYZhD9A1pQ-ojCNPoNh-" +
  "vJjHhJaUalVsDLQivYf_Z23Un8mEaePxSg";
const PRODUCT = "ESPECIAL";

/***********************
 * FETCH
 ***********************/
async function fetchText(url) {
  const r = new Request(url);
  r.timeoutInterval = 15;
  r.headers = {
    "User-Agent": "Mozilla/5.0 (iPhone; CPU iPhone OS like Mac OS X)",
    Accept: "text/csv,text/plain,*/*",
  };
  try {
    return await r.loadString();
  } catch (_) {
    return "";
  }
}

/***********************
 * PARSEO
 ***********************/
function normalizeLiters(raw) {
  if (!raw) return 0;
  const digits = raw.replace(/[^\d]/g, "");
  return digits ? Number(digits) : 0;
}

function parseCSV(text, product) {
  if (!text) return 0;
  const upper = product.toUpperCase();
  const lines = text.split("\n");
  let best = 0;
  for (const line of lines) {
    if (!line.toUpperCase().includes(upper)) continue;
    const nums = line.match(/[\d]+(?:[.,]\d+)*/g);
    if (nums) {
      for (const n of nums) {
        const val = normalizeLiters(n);
        if (val > best) best = val;
      }
    }
  }
  return best;
}

function parseJSON(text, product) {
  if (!text) return 0;
  const jsonMatch = text.match(/setResponse\(([\s\S]+)\);?\s*$/);
  if (!jsonMatch) return 0;
  try {
    const data = JSON.parse(jsonMatch[1]);
    const rows = data?.table?.rows;
    if (!rows) return 0;
    const upper = product.toUpperCase();
    let best = 0;
    for (const row of rows) {
      const cells = row.c || [];
      const hasProduct = cells.some(
        (c) => typeof c?.v === "string" && c.v.toUpperCase().includes(upper)
      );
      if (!hasProduct) continue;
      for (const c of cells) {
        if (typeof c?.v === "number" && c.v > best) best = Math.round(c.v);
      }
    }
    return best;
  } catch (_) {
    return 0;
  }
}

/***********************
 * INTENTAR MULTIPLES ENDPOINTS
 ***********************/
let litros = 0;

// 1) pub CSV export
const csv1 = await fetchText(SHEET_BASE + "/pub?gid=0&single=true&output=csv");
litros = parseCSV(csv1, PRODUCT);

// 2) gviz JSON query
if (litros === 0) {
  const json = await fetchText(SHEET_BASE + "/gviz/tq?tqx=out:json");
  litros = parseJSON(json, PRODUCT);
}

// 3) gviz CSV query
if (litros === 0) {
  const csv2 = await fetchText(SHEET_BASE + "/gviz/tq?tqx=out:csv");
  litros = parseCSV(csv2, PRODUCT);
}

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

// ── TITULO
const title = w.addText(STATION_NAME);
title.font = Font.semiboldSystemFont(22);
title.textColor = Color.dynamic(
  new Color("#000000"),
  new Color("#FFFFFF")
);

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
