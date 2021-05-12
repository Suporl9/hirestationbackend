const ordersModel = require("../model/ordersModel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const { findById } = require("../model/ordersModel");

//post an order bya user => GET order/new
const postOrder = async (req, res) => {
  const { orderItems, paymentInfo, totalPrice } = req.body;

  const order = await ordersModel.create({
    orderItems,
    paymentInfo,
    totalPrice,
    user: req.user._id,
    paidAt: Date.now(),
  });

  res.status(200).json({
    success: true,
    order,
  });
};

//get a single order according to id

const getSingleOrder = async (req, res, next) => {
  const order = await ordersModel
    .findById(req.params.id)
    .populate("User", "fullname email");
  if (!order) {
    return next(new ErrorHandler("No order found with this ID", 404));
  }

  res.status(200).json({
    success: true,
    order,
  });
};

//get logged in user orders // to be done by admin user //GET => order/me

const myOrders = async (req, res) => {
  //   req.body.user = req.user._id;
  const orders = await ordersModel.find({ user: req.user._id });

  res.status(200).json({
    success: true,
    orders,
  });
};

//oders by the admin which will be user // GET => order/myOrders
//////////////////////////////////////////////////////////////////////////////////////////////////////
//this is wrong  //find an alternative way to fix this
const userAdminOrders = async (req, res) => {
  const orders = await ordersModel.find({ user: req.user._id });

  let totalAmount = 0;

  orders.forEach((order) => {
    totalAmount = totalAmount + order.totalPrice;
  });

  res.status(200).json({
    success: true,
    totalAmount,
    orders,
  });
};

//update service from statuscode from processig to delivered //PUT => order/myOrders/:id

const userUpdateOrder = async (req, res, next) => {
  const order = await ordersModel.findById(req.params.id);

  if (order.orderStatus === "Delivered") {
    return next(new ErrorHandler("This order is already delivered"));
  }

  order.orderStatus = req.body.orderStatus;

  await order.save();
  res.status(200).json({
    success: true,
  });
};

//delete the service by the admin  user //DELETE => order/myOrders/:id

const userDeleteOrder = async (req, res, next) => {
  const order = await ordersModel.findById(req.params.id);

  if (!order) {
    return next(new ErrorHandler("order not found with this id"));
  }

  await order.remove();
  res.status(200).json({
    success: "true",
  });
};

module.exports = {
  postOrder,
  getSingleOrder,
  myOrders,
  userAdminOrders,
  userUpdateOrder,
  userDeleteOrder,
};
