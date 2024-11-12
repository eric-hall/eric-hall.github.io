"use strict";

// For demo purposes, initialize the demo database...
// Refactor later? I don't know.
const { init_demo_db } = require("./init_demo_db");
init_demo_db();

const express = require("express");
const app = express();

const multer = require("multer");
app.use(multer().none());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const cors = require("cors");
app.use(cors());

const jokesRoutes = require("./routes/jokes.route");
const { db_close } = require("./models/db-conn");

app.use(express.static("public"));
app.use("/jokebook", jokesRoutes);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, function () {
    console.log("App listening at http://localhost:" + PORT);
});

process.on("SIGINT", cleanUp);
function cleanUp() {
    console.log("Terminate signal received.");
    db_close();
    console.log("...Closing HTTP server.");
    server.close(() => {
        console.log("...HTTP server closed.")
    })
}
