const { places, descriptors } = require("./names.js");
const Picture = require("../models/picture.js");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/embroidery-app");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample = (array) => {
    return array[Math.floor(Math.random() * array.length)];
};

const createSeeds = async () => {
    await Picture.deleteMany();
    for (i = 0; i < 50; i++) {
        const price = Math.floor(Math.random() * 10) + 5;
        const picture = new Picture({
            name: `${sample(descriptors)} ${sample(places)}`,
            description:
                "Lorem ipsum dolor sit amet consectetur, adipisicing elit. Suscipit molestias quae animi ut impedit non neque fuga? Rem labore illum aut exercitationem praesentium tempore repellendus cumque. Possimus ut ipsa non?",
            price,
            rating: Math.round((Math.random() + 4) * 100) / 100,
            thumbnails: [
                "https://traveltimes.ru/wp-content/uploads/2021/08/oduvan.jpg",
            ],
        });
        await picture.save();
    }
};

createSeeds().then(() => {
    mongoose.connection.close();
});
