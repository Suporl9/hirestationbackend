const serviceModel = require("../model/serviceModel");

const postService = async (req, res) => {
  try {
    const { name } = req.body; //we ll only be sending the name font the post so destructing it
    const newService = new serviceModel({
      //sending name to model
      name,
    });
    newService.save(); //and saving it to the database
    res.status(201).json({
      message: "successful",
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllServices = async (req, res) => {
  try {
    const getServices = await serviceModel.find(); //finding all users from database and sending json to the browser
    return res.status(200).json({
      services: getServices,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllServices,
  postService,
};
