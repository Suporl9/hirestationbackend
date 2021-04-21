const mongoose = require("mongoose");

const JobSchema = mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("job", JobSchema);
