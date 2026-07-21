const PredictorCutoff = require("../models/PredictorCutoff");
const PredictorAccess = require("../models/PredictorAccess");
const { getPredictorAccessStatus } = require("../middleware/predictorAccess");
const { Types } = require("mongoose");
const { computeChance, getQuotaGroupLabel } = require("../utils/predictorNormalize");

function cleanString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parsePositiveInt(value, fallback) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

function toSortDirection(sortDir) {
  return sortDir === "desc" ? -1 : 1;
}

function addDays(date, days) {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000);
}

function isAdminUser(admin) {
  return admin && ["admin", "superadmin"].includes(admin.role);
}

function getAdminActor(admin) {
  const adminId = cleanString(admin?.id);
  const email = cleanString(admin?.email).toLowerCase();
  if (!Types.ObjectId.isValid(adminId) || !email) return null;
  return {
    adminId,
    email,
    at: new Date(),
  };
}

function buildSearchFilter(body = {}) {
  const state = cleanString(body.state);
  const rawCategory = cleanString(body.rawCategory);
  const category = cleanString(body.category);
  const subCategory = cleanString(body.subCategory);
  const quota = cleanString(body.quota);
  const quotaGroup = cleanString(body.quotaGroup).toUpperCase();
  const college = cleanString(body.college);
  const rank = Number(body.rank);

  const filter = {};

  if (state) filter.state = state;
  if (rawCategory) {
    filter.rawCategory = rawCategory;
  } else {
    if (category) filter.category = category;
    if (subCategory) filter.subCategory = subCategory;
  }
  if (quota) filter.quota = quota;
  if (quotaGroup) filter.quotaGroup = quotaGroup;
  if (college) filter.college = { $regex: college.replace(/[.*+?^${}()|[\]\\]/g, String.raw`\$&`), $options: "i" };

  if (Number.isFinite(rank) && rank > 0) {
    // Show colleges where candidate rank can potentially qualify
    filter.closingRank = { $gte: rank };
  }

  return { filter, rank: Number.isFinite(rank) && rank > 0 ? rank : null };
}

async function loadLatestAccessRecord(userId) {
  return PredictorAccess.findOne({ userId })
    .sort({ expiresAt: -1, createdAt: -1 })
    .select("expiresAt isActive accessType")
    .lean();
}

