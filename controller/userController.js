const UserModel = require("../model/usermodel");
const ErrorHandler = require("../utils/errorHandler");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail");

// register new user //post => localhost/auth/new

const postRegisterController = async (req, res) => {
  try {
    //destructing the req.body that we ll be sending to the database with the post request

    const { fullname, email, password, passwordverify } = req.body;

    //  validation

    //if the user does not enter all the fields we are sending the errmessage instead of just registering it

    if (!fullname || !email || !password || !passwordverify)
      return res.status(400).json({
        errorMessage: "Please enter all the required fields",
      });

    // if the user enter password less than 6 we send the errormessage to the frontend

    if (password.length < 6)
      return res.status(400).json({
        errorMessage: "Password must be more than 6 characters",
      });

    //   if the password doesnot match with the paswordverify we send the error

    if (password !== passwordverify)
      return res.status(400).json({
        errorMessage: "Please enter the same password twice!",
      });

    //For checking if the email entered by the user already exists in the database and if it exists then error message

    const existingUser = await UserModel.findOne({ email: email });

    if (existingUser)
      return res.status(400).json({
        errorMessage: "An account with this email already exists!",
      });

    //hashing the password using bcrypt //before saving it to the database

    const salt = await bcrypt.genSalt();

    const passwordHash = await bcrypt.hash(password, salt);

    //saving the email and hashedpassword in the database!!

    const newUser = new UserModel({ fullname, email, passwordHash });

    const savedUser = await newUser.save();

    //now log the user with JWT //this will only give token so that the user is logged in with a token

    const token = jwt.sign(
      //payload //data we want to store in token
      {
        user: savedUser._id,
      },
      process.env.JWT_SECRET
      //later add jwtexpirestime to expire after certain time//fot example 7 days,8 days or 1 hour
    );

    // console.log(token);

    //send the token to  the http only cookie.Doing that browser can send the cookie to the server and the server can validate the data
    res
      .cookie("token", token, {
        httpOnly: true,
        expires: new Date( //cookie expireswithin 7 days
          Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
      })
      .json({
        success: true,
        user: savedUser,
        token,
      });
  } catch (error) {
    console.error(err);
    res.status(500).send();
  }
};

// login post api with jwt bcrypt and http cookie!! post => localhost/auth/login

const postLogInController = async (req, res) => {
  try {
    //destructuring the values that we'll be sending to the server in login page

    const { email, password } = req.body;

    //Validation

    //if the email and passwords are correct

    if (!email || !password)
      return res
        .status(400)
        .json({ errorMessage: "Please fill all the fields." });

    //checking the sent email in the database from the server

    const existingUser = await UserModel.findOne({ email });

    //if not the correct email in database:

    if (!existingUser)
      return res.status(400).json({
        errorMessage: "Email or password is wrong!", //even if we know we are checking for email we dont want to let hackers know we if theyahave incorrect email or password!!
      });

    //checking if the password(hashed) is correct with bcrypt.compare

    const passwordCorrect = await bcrypt.compare(
      password,
      existingUser.passwordHash
    );

    //if the password is not correct

    if (!passwordCorrect)
      return res.status(400).json({
        errorMessage: "Email or password is wrong!",
      });

    //now making a token with jwt for the user

    const token = jwt.sign(
      {
        user: existingUser._id,
      },
      process.env.JWT_SECRET
    );

    //sending that token to cookie

    res
      .cookie("token", token, {
        httpOnly: true,
        expires: new Date( //expires after 7 days
          Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
        ),
      })
      .json({
        success: true,
        user: existingUser,
        token,
      });
  } catch (error) {
    console.log(error);
  }
};

//logout registered user //get => localhost/auth/logout

const getLogOutController = async (req, res) => {
  //removing the cookie on logging out

  res.cookie("token", "", {
    //he cookie will be set to an empty string instead of the the previous cookie

    httpOnly: true,
    expires: new Date(0),

    //international standard time apparanttly  //this clears the  cookie from the browser..so now the tokenis also removed
  });

  res.status(200).json({
    success: true,
    message: "Logged out",
  });
};

//to checkif the user is logged  in or not sends true is yes and false if not

//if the user is logged in//verify token from cookies and validate with JWT //GET => localhost/auth/loggedin

const getLoggedin = (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.json(false);

    jwt.verify(token, process.env.JWT_SECRET);
    //as the token is httponlys so we cant send the actual token insted send true if there is token and false if there is no any token !!
    res.send(true); //passing true as token is validated  //<= send  data to the client
  } catch (error) {
    res.json(false);
  }
};

//sends url to mail when  user forgets password // POST => auth/passwoed/forget
const forgotPassword = async (req, res, next) => {
  const user = await UserModel.findOne({ email: req.body.email });

  // const { resetPasswordToken, resetPa sswordExpire } = req.body;

  if (!user) {
    return next(new ErrorHandler("Invalid Email or Password", 404));
  }

  const resetToken = user.getResetPasswordToken();
  //if exists get reset token

  await user.save({ validateBeforeSave: false }); //disables automtic validation before save    //works when validated too

  //create reset password url

  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/auth/password/reset/${resetToken}`;
  const message = `Your password reset url is as follows:\n\n${resetUrl}.\n\nIf you didn't request .simply ignore it!`;
  //lets send it to a mail
  try {
    await sendEmail({
      email: user.email,
      subject: "Hire Station Password Recovery!",
      message,
    });

    res.status(200).json({
      success: true,
      message: `email is sent to ${user.email}`,
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler(error.message, 500));
  }
};

//for resetting the password when form is filled with password and new password //POST => auth/password/reset/:token
const ResetPassword = async (req, res, next) => {
  //comparing the token we have wih the hashed token in the database

  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");

  const user = await UserModel.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });
  if (!user) {
    return next(new ErrorHandler("Token not found or expired"));
  }

  if (req.body.password !== req.body.confirmPassword) {
    return next(new ErrorHandler("Password do not match!"));
  }

  const password = req.body.password;

  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  //hashing the password using bcrypt //before saving it to the database

  const salt = await bcrypt.genSalt();

  const passwordHashed = await bcrypt.hash(password, salt);

  user.passwordHash = passwordHashed;

  await user.save();

  const token = jwt.sign(
    {
      user: user._id,
    },
    process.env.JWT_SECRET
  );

  //sending that token to cookie

  res
    .cookie("token", token, {
      httpOnly: true,
      expires: new Date( //expires after 7 days
        Date.now() + process.env.COOKIE_EXPIRES_TIME * 24 * 60 * 60 * 1000
      ),
    })
    .json({
      success: true,
      user: user,
      token,
    });
};

module.exports = {
  postRegisterController,
  postLogInController,
  getLogOutController,
  getLoggedin,
  forgotPassword,
  ResetPassword,
};
