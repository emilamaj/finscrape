// Here, we implement the main trading strategy. The update function is called every time a new piece of information is available. The update function is called with the following arguments:
//
// - The current time
// - The market in question
// - The pair in question
// - The type of info that is available: "partial_order_book", "order_book", "trades", "ticker"
// - The info itself

// The update function, as the name suggests, updates the internal state of the strategy.
// It is only after the update function that we implement the core of the strategy, in the infer function.
// The infer function is called every time the update function is called, and it returns the action to take.

// The infer function is called with the following arguments:
// - The current time
// It returns the action to take, which is one of the following:
// - "buy"
// - "sell"
// - "nothing"
// - if the action is "buy" or "sell", it also returns the amount to buy or sell, and the target market and pair.

// The internal state of the strategy stores the following information:
// - Last time each piece of info was updated
// - Current order book
// - History of best bid/ask and at which time, and at several capacity levels.

const ob = require("./utils/orderbook.js");

// Internal state variable definition:

// The last time each piece of info was updated on each market and pair
let last_update = {
    market: {
        pair: {
            "partial_order_book": 0,
            "order_book": 0,
            "trades": 0,
            "ticker": 0
        }
    }
};

// The current order book on each market and pair
let order_book = {
    market: {
        pair: {
            bids: [],
            asks: []
        }
    }
};

// The history of best bid/ask and at which time, and at several capacity levels
// The object is as such: {market: {pair: [{time, bid: {1: price, 10: price, 100: price}, ask: {1: price, 10: price, 100: price}}}}]}}
let history = {
    market: {
        pair: []
    }
};


// The update function 
function update(time, market, pair, info_type, info) {
    // Update the last update time
    last_update[market][pair][info_type] = time;
    // Update the order book if needed
    if (info_type == "partial_order_book" || info_type == "order_book") {
        // Replace the current order book with the new one or its updated version
        order_book[market][pair] = info_type == "order_book" ? info : updateOrderBook(order_book[market][pair], info);
        // let clipped_order_book = clipOrderBook(order_book[market][pair], 100);

        let current_bid = ob.getBestBidPriceAtCapacity(order_book[market][pair], 1);
    }
    // Update the history 
    if (info_type == "order_book" || info_type == "ticker") {
