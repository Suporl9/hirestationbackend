const express = require("express");
const router = express.Router();
const serviceController = require("../controller/serviceController");
const isAuthenticatedUser = require("../middleware/auth");

//auth is a custom middleware to verifying the token and creating customer if only there is the token or user is logged in already

router.route("/new").post(isAuthenticatedUser, serviceController.postService); //if the user is logged in or has the token still available then only he will be able to create a new customer or else it would be unauthorized

//get all the services in the database
router.route("/").get(isAuthenticatedUser, serviceController.getAllServices); //isauthenticated has _id so it knows which user //in req.user

//get  a single service according to the id passed from the database
router.route("/:id").get(serviceController.getAService);

//update the service //for eg the title and other body can be updated

router.route("/:id").put(isAuthenticatedUser, serviceController.updateService);

//for deleting  the service //according the objectid  ofcourse
router
  .route("/:id")
  .delete(isAuthenticatedUser, serviceController.deleteService);

module.exports = router;
