const mongoose = require("mongoose");

const ledgerSchema = new mongoose.Schema({
  account: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "account",
    reuired: [true, "Ledger must be associated with an account"],
    index: true, //for faster queries
    immutable: true, //once set, cannnot be changes, single source of truth
  },
  amount: {
    type: Number,
    required: [true, "Ledger entry must have an amount"],
    immutable: true, //once set, cannnot be changes, single source of truth
  },
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "transaction",
    required: [true, "Ledger entry must be associated with a transaction"],
    index: true, //for faster queries
    immutable: true, //once set, cannnot be changes, single source of truth
  },
  type: {
    type: String,
    enum: {
      values: ["DEBIT", "CREDIT"],
      message: "Ledger type must be either DEBIT or CREDIT",
    },
    required: [true, "Ledger entry must have a type (DEBIT or CREDIT)"],
    immutable: true, //once set, cannnot be changes, single source of truth
  },
});

function preventLedgerModifcation() {
  throw new Error(
    "Ledger entries are immutable and cannot be modified or deleted after creation",
  );
}

ledgerSchema.pre("findOneAndUpdate", preventLedgerModification);
ledgerSchema.pre("updateOne", preventLedgerModification);
ledgerSchema.pre("deleteOne", preventLedgerModification);
ledgerSchema.pre("findOneAndDelete", preventLedgerModification);
ledgerSchema.pre("remove", preventLedgerModification);
ledgerSchema.pre("deleteMany", preventLedgerModification);
ledgerSchema.pre("updateMany", preventLedgerModification);
ledgerSchema.pre("findOneAndRemove", preventLedgerModification);
ledgerSchema.pre("findOneAndReplace", preventLedgerModification);

const ledgerModel = mongoose.model("ledger", ledgerSchema);

module.exports = ledgerModel;
