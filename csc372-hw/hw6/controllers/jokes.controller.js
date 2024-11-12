"use strict";

const model = require("../models/jokes.model");

function getRandomJoke(req, res, next) {
    console.log("getRandomJoke");

    try {
        const joke = model.getRandomJoke();
        // Check if no jokes available
        if (joke.error) {
            return res.status(404).json({ error: joke.error });
        }
        res.json(joke);
    } catch (err) {
        console.error("Error while getting a random joke:", err.message);
        next(err);
    }
}

function getCategories(req, res, next) {
    console.log("getCategories");

    try {
        const categories = model.getCategories();
        res.json(categories);
    } catch (err) {
        console.error("Error while getting categories:", err.message);
        next(err);
    }
}

function getJokesInCategory(req, res, next) {
    const category = req.params.category;
    const limit = parseInt(req.query.limit, 10) || 10; // Ensure limit is an actual int
    console.log(`getJokesInCategory for category: ${category} with limit: ${limit}`);

    try {
        const jokes = model.getJokesInCategory(category, limit);
        // Check if category empty
        if (jokes.length === 0) {
            return res.status(404).json({ error: `No jokes found in the category '${category}'` });
        }
        res.json(jokes);
    } catch (err) {
        console.error("Error while getting jokes:", err.message);
        next(err);
    }
}

function addJoke(req, res, next) {
    const { setup, delivery, category } = req.body;
    console.log(`addJoke : ${setup}, ${delivery}, ${category}`);

    if (!setup || !delivery || !category) {
        return res.status(400).json({ error: "Please provide setup, delivery, and category." });
    }

    try {
        const result = model.addJoke(setup, delivery, category);
        // Check if category missing
        if (result.error) {
            return res.status(400).json({ error: result.error });
        }
        res.status(201).json(result);
    } catch (err) {
        console.error("Error while adding a new joke:", err.message);
        next(err);
    }
}

module.exports = {
    getRandomJoke,
    getCategories,
    getJokesInCategory,
    addJoke,
};
