const { model, Schema } = require("mongoose");


const userEventSchema = new Schema(
    {
        eventIds: [String],
    },
)

module.exports = model("UserEvents", userEventSchema);