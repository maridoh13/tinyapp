const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session')
const bcrypt = require('bcrypt');

const { getEmailByUserID } = require('./helpers');
const { generateRandomString } = require('./helpers');
const { getUserByEmail } = require('./helpers');

app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['elephant-key'],
  // maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


// DATABASES

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  sS3soS: { longURL: "https://www.9gag.com", userID: "maridoh" }
};

let users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "maridoh": {
    id: "maridoh",
    email: "eu@gmail",
    password: "$2b$10$TsAGOkx0C4t5KZfoNetWu.2z8M5K4T308boDWxHg4MAzVV7KSc8Qy"
  }
};

const urlsForUser = (id) => {
  let urlsOfUser = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      urlsOfUser[shortURL] = urlDatabase[shortURL];
    }
  }
  return urlsOfUser;
};

// -------------------------- Tiny App code --------------------------- //

app.listen(PORT, () => {
  console.log(`Tiny App listening on port ${PORT}!`);
});

app.get("/", (req, res) => {
  res.redirect("/login");
});

// Landing page
app.get("/urls", (req, res) => {
  if (req.session.user_id) {
    let userID = req.session.user_id;
    let userEmail = getEmailByUserID(userID, users);
    let urlsOfUser = urlsForUser(userID);
    let templateVars = { urls: urlsOfUser, email: userEmail };
    res.render("urls_index", templateVars);
  } else {
    let templateVars = { urls: urlsForUser, email: undefined };
    res.render("urls_index", templateVars);
  }
});

// Form to create tiny link
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let userID = req.session.user_id;
    let userEmail = getEmailByUserID(userID, users);
    let templateVars = { urls: urlDatabase, email: userEmail };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// Creates tiny link
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  let userID = req.session.user_id;
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls/${shortURL}`);
});

// New tiny link created
app.get("/urls/:shortURL", (req, res) => {
  if (!req.session.user_id) {
    res.redirect("/login");
  } else {
    let userID = req.session.user_id;
    let userEmail = getEmailByUserID(userID, users);
    let shortURL = req.params.shortURL
    let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortURL]['longURL'], email: userEmail };
    res.render("urls_show", templateVars);
  }
});

// Forwarder page
app.get("/u/:shortURL", (req, res) => {
    if (!urlDatabase[req.params.shortURL]) {
    res.send("TinyLink does not exist.");
  } else {
    const longURL = urlDatabase[req.params.shortURL]['longURL'];
    res.redirect(longURL);
  }
});

// Delete url entry
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.session.user_id) {
    let key = req.params.shortURL;
    delete urlDatabase[key];
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// Update a longURL resource - EDIT longURL
app.post("/urls/:shortURL/edit", (req, res) => {
  let userID = req.session.user_id;
  let userEmail = getEmailByUserID(userID, users);
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL]['longURL'] = req.body.newlongURL;
  res.redirect(`/urls/${shortURL}`);
});

// Login
app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  let userID = getUserByEmail(req.body.email, users);
  if (req.body.email === "" || req.body.password === "") {
    res.statusCode = 403;
    res.send('Please enter all fields.');
  } else if (!getUserByEmail(req.body.email, users)) {
    res.statusCode = 403;
    res.send('E-mail not found!');
  } else if (getUserByEmail(req.body.email, users) && (!bcrypt.compareSync(req.body.password, users[userID]['password']))) {
    res.statusCode = 403;
    res.send('Incorrect password.');
  } else if (getUserByEmail(req.body.email, users) && (bcrypt.compareSync(req.body.password, users[userID]['password']))) {
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

// Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Registration pages
app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  let newID = generateRandomString();
  let password = req.body.password;
  let hashedPassword = bcrypt.hashSync(password, 10);
  let newUser = { id: newID, email: req.body.email, password: hashedPassword };
  let reqEmail = req.body.email

  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Please enter all fields.');
  } else if (getUserByEmail(reqEmail, users)) {
    res.status(400);
    res.send('E-mail already registered. Try again.');
  } else {
    users[newID] = newUser;
    req.session.user_id = newID;
    res.redirect("/urls");
  }
});

app.get("/registered", (req, res) => {
  res.send(users);
});
