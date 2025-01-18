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

// Public authentication routes
router.post("/register", signupUser);
router.post("/login", loginUser);
router.post("/logout", logoutCurrentUser);

// Profile routes (user-protected routes)
router.get("/profile", getCurrentUserProfile);
router.patch("/profile", updateCurrentUserProfile);

// Admin routes
router.get("/", getAllUsers);
router
  .route("/:id")
  .get(getUserById)
  .patch(updateUserByAdmin)
  .delete(deleteUser);

module.exports = router;
