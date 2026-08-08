const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const transactionRoutes = express.Router();
const transactionController = require("../controllers/transaction.controller");

/**
 * - post/api/transaction/
 * - creaet a new transaction api
 */

transactionRoutes.post("/",authMiddleware.authMiddleware,transactionController.createTransaction);

/**
 * - post/api/transaction/system/initial-funds
 *  - create initial funds transaction from system user.
 */

transactionRoutes.post("/system/initial-funds",authMiddleware.authSystemUserMiddleware,transactionController.createInitialFundsTransaction)


module.exports = transactionRoutes;