"use strict";

const express = require("express");
const router = express.Router();

const jokesController = require("../controllers/jokes.controller");

//http://localhost:3000/jokebook/random
router.get("/random", jokesController.getRandomJoke);

//http://localhost:3000/jokebook/categories
router.get("/categories", jokesController.getCategories);

//http://localhost:3000/jokebook/Math
router.get("/:category", jokesController.getJokesInCategory);

router.post('/new', jokesController.addJoke);

module.exports = router;