const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
  {
    fromAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: [true, "transaction must have a from account"],
      index: true, //for faster lookups in mongodb (uses B+ tree under the hood)
    },

    toAccount: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "account",
      required: [true, "transaction must have a To account"],
      index: true, //for faster lookups in mongodb (uses B+ tree under the hood)
    },

    status: {
      type: String,
      enum: {
        values: ["PENDING", "COMPLETED", "FAILED", "REVERSED"],
        message: "Invalid transaction status",
      },
      default: "PENDING",
    },
    amount: {
      type: Number,
      required: [true, "transaction must have an amount"],
      min: [0, "transaction amount can not be negative"],
    },

    idempotencyKey: {
      type: String,
      required: [true, "transaction must have an idempotency key"],
      index: true, //for faster lookups in mongodb (uses B+ tree under the hood)
      unique: true, //to ensure that same transction are not processed multiple times (for example in case of network failure and retrying the transaction)
    },
  },
  {
    timestamps: true,
  },
);

const transactionModel = mongoose.model("transaction", transactionSchema);

module.exports = transactionModel;
