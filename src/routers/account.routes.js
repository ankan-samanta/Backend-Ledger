const express = require("express");
const authMiddleware = require("../middleware/auth.middleware");
const accountController = require("../controllers/account.controller");

const router = express.Router();

/**
 * - POST/api/accounts/
 * - create a new account
 * - proteted route
 */

router.post("/",authMiddleware.authMiddleware,accountController.createAccount);

/**
 * - get/api/accounts/
 * - get all accounts of the logged-in user
 * - protected route
 */

router.get("/",authMiddleware.authMiddleware,accountController.getUserAccount);

/**
 * - GET/api/accounts/balance/:accountId
 */
router.get("/balance/:accountId",authMiddleware.authMiddleware,accountController.getAccountBalance);


module.exports = router;