const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const NewsSchema = new Schema({
    name: {type: String, required: true},
    link: {type: String, required: true},
    date: {type: Date, default: Date.now}
});

const News = mongoose.model('News', NewsSchema);

module.exports = News;