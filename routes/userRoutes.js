const express = require("express");
const router = express.Router();
const {
  signupUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUser,
  getUserById,
  updateUserByAdmin,
} = require("../controllers/userController");

// Middleware imports
const { authMiddleware, authAdmin } = require("../middlewares/authMiddleware");

// Public authentication routes
router.post("/register", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutCurrentUser);

// Protected routes
router.use(authMiddleware);

// Profile routes (user-protected routes)
router.get("/profile", getCurrentUserProfile);
router.patch("/profile", updateCurrentUserProfile);

// Admin routes
router.get("/", authAdmin, getAllUsers);
router
  .route("/:id")
  .get(authAdmin, getUserById)
  .patch(authAdmin, updateUserByAdmin)
  .delete(authAdmin, deleteUser);

module.exports = router;
