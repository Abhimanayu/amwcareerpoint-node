const KNOWN_BASES = new Set([
  "UR", "OBC", "SC", "ST", "EWS", "BC", "GEN", "GENERAL",
  "MBC", "SA", "SBC", "SEBC", "NRI", "SM", "MM", "OC",
  "OPEN",
]);

function deriveCategoryParts(state, rawCategory) {
  const raw = String(rawCategory || "").trim();
  const upper = raw.toUpperCase();

  if (["GENERAL", "GEN", "OPEN", "OC", "OM", "OPNO"].includes(upper)) {
    return { rawCategory: raw, category: "UR", subCategory: null };
  }

  if (/^UR\s*\(/i.test(raw)) {
    const paren = raw.match(/\(([^)]+)\)/);
    return { rawCategory: raw, category: "UR", subCategory: paren?.[1]?.trim().toUpperCase() || null };
  }

  if (/^SC[0-9A-Z]+$/i.test(raw) && upper !== "SC") {
    return { rawCategory: raw, category: "SC", subCategory: upper.slice(2) || null };
  }

  if (/^SC\s+.+/i.test(raw)) {
    return { rawCategory: raw, category: "SC", subCategory: raw.substring(2).trim().toUpperCase() || null };
  }

  if (/^ST[0-9A-Z]+$/i.test(raw) && upper !== "ST") {
    return { rawCategory: raw, category: "ST", subCategory: upper.slice(2) || null };
  }

  if (/^ST\s+.+/i.test(raw)) {
    return { rawCategory: raw, category: "ST", subCategory: raw.substring(2).trim().toUpperCase() || null };
  }

  if (/^CATEGORY\s+/i.test(raw)) {
    return { rawCategory: raw, category: "CATEGORY", subCategory: raw.replace(/^category\s+/i, "").trim().toUpperCase() || null };
  }

  // Rule 1: BCA / BCB / BCC / BCD / BCE
  if (/^BC[A-E]$/i.test(raw)) {
    return { rawCategory: raw, category: "BC", subCategory: upper[2] };
  }

  if (/^BC[A-Z]$/i.test(raw) && upper !== "BC") {
    return { rawCategory: raw, category: "BC", subCategory: upper.slice(2) || null };
  }

  // Rule 2: Madhya Pradesh slash notation
  if (String(state).toUpperCase() === "MADHYA PRADESH" && raw.includes("/")) {
    const slashIdx = raw.indexOf("/");
    const base = raw.substring(0, slashIdx).trim().toUpperCase();
    const sub = raw.substring(slashIdx + 1).trim();
    if (base) {
      return { rawCategory: raw, category: base, subCategory: sub || null };
    }
  }

  // Rule 3: Uttarakhand parentheses notation
  if (String(state).toUpperCase() === "UTTARAKHAND" && raw.includes("(")) {
    const parenIdx = raw.indexOf("(");
    const base = raw.substring(0, parenIdx).trim().toUpperCase();
    if (base) {
      const parenContents = [];
      const parenRegex = /\(([^)]+)\)/g;
      let match;
      while ((match = parenRegex.exec(raw)) !== null) {
        const part = (match[1] || "").trim();
        if (part) parenContents.push(part.toUpperCase());
      }
      if (parenContents.length > 0) {
        return { rawCategory: raw, category: base, subCategory: parenContents.join(" ") };
      }
    }
  }

  // Rule 4: Hyphen with known base category
  if (raw.includes("-")) {
    const normalized = raw.replace(/\s*-+\s*/g, "-").trim();
    const firstHyphen = normalized.indexOf("-");
    if (firstHyphen > 0) {
      const base = normalized.substring(0, firstHyphen).toUpperCase();
      const sub = normalized.substring(firstHyphen + 1).toUpperCase();
      if (KNOWN_BASES.has(base) && sub.length > 0) {
        return { rawCategory: raw, category: base, subCategory: sub };
      }
    }
  }

  // Rule 5: Fallback
  return { rawCategory: raw, category: upper, subCategory: null };
}

module.exports = {
  deriveCategoryParts,
  KNOWN_BASES,
};
