let mongoose = require('mongoose');
let dotenv = require('dotenv');

dotenv.config();

let userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});

let UserModel = mongoose.model('User', userSchema);

module.exports = UserModel;