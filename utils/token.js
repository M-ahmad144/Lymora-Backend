const jwt = require("jsonwebtoken");

const generateToken = (res, userId) => {
  // Generate the JWT token
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });

  // Set the JWT token in an HTTP-only cookie
  res.cookie("jwt", token, {});

  return token;
};

module.exports = generateToken;
