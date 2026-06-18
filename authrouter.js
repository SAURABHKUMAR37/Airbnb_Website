const express = require("express");
const authrouter = express.Router();
const authController = require("./controllers/authControllers");

authrouter.get("/signup", authController.getSignup);
authrouter.post("/signup", authController.postSignup);

authrouter.get("/login", authController.getLogin);
authrouter.post("/login", authController.postLogin);

authrouter.post("/logout", authController.postLogout);

// ← ADD KARO
authrouter.get("/forgot-password", authController.getForgotPassword);
authrouter.post("/forgot-password", authController.postForgotPassword);

authrouter.get("/reset-password/:token", authController.getResetPassword);
authrouter.post("/reset-password/:token", authController.postResetPassword);

module.exports = authrouter;