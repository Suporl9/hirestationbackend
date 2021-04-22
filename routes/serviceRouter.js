const express = require("express");
const router = express.Router();
const serviceController = require("../controller/serviceController");
const auth = require("../middleware/auth");

//auth is a custom middleware to verifying the token and creating customer if only there is the token or user is logged in already

router.route("/").post(auth, serviceController.postService); //if the user is logged in or has the token still available then only he will be able to create a new customer or else it would be unauthorized

router.route("/").get(auth, serviceController.getAllServices);

module.exports = router;
