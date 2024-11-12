"use strict";

const db = require("./db-conn");

// Get a random joke from the Jokes table
function getRandomJoke() {
    const sql = `
        SELECT Jokes.id, Jokes.setup, Jokes.delivery, Categories.value AS category
        FROM Jokes
        JOIN Categories ON Jokes.category_id = Categories.id
        ORDER BY RANDOM()
        LIMIT 1;
    `;
    const joke = db.get(sql);
    return joke || { error: "No jokes available." };
}

// Get all categories from the Categories table
function getCategories() {
    let sql = "SELECT value FROM Categories;";
    return db.all(sql);
}

// Get all jokes for a specific category by joining Jokes and Categories tables
function getJokesInCategory(category, limit) {
    let sql = `
        SELECT Jokes.id, Jokes.setup, Jokes.delivery, Categories.value AS category
        FROM Jokes
        JOIN Categories ON Jokes.category_id = Categories.id
        WHERE Categories.value = ?
        LIMIT ?;
    `;
    return db.all(sql, category, limit) || [];
}

function addJoke(setup, delivery, category) {
    
    // Check if category exists
    const categoryCheckSql = "SELECT id FROM Categories WHERE value = ? LIMIT 1;";
    const categoryRow = db.get(categoryCheckSql, category);
    if (!categoryRow) {
        return { error: "Category does not exist." };
    }

    // Insert the new joke into Jokes table
    const categoryId = categoryRow.id;
    const insertJokeSql = "INSERT INTO Jokes (setup, delivery, category_id) VALUES (?, ?, ?);";
    const result = db.run(insertJokeSql, setup, delivery, categoryId);
    
    console.log("Joke inserted: ", result.lastInsertRowid);
    return {
        id: result.lastInsertRowid,
        setup,
        delivery,
        category,
    };
}

module.exports = {
    getRandomJoke,
    getCategories,
    getJokesInCategory,
    addJoke
};
