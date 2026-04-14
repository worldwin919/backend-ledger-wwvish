const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");
const accountDetailsController = require("../controllers/accountdetails.controller");
const getAccountListController = require("../controllers/account.controller");
const { param, body } = require("express-validator");
const validateRequest = require("../middleware/validation.middlware");
const apiCache = require("apicache");
let cache = apiCache.middleware;//caching for single instance
const router = express.Router();

/**
 * @route POST /api/accounts/
 * - Create a new account
 * - Protected route
 */
router.post(
  "/",
  authMiddleware.authMiddleware,
  accountController.createAccountController,
);

/**
 * @route GET /api/accounts/
 * - Get all accounts of the authenticated user
 * - Protected route
 */
router.get(
  "/",
  authMiddleware.authMiddleware,
  cache("2 minutes"), //cache response for 2 min in memeory as single instsance for now
  getAccountListController.getAccountListController,
);
/**
 *  @route GET /api/accounts/:id
 *  - Get account details by ID
 *  - Protected route
 */
router.get(
  "/:id",
  authMiddleware.authMiddleware,
  param("id").isMongoId().withMessage("Valid account ID is required"),
  validateRequest,
  accountDetailsController.getAccountDetailsController,
);

/**
 * @route PUT /api/accounts/:id/deposit
 * - Deposit money into an account
 * - Protected route
 */

router.post(
  "/:id/deposit",
  authMiddleware.authMiddleware,
  param("id").isMongoId().withMessage("Valid account ID is required"),
  body("amount")
    .isFloat({ gt: 0 })
    .withMessage("Amount must be greater than 0"),
  validateRequest,
  accountController.depositController,
);

module.exports = router;
