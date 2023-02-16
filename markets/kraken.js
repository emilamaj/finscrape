// This file provides methods to get market data for a given pair on kraken.

// const crypto = require('crypto'); // This module is used to create the signature of some requests
// const qs = require('qs'); // This module is used to create the query string for the request
const WebSocket = require('ws'); // This module is used to create the websockets

// const API_SECRET = process.env.KRAKEN_API_SECRET;

// Some requests need to be authenticated. This is done by adding signature headers to the request.
// let signature = getMessageSignature('/0/private/AddOrder', requestData, API_SECRET, requestData.nonce);

// // This function returns the signature of a request
// const getMessageSignature = (path, request, secret, nonce) => {
//     const message       = qs.stringify(request);
//     const secret_buffer = Buffer.from(secret, 'base64');
//     const hash          = new crypto.createHash('sha256');
//     const hmac          = new crypto.createHmac('sha512', secret_buffer);
//     const hash_digest   = hash.update(nonce + message).digest('binary');
//     const hmac_digest   = hmac.update(path + hash_digest, 'binary').digest('base64');

//     return hmac_digest;
// };

// This function returns the list of all pairs on kraken
async function getPairs() {
    // API Counter: This request will cost 
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.kraken.com/0/public/AssetPairs`);
        // Await response to be converted to JSON
        let data = await response.json();
        
        // Return the list of all pairs
        return Object.keys(data.result).map((pair) => ({base:data.result[pair].base, quote:data.result[pair].quote}));
    } catch (error) {
        console.log(`Kraken getPairs() error: ${error}`);
    }
}

// The following functions return classic market data for a given pair on kraken
// The following data is collected:
// - Price
// - Book ticker
// - Order book
// - Recent trades

// This function returns the price of a given pair on kraken
async function getPrice(pair) {
    // API Counter: This request will cost 
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${pair}`);
        // Await response to be converted to JSON
        let data = await response.json();
        // Return the price of the pair
        return data.result[pair].c[0];
    } catch (error) {
        console.log(`Kraken getPrice() error: ${error}`);
    }
}

// This function returns the bid/ask prices of the order book for a given pair on kraken
async function getBookTicker(pair) {
    // API Counter: This request will cost 
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.kraken.com/0/public/Ticker?pair=${pair}`);
        // Await response to be converted to JSON
        let data = await response.json();
        // Return the bid/ask price of the order book of the pair
        return {bid:data.result[pair].b[0], ask:data.result[pair].a[0]};
    } catch (error) {
        console.log(`Kraken getBookTicker() error: ${error}`);
    }
}

// This function returns the order book of a given pair on kraken
async function getOrderBook(pair, count) {
    // Default API count is 100
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.kraken.com/0/public/Depth?pair=${pair}${count?"&count="+count:""}`);
        // Await response to be converted to JSON
        let data = await response.json();
        // Return the order book of the pair
        // The return object has only one (unknown) key, so we return the value of this key
        return Object.values(data.result)[0];
    } catch (error) {
        console.log(`Kraken getOrderBook() error: ${error}`);
    }
}

// This function returns the recent trades of a given pair on kraken
async function getRecentTrades(pair, since) {
    // By default, returns the last 1000 trades
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.kraken.com/0/public/Trades?pair=${pair}${since?"&since="+since:""}`);
        // Await response to be converted to JSON
        let data = await response.json();
        // Return the recent trades of the pair
        // The return object has only one (unknown) key, so we return the value of this key
        return Object.values(data.result)[0];
    } catch (error) {
        console.log(`Kraken getRecentTrades() error: ${error}`);
    }
}

// The following functions subscribe to the websocket API of kraken to fetch the following data:
// - Order book
// - Recent trades

// This function subscribes to the websocket API of kraken to get the order book of a given pair. It uses getMessageSignature() to authenticate the request.
function subscribeOrderBook(pair, callback) {
    // API Counter: This request will cost 
    try {
        // Creating a new websocket
        let ws = new WebSocket('wss://ws.kraken.com');
        // When the websocket is opened, subscribe to the order book
        ws.onopen = () => {
            // Creating a request to subscribe to the order book
            let requestData = {
                event: "subscribe",
                pair: [pair],
                subscription: {
                    name: "book",
                    depth: 1000
                }
            };
            // Sending the request
            ws.send(JSON.stringify(requestData));
            console.log(`Kraken subscribeOrderBook() subscribed to ${pair}`);
        }
        // When the websocket sends a message, call the callback function
        ws.onmessage = (message) => {
            console.log(`Kraken subscribeOrderBook() received message: ${message.data}`);
            callback(JSON.parse(message.data));
        }
        // When the websocket is closed, call the callback function
        ws.onclose = () => {
            console.log(`Kraken subscribeOrderBook() closed`);
        }
        // When an error occurs, call the callback function
        ws.onerror = (error) => {
            console.log(`Kraken subscribeOrderBook() error: ${error}`);
        }
    } catch (error) {
        console.log(`Kraken subscribeOrderBook() error: ${error}`);
    }
}

// This function subscribes to the websocket API of kraken to get the recent trades of a given pair
function subscribeRecentTrades(pair, callback) {
    // API Counter: This request will cost 
    try {
        // Creating a new websocket
        let ws = new WebSocket('wss://ws.kraken.com');
        // When the websocket is opened, subscribe to the recent trades
        ws.onopen = () => {
            ws.send(JSON.stringify({
                event: "subscribe",
                pair: [pair],
                subscription: {
                    name: "trade"
                }
            }));
            console.log(`Kraken subscribeRecentTrades() subscribed to ${pair}`);
        }
        // When the websocket sends a message, call the callback function
        ws.onmessage = (message) => {
            console.log(`Kraken subscribeRecentTrades() received message: ${message.data}`);
            callback(JSON.parse(message.data));
        }
        // When the websocket is closed, call the callback function
        ws.onclose = () => {
            console.log(`Kraken subscribeRecentTrades() closed`);
        }
        // When an error occurs, call the callback function
        ws.onerror = (error) => {
            console.log(`Kraken subscribeRecentTrades() error: ${error}`);
        }
        // Return the websocket
        return ws;
    } catch (error) {
        console.log(`Kraken subscribeRecentTrades() exception: ${error}`);
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
    subscribeRecentTrades
}
