const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");
const readXlsxFile = require("read-excel-file/node");

const PredictorCutoff = require("../models/PredictorCutoff");
const { deriveCategoryParts } = require("../utils/predictorCategory");
const {
  normalizeState,
  normalizeCollege,
  normalizeCategory,
  normalizeQuota,
  normalizeWhitespace,
  deriveQuotaGroup,
  inferCategoryFromQuota,
} = require("../utils/predictorNormalize");

const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amwcareerpoint";

function getArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx < 0 || idx + 1 >= process.argv.length) return null;
  return process.argv[idx + 1];
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function loadJsonFile(filePath) {
  const absPath = path.resolve(process.cwd(), filePath);
  const raw = fs.readFileSync(absPath, "utf8");
  return { absPath, data: JSON.parse(raw) };
}

function mapRowFromArray(row) {
  return {
    serialNumber: row[0],
    state: row[1],
    closingRank: row[2],
    category: row[3],
    quota: row[4],
    college: row[5],
  };
}

function isHeaderRow(row) {
  const normalized = row.map((cell) => String(cell || "").trim().toUpperCase());
  return normalized.includes("STATES") && normalized.includes("NEET RANK") && normalized.includes("COLLEGES");
}

async function loadXlsxFile(filePath) {
  const absPath = path.resolve(process.cwd(), filePath);
  const sheets = await readXlsxFile(absPath, { trim: true });
  const data = [];

  sheets.forEach((sheet) => {
    const sheetName = sheet.sheet;
    const rows = sheet.data || [];

    if (!Array.isArray(rows) || rows.length === 0) return;

    const startIndex = isHeaderRow(rows[0]) ? 1 : 0;
    for (const row of rows.slice(startIndex)) {
      if (!row || row.every((cell) => String(cell || "").trim() === "")) continue;
      data.push({ ...mapRowFromArray(row), sourceSheet: sheetName });
    }
  });

  return { absPath, data };
}

async function loadInputFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === ".xlsx" || ext === ".xls") return loadXlsxFile(filePath);
  return loadJsonFile(filePath);
}

