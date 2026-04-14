const crypto = require("crypto");
// Replace these with your actual values
const order_id = "order_ScYi9urrGEuMjh"; // paste from create-order response
const payment_id = "pay_test123"; // fake payment id for testing

const secret = process.env.SIGNATURE_SECRET; // use the same secret as RAZORPAY_SECRET for testing

if (!secret) {
  console.error("SIGNATURE_SECRET is undefined. Check your .env file.");
  process.exit(1);
}

const signature = crypto
  .createHmac("sha256", secret)
  .update(order_id + "|" + payment_id)
  .digest("hex");

console.log("Generated Signature:", signature);
