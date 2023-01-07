const User = require("../models/user.js");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/embroidery-app");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

async function deleteUsers() {
    await User.deleteMany({});
}

deleteUsers();
