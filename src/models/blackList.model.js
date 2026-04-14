const mongoose = require("mongoose");

//for log out api
const tokenBlackListSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: [true, "Token is required"],
      unique: [true, "Token must be unique"],
    },
  },
  {
    timestamps: true,
  },
);

tokenBlackListSchema.index({
  createdAt: 1,
  expireAfterSeconds: 60 * 60 * 24 * 4, //expire after 24 * 4 hours -> 4 days
});

const tokenBlackListModel = mongoose.model(
  "TokenBlockListModel",
  tokenBlackListSchema,
);

module.exports = tokenBlackListModel;
  