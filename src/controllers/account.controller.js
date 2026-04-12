const accountModel = require("../models/account.models");
const ledgerModel = require("../models/ledger.model");

async function createAccountController(req, res) {
  const user = req.user;

  const account = await accountModel.create({
    user: user._id,
  });

  res.status(201).json({
    account,
  });
}

async function getAccountListController(req, res) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({
      message: "user not authenticated",
    });
  }

  try {
    //find all available accounts in the system
    const account = await accountModel.find();

    return res.status(200).json({
      account,
    });
  } catch (error) {
    return res.status(500).json({
      message: "could not fetch account",
      error: error.message,
    });
  }
}

async function depositController(req, res, next) {
  const { id } = req.params;
  const { amount } = req.body;

  if (!amount || amount <= 0) {
    return res.status(400).json({
      message: "Amount must be > 0",
    });
  }

  try {
    const account = await accountModel.findById(id);

    if (!account) {
      return res.status(404).json({
        message: "Account not found",
      });
    }

    //else account found, create a ledger entry for this

    await ledgerModel.create({
      account: account._id,
      amount: amount,
      transaction: null, //no transaction as this is just a deposit
      type: "CREDIT",
    });

    //DONE RETURN SUCCSSS
    return res.status(200).json({
      message: "Deposit Sucessful",
      amount: amount,
    });
  } catch (error) {
    //glovbal error handler will cath this
    next(error);
  }
}

module.exports = {
  createAccountController,
  getAccountListController,
  depositController,
};
