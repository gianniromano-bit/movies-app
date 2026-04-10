const express = require('express');
const Movie = require('../models/Movie');

const router = express.Router();

// LOGIN CHECK
function isLoggedIn(req, res, next) {
    if (!req.session.userId) {
        return res.redirect('/login');
    }
    next();
}

// ALL MOVIES
router.get('/', async(req, res) => {
    const movies = await Movie.find();
    res.render('movies/index', { movies });
});

// NEW FORM
router.get('/new', isLoggedIn, (req, res) => {
    res.render('movies/new', { error: null });
});

// CREATE
router.post('/', isLoggedIn, async(req, res) => {
    const { name, description, year, genres, rating } = req.body;

    if (!name || !year) {
        return res.render('movies/new', { error: "Name & year required" });
    }

    const movie = new Movie({
        name,
        description,
        year,
        genres: genres ? genres.split(',') : [],
        rating,
        createdBy: req.session.userId
    });

    await movie.save();
    res.redirect('/movies');
});

// SHOW
router.get('/:id', async(req, res) => {
    const movie = await Movie.findById(req.params.id);
    res.render('movies/show', { movie });
});

// EDIT FORM
router.get('/:id/edit', isLoggedIn, async(req, res) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie.createdBy || movie.createdBy.toString() !== req.session.userId) {
        return res.send("Unauthorized");
    }

    res.render('movies/edit', { movie, error: null });
});

// UPDATE
router.put('/:id', isLoggedIn, async(req, res) => {
    try {
        const movie = await Movie.findById(req.params.id);

        // ownership check
        if (!movie.createdBy || movie.createdBy.toString() !== req.session.userId) {
            return res.send("Unauthorized");
        }

        const { name, description, year, genres, rating } = req.body;

        await Movie.findByIdAndUpdate(req.params.id, {
            name,
            description,
            year,
            genres: genres ? genres.split(',') : [],
            rating
        });

        res.redirect('/movies/' + req.params.id);

    } catch (err) {
        console.log(err);
        res.send("Update failed");
    }
});

// DELETE
router.delete('/:id', isLoggedIn, async(req, res) => {
    const movie = await Movie.findById(req.params.id);

    if (!movie.createdBy || movie.createdBy.toString() !== req.session.userId) {
        return res.send("Unauthorized");
    }

    await Movie.findByIdAndDelete(req.params.id);
    res.redirect('/movies');
});

module.exports = router;