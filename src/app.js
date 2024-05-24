/**
 * @file app.js
 * @fileoverview Entry point of the Express application.
 * This file configures and initializes the Express server,
 * sets up middleware for security, logging, parsing requests,
 * authentication, session management, error handling,
 * and defines routes for various endpoints.
 * 
 * @requires express
 * @requires morgan
 * @requires cors
 * @requires errorHandler
 * @requires AuthRouter
 * @requires ProfileRouter
 * @requires ContactRouter
 * @requires SpamRouter
 * @requires SearchRouter
 * @requires TokenRouter
 * @requires passport
 * @requires helmet
 * @requires passportConfig
 * @requires session
 */

const express = require("express");
const morgan = require("morgan");
const cors = require('cors');
const errorHandler = require("./middlewares/error.handler");
const AuthRouter = require('./routes/Auth/index');
const ProfileRouter = require('./routes/Profile/index');
const ContactRouter = require('./routes/Contact/index');
const SpamRouter = require('./routes/Spam/index');
const SearchRouter = require('./routes/Search/index');
const TokenRouter = require('./routes/Token/index');
const passport = require('passport');
const helmet = require('helmet');
const { passportConfig } = require("./config/passport.config");
const session = require('express-session');

const app = express();

// helmet middleware
app.use(helmet());

// cors middleware
app.use(cors());

/**
 * Log HTTP requests to the console.
 */
app.use(morgan("dev"));

/**
 * Parse incoming request bodies in JSON format.
 */
app.use(express.json());

/**
 * Parse incoming request bodies in URL-encoded format.
 */
app.use(express.urlencoded({ extended: false }));

/**
 * Initialize Passport.js for authentication.
 */
passportConfig(passport);

/**
 * Configure express-session middleware.
 */
app.use(
    session({
        secret: "yoursecretkey",
        resave: false,
        saveUninitialized: true,
        cookie: { secure: true }, // for demo purpose only, set to true in a production environment
    })
);

/**
 * Handle root endpoint.
 */
app.get("/", (req, res) => {
    res.status(200).send("Welcome !!!");
});

/**
 * Route for authentication-related endpoints.
 */
app.use('/api/auth', AuthRouter);

/**
 * Route for profile-related endpoints.
 */
app.use('/api/profile', ProfileRouter);

/**
 * Route for contact-related endpoints.
 */
app.use('/api/contact', ContactRouter);

/**
 * Route for spam-related endpoints.
 */
app.use('/api/spam', SpamRouter);

/**
 * Route for search-related endpoints.
 */
app.use('/api/search', SearchRouter);

/**
 * Route for token-related endpoints.
 */
app.use('/api/token', TokenRouter);

/**
 * Error handling middleware.
 */
app.use(errorHandler);

module.exports = app;
