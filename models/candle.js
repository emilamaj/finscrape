const mongoose = require('mongoose');

// Creating the Schema
const candleSchema = new mongoose.Schema({
    marketName: {
        type: String,
        required: true
    },
    time: {
        type: Date,
        required: true
    },
    open: {
        type: Number,
        required: true
    },
    high: {
        type: Number,
        required: true
    },
    low: {
        type: Number,
        required: true
    },
    close: {
        type: Number,
        required: true
    },
    volume: {
        type: Number,
        required: true
    },
    closeTime: {
        type: Date,
        required: true
    },
    quoteAssetVolume: {
        type: Number,
        required: false
    },
    numberOfTrades: {
        type: Number,
        required: false
    },
    takerBuyBaseAssetVolume: {
        type: Number,
        required: false
    },
    takerBuyQuoteAssetVolume: {
        type: Number,
        required: false
    },
    ignore: {
        type: Number,
        required: false
    }
});

// Creating the model
const candle = mongoose.model('candle', candleSchema);

// Exporting the model
module.exports = candle;
