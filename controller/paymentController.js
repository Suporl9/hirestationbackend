const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const processPayment = catchAsyncErrors(async (req, res) => {
  const paymentIntent = await stripe.paymentIntent.create({
    amount: req.body.amount,
    currency: "inr",
    metaData: {
      integration_check: "accept_a_payment",
    },
  });

  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_Secret,
  });
});

const getStripeApiKey = catchAsyncErrors(async (req, res, next) => {
  res.status(200).json({
    stripeApiKey: process.env.STRIPE_API_KEY,
  });
});

module.exports = {
  processPayment,
  getStripeApiKey,
};
