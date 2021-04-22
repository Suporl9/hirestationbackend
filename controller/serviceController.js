const serviceModel = require("../model/serviceModel");

//create new service => localhost/services  GET  and posting in the database
const postService = async (req, res) => {
  try {
    const service = await serviceModel.create(req.body); //this creates and triggers  the .save to save our req on the database
    res.status(201).json({
      success: true,
      service,
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllServices = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "working  currently but needs to be modified",
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllServices,
  postService,
};
