const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const imageSchema = new Schema({
    url: String,
    filename: String,
});

const pictureSchema = new Schema({
    thumbnails: [String],
    files: [String],
    name: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    reviews: [Schema.Types.ObjectId],
    creationDate: {
        type: Date,
        default: Date.now,
    },
});

pictureSchema.index({ name: "text" });

module.exports = mongoose.model("Picture", pictureSchema);
