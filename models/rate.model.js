const mongoose = require('mongoose');
const { model, Schema } = mongoose;

const rateSchema = new Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    rate: {
        type: Number,
        required: true
    }
});

module.exports = model("Rate", rateSchema);
