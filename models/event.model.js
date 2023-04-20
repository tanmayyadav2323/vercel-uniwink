const { model, Schema } = require("mongoose");

const eventSchema = new Schema(
    {
        title: {
            type: String,
            required: true,

        },
        authorId: {
            type: String,
            required: true
        },
        organizer: {
            type: String,
            required: true
        },
        savedMembers: [String],
        memberIds: [String],
        memberImageUrls: [String],
        creationDate: Date,
        about: String,
        image: String,
        latitude: String,
        longitude: String,
        images: [String],
        rating: Number,
        startDateTime: Date,
        endDateTime: Date
    },
)

module.exports = model("Events", eventSchema);