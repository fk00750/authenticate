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
const swaggerUI = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocumentation = YAML.load('./swagger.yaml')
const path = require('path')
const rateLimit = require("express-rate-limit");
const cookieParser = require('cookie-parser')

const app = express();

/**
 * Define allowed origins for CORS (Cross-Origin Resource Sharing) policy.
 */
const allowedOrigins = ["https://authenticate-kx0v.onrender.com"];
const corsOptions = {
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}
app.use(cors(corsOptions))

/**
 * Apply various security-related HTTP headers to the responses.
 * @see {@link https://www.npmjs.com/package/helmet} for more information about helmet middleware.
 */
app.use(
    helmet({
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                connectSrc: ["'self'", "https://authenticate-kx0v.onrender.com"],
            },
        },
        referrerPolicy: { policy: "no-referrer" },
        hsts: {
            maxAge: 21945600, // 254 days
            includeSubDomains: false,
        },
        frameguard: {
            action: "deny",
        },
        noSniff: true,
    })
);

// cookie parser
app.use(cookieParser())

/**
 * Log HTTP requests to the console.
 */
// app.use(morgan("dev"));

/**
 * Parse incoming request bodies in JSON format.
 */
app.use(express.json());

// /**
//  * Parse incoming request bodies in URL-encoded format.
//  */
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

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(swaggerDocumentation))

/**
 * Handle root endpoint.
 */
app.use(express.static(path.join(__dirname, '..', 'docs', 'jsdoc')));
app.get("/", (req, res) => {
    const filePath = path.join(__dirname, '..', 'docs', 'jsdoc', 'index.html');
    return res.sendFile(filePath);
});

/**
 * test data
 */
app.get("/test-data", (req, res) => {
    const filePath = path.join(__dirname, '..', 'data.html');
    return res.sendFile(filePath);
});


const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 min
    max: 100, // limit each IP to 100 requests per window (100 req per 15 min)
    message: "Too many requests, please try again later.",
});

/**
 * Route for authentication-related endpoints.
 */
app.use('/api/auth', authLimiter, AuthRouter);

/**
 * Route for profile-related endpoints.
 */
app.use('/api/profile', authLimiter, ProfileRouter);

/**
 * Route for contact-related endpoints.
 */
app.use('/api/contact', authLimiter, ContactRouter);

/**
 * Route for spam-related endpoints.
 */
app.use('/api/spam', authLimiter, SpamRouter);

/**
 * Route for search-related endpoints.
 */
app.use('/api/search', authLimiter, SearchRouter);

/**
 * Route for token-related endpoints.
 */
app.use('/api/token', authLimiter, TokenRouter);


/**
 * Error handling middleware.
 */
app.use(errorHandler);

module.exports = app;
