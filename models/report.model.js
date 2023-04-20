const { model, Schema } = require("mongoose");

const reportSchema = new Schema(
    {
        message: {
            type: String,
            required: true,

        },
        userId: {
            type: String,
            required: true
        },
        eventId: {
            type: String,
            required: true
        },

    },
)

module.exports = model("Report", reportSchema);