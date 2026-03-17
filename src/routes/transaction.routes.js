const {Router} = require("express");
const  authMiddleware  = require("../middleware/auth.middleware");

const transactionRoutes = Router();

/**
    * POST /api/transactions/
    - Create a new transaction
    - Protected route
*/

transactionRoutes.post("/", authMiddleware.authMiddleware);

module.exports = transactionRoutes;