exports.getAccessStatus = async (req, res, next) => {
  try {
    // Support both student (req.predictorUser) and admin (req.admin)
    const user = req.predictorUser || req.admin;
    if (!user?.id) {
      return res.status(401).json({
        error: { code: "UNAUTHORIZED", message: "Authorization token required" },
      });
    }

    // Admin users have bypass access
    if (user.role === "admin" || user.role === "superadmin") {
      return res.json({
        data: {
          hasAccess: true,
          expiresAt: null,
          daysRemaining: null,
          accessState: "admin_bypass",
          isExpired: false,
          expiredAt: null,
          isAdminBypass: true,
        },
      });
    }

    // Student or other user: check active access
    const now = new Date();
    const activeAccess = await PredictorAccess.findOne({
      userId: user.id,
      isActive: true,
      expiresAt: { $gt: now },
    })
      .sort({ expiresAt: -1 })
      .select("expiresAt")
      .lean();

    if (!activeAccess) {
      const latestAccess = await loadLatestAccessRecord(user.id);
      const expiredAt = latestAccess?.expiresAt || null;

      return res.json({
        data: {
          hasAccess: false,
          expiresAt: expiredAt,
          daysRemaining: 0,
          accessState: expiredAt ? "expired" : "inactive",
          isExpired: Boolean(expiredAt),
          expiredAt,
          isAdminBypass: false,
        },
      });
    }

    const ms = new Date(activeAccess.expiresAt).getTime() - now.getTime();
    const daysRemaining = Math.ceil(ms / (1000 * 60 * 60 * 24));

    return res.json({
      data: {
        hasAccess: true,
        expiresAt: activeAccess.expiresAt,
        daysRemaining: daysRemaining > 0 ? daysRemaining : 0,
        accessState: "active",
        isExpired: false,
        expiredAt: null,
        isAdminBypass: false,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.search = async (req, res, next) => {
  try {
    const page = parsePositiveInt(req.body.page, 1);
    const limit = Math.min(100, parsePositiveInt(req.body.limit, 20));
    const skip = (page - 1) * limit;
    const sortBy = ["closingRank", "college", "state"].includes(req.body.sortBy)
      ? req.body.sortBy
      : "closingRank";
    const sortDir = toSortDirection(req.body.sortDir);

    const { filter, rank } = buildSearchFilter(req.body || {});

    const [rows, total] = await Promise.all([
      PredictorCutoff.find(filter)
        .sort({ [sortBy]: sortDir, _id: 1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PredictorCutoff.countDocuments(filter),
    ]);

    const items = rows.map((row) => {
      const rankMargin = rank ? row.closingRank - rank : null;
      return {
        ...row,
        rankMargin,
        chance: computeChance(rankMargin),
        quotaGroupLabel: getQuotaGroupLabel(row.quotaGroup),
      };
    });

    return res.json({
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        },
        appliedFilters: {
          state: cleanString(req.body.state) || null,
          rawCategory: cleanString(req.body.rawCategory) || null,
          category: cleanString(req.body.category) || null,
          subCategory: cleanString(req.body.subCategory) || null,
          quota: cleanString(req.body.quota) || null,
          quotaGroup: cleanString(req.body.quotaGroup) || null,
          college: cleanString(req.body.college) || null,
          rank,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.grantAccess = async (req, res, next) => {
  try {
    if (!isAdminUser(req.admin)) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Only admin users can grant predictor access" },
      });
    }

    const userId = cleanString(req.body.userId);
    const days = Math.min(365, parsePositiveInt(req.body.days, 7));
    const notes = cleanString(req.body.notes);
    const accessType = ["trial", "paid", "manual"].includes(req.body.accessType)
      ? req.body.accessType
      : "manual";

    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Valid userId is required" },
      });
    }

    const actor = getAdminActor(req.admin);
    if (!actor) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Admin actor details are missing in token" },
      });
    }

    const now = new Date();
    const expiresAt = addDays(now, days);

    await PredictorAccess.updateMany(
      {
        userId,
        isActive: true,
      },
      {
        $set: {
          isActive: false,
          notes: "Auto-revoked due to new access grant",
          revokedBy: actor,
        },
      }
    );

    const granted = await PredictorAccess.create({
      userId,
      accessType,
      grantedAt: now,
      grantedBy: actor,
      expiresAt,
      isActive: true,
      notes,
    });

    return res.status(201).json({
      data: {
        _id: granted._id,
        userId: granted.userId,
        accessType: granted.accessType,
        grantedAt: granted.grantedAt,
        grantedBy: granted.grantedBy,
        expiresAt: granted.expiresAt,
        isActive: granted.isActive,
        notes: granted.notes,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.revokeAccess = async (req, res, next) => {
  try {
    if (!isAdminUser(req.admin)) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Only admin users can revoke predictor access" },
      });
    }

    const userId = cleanString(req.body.userId);
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Valid userId is required" },
      });
    }

    const actor = getAdminActor(req.admin);
    if (!actor) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Admin actor details are missing in token" },
      });
    }

    const reason = cleanString(req.body.reason) || "Revoked by admin";

    const result = await PredictorAccess.updateMany(
      {
        userId,
        isActive: true,
      },
      {
        $set: {
          isActive: false,
          notes: reason,
          revokedBy: actor,
        },
      }
    );

    return res.json({
      data: {
        userId,
        revokedCount: result.modifiedCount || 0,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.listExpiringAccesses = async (req, res, next) => {
  try {
    if (!isAdminUser(req.admin)) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Only admin users can view expiring predictor accesses" },
      });
    }

    const days = Math.min(30, parsePositiveInt(req.query.days, 2));
    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(100, parsePositiveInt(req.query.limit, 20));
    const skip = (page - 1) * limit;
    const now = new Date();
    const until = addDays(now, days);

    const filter = {
      isActive: true,
      expiresAt: { $gt: now, $lte: until },
    };

    const [items, total] = await Promise.all([
      PredictorAccess.find(filter)
        .sort({ expiresAt: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PredictorAccess.countDocuments(filter),
    ]);

    return res.json({
      data: {
        days,
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.getAccessByUser = async (req, res, next) => {
  try {
    if (!isAdminUser(req.admin)) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Only admin users can view predictor access details" },
      });
    }

    const userId = cleanString(req.params.userId);
    if (!Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: { code: "VALIDATION_ERROR", message: "Valid userId is required" },
      });
    }

    const history = await PredictorAccess.find({ userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const active = history.find((x) => x.isActive && new Date(x.expiresAt).getTime() > Date.now()) || null;

    return res.json({
      data: {
        userId,
        active,
        history,
      },
    });
  } catch (err) {
    return next(err);
  }
};

exports.listActiveAccesses = async (req, res, next) => {
  try {
    if (!isAdminUser(req.admin)) {
      return res.status(403).json({
        error: { code: "FORBIDDEN", message: "Only admin users can view active predictor accesses" },
      });
    }

    const page = parsePositiveInt(req.query.page, 1);
    const limit = Math.min(100, parsePositiveInt(req.query.limit, 20));
    const skip = (page - 1) * limit;
    const now = new Date();

    const filter = {
      isActive: true,
      expiresAt: { $gt: now },
    };

    const [items, total] = await Promise.all([
      PredictorAccess.find(filter)
        .sort({ expiresAt: 1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      PredictorAccess.countDocuments(filter),
    ]);

    return res.json({
      data: {
        items,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit) || 1,
        },
      },
    });
  } catch (err) {
    return next(err);
  }
};
