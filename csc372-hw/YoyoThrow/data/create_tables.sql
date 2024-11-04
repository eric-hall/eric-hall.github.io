CREATE TABLE Users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    user_type TEXT CHECK(user_type IN ('shopper', 'admin')) NOT NULL
);
CREATE TABLE Categories (
    category_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);
CREATE TABLE Products (
    product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    price REAL NOT NULL CHECK(price >= 0),
    category_id INTEGER,
    FOREIGN KEY (category_id) REFERENCES Categories(category_id)
);
CREATE TABLE Tags (
    tag_id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE
);
CREATE TABLE ProductTags (
    product_id INTEGER,
    tag_id INTEGER,
    PRIMARY KEY (product_id, tag_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id),
    FOREIGN KEY (tag_id) REFERENCES Tags(tag_id)
);
CREATE TABLE Carts (
    cart_id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE,  -- Enforces one cart per user
    status TEXT CHECK(status IN ('new', 'abandoned', 'purchased')) DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES Users(user_id)
);
CREATE TABLE CartProducts (
    cart_product_id INTEGER PRIMARY KEY AUTOINCREMENT,
    cart_id INTEGER,
    product_id INTEGER,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    FOREIGN KEY (cart_id) REFERENCES Carts(cart_id),
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);
