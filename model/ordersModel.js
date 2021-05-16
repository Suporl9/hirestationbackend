const mongoose = require("mongoose");

const ordersSchema = new mongoose.Schema({
  user: {
    //user that has placed the order
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  orderItems: [
    {
      title: {
        type: String,
        required: true,
      },
      image: {
        type: String,
        required: true,
      },
      // service user want to hire
      service: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "service",
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],

  paymentInfo: {
    // we will use stripe
    id: {
      type: String,
    },

    status: {
      type: String,
    },
  },

  paidAt: {
    type: Date,
  },
  deliveredAt: {
    type: Date,
  },
  totalPrice: {
    type: Number,
    required: true,
    default: 0.0,
  },
  orderStatus: {
    type: String,
    required: true,
    default: "Processing",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Order", ordersSchema);
