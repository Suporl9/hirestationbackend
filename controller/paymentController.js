const catchAsyncErrors = require("../middleware/catchAsyncErrors");
//THIS SECTION DOES NOT GET STRIPE SECRET KEY FROM ENV VARIABLE SO HARDCODE IT(SECRET KEY) OR DECLARE DOTENV ON TOP
const stripe = require("stripe")(
  process.env.STRIPE_SECRET_KEY
);

// console.log("key", process.env.STRIPE_SECRET_KEY);
// console.log("key", process.env.STRIPE_API_KEY);
const processPayment = catchAsyncErrors(async (req, res) => {
  const paymentIntent = await stripe.paymentIntents.create({
    amount: req.body.amount,
    currency: "inr",
    metadata: {
      integration_check: "accept_a_payment",
    },
  });
  // console.log(paymentIntent.client_secret);
  res.status(200).json({
    success: true,
    client_secret: paymentIntent.client_secret,
  });
});

const getStripeApiKey = catchAsyncErrors(async (req, res, next) => {
  //  const  api_key = "pk_test_51J1YOYSCxWLgibrfXnUi24LohSZwjaTjoE0Fnlg6OotpxoRtL9lGcNXingXYb8pQv5QmIhSQPgf4e2XfRxOpQAvu00CI0FFLop"
  res.status(200).json({
    stripeApiKey: process.env.STRIPE_API_KEY,
  });
});

module.exports = {
  processPayment,
  getStripeApiKey,
};
