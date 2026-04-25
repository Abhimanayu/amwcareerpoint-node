/**
 * Pre-go-live cleanup script.
 * Removes QA / edge-test / dummy records from all collections.
 *
 * DRY RUN by default — pass --execute to actually delete.
 *
 *   node src/scripts/cleanupTestData.js            # preview
 *   node src/scripts/cleanupTestData.js --execute   # delete for real
 */

const mongoose = require("mongoose");
require("dotenv").config();

const Country = require("../models/Country");
const University = require("../models/University");
const { Blog, BlogCategory } = require("../models/Blog");
const Faq = require("../models/Faq");
const Enquiry = require("../models/Enquiry");
const { Review } = require("../models/Review");
const Counsellor = require("../models/Counsellor");

const DRY_RUN = !process.argv.includes("--execute");

// ── Patterns that indicate test / dummy data ─────────────────────
const TEST_SLUG_PATTERNS = [
  /^edge-test-/i,
  /^qa-full-/i,
  /^test-/i,
  /^dummy-/i,
  /^sample-/i,
  /^hjkh/i,
  /^asdf/i,
  /^xxx/i,
];

const TEST_NAME_PATTERNS = [
  /^edge[-\s]?test/i,
  /^qa[-\s]?full/i,
  /^qa[-\s]?contact/i,
  /^qa[-\s]?counselling/i,
  /^test\s/i,
  /^dummy/i,
  /^sample\s/i,
  /^hjkh/i,
  /^asdf/i,
  /^xxx/i,
  /lorem ipsum/i,
  /^foo\b/i,
  /^bar\b/i,
];

const TEST_EMAIL_PATTERNS = [
  /test@example\.com/i,
  /dummy@/i,
  /qa@/i,
  /fake@/i,
  /edge-?test/i,
  /@test\.com$/i,
  /@example\.(com|org|net)$/i,
];

// ── Helpers ──────────────────────────────────────────────────────
function matchesAny(value, patterns) {
  if (!value) return false;
  return patterns.some((p) => p.test(value));
}

function isTestRecord(
  doc,
  { slugField = "slug", nameField = "name", emailField = null } = {},
) {
  if (slugField && matchesAny(doc[slugField], TEST_SLUG_PATTERNS)) return true;
  if (nameField && matchesAny(doc[nameField], TEST_NAME_PATTERNS)) return true;
  if (emailField && matchesAny(doc[emailField], TEST_EMAIL_PATTERNS))
    return true;
  return false;
}

async function cleanCollection(Model, label, opts = {}) {
  const docs = await Model.find().lean();
  const toDelete = docs.filter((d) => isTestRecord(d, opts));

  if (toDelete.length === 0) {
    console.log(`  ✅ ${label}: 0 test records found (${docs.length} total)`);
    return 0;
  }

  console.log(
    `  🗑️  ${label}: ${toDelete.length} test records out of ${docs.length} total`,
  );
  for (const d of toDelete) {
    const display = d.slug || d.name || d.title || d.email || d._id;
    console.log(`      - ${display}`);
  }

  if (!DRY_RUN) {
    const ids = toDelete.map((d) => d._id);
    await Model.deleteMany({ _id: { $in: ids } });
    console.log(`      ❌ Deleted ${ids.length} records`);
  }

  return toDelete.length;
}

// ── Main ─────────────────────────────────────────────────────────
async function main() {
  const uri =
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/amwcareerpoint";
  console.log(`\n🔌 Connecting to: ${uri}`);
  await mongoose.connect(uri);
  console.log(`✅ Connected to: ${mongoose.connection.name}\n`);

  if (DRY_RUN) {
    console.log("═══════════════════════════════════════════════════");
    console.log("  DRY RUN — no records will be deleted.");
    console.log("  Re-run with --execute to actually delete.");
    console.log("═══════════════════════════════════════════════════\n");
  } else {
    console.log("═══════════════════════════════════════════════════");
    console.log("  ⚠️  LIVE RUN — records WILL be deleted.");
    console.log("═══════════════════════════════════════════════════\n");
  }

  let total = 0;

  console.log("📋 Scanning collections for test/dummy data...\n");

  total += await cleanCollection(Country, "Countries", {
    slugField: "slug",
    nameField: "name",
  });
  total += await cleanCollection(University, "Universities", {
    slugField: "slug",
    nameField: "name",
  });
  total += await cleanCollection(Blog, "Blogs", {
    slugField: "slug",
    nameField: "title",
  });
  total += await cleanCollection(Faq, "FAQs", {
    slugField: null,
    nameField: "question",
  });
  total += await cleanCollection(Enquiry, "Enquiries", {
    slugField: null,
    nameField: "name",
    emailField: "email",
  });
  total += await cleanCollection(Review, "Reviews", {
    slugField: null,
    nameField: "studentName",
  });
  total += await cleanCollection(Counsellor, "Counsellors", {
    slugField: null,
    nameField: "name",
  });

  console.log("\n───────────────────────────────────────────────────");
  if (DRY_RUN) {
    console.log(`📊 Total test records found: ${total}`);
    console.log("   Run with --execute to delete them.");
  } else {
    console.log(`📊 Total test records deleted: ${total}`);
  }
  console.log("───────────────────────────────────────────────────");

  // Post-cleanup summary (remaining counts)
  console.log("\n📊 Remaining record counts:");
  const counts = await Promise.all([
    Country.countDocuments(),
    University.countDocuments(),
    Blog.countDocuments(),
    Faq.countDocuments(),
    Enquiry.countDocuments(),
    Review.countDocuments(),
    Counsellor.countDocuments(),
  ]);
  const labels = [
    "Countries",
    "Universities",
    "Blogs",
    "FAQs",
    "Enquiries",
    "Reviews",
    "Counsellors",
  ];
  labels.forEach((l, i) => console.log(`   ${l}: ${counts[i]}`));

  await mongoose.disconnect();
  console.log("\n🔌 Disconnected.\n");
}

main().catch((err) => {
  console.error("❌ Fatal error:", err.message);
  process.exit(1);
});
