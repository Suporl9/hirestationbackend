const serviceModel = require("../model/serviceModel");
const ErrorHandler = require("../utils/errorHandler");

//create new service => localhost/services/new  POST  and posting in the database
const postService = async (req, res) => {
  try {
    const service = await serviceModel.create(req.body); //this creates and triggers  the .save to save our req on the database
    return res.status(201).json({
      success: true,
      service,
    });
  } catch (error) {
    // return res.status(400).json({
    //   message: "dont leave anything blank please!",
    // });
    console.log(error);
  }
};
//get all the services in the database!! GET => services/
const getAllServices = async (req, res) => {
  try {
    const getServices = await serviceModel.find();

    return res.status(200).json({
      success: true,
      count: getServices.length,
      getServices,
    });
  } catch (error) {
    console.log(error);
  }
};

//get single sercive title and details!!  GET => services/:id
const getAService = async (req, res, next) => {
  try {
    const id = req.params.id;
    const getService = await serviceModel.findById(id);
    if (!getService) {
      return next(new ErrorHandler("Service not found!!", 404)); //if anything is passed as argument  in the next method express treats it as error   //pass return so that  next  line wont run and the  server will crash
    }

    return res.status(200).json({
      success: true,
      getService,
    });
  } catch (error) {
    console.log(error);
  }
};
const updateService = async (req, res) => {
  try {
    const id = req.params.id;
    const updateSer = await serviceModel.findById(id); //using let cause  we will be changing the updateSer later on

    if (!updateSer) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
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
  } catch (error) {
    console.log(error);
  }
};
//now for the deleting the service by id provided from the user

const deleteService = async (req, res) => {
  try {
    const id = req.params.id;
    const deleteServ = await serviceModel.findById(id);

    if (!deleteServ) {
      return res.status(404).json({
        success: false,
        message: "Service not found",
      });
    }
    await deleteServ.remove();

    return res.status(200).json({
      success: true,
      message: "successfully deleted the service",
      data: {},
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllServices,
  postService,
  getAService,
  updateService,
  deleteService,
};
