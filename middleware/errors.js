const ErrorHandler = require("../utils/errorHandler");

module.exports = (err, req, res, next) => {
  //if tthere are four arguments in middlewate express  knows its an error handling middleware
  err.statusCode = err.statusCode || 500; //we could havejust passed err.statuscode since we already have statuscode and message but we are passing || (or) so we are doing  like this
  err.message = err.message || "Internal Server Error";

  //if we are in development mode use this code showing all the generic errors like message statuscode and the stack trace
  if (process.env.NODE_ENV === "DEVELOPMENT") {
    res.status(err.statusCode).json({
      success: false,
      error: err,
      message: err.message,
      stack: err.stack,
    });
  }

  //if we are in the produciton mode then use this code //this  is  for the user or the client
  if (process.env.NODE_ENV === "PRODUCTION") {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  //   console.log(err);
};
