const PredictorCutoff = require("../models/PredictorCutoff");
const { getQuotaGroupLabel } = require("../utils/predictorNormalize");

function cleanState(input) {
  return typeof input === "string" ? input.trim() : "";
}

function cleanCategory(input) {
  return typeof input === "string" ? input.trim().toUpperCase() : "";
}

function cleanQuotaGroup(input) {
  return typeof input === "string" ? input.trim().toUpperCase() : "";
}

function sortAlpha(values) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

async function listStates() {
  const states = await PredictorCutoff.distinct("state", {});
  const clean = states.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim());
  return sortAlpha([...new Set(clean)]);
}

async function listCategoriesAndQuotas(stateFilter, categoryFilter, quotaGroupFilter) {
  const filter = stateFilter ? { state: stateFilter } : {};
  if (categoryFilter) filter.category = categoryFilter;
  if (quotaGroupFilter) filter.quotaGroup = quotaGroupFilter;

  const categoryBaseFilter = stateFilter ? { state: stateFilter } : {};
  if (quotaGroupFilter) categoryBaseFilter.quotaGroup = quotaGroupFilter;

  const [categories, subCategories, rawCategories, quotas, quotaGroups] = await Promise.all([
    PredictorCutoff.distinct("category", categoryBaseFilter),
    PredictorCutoff.distinct("subCategory", filter),
    PredictorCutoff.distinct("rawCategory", filter),
    PredictorCutoff.distinct("quota", filter),
    PredictorCutoff.distinct("quotaGroup", categoryFilter ? filter : categoryBaseFilter),
  ]);

  const cleanCategories = sortAlpha(
    [...new Set(categories.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim()))]
  );
  const cleanSubCategories = sortAlpha(
    [...new Set(subCategories.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim()))]
  );
  const cleanRawCategories = sortAlpha(
    [...new Set(rawCategories.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim()))]
  );
  const cleanQuotas = sortAlpha(
    [...new Set(quotas.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim()))]
  );
  const cleanQuotaGroups = sortAlpha(
    [...new Set(quotaGroups.filter((x) => typeof x === "string" && x.trim()).map((x) => x.trim()))]
  );

  return {
    categories: cleanCategories,
    subCategories: cleanSubCategories,
    rawCategories: cleanRawCategories,
    quotas: cleanQuotas,
    quotaGroups: cleanQuotaGroups,
    quotaGroupOptions: cleanQuotaGroups.map((value) => ({
      value,
      label: getQuotaGroupLabel(value),
    })),
  };
}

async function listCategoryOptions(stateFilter, quotaGroupFilter) {
  const pipeline = [];
  const match = {};
  if (stateFilter) match.state = stateFilter;
  if (quotaGroupFilter) match.quotaGroup = quotaGroupFilter;
  if (Object.keys(match).length > 0) {
    pipeline.push({ $match: match });
  }

  pipeline.push(
    {
      $group: {
        _id: "$category",
        subCategories: { $addToSet: "$subCategory" },
      },
    },
    { $sort: { _id: 1 } }
  );

  const groups = await PredictorCutoff.aggregate(pipeline);
  return groups
    .filter((group) => typeof group._id === "string" && group._id.trim())
    .map((group) => {
      const subCategories = sortAlpha(
        (group.subCategories || [])
          .filter((value) => typeof value === "string" && value.trim())
          .map((value) => value.trim())
      );

      return {
        category: group._id.trim(),
        subCategories,
        hasSubCategories: subCategories.length > 0,
      };
    });
}

exports.getMetadata = async (req, res, next) => {
  try {
    const state = cleanState(req.query.state);
    const category = cleanCategory(req.query.category);
    const quotaGroup = cleanQuotaGroup(req.query.quotaGroup);
    const states = await listStates();

    if (state && !states.includes(state)) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "State metadata not found",
          field: "state",
        },
      });
    }

    const [metadata, categoryOptions] = await Promise.all([
      listCategoriesAndQuotas(state, category, quotaGroup),
      listCategoryOptions(state, quotaGroup),
    ]);

    if (category && !metadata.categories.includes(category)) {
      return res.status(404).json({
        error: {
          code: "NOT_FOUND",
          message: "Category metadata not found",
          field: "category",
        },
      });
    }

    return res.json({
      data: {
        state: state || null,
        category: category || null,
        quotaGroup: quotaGroup || null,
        states,
        categories: metadata.categories,
        subCategories: metadata.subCategories,
        rawCategories: metadata.rawCategories,
        quotas: metadata.quotas,
        quotaGroups: metadata.quotaGroups,
        quotaGroupOptions: metadata.quotaGroupOptions,
        categoryOptions,
      },
    });
  } catch (err) {
    return next(err);
  }
};
