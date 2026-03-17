const transactionModel = require("../models/transaction.model");
const ledgerModel = require("../models/ledger.model");

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
 * 8. update transaction status to COMPLETED
 * 9. commit mongo db session
 * 10. send email
 */

async function createTransaction(req, res) {
  const { fromAccount, toAccount, amount, idempotencyKey } = req.body;
  //validate this values, from , to , amount, ikey
  if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
    return res.status(400).json({
      message:
        "Invalid request, fromAccount, toAccount, amount and idempotencyKey are required",
    });
  }

  //continue from 2:13:13
}
