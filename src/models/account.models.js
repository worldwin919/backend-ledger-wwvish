const mongoose = require("mongoose");
const ledgerModel = require("./ledger.model");

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
      default: "ACTIVE",
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

accountSchema.methods.getBalance = async function () {
  //that single source of truuth must come from ledger so import ledger model '
  const balanceData = await ledgerModel.aggregate([
    { $match: { account: this._id } },
    {
      $group: {
        _id: null,
        totalDebit: {
          $sum: {
            $cond: [{ $eq: ["$type", "DEBIT"] }, "$amount", 0],
          },
        },

        totalCredit: {
          $sum: {
            $cond: [{ $eq: ["$type", "CREDIT"] }, "$amount", 0],
          },
        },
      },
    },

    {
      $project: {
        _id: 0,
        balance: { $subtract: ["$totalCredit", "$totalDebit"] },
      },
    },
  ]);

  //if user would be new there would be no trsanction and return emoty array

  if (balanceData.length == 0) {
    return 0;
  }

  //else there is some balance
  return balanceData[0].balance;
};

const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;
