const router = require("express").Router();
const ctrl = require("../controllers/counsellor.controller");
const { authMiddleware } = require("../middleware/auth");

router.get("/", ctrl.list);
router.post("/", authMiddleware, ctrl.create);
router.put("/:id", authMiddleware, ctrl.update);
router.delete("/:id", authMiddleware, ctrl.remove);

module.exports = router;
