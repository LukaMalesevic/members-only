const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    first_name: { type: String, required: true },
    last_name: { type: String },
    username: { type: String },
    password: { type: String, required: true},
    membership_status: { type: Boolean, default: false},
    admin_status: { type: Boolean, default: false}
})

UserSchema.virtual("url").get(function(){
    return `/board/user/${this._id}`;
})

module.exports = mongoose.model("User", UserSchema);