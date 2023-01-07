require("dotenv").config();

const express = require("express");
const app = express();

// my functions and classes
const { isAdmin } = require("./middleware");
const Picture = require("./models/picture");
const ExpressError = require("./utils/errors");

// mongo
const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/embroidery-app");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

// method-override
const methodOverride = require("method-override");
app.use(methodOverride("_method"));

// sessions
const session = require("express-session");
const sessionConfig = {
    name: "eapp-session",
    secret: process.env.SESSION_KEY,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        //secure: true,
    },
};
app.use(session(sessionConfig));

// passport
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
app.use(passport.initialize());
app.use(passport.session());

// ejs
const engine = require("ejs-mate");
app.engine("ejs", engine);
app.set("view engine", "ejs");

// flash
const flash = require("connect-flash");
app.use(flash());

// locals
app.use((req, res, next) => {
    res.locals.currentUser = req.user || "";
    res.locals.page = "";
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// paths
const path = require("path");
app.use(
    "/bootstrap",
    express.static(path.join(__dirname, "/node_modules/bootstrap/dist"))
);
app.use("/public", express.static(path.join(__dirname, "/public")));

app.use("/uploads/thumbnails", (req, res, next) => {
    express.static(path.join(__dirname, "/uploads/thumbnails"))(req, res, next);
});

app.use("/uploads/paid-files", isAdmin, (req, res, next) => {
    express.static(path.join(__dirname, "/uploads/paid-files"))(req, res, next);
});

console.log(path.join(__dirname, "/uploads"));

// encodings
app.use(express.urlencoded({ extended: true }));
const multer = require("multer");
const upload = multer({
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            if (file.fieldname === "thumbnails") {
                cb(null, path.join(__dirname, "/uploads/thumbnails"));
            } else if (file.fieldname === "paidFiles") {
                cb(null, path.join(__dirname, "/uploads/paid-files"));
            } else {
                cb(null, path.join(__dirname, "/uploads/other-files"));
            }
        },
        filename: function (req, file, cb) {
            cb(
                null,
                Date.now() +
                    "-" +
                    Math.round(Math.random() * 1e9) +
                    path.extname(file.originalname)
            );
        },
    }),
});

// pictures

app.get("/", (req, res) => {
    res.redirect("/pictures");
});

app.get("/pictures", async (req, res) => {
    if (req.query.search) {
        var allPictures = await Picture.find({
            $text: { $search: req.query.search },
        }).sort({ creationDate: -1 });
    } else {
        var allPictures = await Picture.find({}).sort({ creationDate: -1 });
    }
    res.render("pictures/all", {
        page: "pictures",
        allPictures,
        search: req.query.search,
    });
});

app.get("/pictures/create", isAdmin, (req, res) => {
    res.render("pictures/create", {
        page: "createPicture",
    });
});

const picUpload = upload.fields([
    { name: "thumbnails" },
    { name: "paidFiles" },
]);

app.post("/pictures/create", isAdmin, picUpload, async (req, res, next) => {
    try {
        if (!("paidFiles" in req.files)) {
            req.files.paidFiles = [];
        }
        const picture = new Picture({
            ...req.body.picture,
            thumbnails: req.files.thumbnails.map((img) =>
                img.path.slice(img.path.search("/uploads"))
            ),
            files: req.files.paidFiles.map((img) =>
                img.path.slice(img.path.search("/uploads"))
            ),
        });
        await picture.save();
        req.flash("success", "Картинка успешно создана");
        res.redirect("/pictures");
    } catch (error) {
        next(new ExpressError(error, 500));
    }
});

app.get("/pictures/:id/edit", isAdmin, async (req, res, next) => {
    try {
        const picture = await Picture.findById(req.params.id);
        res.render("pictures/edit", {
            page: "edit",
            picture,
        });
    } catch (err) {
        next(new ExpressError("", 500));
    }
});

app.patch("/pictures/:id/edit", isAdmin, picUpload, async (req, res, next) => {
    try {
        const picture = await Picture.findByIdAndUpdate(req.params.id, {
            ...req.body.picture,
        });
        if ("thumbnails" in req.files) {
            picture.thumbnails.push(
                ...req.files.thumbnails.map((img) =>
                    img.path.slice(img.path.search("/uploads"))
                )
            );
        }
        if ("paidFiles" in req.files) {
            picture.paidFiles.push(
                ...flashreq.files.paidFiles.map((img) =>
                    img.path.slice(img.path.search("/uploads"))
                )
            );
        }
        await picture.save();
        req.flash("success", "Картинка успешно отредактирована");
        res.redirect("/pictures");
    } catch (error) {
        next(new ExpressError(error, 500));
    }
});

app.get("/pictures/:id", async (req, res, next) => {
    try {
        const picture = await Picture.findById(req.params.id);
        res.render("pictures/show", {
            page: "picture",
            picture,
        });
    } catch (err) {
        next(new ExpressError("", 500));
    }
});

app.delete("/pictures/:id", isAdmin, async (req, res, next) => {
    try {
        await Picture.findByIdAndDelete(req.params.id);
        req.flash("success", "Картинка успешно удалена");
        res.redirect("/pictures");
    } catch (err) {
        next(new ExpressError("", 500));
    }
});

// about

app.get("/about", (req, res) => {
    res.render("about.ejs", {
        page: "about",
    });
});

// users

app.get("/login", (req, res) => {
    res.render("login.ejs", {
        page: "login",
    });
});

app.post("/login", passport.authenticate("local"), (req, res) => {
    res.redirect("/");
});

app.get("/register", (req, res) => {
    res.render("register.ejs", {
        page: "register",
    });
});

app.post("/register", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;
        let isAdmin = false;
        console.log(process.env.ADMIN_NAME.split(" "));
        if (process.env.ADMIN_NAME.split(" ").includes(username)) {
            isAdmin = true;
        }
        const user = new User({ username, email, isAdmin });
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, (error) => {
            if (error) return next(error);
            console.log("Success!!!");
            res.redirect("/");
        });
    } catch (error) {
        req.flash("error", "Ошибка при регистрации");
        res.redirect("/register");
    }
});

app.get("/logout", (req, res) => {
    req.logout((error) => {
        if (error) return next(error);
        res.redirect("/");
    });
});

// errors

app.all("*", (req, res, next) => {
    next(new ExpressError("Страница не найдена", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Что-то пошло не так";
    res.status(statusCode).render("error.ejs", { err });
});

// listening

const port = 8080;
app.listen(port);