function toNormalizedRecord(row, context = {}) {
  const state = normalizeState(row.state ?? row.STATES);
  const college = normalizeCollege(row.college ?? row.COLLEGES);
  const rawQuota = normalizeWhitespace(row.quota ?? row.QUOTA);
  const quota = normalizeQuota(rawQuota);
  const rawCategoryInput = normalizeCategory(row.category ?? row.rawCategory ?? row["ALL CATEGORIES"]);
  const rawCategory = rawCategoryInput || inferCategoryFromQuota(rawQuota || quota);
  const closingRank = Number(row.closingRank ?? row["NEET RANK"]);

  if (!state || !college || !rawCategory || !quota || !Number.isFinite(closingRank) || closingRank <= 0) {
    return null;
  }

  const parsed = deriveCategoryParts(state, rawCategory);

  return {
    state,
    college,
    rawCategory: parsed.rawCategory,
    category: parsed.category,
    subCategory: parsed.subCategory,
    closingRank,
    quota,
    rawQuota,
    quotaGroup: deriveQuotaGroup(rawQuota || quota),
    stateNormalized: state,
    collegeNormalized: college.toLowerCase(),
    sourceYear: context.sourceYear,
    sourceFile: context.sourceFile,
    importBatchId: context.importBatchId,
  };
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function parseOptions() {
  const input = getArg("--input");
  const metaPath = getArg("--meta") || null;
  const batchSize = Number(getArg("--batch-size") || 1000);
  const sourceYearRaw = getArg("--source-year") || getArg("--year") || null;
  const sourceYear = sourceYearRaw ? Number(sourceYearRaw) : null;
  const importBatchId = getArg("--batch-id") || `predictor_${new Date().toISOString().replace(/[:.]/g, "-")}`;
  const dryRun = hasFlag("--dry-run");
  const clearFirst = hasFlag("--clear");

  if (!input) {
    console.error("Usage: node src/scripts/importPredictorCutoff.js --input <path-to-neet-cutoff.json|xlsx> [--source-year 2025] [--meta <path-to-neet-state-meta.json>] [--batch-size 1000] [--clear] [--dry-run]");
    process.exit(1);
  }
  if (!Number.isFinite(batchSize) || batchSize <= 0) {
    console.error("❌ Invalid --batch-size. Provide a positive number.");
    process.exit(1);
  }

  if (sourceYearRaw && (!Number.isFinite(sourceYear) || sourceYear < 2000 || sourceYear > 2100)) {
    console.error("❌ Invalid --source-year. Provide a year like 2025.");
    process.exit(1);
  }

  return { input, metaPath, batchSize, sourceYear, importBatchId, dryRun, clearFirst };
}

function getMetaStates(metaPath) {
  if (!metaPath) return [];
  const loadedMeta = loadJsonFile(metaPath);
  const meta = loadedMeta.data;
  if (meta && typeof meta === "object" && !Array.isArray(meta)) {
    return Object.keys(meta);
  }
  return [];
}

function normalizeRows(data, context) {
  const normalized = [];
  let skipped = 0;

  for (const row of data) {
    const parsed = toNormalizedRecord(row, context);
    if (!parsed) {
      skipped++;
      continue;
    }
    normalized.push(parsed);
  }

  return { normalized, skipped };
}

function dedupeRows(rows) {
  const uniqueKeySet = new Set();
  const deduped = [];
  let duplicateRows = 0;

  for (const row of rows) {
    const key = `${row.state}||${row.college}||${row.rawCategory}||${row.quota}||${row.closingRank}`;
    if (uniqueKeySet.has(key)) {
      duplicateRows++;
      continue;
    }
    uniqueKeySet.add(key);
    deduped.push(row);
  }

  return { deduped, duplicateRows };
}

function buildSummary(deduped) {
  const statesFromCutoff = [...new Set(deduped.map((x) => x.state))].sort((a, b) => a.localeCompare(b));
  const collegesCount = new Set(deduped.map((x) => `${x.state}||${x.college}`)).size;
  return { statesFromCutoff, collegesCount };
}

function logPreInsertSummary({ absPath, inputRows, normalizedRows, skippedRows, duplicateRows, dedupedRows, statesFromCutoff, collegesCount, metaStates }) {
  console.log("\n📦 Predictor cutoff import summary (pre-insert)");
  console.log(`   Input file      : ${absPath}`);
  console.log(`   Input rows      : ${inputRows}`);
  console.log(`   Valid rows      : ${normalizedRows}`);
  console.log(`   Skipped rows    : ${skippedRows}`);
  console.log(`   Duplicate rows  : ${duplicateRows}`);
  console.log(`   Rows to insert  : ${dedupedRows}`);
  console.log(`   Unique states   : ${statesFromCutoff.length}`);
  console.log(`   Unique colleges : ${collegesCount}`);

  if (metaStates.length > 0) {
    const missingInMeta = statesFromCutoff.filter((s) => !metaStates.includes(s));
    const extraInMeta = metaStates.filter((s) => !statesFromCutoff.includes(s));
    console.log("\n🧩 Meta parity check");
    console.log(`   Meta states     : ${metaStates.length}`);
    console.log(`   Missing in meta : ${missingInMeta.length}`);
    console.log(`   Extra in meta   : ${extraInMeta.length}`);
    if (missingInMeta.length) {
      console.log(`   Missing list    : ${missingInMeta.join(", ")}`);
    }
    if (extraInMeta.length) {
      console.log(`   Extra list      : ${extraInMeta.join(", ")}`);
    }
  }
}

async function upsertRows(deduped, batchSize) {
  let inserted = 0;
  let modified = 0;
  const chunks = chunkArray(deduped, batchSize);

  for (let i = 0; i < chunks.length; i++) {
    const batch = chunks[i];
    if (batch.length === 0) continue;

    const operations = batch.map((row) => ({
      updateOne: {
        filter: {
          state: row.state,
          college: row.college,
          rawCategory: row.rawCategory,
          quota: row.quota,
          closingRank: row.closingRank,
        },
        update: { $set: row },
        upsert: true,
      },
    }));

    const result = await PredictorCutoff.bulkWrite(operations, { ordered: false });
    inserted += result.upsertedCount || 0;
    modified += result.modifiedCount || 0;
    console.log(`   Batch ${i + 1}/${chunks.length}: upserted ${result.upsertedCount || 0}, updated ${result.modifiedCount || 0}`);
  }

  return { inserted, modified };
}

async function run() {
  const { input, metaPath, batchSize, sourceYear, importBatchId, dryRun, clearFirst } = parseOptions();

  const { absPath, data } = await loadInputFile(input);
  if (!Array.isArray(data)) {
    console.error("❌ Input file must resolve to an array of cutoff rows.");
    process.exit(1);
  }

  const metaStates = getMetaStates(metaPath);
  const { normalized, skipped } = normalizeRows(data, {
    sourceYear,
    sourceFile: path.basename(absPath),
    importBatchId,
  });
  const { deduped, duplicateRows } = dedupeRows(normalized);
  const { statesFromCutoff, collegesCount } = buildSummary(deduped);

  logPreInsertSummary({
    absPath,
    inputRows: data.length,
    normalizedRows: normalized.length,
    skippedRows: skipped,
    duplicateRows,
    dedupedRows: deduped.length,
    statesFromCutoff,
    collegesCount,
    metaStates,
  });

  if (dryRun) {
    console.log("\n⚠️ Dry run enabled: no DB changes applied.");
    return;
  }

  await mongoose.connect(MONGODB_URI);
  console.log(`\n✅ Connected to MongoDB: ${mongoose.connection.name}`);

  if (clearFirst) {
    const cleared = await PredictorCutoff.deleteMany({});
    console.log(`🧹 Cleared existing cutoff docs: ${cleared.deletedCount}`);
  }

  const { inserted, modified } = await upsertRows(deduped, batchSize);

  const totalInDb = await PredictorCutoff.countDocuments({});
  console.log("\n🎉 Import completed");
  console.log(`   Upserted rows   : ${inserted}`);
  console.log(`   Updated rows    : ${modified}`);
  console.log(`   Total in DB     : ${totalInDb}`);

  await mongoose.disconnect();
}

run().catch(async (err) => {
  console.error("\n❌ Predictor cutoff import failed:", err.message);
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  process.exit(1);
});
