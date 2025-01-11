const mongoose = require("mongoose");

const isValidObjectId = mongoose.isValidObjectId;

const checkId = (req, res, next) => {
  if (!isValidObjectId(req.params.id)) {
    return res
      .status(400)
      .json({ error: `Invalid Object ID: ${req.params.id}` });
  }
  next();
};

module.exports = checkId;
