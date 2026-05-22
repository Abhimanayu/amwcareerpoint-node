const KNOWN_BASES = new Set([
  "UR", "OBC", "SC", "ST", "EWS", "BC", "GEN", "GENERAL",
  "MBC", "SA", "SBC", "SEBC", "NRI", "SM", "MM", "OC",
]);

function deriveCategoryParts(state, rawCategory) {
  const raw = String(rawCategory || "").trim();
  const upper = raw.toUpperCase();

  // Rule 1: BCA / BCB / BCC / BCD / BCE
  if (/^BC[A-E]$/i.test(raw)) {
    return { rawCategory: raw, category: "BC", subCategory: upper[2] };
  }

  // Rule 2: Madhya Pradesh slash notation
  if (state === "Madhya Pradesh" && raw.includes("/")) {
    const slashIdx = raw.indexOf("/");
    const base = raw.substring(0, slashIdx).trim().toUpperCase();
    const sub = raw.substring(slashIdx + 1).trim();
    if (base) {
      return { rawCategory: raw, category: base, subCategory: sub || null };
    }
  }

  // Rule 3: Uttarakhand parentheses notation
  if (state === "Uttarakhand" && raw.includes("(")) {
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
