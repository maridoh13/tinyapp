const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  }
};

const emailLookup = (data, users) => {
  for (let el in users) {
    if (users[el]["email"] === data) {
      return true;
    }
  }
  return false;
};

const isPasswordCorrect = (data, users) => {
  for (let el in users) {
    if (users[el]["password"] === data) {
      return true;
    }
  }
  return false;
};

const getEmailByUserID = (userID) => {
  return users[userID].email;
};

const getUserByEmail = (email, users) => {
  for (let el in users) {
    if (users[el]['email'] === email) {
      return users[el].id;
    }
  }
  return false;
};

function generateRandomString() {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// Root page
app.get("/", (req, res) => {
  res.send("Howdy do! Please go to /urls");
});

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

// Hello test page
app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!', user_id: req.cookies["user_id"] };
  res.render("hello_world", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Main page
app.get("/urls", (req, res) => {
  if (req.cookies["user_id"]) {
    let userID = req.cookies["user_id"];
    let userEmail = getEmailByUserID(userID);
    let templateVars = { urls: urlDatabase, email: userEmail };
    res.render("urls_index", templateVars);
  } else {
    let templateVars = { urls: urlDatabase, email: undefined };
    res.render("urls_index", templateVars);
  }
});

// Form to create tiny link
app.get("/urls/new", (req, res) => {
  let userID = req.cookies["user_id"];
  let userEmail = getEmailByUserID(userID);
  let templateVars = { urls: urlDatabase, email: userEmail };
  res.render("urls_new", templateVars);
});

// Creates tiny link
app.post("/urls", (req, res) => {
  let longURL = req.body.longURL;
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`/urls/${shortURL}`);
});

// New tiny link created
app.get("/urls/:shortURL", (req, res) => {
  let userID = req.cookies["user_id"];
  let userEmail = getEmailByUserID(userID);
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], email: userEmail };
  res.render("urls_show", templateVars);
});

// Forwarder page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// Delete url entry
app.post("/urls/:shortURL/delete", (req, res) => {
  let key = req.params.shortURL;
  delete urlDatabase[key];
  res.redirect("/urls");
});

// Update a longURL resource
app.post("/urls/:shortURL/edit", (req, res) => {
  let key = req.params.shortURL;
  urlDatabase[key] = req.body.newlongURL;
  res.redirect(`/urls/${key}`);
});

// Login
app.get("/login", (req, res) => {
  res.render("urls_login");
});

app.post("/login", (req, res) => {
  let userID = getUserByEmail(req.body.email, users);

  if (!getUserByEmail(req.body.email, users)) {
    res.statusCode = 403;
    res.send('E-mail not found');
  } else if (emailLookup(req.body.email, users) && (!isPasswordCorrect(req.body.password, users))) {
    res.statusCode = 403;
    res.send('Incorrect password.');
  } else if (emailLookup(req.body.email, users) && isPasswordCorrect(req.body.password, users)) {
    res.cookie('user_id', userID);
    res.redirect("/urls");
  }
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

// Registration pages
app.get("/register", (req, res) => {
  res.render("urls_register");
});

app.post("/register", (req, res) => {
  let newID = generateRandomString();
  let newUser = { id: newID, email: req.body.email, password: req.body.password };

  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('Missing information. Try again.');
  } else if (emailLookup(req.body.email, users)) {
    res.status(400);
    res.send('E-mail already registered. Try again.');
  } else {
    users[newID] = newUser;
    res.cookie('user_id', newID);
    res.redirect("/urls");
  }
});

app.get("/registered", (req, res) => {
  res.send(users);
});
