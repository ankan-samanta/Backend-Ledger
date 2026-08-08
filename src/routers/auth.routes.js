const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");


router.post("/register",authController.userRegisterController);

router.post("/login",authController.userLoginController);

router.post("/logout",authController.userLogoutController);

module.exports = router;