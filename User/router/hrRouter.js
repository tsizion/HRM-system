const express = require("express");
const router = express.Router();
const {
  Create,

  ReadAll,
  ReadOne,
  Update,
  Delete,
} = require("../controllers/HRMangerController");

router.post("/", Create);
router.get("/", ReadAll);
router.get("/:id", ReadOne);
router.put("/:id", Update);
router.delete("/:id", Delete);

module.exports = router;
