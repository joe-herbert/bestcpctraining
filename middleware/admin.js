const models = require("../models");
exports.admin = function (req, res, next) {
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
                    redirect(req, res, true);
                }
            })
            .catch((err) => {
                redirect(req, res, false);
            });
    } else {
        redirect(req, res, true);
    }
};
exports.user = function (req, res, next) {
    if (req.session && req.session.user) {
        models.User.findOne({
            where: {
                email: req.session.user,
            },
            attributes: ["permissions"],
        })
            .then((user) => {
                if (user.permissions === "user" || user.permissions === "admin") {
                    next();
                } else {
                    redirect(req, res, true);
                }
            })
            .catch((err) => {
                redirect(req, res, false);
            });
    } else {
        redirect(req, res, true);
    }
};

function redirect(req, res, accessDenied) {
    if (req.method === "POST") {
        res.status(403).send("Access Denied");
    } else {
        res.render("login", {
            error: accessDenied ? "Access Denied. You do not have the required permissions." : undefined,
        });
    }
}
