const express = require("express");
const path = require("path");
const session = require("express-session");
const MemoryStore = require("memorystore")(session);
const secret = require("./config/secret.json").secret;
const app = express();
const port = 3001;
const router = require("./controllers/index.js");
const adminRouter = require("./controllers/admin.js");
const MAINTENANCE = false;

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(
    session({
        secret: secret,
        resave: false,
        saveUninitialized: false,
        store: new MemoryStore({
            checkPeriod: 86400000, //every 24h
        }),
    })
);

//Maintenance middleware
app.use((req, res, next) => {
	const models = require("./models");
	console.log(req.path);
    if (!MAINTENANCE || req.path === "/login") {
        next();
    } else {
    if (req.session && req.session.user) {
        models.User.findOne({
            where: {
                email: req.session.user,
            },
            attributes: ["permissions"],
        })
            .then((user) => {
                if (user.permissions === "admin") {
                    next();
                } else {
                    redirectMaintenance(req, res, true);
                }
            })
            .catch((err) => {
                redirectMaintenance(req, res, false);
            });
    } else {
        redirectMaintenance(req, res, true);
    }
        }
});

function redirectMaintenance(req, res, accessDenied) {
    if (req.method === "POST") {
        res.status(503).send("Maintenance in progress. Please try again later.");
    } else {
        res.render("maintenance");
    }
}

app.use("/", router);
app.use("/admin/", adminRouter);

app.use(function (req, res, next) {
    res.status(404);

    // respond with html page
    if (req.accepts("html")) {
        res.render("404", { url: req.url });
        return;
    }

    // respond with json
    if (req.accepts("json")) {
        res.json({ error: "Not found" });
        return;
    }

    // default to plain-text. send()
    res.type("txt").send("Not found");
});

app.listen(port, () => {
    console.log(`bestcpctraining app listening on port ${port}`);
});
