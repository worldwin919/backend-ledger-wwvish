const transactionModel = require("../models/transaction.model");
const accountModel = require("../models/account.model");

/**
 * - get transactions controller
 * - GET /api/transactions/
 * - Protected route
 */

async function getTransactionController(req, res) {
  const user = req.user; // Assuming the authenticated user is available in req.user

  try {
    const userAccounts = await accountModel.find({ userId: user._id });
    const accountIds = userAccounts.map((account) => account._id);

    //find transaction where user is either sender or receiver

    const transactions = await transactionModel
      .find({
        $or: [
          { fromAccount: { $in: accountIds } },
          { toAccount: { $in: accountIds } },
        ],
      })
      .populate("fromAccount")
      .populate("toAccount")
      .sort({ createdAt: -1 }); // Sort by createdAt in descending order

    return res.status(200).json({
      transactions,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Could not get transactions",
      error: error.message,
    });
  }
}

/**
 * get tranactionss by Id controller
 * GET /api/transactions/:id
 * Protected route
 */

async function getTransactionByIdController(req, res, next) {
  const { id } = req.params;
  const user = req.user;

  try {
    const userAccounts = await accountModel.find({
      user: user._id,
    });

    const accountIds = userAccounts.map((account) => account._id);

    //find transaction by id, and user owns it
    const transaction = await transactionModel
      .findOne({
        _id: id,
        $or: [
          { fromAccount: { $in: accountIds } },
          { toAccount: { $in: accountIds } },
        ],
      })
      .populate("fromAccount")
      .populate("toAccount");

    if (!transaction) {
      return res.status(400).json({
        message: "Transaction not found",
      });
    }

    //else means found, return transaction

    return res.status(200).json({
      transaction,
    });
  } catch (error) {
    //global error handler will catch this
    next(error);
  }
}

module.exports = {
  getTransactionController,
  getTransactionByIdController,
};
