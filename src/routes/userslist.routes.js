const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const { getUserListController } = require("../controllers/userlist.controller");
const {
  getAccountDetailsController,
} = require("../controllers/accountdetails.controller");

const { param } = require("express-validator");
const validateRequest = require("../middleware/validation.middlware");
const router = express.Router();
/**
 * @route GET /api/userslist/
 * - user controller to get list of users
 */

router.get("/", authMiddleware.authMiddleware, getUserListController);

/**
 * @route GET /api/userslist/:id
 * - user controller to get user details by id
 */
router.get(
  "/:id",
  authMiddleware.authMiddleware,
  param("id").isMongoId().withMessage("Valid user ID is required"),
  validateRequest,
  getAccountDetailsController,
);

module.exports = router;
