//express
const express = require('express')
const app = express()
//database
const ConnectDatabase = require('./db/connect');
const port = process.env.PORT || 5000

//other packages
const colors = require('colors');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();
require('express-async-errors');

//middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');
const authRouter = require('./routes/authRoutes');
const userRouter = require('./routes/userRoutes');

//middleware      
app.use(morgan('tiny'));
app.use(express.json());
app.use(cookieParser(process.env.COOKIE_SECRET))

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);

app.get('/', (req, res) => {
  res.send('hello from simple server :)');
});

app.get('/cookie', (req, res) => {
//   console.log(req.cookies);
  console.log(req.signedCookies);
  res.send('check in terminal');
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


app.listen(port, () => {
    console.log(`> Server is up and running on : http://localhost:${port} `.green.bgWhite);
    ConnectDatabase();
  });
