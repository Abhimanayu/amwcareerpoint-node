const fs = require("node:fs");
const path = require("node:path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
const mongoose = require("mongoose");

const PredictorCutoff = require("../models/PredictorCutoff");
const { deriveCategoryParts } = require("../utils/predictorCategory");

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

function toNormalizedRecord(row) {
  const state = String(row.state || "").trim();
  const college = String(row.college || "").trim();
  const rawCategory = String(row.category || "").trim();
  const quota = String(row.quota || "").trim();
  const closingRank = Number(row.closingRank);

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
  const dryRun = hasFlag("--dry-run");
  const clearFirst = hasFlag("--clear");

  if (!input) {
    console.error("Usage: node src/scripts/importPredictorCutoff.js --input <path-to-neet-cutoff.json> [--meta <path-to-neet-state-meta.json>] [--batch-size 1000] [--clear] [--dry-run]");
    process.exit(1);
  }
  if (!Number.isFinite(batchSize) || batchSize <= 0) {
    console.error("❌ Invalid --batch-size. Provide a positive number.");
    process.exit(1);
  }

  return { input, metaPath, batchSize, dryRun, clearFirst };
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

function normalizeRows(data) {
  const normalized = [];
  let skipped = 0;

  for (const row of data) {
    const parsed = toNormalizedRecord(row);
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
  const { input, metaPath, batchSize, dryRun, clearFirst } = parseOptions();

  const { absPath, data } = loadJsonFile(input);
  if (!Array.isArray(data)) {
    console.error("❌ Input JSON must be an array of cutoff rows.");
    process.exit(1);
  }

  const metaStates = getMetaStates(metaPath);
  const { normalized, skipped } = normalizeRows(data);
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
