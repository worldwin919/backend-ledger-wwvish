const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");
const accountModel = require("../models/account.models");
const mongoose = require("mongoose");

/**
 * @desc Create a new transaction
 * 10 STEPS PROCESS
 * 1. Validate request body (amount, fromAccount, toAccount)
 * 2. validate idempotency key
 * 3. check account status
 * 4. derive sender balace
 * 5. create transaction record with status PENDING
 * 6. create ledger entry for sender (DEBIT)
 * 7. create ledger entry for receiver (CREDIT)
 * 8. update transaction status to COMPLETED=
 * 9. commit mongo db session
 * 10. send email
 */

async function createTransaction(req, res, next) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  //validate this values, from , to , amount, ikey
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message:
        "Invalid request, fromAccount, toAccount, amount and idempotencyKey are required",
    });
  }

  //continue from 2:13:13
  //1. valdiate request
  try {
    const fromUserAccount = await accountModel.findOne({
      _id: fromAccount,
    });

    const toUserAccount = await accountModel.findOne({
      _id: toAccount,
    });

    if (!fromUserAccount || !toUserAccount) {
      return res.status(404).json({
        message: "One or both accounts not found",
      });
    }

    //2. validate idempotency key
    const transactionExists = await transactionModel.findOne({
      idempotencyKey: idempotencyKey,
    });

    if (transactionExists) {
      if (transactionExists.status == "COMPLETED") {
        return res.status(200).json({
          message: "Transaction already completed",
          transaction: transactionExists,
        });
      }

      if (transactionExists.status == "PENDING") {
        // Attempt to complete the pending transaction
        try {
          // Check if ledger entries exist
          const existingDebits = await ledgerModel.find({
            transaction: transactionExists._id,
            type: "DEBIT",
          });
          const existingCredits = await ledgerModel.find({
            transaction: transactionExists._id,
            type: "CREDIT",
          });

          if (existingDebits.length > 0 && existingCredits.length > 0) {
            // Ledger entries exist, mark as completed
            transactionExists.status = "COMPLETED";
            await transactionExists.save();
            return res.status(200).json({
              message: "Transaction completed successfully",
              transaction: transactionExists,
            });
          } else {
            // Incomplete, mark as failed and retry
            transactionExists.status = "FAILED";
            await transactionExists.save();
            // Continue to create new transaction
          }
        } catch (error) {
          //global error handler will catch this
          next(error);
        }
      }

      if (transactionExists.status == "FAILED") {
        return res.status(200).json({
          message: "Transaction failed previously, please try again",
          transaction: transactionExists,
        });
      }

      if (transactionExists.status == "REVERSED") {
        return res.status(500).json({
          message: "Transaction was reversed, please try again",
        });
      }
    }

    /**
     * 3. check account status
     */
    if (
      fromUserAccount.status != "ACTIVE" ||
      toUserAccount.status != "ACTIVE"
    ) {
      return res.status(400).json({
        message:
          "Both sender and receiver accounts must be active to perform a transaction",
      });
    }

    /**
     * 4. derive sender balance
     * we will use Aggregation pipeline for this
     */
    const balance = await fromUserAccount.getBalance();
    //check if balance is sufficient or not
    if (balance < amount) {
      return res.status(400).json({
        message: `Insufficient balance, Current balance is ${balance}. Required balance is ${amount}`,
      });
    }

    /**
     * 5. create transaction record with status PENDING
     */

    //need to create session for transaction , need mongoose pacakgage for this
    const session = await mongoose.startSession();
    session.startTransaction();
    //all the tasks from5 -8 should be either done complelety or even one fails then all should be rolled back ,so we use transaction for this
    const [transaction] = await transactionModel.create(
      [{ fromAccount, toAccount, amount, idempotencyKey, status: "PENDING" }],
      { session },
    );
    //create Ledger entry for sender (DEBIT)
    await ledgerModel.create(
      [
        {
          account: fromAccount, //deduct money from from account (sender)
          amount: amount,
          transaction: transaction._id,
          type: "DEBIT",
        },
      ],
      { session },
    );

    //create Ledger entry for reciever (CREDIT)
    await ledgerModel.create(
      [
        {
          account: toAccount, //add money to to account (receiver)
          amount: amount,
          transaction: transaction._id,
          type: "CREDIT",
        },
      ],
      { session },
    );

    //completing transsaction , can even add thing like  upi paymeny or netbanking here
    transaction.status = "COMPLETED";
    await transaction.save({ session });
    //now commit the session
    await session.commitTransaction();
    session.endSession();
    /**
     *  10. send email
     *  skipping for now , need to add email service, node mailer
     */

    //transaction successful
    return res.status(200).json({
      message: "transaction completed sucessfully",
      transaction: transaction,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get all transactions for the authenticated user
 */
async function getTransactionsController(req, res, next) {
  try {
    // Get all accounts of the user
    const userAccounts = await accountModel.find({ user: req.user._id });
    const accountIds = userAccounts.map((account) => account._id);

    // Find transactions where fromAccount or toAccount is in user's accounts
    const transactions = await transactionModel
      .find({
        $or: [
          { fromAccount: { $in: accountIds } },
          { toAccount: { $in: accountIds } },
        ],
      })
      .populate("fromAccount toAccount")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      message: "Transactions retrieved successfully",
      transactions,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @desc Get a specific transaction by ID
 */
async function getTransactionByIdController(req, res) {
  try {
    const { id } = req.params;

    // Get user's accounts
    const userAccounts = await accountModel.find({ user: req.user._id });
    const accountIds = userAccounts.map((account) => account._id);

    // Find transaction and ensure it belongs to user's accounts
    const transaction = await transactionModel
      .findOne({
        _id: id,
        $or: [
          { fromAccount: { $in: accountIds } },
          { toAccount: { $in: accountIds } },
        ],
      })
      .populate("fromAccount toAccount");

    if (!transaction) {
      return res.status(404).json({
        message: "Transaction not found or access denied",
      });
    }

    return res.status(200).json({
      message: "Transaction retrieved successfully",
      transaction,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  createTransaction,
  getTransactionsController,
  getTransactionByIdController,
};
