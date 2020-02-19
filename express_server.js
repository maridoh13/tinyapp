const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(cookieParser());


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

function generateRandomString() {
  let result           = '';
  let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let charactersLength = characters.length;
  for ( let i = 0; i < 6; i++ ) {
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

app.get("/hello", (req, res) => {
  let templateVars = { greeting: 'Hello World!', username: req.cookies["username"] };
  res.render("hello_world", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Main page
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// Form to create tiny link
app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"] };
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
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL], username: req.cookies["username"] }
  res.render("urls_show", templateVars);
});

// Forwarder page
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

// Delete url entry
app.post("/urls/:shortURL/delete", (req, res) => {
  let key = req.params.shortURL;
  delete urlDatabase[key];
  res.redirect("/urls");
})

// Update a longURL resource
app.post("/urls/:shortURL/edit", (req, res) => {
  let key = req.params.shortURL;
  urlDatabase[key] = req.body.newlongURL;
  res.redirect(`/urls/${key}`);
})

// Login
app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  // let templateVars = { username: req.cookies["username"]  };
  // res.render("urls_index", templateVars);
  res.redirect("/urls");
})

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
})
