// This file provides methods to get market data for a given pair on coinbase.

// Importing the required modules
const WebSocket = require('ws'); // Websocket client

// This function returns the list of all pairs on coinbase. This will be useful since subscriptions are made using a different pair naming convention than on other markets
async function getPairs() {
    // This request will cost 1 weight
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.pro.coinbase.com/products`);
        // Await response to be converted to JSON
        let data = await response.json();
        // Return the list of all pairs
        return data.map((symbolData) => ({base:symbolData.base_currency, quote:symbolData.quote_currency}));
    } catch (error) {
        console.log(`Coinbase getPairs() error: ${error}`);
    }
}

// The following functions return classic market data for a given pair on coinbase
// The following data is collected:
// - Price
// - Book ticker
// - Order book
// - Recent trades

// This function returns the price of a given pair on coinbase
async function getPrice(pair) {
    // This request will cost 1 weight
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.pro.coinbase.com/products/${pair}/ticker`);
        // Await response to be converted to JSON
        let data = await response.json();
        // Return the price of the pair
        return data.price;
    } catch (error) {
        console.log(`Coinbase getPrice() error: ${error}`);
    }
}

// This function returns the bid/ask price of the order book for a given pair on coinbase
async function getBookTicker(pair) {
    // This request will cost 1 weight
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.pro.coinbase.com/products/${pair}/book?level=1`);
        // Await response to be converted to JSON
        let data = await response.json();
        // Return the bid/ask price of the order book of the pair
        return {bid:data.bids[0][0], ask:data.asks[0][0]};
    } catch (error) {
        console.log(`Coinbase getBookTicker() error: ${error}`);
    }
}

// This function returns the order book of a given pair on coinbase
async function getOrderBook(pair, limit) {
    // Depending on the limit, this request will cost 1, 5, 10 or 50 weight (limit = 1-100, 101-500, 501-1000, 1001-5000)
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.pro.coinbase.com/products/${pair}/book?level=2&limit=${limit}`);
        // Await response to be converted to JSON
        let data = await response.json();
        // Return the order book of the pair
        return {bids:data.bids, asks:data.asks};
    } catch (error) {
        console.log(`Coinbase getOrderBook() error: ${error}`);
    }
}

// This function returns the recent trades of a given pair on coinbase
async function getRecentTrades(pair) {
    // This request will cost 1 weight
    try {
        // Await response from fetch()
        let response = await fetch(`https://api.pro.coinbase.com/products/${pair}/trades`);
        // Await response to be converted to JSON
        let data = await response.json();
        // Return the recent trades of the pair
        return data;
    } catch (error) {
        console.log(`Coinbase getRecentTrades() error: ${error}`);
    }
}

// The following functions return websocket market data for a given pair on coinbase
// The following data is collected:
// - Price
// - Book ticker
// - Order book
// - Recent trades

// This function returns the price of a given pair on coinbase
async function getPriceWS(pair) {
    // This request will cost 1 weight
    // Create a new websocket client
    const ws = new WebSocket(`wss://ws-feed.pro.coinbase.com`);
    // Return a promise that will be resolved when the websocket client receives a message
    return new Promise((resolve) => {
        // When the websocket client is opened
        ws.on('open', () => {
            // Subscribe to the ticker channel for the given pair
            ws.send(JSON.stringify({
                "type": "subscribe",
                "product_ids": [pair],
                "channels": ["ticker"]
            }));
        });
        // When the websocket client receives a message
        ws.on('message', (data) => {
            // Convert the message to JSON
            data = JSON.parse(data);
            // If the message is a ticker
            if (data.type === 'ticker') {
                // Resolve the promise with the price of the pair
                resolve(data.price);
            }
        });
    });
}

// This function returns the bid/ask price of the order book for a given pair on coinbase
async function getBookTickerWS(pair) {
    // This request will cost 1 weight
    // Create a new websocket client
    const ws = new WebSocket(`wss://ws-feed.pro.coinbase.com`);
    // Return a promise that will be resolved when the websocket client receives a message
    return new Promise((resolve) => {
        // When the websocket client is opened
        ws.on('open', () => {
            // Subscribe to the level 2 channel for the given pair
            ws.send(JSON.stringify({
                "type": "subscribe",
                "product_ids": [pair],
                "channels": ["level2"]
            }));
        });
        // When the websocket client receives a message
        ws.on('message', (data) => {
            // Convert the message to JSON
            data = JSON.parse(data);
            // If the message is a snapshot
            if (data.type === 'snapshot') {
                // Resolve the promise with the bid/ask price of the order book of the pair
                resolve({bid:data.bids[0][0], ask:data.asks[0][0]});
            }
        });
    });
}

// This function returns the order book of a given pair on coinbase
async function getOrderBookWS(pair, limit) {
    // Depending on the limit, this request will cost 1, 5, 10 or 50 weight (limit = 1-100, 101-500, 501-1000, 1001-5000)
    // Create a new websocket client
    const ws = new WebSocket(`wss://ws-feed.pro.coinbase.com`);
    // Return a promise that will be resolved when the websocket client receives a message
    return new Promise((resolve) => {
        // When the websocket client is opened
        ws.on('open', () => {
            // Subscribe to the level 2 channel for the given pair
            ws.send(JSON.stringify({
                "type": "subscribe",
                "product_ids": [pair],
                "channels": ["level2"]
            }));
        });
        // When the websocket client receives a message
        ws.on('message', (data) => {
            // Convert the message to JSON
            data = JSON.parse(data);
            // If the message is a snapshot
            if (data.type === 'snapshot') {
                // Resolve the promise with the order book of the pair
                resolve({bids:data.bids.slice(0, limit), asks:data.asks.slice(0, limit)});
            }
        });
    });
}

// This function returns the recent trades of a given pair on coinbase
async function getRecentTradesWS(pair) {
    // This request will cost 1 weight
    // Create a new websocket client
    const ws = new WebSocket(`wss://ws-feed.pro.coinbase.com`);
    // Return a promise that will be resolved when the websocket client receives a message
    return new Promise((resolve) => {
        // When the websocket client is opened
        ws.on('open', () => {
            // Subscribe to the matches channel for the given pair
            ws.send(JSON.stringify({
                "type": "subscribe",
                "product_ids": [pair],
                "channels": ["matches"]
            }));
        });
        // When the websocket client receives a message
        ws.on('message', (data) => {
            // Convert the message to JSON
            data = JSON.parse(data);
            // If the message is a match
            if (data.type === 'match') {
                // Resolve the promise with the
                resolve(data);
            }
        });
    });
}

module.exports = {
    getProducts,
    getPrice,
    getBookTicker,
    getOrderBook,
    getRecentTrades,
    getPriceWS,
    getBookTickerWS,
    getOrderBookWS,
    getRecentTradesWS
}