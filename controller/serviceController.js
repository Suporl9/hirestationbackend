const serviceModel = require("../model/serviceModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");

//create new service => localhost/services/new  POST  and posting in the database
const postService = catchAsyncErrors(async (req, res) => {
  const service = await serviceModel.create(req.body); //this creates and triggers  the .save to save our req on the database
  return res.status(201).json({
    success: true,
    service,
  });
});

//get all the services in the database!! GET => localhost/services
const getAllServices = catchAsyncErrors(async (req, res) => {
  const getServices = await serviceModel.find();

  return res.status(200).json({
    success: true,
    count: getServices.length,
    getServices,
  });
});

//get single service title and details!!  GET => services/:id
const getAService = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const getService = await serviceModel.findById(id);
  if (!getService) {
    return next(new ErrorHandler("Service not found!!", 404)); //if anything is passed as argument  in the next method express treats it as error   //pass return so that  next  line wont run and the  server will crash
  }

  return res.status(200).json({
    success: true,
    getService,
  });
});

//updating the service PATCH => services/:id
const updateService = catchAsyncErrors(async (req, res) => {
  const id = req.params.id;
  const updateSer = await serviceModel.findById(id); //using let cause  we will be changing the updateSer later on

  if (!updateSer) {
    return next(new ErrorHandler("Service no Found", 404));
    // res.status(404).json({
    //   success: false,
    //   message: "Service not found",
    // });
  }
  await updateSer.findByIdAndUpdate(id, req.body, {
    new: true, //the default is to send the old and unaltered document but if we set new to true  it returns the new altered document!
    // runValidators: true,
    useFindAndModify: false,
  }); //should pass third parameter object to avoid the deprication warning like findoneandupdate without useFindandModify  set to false are depricated

  return res.status(201).json({
    success: true,
    updateSer,
  });
});

//now for the deleting the service by id provided from the user DELETE => services/:id
const deleteService = catchAsyncErrors(async (req, res) => {
  const id = req.params.id;
  const deleteServ = await serviceModel.findById(id);

  if (!deleteServ) {
    return next(new ErrorHandler("Service Not Found!", 404));
    // res.status(404).json({
    //   success: false,
    //   message: "Service not found",
    // });
  }
  await deleteServ.remove();

  return res.status(200).json({
    success: true,
    message: "successfully deleted the service",
    data: {},
  });
});

module.exports = {
  getAllServices,
  postService,
  getAService,
  updateService,
  deleteService,
};
