require('dotenv').config();
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var productRouter = require('./src/routes/product.routes');
var categoryRouter = require('./src/routes/category.routes')
var adminRouter = require('./src/routes/admin.routes')
var userRouter = require('./src/routes/user.routes')
const orderRouter = require('./src/routes/order.routes')
const cartRouter = require('./src/routes/cart.routes');


var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/v1/products', productRouter); 
app.use('/api/v1/category', categoryRouter);
app.use('/api/v1/admin', adminRouter);
app.use('/api/v1/user', userRouter);
app.use('/api/v1/orders', orderRouter);
app.use('/api/v1/cart', cartRouter);

module.exports = app;
