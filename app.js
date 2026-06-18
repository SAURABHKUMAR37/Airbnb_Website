
require("dotenv").config();
console.log("APP STARTED - NEW VERSION");
console.log("URL:", process.env.MONGO_URL);

const path = require('path');
const express = require('express');
const session = require("express-session");  
const storerouter = require("./storerouter");
const hostrouter = require("./hostrouter");
const authrouter = require("./authrouter"); 
const { mongoConnect } = require("./utill/databaseutill");

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use("/", (req, res, next) => {
    console.log("REQUEST",req.url, req.method);
    next();
});

app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: "airbnb-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 24 }  // 1 day
}));

// ✅ Make sessionUser available in ALL ejs pages automatically
// app.use((req, res, next) => {
//     res.locals.sessionUser = req.session.user || null;
//     next();
// });
app.use((req, res, next) => {
    console.log("Session User =", req.session.user);
    res.locals.sessionUser = req.session.user || null;
    next();
});



app.use(storerouter);
app.use(hostrouter);
app.use(authrouter); 
app.use(express.static('public')); 



const errorsController = require("./controllers/error");

app.use(errorsController.pageNotFound);

const PORT = 3007;

mongoConnect()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server runnning on address http://localhost:${PORT}`);
        });
    })
    .catch(err => {
        console.log(err);
    });