// This file provides methods to get market data for a given pair on binance.

// Importing the required modules
const WebSocket = require('ws'); // Websocket client

// This function returns the list of all pairs on binance. This will be useful since subscriptions are made using a different pair naming convention than on other markets
async function getPairs() {
    // This request will cost 1 weight
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.binance.com/api/v3/exchangeInfo`);
        // Await response to be converted to JSON
        let data = await response.json();
        // Return the list of all pairs
        return data.symbols.map((symbolData) => ({base:symbolData.baseAsset, quote:symbolData.quoteAsset}));
    } catch (error) {
        console.log(`Binance getPairs() error: ${error}`);
    }
}

// The following functions return classic market data for a given pair on binance
// The following data is collected:
// - Price
// - Book ticker
// - Order book
// - Recent trades

// This function returns the price of a given pair on binance
async function getPrice(pair) {
    // This request will cost 1 weight
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
        // Await response to be converted to JSON
        let data = await response.json();
        // Return the price of the pair
        return data.price;
    } catch (error) {
        console.log(`Binance getPrice() error: ${error}`);
    }
}

// This function returns the bid/ask price of the order book for a given pair on binance
async function getBookTicker(pair) {
    // This request will cost 1 weight
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.binance.com/api/v3/ticker/bookTicker?symbol=${pair}`);
        // Await response to be converted to JSON
        let data = await response.json();
        // Return the bid/ask price of the order book of the pair
        return {bid:data.bidPrice, ask:data.askPrice};
    } catch (error) {
        console.log(`Binance getBookTicker() error: ${error}`);
    }
}

// This function returns the order book of a given pair on binance
async function getOrderBook(pair, limit) {
    // Depending on the limit, this request will cost 1, 5, 10 or 50 weight (limit = 1-100, 101-500, 501-1000, 1001-5000)
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.binance.com/api/v3/depth?symbol=${pair}${limit?"&limit="+limit:""}`);
        // Await response to be converted to JSON
        let data = await response.json();
        // Return the order book of the pair
        return data;
    } catch (error) {
        console.log(`Binance getOrderBook() error: ${error}`);
    }
}

// This function returns the recent trades of a given pair on binance
async function getRecentTrades(pair, limit) {
    // This request will cost 1 weight
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.binance.com/api/v3/trades?symbol=${pair}${limit?"&limit="+limit:""}`);
        // Await response to be converted to JSON
        let data = await response.json();
        // Return the recent trades of the pair
        return data;
    } catch (error) {
        console.log(`Binance getRecentTrades() error: ${error}`);
    }
}

// The following functions subscribe to a websocket and return market data for a given pair on binance
// The following data is collected:
// - Order book
// - Recent trades

// This function subscribes to the order book of a given pair on binance
function subscribeOrderBook(pair, callback) {
    // This request will cost 1 weight
    try {
        // Create a new websocket
        let ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@depth`);
        // When the websocket is open, log it
        ws.on('open', (event) => {console.log(`Binance subscribeOrderBook() open: ${event}`)});
        // When the websocket receives a message, log it
        ws.on('message', (event) => {
            console.log(`Binance subscribeOrderBook() message: \n${event}`);
            callback(event);

            // When we receive "depthUpdate" event, the changes of the order book are sent in the following format:
            // {
            //     "e": "depthUpdate",  // Event type
            //     "E": 1564034578858,  // Event time
            //     "s": "ETHBTC",       // Symbol
            //     "U": 157,            // First update ID in event
            //     "u": 160,            // Final update ID in event
            //     "b": [               // Bids to be updated
            //         [
            //             "0.03423700", // Price level to be updated
            //             "10.00000000" // Quantity
            //         ]
            //     ],
            //     "a": [               // Asks to be updated
            //         [
            //             "0.03423800", // Price level to be updated
            //             "100.00000000" // Quantity
            //         ]
            //     ]
            // }
            
        });
        // When the websocket is closed, log it
        ws.on('close', (event) => {console.log(`Binance subscribeOrderBook() close: ${event}`)});
        // When the websocket receives an error, log it
        ws.on('error', (event) => {console.log(`Binance subscribeOrderBook() error: ${event}`)});
    } catch (error) {
        console.log(`Binance subscribeOrderBook() error: ${error}`);
    }
}

// This function subscribes to the recent trades of a given pair on binance
function subscribeRecentTrades(pair, callback) {
    // This request will cost 1 weight
    try {
        // Create a new websocket
        let ws = new WebSocket(`wss://stream.binance.com:9443/ws/${pair.toLowerCase()}@trade`);
        // When the websocket is open, log it
        ws.on('open', (event) => {console.log(`Binance subscribeRecentTrades() open: ${event}`)});
        // When the websocket receives a message, log it
        ws.on('message', (event) => {callback(event)});
        // When the websocket is closed, log it
        ws.on('close', (event) => {console.log(`Binance subscribeRecentTrades() close: ${event}`)});
        // When the websocket receives an error, log it
        ws.on('error', (event) => {console.log(`Binance subscribeRecentTrades() error: ${event}`)});
    }
    catch (error) {
        console.log(`Binance subscribeRecentTrades() error: ${error}`);
    }
}

// Exporting the functions
module.exports = {
    getPairs,
    getPrice,
    getBookTicker,
    getOrderBook,
    getRecentTrades,
    subscribeOrderBook,
    subscribeRecentTrades,
}
