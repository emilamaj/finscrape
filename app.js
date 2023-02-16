// This app periodically sends requests to binance to get the price of ethereum.
// The prices are then stored in a mongodb database

// Importing the required modules
const mongoose = require('mongoose');
require('dotenv').config();
const markets = require('./markets/markets');
const odb = require('./utils/orderbook');

// Connect to the database
mongoose.set('strictQuery', true);
mongoose.connect(process.env.MONGODB_ADDRESS) // Connecting to the database
.then(() => {
    console.log("DB CONNECTED");
});
const priceTick = require('./models/priceTick'); // Importing the model for the priceTick collection



// Subscribe to binance order book updates
markets.subscribeOrderBook('binance', "ETHUSDT", (orderBook) => {
    // console.log(orderBook);
});


