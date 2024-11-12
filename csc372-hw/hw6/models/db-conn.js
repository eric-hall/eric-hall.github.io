"use strict";

const Database = require("better-sqlite3");
const db = new Database("./models/demo.db", { fileMustExist: true });

function all(sql, ...params) {
  return db.prepare(sql).all(...params);
}

function get(sql, ...params) {
  return db.prepare(sql).get(...params);
}

function run(sql, ...params) {
  return db.prepare(sql).run(...params);
}

function exec(sql) {
  return db.exec(sql);
}

function db_close() {
  console.log("...Closing database connection.")
  db.close();
}

module.exports = {
  all,
  get,
  run,
  exec,
  db_close
};
