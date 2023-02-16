// This file allows to fetch data from different markets (both centralized and decentralized)


// Here is the list of all the currently supported centralized markets:
// - Binance
// - Kraken
// - Coinbase
// - Uniswap V2

// Here is the list of all the currently supported decentralized markets:

// Currently unsupported:
// Centralized markets
// - Bybit
// - Huobi
// - LBank
// - Upbit
// - P2B
// - OKX
// - MEXC
// - Gate.io
// - KuCoin
// - Bybit
// - Crypto.com
// - Bitkub
// - Bitfinex
// - Gemini
// - Bitstamp
// - Bittrex
// - Poloniex
// - Bithumb
// Decentralized markets 
// - Uniswap V3
// - Sushiswap
// - Balancer
// - Curve
// - Bancor


// Import a module for each market
binance = require('./binance');
kraken = require('./kraken');
coinbase = require('./coinbase');
uniswapV2 = require('./uniswapV2');



// Array containing the names of all the markets
const marketList = ['binance', 'kraken', 'coinbase', 'uniswapV2'];

// Object containing all the market modules
const marketModules = {binance, kraken, coinbase, uniswapV2};

// This function returns the list of all the pairs on a given market
async function getPairs(market) {
    return await marketModules[market].getPairs();
}

// This function returns the list of all the pairs on all markets. The calls are made in parallel
async function getPairsAll() {
    return await Promise.all(marketList.map(async (market) => {
        return await marketModules[market].getPairs();
    }));
}

// This function returns the price of a specific pair in a specific market
async function getPrice(market, pair) {
    return await marketModules[market].getPrice(pair);
}

// This function returns the price of a specific pair in all markets. The calls are made in parallel
async function getPriceAll(pair) {
    return await Promise.all(marketList.map(async (market) => {
        return await marketModules[market].getPrice(pair);
    }));
}

// This function returns the best bid/ask on the order book for a given pair on a given market
async function getBookTicker(market, pair) {
    return await marketModules[market].getBookTicker(pair);
}

// This function returns the best bid/ask on the order book for a given pair on all markets. The calls are made in parallel
async function getBookTickerAll(pair) {
    return await Promise.all(marketList.map(async (market) => {
        return await marketModules[market].getBookTicker(pair);
    }));
}

// This function returns the order book of a given pair on a given market
async function getOrderBook(market, pair, limit) {
    return await marketModules[market].getOrderBook(pair, limit);
}

// This function returns the order book of a given pair on all markets. The calls are made in parallel
async function getOrderBookAll(pair, limit) {
    return await Promise.all(marketList.map(async (market) => {
        return await marketModules[market].getOrderBook(pair, limit);
    }));
}

// This function returns the recent trades of a given pair on a given market
async function getRecentTrades(market, pair, limit) {
    return await marketModules[market].getRecentTrades(pair, limit);
}

// This function returns the recent trades of a given pair on all markets. The calls are made in parallel
async function getRecentTradesAll(pair, limit) {
    return await Promise.all(marketList.map(async (market) => {
        return await marketModules[market].getRecentTrades(pair, limit);
    }));
}

// This function subscribes to the orderbook websocket of a given market and pair
function subscribeOrderBook(market, pair, callback) {
    marketModules[market].subscribeOrderBook(pair, callback);
}

// This function unsubscribes from the orderbook websocket of a given market and pair
function unsubscribeOrderBook(market, pair) {
    marketModules[market].unsubscribeOrderBook(pair);
}

// Here is the list of all the assets that are equivalent to USD: 
let usdList = ['USDT', 'USDC', 'USDS', 'DAI', 'BUSD', 'TUSD', 'PAX', 'GUSD', 'USDN', 'USDSB', 'USD', 'USDK', 'USDP', 'USDX']

// This function calculates the USD price of all the tokens in a given list of pairs prices on all markets
// It takes as input a list of base/quote asset pairs on all markets, the list of pair prices on all markets, and the list of USD equivalent tokens. It returns a list of prices of the assets in USD
// If an asset does not have a pair with a USD equivalent, it is kept aside until it is possible to calculate its price in USD by using its pairs with other assets that themselves have a USD equivalent.
// For example, if the input is
// marketPairs:
// {"binance":
//     [
//         {base: 'ETH', quote: 'BTC'},
//         {base: 'BTC', quote: 'USDT'}
//     ]
// }
// marketPrices:
// {"binance":
//     "ETHBTC": 0.034,
//     "BTCUSDT": 60000
// }
// the output will be
// {"binance":
//     "ETH": 2040,
//     "BTC": 60000
// }
function getUSDPrices(marketPairs, marketPrices, usdEquivalents) {
    // Initialize the output
    let pricedAssets = {} // {asset: price}
    // Initialize the list of assets that are not yet priced in USD
    let unpricedAssets = [] // [asset]
    
    // Loop over all the markets
    for (const [market, pairs] of Object.entries(marketPairs)) {
        // Loop over all the pairs of the market
        for (const pair of pairs) {
            // If the pair is not in the marketPrices object, skip it
            if (!(pair.base+pair.quote in marketPrices[market])) {
                continue;
            }
            // If the base asset is already priced in USD, add the price of the quote asset in USD to the output
            if (usdEquivalents.includes(pair.base)) {
                pricedAssets[pair.quote] = marketPrices[market][pair.base+pair.quote] * pricedAssets[pair.base];
            }
            // If the quote asset is already priced in USD, add the price of the base asset in USD to the output
            else if (usdEquivalents.includes(pair.quote)) {
                pricedAssets[pair.base] = marketPrices[market][pair.base+pair.quote] * pricedAssets[pair.quote];
            }
            // If the base asset is not yet priced in USD, add it to the list of unpriced assets
            else if (!(pair.base in pricedAssets)) {
                unpricedAssets.push(pair.base);
            }
            // If the quote asset is not yet priced in USD, add it to the list of unpriced assets
            else if (!(pair.quote in pricedAssets)) {
                unpricedAssets.push(pair.quote);
            }
        }
    }
    
    // Loop over all the unpriced assets
    for (const asset of unpricedAssets) {
        // Loop over all the markets
        for (const [market, pairs] of Object.entries(marketPairs)) {
            // Loop over all the pairs of the market
            for (const pair of pairs) {
                // If the pair is not in the marketPrices object, skip it
                if (!(pair.base+pair.quote in marketPrices[market])) {
                    continue;
                }
                // If the pair contains the asset, try to price it in USD
                if (pair.base == asset) {
                    // If the quote asset is already priced in USD, add the price of the asset in USD to the output
                    if (usdEquivalents.includes(pair.quote)) {
                        pricedAssets[asset] = marketPrices[market][pair.base+pair.quote] * pricedAssets[pair.quote];
                    }
                }
                else if (pair.quote == asset) {
                    // If the base asset is already priced in USD, add the price of the asset in USD to the output
                    if (usdEquivalents.includes(pair.base)) {
                        pricedAssets[asset] = marketPrices[market][pair.base+pair.quote] * pricedAssets[pair.base];
                    }
                }
            }
        }
    }

    // Return the output
    return pricedAssets;
}



// Export all the functions
module.exports = {
    marketList,
    marketModules,
    getPairs,
    getPairsAll,
    getPrice,
    getPriceAll,
    getBookTicker,
    getBookTickerAll,
    getOrderBook,
    getOrderBookAll,
    getRecentTrades,
    getRecentTradesAll,
    subscribeOrderBook,
    unsubscribeOrderBook
}