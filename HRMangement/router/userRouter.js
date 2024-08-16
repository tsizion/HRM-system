const express = require("express");
const router = express.Router();
const {
  Create,
  Login,
  ReadAll,
  ReadOne,
  Update,
  Delete,
  updatePassword,
} = require("../controllers/userController");
const {
  protectUser,
  protectAdmin,
  protectSuperAdmin,
} = require("../../middleware/authorization");
// Routes for user creation and login
router.post("/", Create);
router.post("/login", Login);

// Additional routes for user management (CRUD operations)
router.get("/", ReadAll); // Read all users
router.get("/:id", ReadOne); // Read one user by ID
router.put("/:id", Update);
router.patch("/updatePassword", protectUser, updatePassword); // Update a user by ID
// Update a user by ID
router.delete("/:id", Delete); // Delete a user by ID

module.exports = router;
