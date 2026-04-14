const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const orderController = require("../controllers/order.controller");
//need the router
const router = express.Router();

/**
 * @route POST /api/orders/create-order
 * - Create a new order for payment usinf Razorpay
 * - Protected route
 */
router.post(
  "/create-order",
  authMiddleware.authMiddleware, //should be authenticated to create order
  orderController.createOrderController,
);

/**
 * @route POST /api/verify-payment
 * - Verify the payment after the user completes the payment on the frontend
 * - Protected route
 */
router.post(
  "/verify-payment",
  authMiddleware.authMiddleware, //should be authenticated to verify payment
  orderController.verifyOrderController,
);

module.exports = router;
