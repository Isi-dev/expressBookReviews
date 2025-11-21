// const express = require('express');
// const jwt = require('jsonwebtoken');
// let books = require("./booksdb.js");
// const regd_users = express.Router();

// let users = [];

// const isValid = (username)=>{ //returns boolean
// //write code to check is the username is valid
// }

// const authenticatedUser = (username,password)=>{ //returns boolean
// //write code to check if username and password match the one we have in records.
// }

// //only registered users can login
// regd_users.post("/login", (req,res) => {
//   //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});
// });

// // Add a book review
// regd_users.put("/auth/review/:isbn", (req, res) => {
//   //Write your code here
//   return res.status(300).json({message: "Yet to be implemented"});
// });

// module.exports.authenticated = regd_users;
// module.exports.isValid = isValid;
// module.exports.users = users;

const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

/**
 * Check if the username already exists
 * @param {string} username
 * @returns {boolean} true if username exists
 */
const isValid = (username) => {
    return users.some(user => user.username === username);
};

/**
 * Authenticate a user by username and password
 * @param {string} username
 * @param {string} password
 * @returns {boolean} true if credentials match
 */
const authenticatedUser = (username, password) => {
    return users.some(user => user.username === username && user.password === password);
};

/**
 * POST /login
 * Only registered users can login
 * Returns JWT token
 */
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ message: "Username and password are required" });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({ message: "Invalid username or password" });
    }

    // Create JWT token
    const token = jwt.sign({ username }, "access", { expiresIn: "1h" });

    // Store token in session (your server setup requires this)
    if (!req.session) req.session = {};
    req.session.authorization = { accessToken: token };

    return res.status(200).json({ message: "User logged in successfully"});
});

/**
 * PUT /auth/review/:isbn
 * Add or update a book review by a logged-in user
 */
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const { review } = req.body;
    const username = req.user.username; // guaranteed by middleware

    if (!books[isbn]) {
        return res.status(404).json({ message: "Book not found" });
    }

    // Initialize reviews if not exists
    if (!books[isbn].reviews) books[isbn].reviews = {};

    // Add/update review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: `Review for ISBN ${isbn} added/updated successfully`,
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
