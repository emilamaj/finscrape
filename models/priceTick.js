// Model for price tick data

const mongoose = require('mongoose');

// Creating the schema
const priceTickSchema = new mongoose.Schema({
    marketName: {
        type: String,
        required: true
    },
    price: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Exporting the schema
module.exports = mongoose.model('PriceTick', priceTickSchema);
