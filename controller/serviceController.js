const serviceModel = require("../model/serviceModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const APIFeatures = require("../utils/apiFeatures");
const userModel = require("../model/usermodel");
//create new service => localhost/services/new  POST  and posting in the database
//wraps with the middleware and if here are not  any errors it resolves..if itt has any error it rejects and  sents to the error Handler middleware

const postService = catchAsyncErrors(async (req, res, next) => {
  req.body.user = req.user._id; //we set req.user in auth so we have a user which was verified with the token//and in user it has user id obviously

  //creating new instance of the servicemodel before saving it into the database
  const service = new serviceModel(req.body);

  //getting the current user id  whcih the req.body.user has
  const user = await userModel.findById(req.body.user);

  // console.log(user);

  // setting the user in the service schema to the current user
  service.user = user;

  //

  service.seller = user.fullname;

  service.sellerBio = user.bio;
  //and then saving
  await service.save();

  //pushing the curren service details whic contains the user id in the user schema
  user.services.push(service);

  //saving the service _id  to the user schema
  await user.save();

  return res.status(201).json({
    success: true,
    service,
  });
});

//get services posted by the user  => services/me

const getUserServices = catchAsyncErrors(async (req, res) => {
  let services = await serviceModel.find({ user: req.user._id });
  // .populate("User");
  services.services;
  res.status(200).json({
    success: true,
    services,
  });
});

//get all the services in the database!! GET => localhost/services and /services?keyword=graphics-design&category=Web-Development&price[gte]=1&price[lte]=20000 (graphics-design is the title)

const getAllServices = catchAsyncErrors(async (req, res) => {
  const resDataPerPage = 8;

  const servicesCount = await serviceModel.countDocuments();

  const apiFeatures = new APIFeatures(
    serviceModel.find().populate("user"),
    req.query
  )
    .search()
    .filter();

  let getServices = await apiFeatures.query;
  let filteredServiceCount = getServices.length;

  // console.log(apiFeatures);
  apiFeatures.pagination(resDataPerPage); //chained the search function in class apifeatures because  we returned this.this function is commented on apifeatures class
  getServices = await apiFeatures.query;

  // const getServices = await serviceModel.find(); //this is a query

  return res.status(200).json({
    success: true,
    filteredServiceCount: filteredServiceCount,
    resDataPerPage,
    servicesCount,
    getServices,
  });
});

//get single service title and details!!  GET => services/:id

const getAService = catchAsyncErrors(async (req, res, next) => {
  const id = req.params.id;
  const getService = await serviceModel.findById(id).populate("user");
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

//routes for reviews

//psoting reviews //POST => services/review

const createServiceReview = async (req, res, next) => {
  const { rating, serviceId, comment } = req.body;

  // if (rating >= 5) {  //we will do  this in front end
  //   return next(new ErrorHandler("rating must be smaller than 5"), 400);
  // }

  const review = {
    //settting the user id and name form auth.js
    user: req.user._id,
    name: req.user.fullname,
    rating: Number(rating),
    comment,
  };

  const service = await serviceModel.findById(serviceId);

  const isServiceReviewed = service.reviews.find(
    //if the user has already reviewed //check the user id in the database  and the user id of the  user that is trying to review again
    (r) => r.user.toString() === req.user._id.toString()
  );

  //if the user already reviewed then only change comment and rating

  if (isServiceReviewed) {
    service.reviews.forEach((review) => {
      if (review.user.toString() === req.user._id.toString()) {
        review.comment = comment;

        review.rating = rating;
      }
    });
  } else {
    //if not then save the review to the database
    service.reviews.push(review); //pushing values  in reviews

    service.numOfReviews = service.reviews.length; //total numberof reviews  in a single service
  }

  //final ratings according to the  ratings  in reviews array

  // await service.review.reduce((acc, currentValue) => acc + currentValue.rating) / 5;

  service.ratings =
    service.reviews.reduce((acc, item) => item.rating + acc, 0) /
    service.reviews.length; //reducing all the ratings into a single  rating

  await service.save({ validateBeforeSave: true });

  res.status(200).json({
    success: true,
  });
};

//get service reviews => GET => reviews?id=""

const getServiceReviews = async (req, res, next) => {
  const service = await serviceModel.findById(req.query.id); //id of service //will pass in the url

  if (!service) {
    return next(new ErrorHandler("service not found!"));
  }

  res.status(200).json({
    success: true,
    reviews: service.reviews,
  });
};

//delete the reveiws  by an user (filter and then laer update) //DELETE => service/review

const deleteServiceReview = async (req, res) => {
  //providing  the service id in query
  const service = await serviceModel.findById(req.query.serviceId);
  //only take out(filter  out the reviews)//take everything out other than this condition => mathing string review id sent in query and review id in database)
  const reviews = service.reviews.filter(
    (review) => review._id.toString() !== req.query.id.toString()
  );
  // console.log(reviews.length);

  const numOfReviews = reviews.length; //new filtered reviews length

  const ratings = //something is wrong here  //ites doing 23  where the total value should have  been 8 + 5 + 5
    service.reviews.reduce((acc, item) => item.rating + acc, 0) / //here in reduce total is wrong //fix later
    reviews.length;

  await serviceModel.findByIdAndUpdate(
    req.query.serviceId,
    {
      reviews,
      ratings,
      numOfReviews,
    },
    {
      new: true, //the default is to send the old and unaltered document but if we set new to true  it returns the new altered document!
      runValidators: true,
      useFindAndModify: false,
    }
  );

  res.status(200).json({
    success: true,
  });
};

module.exports = {
  getAllServices,
  getUserServices,
  postService,
  getAService,
  updateService,
  deleteService,
  createServiceReview,
  getServiceReviews,
  deleteServiceReview,
};
