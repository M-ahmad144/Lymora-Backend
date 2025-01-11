const User = require("../models/userModel");
const asyncHandler = require("../middlewares/asyncHandler");
const generateToken = require("../utils/token");
const ErrorHandler = require("../utils/errorHandler");

// sign-up
exports.signupUser = asyncHandler(async (req, res, next) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return next(new ErrorHandler("Please fill all the inputs.", 400));
  }
  const existUser = await User.findOne({ email });
  if (existUser) {
    return next(new ErrorHandler("User already exists", 400));
  }
  const newUser = await User.create({ username, email, password });
  // Generate token and set it as a cookie
  generateToken(res, newUser._id);
  res.status(201).json({
    success: true,
    data: {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      isAdmin: newUser.isAdmin,
    },
  });
});

// login-user
exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }
  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return next(new ErrorHandler("Invalid credentials", 401));
  }
  generateToken(res, user._id);
  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    },
  });
});

// logout-user
exports.logoutCurrentUser = (req, res) => {
  res.cookie("jwt", "", {
    httpOnly: true,
    expires: new Date(0),
  });
  res.status(200).json({ success: true, message: "Logged out successfully" });
};

// get all users
exports.getAllUsers = asyncHandler(async (req, res, next) => {
  const users = await User.find({});
  res.status(200).json({
    success: true,
    users,
  });
});

// current user profile
exports.getCurrentUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
    },
  });
});

//update current user profile
exports.updateCurrentUserProfile = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).select("+password");
  if (!user) {
    return next(new ErrorHandler("User doesn't exist", 404));
  }

  // Update profile information
  if (req.body.username) user.username = req.body.username;
  if (req.body.email) user.email = req.body.email;

  // Update password if provided
  if (req.body.password) {
    // Check if current password is provided and correct
    if (!req.body.currentPassword) {
      return next(
        new ErrorHandler("Current password is required to update password", 400)
      );
    }

    const isPasswordCorrect = await user.correctPassword(
      req.body.currentPassword,
      user.password
    );
    if (!isPasswordCorrect) {
      return next(new ErrorHandler("Incorrect current password", 401));
    }

    user.password = req.body.password;
  }

  await user.save({ validateBeforeSave: true });

  // Generate a new token if password was changed
  if (req.body.password) {
    generateToken(res, user._id);
  }

  res.status(200).json({
    success: true,
    data: {
      _id: user._id,
      username: user.username,
      email: user.email,
    },
    message: req.body.password
      ? "Profile and password updated successfully"
      : "Profile updated successfully",
  });
});

//delete user
exports.deleteUser = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  if (user && user.isAdmin) {
    return next(new ErrorHandler("Cannot delete admin user", 401));
  }
  await user.deleteOne();
  res.status(200).json({
    success: true,
    message: "User deleted successfully",
  });
});

//get user by id
exports.getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  res.status(200).json({
    success: true,
    user,
  });
});

//update user by id
exports.updateUserByAdmin = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }
  if (req.body.username) user.username = req.body.username || user.username;
  if (req.body.email) user.email = req.body.email || user.email;
  if (req.body.isAdmin) user.isAdmin = Boolean(req.body.isAdmin);
  await user.save({ validateBeforeSave: true });
  res.status(200).json({
    success: true,
    data: {
      id: user._id,
      username: user.username,
      email: user.email,
      isAdmin: user.isAdmin,
    },
  });
});
