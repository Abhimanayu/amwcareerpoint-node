const router = require("express").Router();
const ctrl = require("../controllers/predictorMetadata.controller");

// Public metadata endpoint used by FE filter dropdowns
router.get("/", ctrl.getMetadata);

module.exports = router;
