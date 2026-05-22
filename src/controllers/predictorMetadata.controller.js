const PredictorCutoff = require("../models/PredictorCutoff");

function cleanState(input) {
  return typeof input === "string" ? input.trim() : "";
}

function cleanCategory(input) {
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

async function listCategoriesAndQuotas(stateFilter, categoryFilter) {
  const filter = stateFilter ? { state: stateFilter } : {};
  if (categoryFilter) filter.category = categoryFilter;

  const [categories, subCategories, rawCategories, quotas] = await Promise.all([
    PredictorCutoff.distinct("category", stateFilter ? { state: stateFilter } : {}),
    PredictorCutoff.distinct("subCategory", filter),
    PredictorCutoff.distinct("rawCategory", filter),
    PredictorCutoff.distinct("quota", filter),
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

  return {
    categories: cleanCategories,
    subCategories: cleanSubCategories,
    rawCategories: cleanRawCategories,
    quotas: cleanQuotas,
  };
}

async function listCategoryOptions(stateFilter) {
  const pipeline = [];
  if (stateFilter) {
    pipeline.push({ $match: { state: stateFilter } });
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
      listCategoriesAndQuotas(state, category),
      listCategoryOptions(state),
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
        states,
        categories: metadata.categories,
        subCategories: metadata.subCategories,
        rawCategories: metadata.rawCategories,
        quotas: metadata.quotas,
        categoryOptions,
      },
    });
  } catch (err) {
    return next(err);
  }
};
