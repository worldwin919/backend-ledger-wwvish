const express = require("express");
const authController = require("../controllers/auth.controller");
const { body } = require("express-validator");
const validateRequest = require("../middleware/validation.middlware");
const router = express.Router();
/* POST /api/auth/register */
router.post(
  "/register",
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").isLength(
    { min: 6 }).withMessage("Password must be at least 6 characters long"),
  validateRequest,
  authController.userRegistrationController,
);

/* POST /api/auth/login */
router.post(
  "/login",
  body("email").isEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required"),
  validateRequest,
  authController.userLoginController,
);

module.exports = router;
