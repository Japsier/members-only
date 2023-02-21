const mongoose = require("mongoose")
const { DateTime } = require("luxon")

const Schema = mongoose.Schema

const MessageSchema = new Schema({
    text: {type: String, required: true, maxLength: 1000},
    title: {type: String, required: true, maxLength: 100},
    timestamp: {type: Date, required:true},
    user: {type: Schema.ObjectId, ref: "User", required: true},
    username: {type: String, required: true}
});
MessageSchema.virtual("date").get(function () {
    return DateTime.fromJSDate(this.timestamp).toLocaleString(DateTime.DATETIME_MED)
})

module.exports = mongoose.model("Message", MessageSchema);