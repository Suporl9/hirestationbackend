const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");

//registering route

router.route("/").post(userController.postRegisterController);

//loggin in route

router.route("/login").post(userController.postLogInController);

//logging out route

router.route("/logout").get(userController.getLogOutController);

//logged in route

router.route("/loggedin").get(userController.getLoggedin);

module.exports = router;
