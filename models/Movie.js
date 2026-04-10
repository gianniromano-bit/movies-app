const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    name: String,
    description: String,
    year: Number,
    genres: [String],
    rating: Number,

    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
});

module.exports = mongoose.model('Movie', movieSchema);