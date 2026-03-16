const mongoose = require("mongoose");

const accountSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: [true, "account must be associated with a user"],
      index: true, //for faster lookups in mongodb (uses B+ tree under the hood)
    },
    status: {
      type: String,
      enum: {
        values: ["ACTIVE", "INACTIVE", "CLOSED"],
        message: "Invalid account status",
      },
      default: "ACTIVE"
    },
    currency: {
      type: String,
      required: [true, "account must have a currency"],
      default: "INR",
    },
  },
  {
    timestamps: true,
  },
);

accountSchema.index({ user: 1, status: 1 }); //compound index for faster lookups based on user and status

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;
