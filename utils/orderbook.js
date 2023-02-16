// Provides functions to manipulate an order book

// An order book is an object with the following structure:
// {
//     "bids": [
//         [price, amount],
//         [price, amount],
//         ...
//     ],
//     "asks": [
//         [price, amount],
//         [price, amount],
//         ...
//     ]
// }
// Note: The bids and asks are sorted from highest to lowest price

// This function updates an order book with a partial update
// The partial update is an object with the same structure as an order book, except only the bids or asks that have changed are present
// The function returns the updated order book
function updateOrderBook(orderBook, partialUpdate) {
    for (let bid of partialUpdate.bids) {
        let index = orderBook.bids.findIndex(b => b[0] == bid[0]);
        if (index == -1) {
            orderBook.bids.push(bid);
        } else {
            orderBook.bids[index] = bid;
        }
    }
    for (let ask of partialUpdate.asks) {
        let index = orderBook.asks.findIndex(a => a[0] == ask[0]);
        if (index == -1) {
            orderBook.asks.push(ask);
        } else {
            orderBook.asks[index] = ask;
        }
    }
    orderBook.bids.sort((b1, b2) => b2[0] - b1[0]);
    orderBook.asks.sort((a1, a2) => a1[0] - a2[0]);
    return orderBook;
}

// This function clips an order book so that the cumulative amount of bids and asks is less than the given amount on each side of the spread
function clipOrderBook(orderBook, amount) {
    let clippedOrderBook = {
        "bids": [],
        "asks": []
    };
    let bidAmount = 0;
    let askAmount = 0;
    for (let bid of orderBook.bids) {
        bidAmount += bid[1];
        if (bidAmount > amount) {
            break;
        }
        clippedOrderBook.bids.push(bid);
    }
    for (let ask of orderBook.asks) {
        askAmount += ask[1];
        if (askAmount > amount) {
            break;
        }
        clippedOrderBook.asks.push(ask);
    }
    return clippedOrderBook;
}

// This function returns the price of the best bid in the order book
function getBestBid(orderBook) {
    return orderBook.bids[0][0];
}

// This function returns the price of the best ask in the order book
function getBestAsk(orderBook) {
    return orderBook.asks[0][0];
}

// This function returns the total amount of bids in the order book
function getTotalBidAmount(orderBook) {
    return orderBook.bids.reduce((total, bid) => total + bid[1], 0);
}

// This function returns the total amount of asks in the order book
function getTotalAskAmount(orderBook) {
    return orderBook.asks.reduce((total, ask) => total + ask[1], 0);
}

// This function returns the total amount of bids in the order book with a price greater than the given price
function getBidAmount(orderBook, price) {
    return orderBook.bids.reduce((total, bid) => total + (bid[0] >= price ? bid[1] : 0), 0);
}

// This function returns the total amount of asks in the order book with a price lower than the given price
function getAskAmount(orderBook, price) {
    return orderBook.asks.reduce((total, ask) => total + (ask[0] <= price ? ask[1] : 0), 0);
}

// This function returns the total amount of bids in the order book with a price lower than the given price
function getBidAmountBelow(orderBook, price) {
    return orderBook.bids.reduce((total, bid) => total + (bid[0] < price ? bid[1] : 0), 0);
}

// This function returns the total amount of asks in the order book with a price greater than the given price
function getAskAmountAbove(orderBook, price) {
    return orderBook.asks.reduce((total, ask) => total + (ask[0] > price ? ask[1] : 0), 0);
}

// This function returns the ask price such that the total amount of asks with a price lower than or equal to the ask price is equal to the given amount
function getBestAskPriceAtCapacity(orderBook, amount) {
    let total = 0;
    for (let i = 0; i < orderBook.asks.length; i++) {
        total += orderBook.asks[i][1];
        if (total >= amount) {
            return orderBook.asks[i][0];
        }
    }
    return orderBook.asks[orderBook.asks.length - 1][0];
}

// This function returns the bid price such that the total amount of bids with a price greater than or equal to the bid price is equal to the given amount
function getBestBidPriceAtCapacity(orderBook, amount) {
    let total = 0;
    for (let i = 0; i < orderBook.bids.length; i++) {
        total += orderBook.bids[i][1];
        if (total >= amount) {
            return orderBook.bids[i][0];
        }
    }
    return orderBook.bids[orderBook.bids.length - 1][0];
}

module.exports = {
    updateOrderBook,
    clipOrderBook,
    getBestBid,
    getBestAsk,
    getTotalBidAmount,
    getTotalAskAmount,
    getBidAmount,
    getAskAmount,
    getBidAmountBelow,
    getAskAmountAbove,
    getBestAskPriceAtCapacity,
    getBestBidPriceAtCapacity
};