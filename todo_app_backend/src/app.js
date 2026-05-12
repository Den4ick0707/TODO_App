const createError = require('http-errors');
const express = require('express');
const logger = require('morgan');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cors = require('cors');
require('dotenv').config();


const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.urlencoded({extended: false}));

// CORS — allow credentials for sessions
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:8080',

    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type'],
    credentials: true, // required for session cookies
}));

// Session middleware with MongoDB store
app.use(session({
    secret: process.env.SESSION_SECRET || 'change_this_secret_in_production',
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI,
        dbName: process.env.DB_NAME || 'todo_db',
        collectionName: 'sessions',
        ttl: 60 * 60 * 24, // 1 day in seconds
    }),
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24, // 1 day in ms
    },
}));

// Swagger
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Todo Task API',
            version: '1.0.0',
            description: 'Todo App API with Authentication',
        },
        servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
    },
    apis: ['./src/routes/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Routes
const taskRouter = require('./routes/task_route');
const userRouter = require('./routes/user_route');
const { requireAuth } = require('./middlewares/auth_middleware');

app.use('/auth', userRouter);
app.use('/tasks', requireAuth, taskRouter); // all task routes are protected

// 404
app.use(function (req, res, next) {
    next(createError(404));
});

// Error handler
app.use(function (err, req, res, next) {
    const status = err.status || 500;
    res.status(status).json({
        message: err.message,
        error: process.env.NODE_ENV === 'development' ? err : {},
    });
});

module.exports = app;