const { model, Schema } = require("mongoose");


const winkSchema = new Schema(
    {
        winkedToId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        message: {
            type: String,
        },
        winkedById: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        status: {
            type: Number,
            requied: true
        }
    },
)

module.exports = model("Wink", winkSchema);