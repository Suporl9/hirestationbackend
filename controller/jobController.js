const jobModel = require("../model/JobModel");

const postJob = async (req, res) => {
  try {
    const { name } = req.body; //we ll only be sending the name font the post so destructing it
    const newCustomer = new jobModel({
      //sending name to model
      name,
    });
    newCustomer.save(); //and saving it to the database
    res.status(201).json({
      message: "successful",
    });
  } catch (error) {
    console.log(error);
  }
};

const getAllJobs = async (req, res) => {
  try {
    const getcustomers = await jobModel.find(); //finding all users from database and sending json to the browser
    return res.status(200).json({
      customers: getcustomers,
    });
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllJobs,
  postJob,
};
