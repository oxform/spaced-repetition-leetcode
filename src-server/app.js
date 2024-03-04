const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");
const DB = require("./db.js");
const apiCards = require("./routes/api/cards");
const { authenticateFirebase } = require("./components/auth/helpers"); // middleware

module.exports = async () => {
  const app = express();
  console.log("yo");
  // Enable CORS
  const corsOptions = {
    origin: "http://localhost:3000", // or use a function to dynamically set origin based on the request
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true, // if your frontend needs to pass credentials
  };

  // Enable CORS using corsOptions
  app.use(cors(corsOptions));

  app.use((err, req, res, next) => {
    console.error(err.stack); // Logs the stack trace with line numbers
    res.status(500).send("Something broke!");
  });

  console.log("cors enabled");
  app.use(authenticateFirebase);

  // view engine setup
  // app.set('views', path.join(__dirname, 'views'));
  // app.set('view engine', 'ejs');

  // This is the middleware that logs requests to the console
  app.use(logger("dev"));

  // Important
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  const { db } = await DB();
  app.set("db", db);

  app.use(express.static(path.join(__dirname, "../public")));
  console.log("static files served");

  // passport.use(require('./components/auth/local')(app));
  // passport.use(require('./components/auth/jwt')(app));

  app.get("/", (req, res) => res.json({ status: "ok" }));
  // app.use('/auth', apiAuth(app));
  // app.use('/api', apiPosts(app));
  console.log("api routes set");
  app.use("/api", apiCards(app));

  console.log("api cards");
  /*
  app.use('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/app/dist/index.html'));
  });
  */

  // catch 404 and forward to error handler
  app.use((req, res, next) => {
    next(createError(404));
  });

  // error handler
  app.use((err, req, res) => {
    // send the error response
    res.status(err.status || 500);
    if (err.status === 401)
      res.send(
        '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0; url=/auth"></head></html>'
      );
    else res.send(err.message);
  });

  return app;
};
