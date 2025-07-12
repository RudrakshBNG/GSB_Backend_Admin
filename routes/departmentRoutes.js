// routes/departmentRoutes.js
const express = require("express");
const router = express.Router();
const {
  addDepartment,
  updateDepartment,
  getAllDepartments,
  deleteDepartment,
} = require("../controllers/departmentController");

router.post("/add", addDepartment);
router.put("/update/:id", updateDepartment);
router.delete("/:id", deleteDepartment);
router.get("/", getAllDepartments);
router.delete("/delete/:id", deleteDepartment);

module.exports = router;
