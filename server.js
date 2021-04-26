const express = require("express");
const colors = require("colors");
const path = require("path");
const dotenv = require("dotenv");
const app = express();
const userRouter = require("./routes/userRouter");
const serviceRouter = require("./routes/serviceRouter");
const ConnectDB = require("./config/db");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const ErrorMiddleWare = require("./middleware/errors");

//path for working with the directories

dotenv.config({ path: "./config/config.env" });

ConnectDB(); //connecting to the database

//middleware for parsing the json to javascript objects //the data is in string {name: "suporl",age: 20} and by parsing the json data  we are converting it to javascript obj.  ..so now const obj = {name: ...,age:...} ,andlater can be used as console.log(obj.name)
//and when sending data to the server like this we have to pass it as string and not object ..use json.stringify() then

app.use(cookieParser()); //parses cookie header and populates req.cookies //parses the incoming cookies and transform into objectt so we can read and use it

app.use(express.json());

app.use(
  //with cors we can pass the cookies and data back and forth!!
  cors({
    origin: "http://localhost:3000", //cors is cross platform to connect with the front end
    credentials: true, //with this we can pass the cookie from the server to the browser
  })
);

//our  routes in here  //or middlewares

app.use("/auth", userRouter);

app.use("/services", serviceRouter);

//middleware to handle the errors //this runs when the next is passed above
app.use(ErrorMiddleWare);

//connect to the PORT from the config.env and if there is any type of of error user 5000 as a port

const PORT = process.env.PORT || 5000;

//listen to the port

// const server =
app.listen(
  PORT,
  console.log(
    `RUNNING SERVER IN ${process.env.NODE_ENV} Mode in PORT ${process.env.PORT}`
      .yellow.bold
  )
);

//Handle the unhandled Promise Rejections  //to be done later

// process.on("unhandledRejection", (err) => {
//   console.log(`error: ${err.message}`);
//   console.log(`shutting down the server due to unHandled promise Rejection`);
//   server.close(() => {
//     process.exit(1);
//   });
// });
