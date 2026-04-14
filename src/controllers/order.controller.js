const Razorpay = require("razorpay");
const crypto = require("crypto");
const transactionController = require("./transaction.controller");

//razorpay instance

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY,
  key_secret: process.env.RAZORPAY_SECRET,
});

async function createOrderController(req, res) {
  const { amount } = req.body;

  try {
    const options = {
      amount: amount * 100, //razorpay works with paise
      currency: "INR",
      receipt: "txn_" + Date.now(), //unique receipt id
    };
    const order = await razorpay.orders.create(options);

    res.status(201).json({
      success: true,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating order",
      error: error.message,
    });
  }
}

//2. verify the payment
async function verifyOrderController(req, res, next) {
  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
    fromAccount,
    toAccount,
    amount,
    idempotencyKey,
  } = req.body;

  const generate_signature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(razorpay_order_id + "|" + razorpay_payment_id)
    .digest("hex");

  console.log("Generated Signature: ", generate_signature);

  //check and verufy the signature

  if (generate_signature === razorpay_signature) {
    //payment is successful and verified
    //now call the transaction controller to transfer the money from from_account to to_account
    //our orignal transfer method
    console.log("sucessfully verified payment, now creating transaction");

    const transReq = {
      body: { fromAccount, toAccount, amount, idempotencyKey },
    };

    const result = await transactionController.createTransaction(
      transReq,
      res,
      next,
    );
    // Only send a response if createTransaction did NOT already send one
    if (!res.headersSent) {
      if (result.success) {
        res
          .status(200)
          .json({ success: true, transaction: result.transaction });
      } else {
        res.status(500).json({ success: false, message: "Transaction failed" });
      }
    }
  } else {
    //else the signature is not matched, so payment is not verified, we can also refund the payment here if we want, for now just send the response
    res.status(400).json({
      success: false,
      message: "Payment verification failed, invalid signature",
    });
  }
}

module.exports = {
  createOrderController,
  verifyOrderController,
};
