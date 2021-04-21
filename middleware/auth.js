// this code iis to check if the user is loged in and if logged in give permission to authorise
//this is automated middleware if we want to create anything after the user is logged in
const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.cookies.token; // getting the incoming cookies which has the token of user and saving to the token constant
    if (!token)
      //if there is no any token i.e no any user is currently logged in then  respond with unauthorised
      return res.status(401).json({
        errorMessage: "unAuthorised!!",
      });
    const verified = jwt.verify(token, process.env.JWT_SECRET); //now checking the token we have with the the secret password so that the token is secured and storing it to verified constant
    // console.log(verified);

    req.user = verified.user; //so this is for later  user. in usercontroller in jwt.sign() we passed id is user so now we have the the id which is specific to each user and we are storing that id in req object as req.user so if we want to use it later on we ll use it as req.user

    next(); //completing this code and jumping to the next function code
  } catch (error) {
    res.status(401).json({
      errorMessage: "unauthorised!!",
    });
  }
};
module.exports = auth;
