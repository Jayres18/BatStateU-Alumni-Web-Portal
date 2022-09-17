const mongoose = require("mongoose");
const { Schema } = mongoose;

const adminSchema = new Schema({
    name: {
        firstName: String,
        lastName: String,
    },
    username: String,
    password: String,
    gender: String,
    avatar: Buffer,
    role: String,
    contact: {
        phone: String,
        cellphone: String,
    },
    address: {
        houseNumber: String,
        building: String,
        street: String,
        city: String,
        province: String,
        country: String,
    },
});

const Admin = mongoose.model("Admin", adminSchema);

module.exports = Admin;