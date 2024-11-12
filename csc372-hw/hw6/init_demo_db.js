"use strict";

const fs = require('fs');
const Database = require('better-sqlite3');
const path = require('path');
const dbPath = path.resolve('models/demo.db');

function init_demo_db() {

    // Delete the existing database file if it exists
    if (fs.existsSync(dbPath)) {
        console.log("DEMO : Deleting existing database...");
        fs.unlinkSync(dbPath);
    }

    const db = new Database(dbPath);

    // Create the Categories and Jokes tables if they don't exist
    db.exec('PRAGMA foreign_keys = ON');
    db.exec(`
        CREATE TABLE IF NOT EXISTS Categories (
            id INTEGER PRIMARY KEY,
            value TEXT NOT NULL
        );
        CREATE TABLE IF NOT EXISTS Jokes (
            id INTEGER PRIMARY KEY,
            setup TEXT NOT NULL,
            delivery TEXT NOT NULL,
            category_id INTEGER,
            FOREIGN KEY (category_id) REFERENCES Categories(id)
        );
    `);

    // Prepare to insert categories
    const insertCategory = db.prepare('INSERT INTO Categories (value) VALUES (?)');
    const categories = ['Lame', 'Funny', 'Math', 'Programming', 'Science', 'Dad Jokes']; // These categories will have ids starting at 1
    categories.forEach(category => insertCategory.run(category));

    // Prepare to insert jokes
    const insertJoke = db.prepare(`
        INSERT INTO Jokes (setup, delivery, category_id) VALUES (?, ?, ?)
    `);
    const jokes = [
        // Lame Jokes
        { setup: 'Why did the scarecrow win an award?', delivery: 'Because he was outstanding in his field!', categoryId: 1 },
        { setup: 'What did the ocean say to the shore?', delivery: 'Nothing, it just waved.', categoryId: 1 },
        // Funny Jokes
        { setup: 'I told my wife she was drawing her eyebrows too high.', delivery: 'She looked surprised.', categoryId: 2 },
        { setup: 'I threw a boomerang years ago.', delivery: 'Now I live in constant fear.', categoryId: 2 },
        // Math Jokes
        { setup: 'Why was the equal sign so humble?', delivery: 'Because it knew it wasn’t less than or greater than anyone else.', categoryId: 3 },
        { setup: 'Parallel lines have so much in common.', delivery: 'It’s a shame they’ll never meet.', categoryId: 3 },
        // Programming Jokes
        { setup: 'Why do programmers prefer dark mode?', delivery: 'Because light attracts bugs!', categoryId: 4 },
        { setup: 'How many programmers does it take to change a light bulb?', delivery: 'None. That’s a hardware problem.', categoryId: 4 },
        // Science Jokes
        { setup: 'Why can’t you trust an atom?', delivery: 'Because they make up everything.', categoryId: 5 },
        { setup: 'What did one DNA strand say to the other?', delivery: 'Do these genes make me look fat?', categoryId: 5 },
        // Dad Jokes
        { setup: 'What time did the man go to the dentist?', delivery: 'Tooth-hurty.', categoryId: 6 },
        { setup: 'How do you organize a space party?', delivery: 'You planet.', categoryId: 6 }
    ];
    jokes.forEach(joke => {
        insertJoke.run(joke.setup, joke.delivery, joke.categoryId);
    });

    console.log("DEMO : Database populated successfully!");

    db.close();
}

module.exports = { init_demo_db };