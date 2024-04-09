const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    author: { type: Schema.Types.ObjectId, ref: "User", required: true},
    title: { type: String },
    message_context: { type: String},
    created_at: { type: Date, immutable: true},
})

MessageSchema.virtual("url").get(function(){
    return `/board/message/${this._id}`;
})

module.exports = mongoose.model("Message", MessageSchema);