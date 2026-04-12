const { Router } = require("express");
const { param, body } = require("express-validator");
const authMiddleware = require("../middleware/auth.middleware");
const validateRequest = require("../middleware/validation.middlware");
const transactionRoutes = Router();
const transactionController = require("../controllers/transaction.controller");

/**
    @route POST /api/transactions/
    @desc Create a new transaction
    @access Protected
*/

transactionRoutes.post(
  "/",
  authMiddleware.authMiddleware,
  body("fromAccount")
    .isMongoId()
    .withMessage("Valid fromAccount ID is required"),
  body("toAccount").isMongoId().withMessage("Valid toAccount ID is required"),
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0"),
  body("idempotencyKey").isString().withMessage("Idempotency key is required"),
  validateRequest,
  transactionController.createTransaction,
);

/**
 *  @route GET /api/transactions/
 *  @desc Get all transactions for the authenticated user
 *  @access Protected
 */
transactionRoutes.get(
  "/",
  authMiddleware.authMiddleware,
  transactionController.getTransactionsController,
);

/**
 *  @route GET /api/transactions/:id
 *  @desc Get a specific transaction by ID
 *  @access Protected
 */
transactionRoutes.get(
  "/:id",
  authMiddleware.authMiddleware,
  param("id").isMongoId().withMessage("Valid transaction ID is required"),
  validateRequest,
  transactionController.getTransactionByIdController,
);

module.exports = transactionRoutes;
