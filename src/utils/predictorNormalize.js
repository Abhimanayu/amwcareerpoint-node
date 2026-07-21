const QUOTA_GROUPS = {
  GOVT_STATE: "Government / State Quota",
  MANAGEMENT: "Management Quota",
  NRI: "NRI Quota",
  MINORITY: "Minority Quota",
  PRIVATE: "Private Quota",
  OTHER: "Other Quota",
};

function normalizeWhitespace(value) {
  return String(value ?? "")
    .replace(/\u00a0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeState(value) {
  return normalizeWhitespace(value).toUpperCase();
}

function normalizeCollege(value) {
  return normalizeWhitespace(value);
}

function normalizeCategory(value) {
  return normalizeWhitespace(value);
}

function normalizeQuota(value) {
  const quota = normalizeWhitespace(value);
  const lower = quota.toLowerCase();

  const typoFixed = lower
    .replace(/\bqyota\b/g, "quota")
    .replace(/\bquoya\b/g, "quota")
    .replace(/\bchirstian\b/g, "christian")
    .replace(/\bkerela\b/g, "kerala")
    .replace(/\bmgm\b/g, "management")
    .replace(/\bmgmt\b/g, "management");

  if (typoFixed.includes("nri")) return "NRI Quota";
  if (typoFixed.includes("management")) return "Management Quota";
  if (
    typoFixed.includes("minority") ||
    typoFixed.includes("muslim") ||
    typoFixed.includes("sikh") ||
    typoFixed.includes("hindu") ||
    typoFixed.includes("christian") ||
    typoFixed.includes("telugu") ||
    typoFixed.includes("malayalam")
  ) {
    return "Minority Quota";
  }
  if (typoFixed.includes("private")) return "Private Quota";
  if (
    typoFixed.includes("state") ||
    typoFixed.includes("govt") ||
    typoFixed.includes("government") ||
    typoFixed.includes("competent authority") ||
    typoFixed.includes("open") ||
    typoFixed.includes("opn") ||
    typoFixed.includes("oth") ||
    typoFixed.includes("gm") ||
    typoFixed.includes("gmp") ||
    typoFixed.includes("gen quota") ||
    /^b[12]( quota)?$/i.test(quota) ||
    typoFixed.startsWith("ctb-")
  ) {
    return "State Quota";
  }

  return quota;
}

function deriveQuotaGroup(quotaValue) {
  const quota = normalizeWhitespace(quotaValue).toLowerCase();

  if (quota.includes("nri")) return "NRI";
  if (quota.includes("management") || quota.includes("mgmt") || quota.includes("mgm")) return "MANAGEMENT";
  if (
    quota.includes("minority") ||
    quota.includes("muslim") ||
    quota.includes("sikh") ||
    quota.includes("hindu") ||
    quota.includes("christian") ||
    quota.includes("chirstian") ||
    quota.includes("telugu") ||
    quota.includes("malayalam")
  ) {
    return "MINORITY";
  }
  if (quota.includes("private")) return "PRIVATE";
  if (
    quota.includes("state") ||
    quota.includes("govt") ||
    quota.includes("government") ||
    quota.includes("competent authority") ||
    quota.includes("open") ||
    quota.includes("opn") ||
    quota.includes("oth") ||
    quota.includes("gm") ||
    quota.includes("gmp") ||
    /^b[12]( quota)?$/i.test(quota) ||
    quota.startsWith("ctb-")
  ) {
    return "GOVT_STATE";
  }

  return "OTHER";
}

function inferCategoryFromQuota(rawQuota) {
  const group = deriveQuotaGroup(rawQuota);
  if (group === "NRI") return "NRI";
  if (group === "MINORITY") return "MINORITY";
  if (group === "MANAGEMENT") return "MANAGEMENT";
  return "OPEN";
}

function getQuotaGroupLabel(group) {
  return QUOTA_GROUPS[group] || QUOTA_GROUPS.OTHER;
}

function computeChance(rankMargin) {
  if (!Number.isFinite(rankMargin)) return "Possible";
  if (rankMargin >= 100000) return "Strong Match";
  if (rankMargin >= 25000) return "Possible Match";
  return "Borderline";
}

module.exports = {
  QUOTA_GROUPS,
  normalizeWhitespace,
  normalizeState,
  normalizeCollege,
  normalizeCategory,
  normalizeQuota,
  deriveQuotaGroup,
  inferCategoryFromQuota,
  getQuotaGroupLabel,
  computeChance,
};
