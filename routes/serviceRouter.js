const express = require("express");
const router = express.Router();
const serviceController = require("../controller/serviceController");
const auth = require("../middleware/auth");

//auth is a custom middleware to verifying the token and creating customer if only there is the token or user is logged in already

router.route("/new").post(auth, serviceController.postService); //if the user is logged in or has the token still available then only he will be able to create a new customer or else it would be unauthorized

//get all the services in the database
router.route("/").get(auth, serviceController.getAllServices);

//get  a single service according to the id passed from the database
router.route("/:id").get(auth, serviceController.getAService);

//update the service //for eg the title and other body can be updated

router.route("/:id").put(auth, serviceController.updateService);

//for deleting  the service //according the objectid  ofcourse
router.route("/:id").delete(auth, serviceController.deleteService);

module.exports = router;
