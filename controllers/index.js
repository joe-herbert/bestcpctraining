const express = require("express");
const router = express.Router();
const models = require("../models");
const bcrypt = require("bcrypt");
const { sendErr, dateFormat } = require("./base");
const sequelize = require("sequelize");
const { user } = require("../middleware/admin");
const generator = require("generate-password");
const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = require("../config/paypal.json");
const { USER_EMAIL, CLIENT_ID, CLIENT_SECRET, REFRESH_TOKEN, ACCESS_TOKEN } = require("../config/gmail.json");
const paypal_base = process.env.NODE_ENV === "production" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com";
//const paypal_base = "https://api-m.sandbox.paypal.com";
const os = require("os");

const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

//const { EMAIL_HOST, EMAIL_PORT, EMAIL_ADDRESS, EMAIL_PASSWORD } = require("../config/email.json");
/*const transporter = nodemailer.createTransport({
    service: "hotmail",
    auth: {
        user: EMAIL_ADDRESS,
        pass: EMAIL_PASSWORD,
    },
});*/
/*const transporter = nodemailer.createTransport(`smtps://${encodeURIComponent(EMAIL_ADDRESS)}:${encodeURIComponent(EMAIL_PASSWORD)}@${EMAIL_HOST}`);*/
/*const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    auth: {
        user: EMAIL_ADDRESS,
        password: EMAIL_PASSWORD,
    },
    secure: true,
});*/

router.get("/", (req, res) => {
    let today = new Date();
    today.setTime(today.getTime() + 60 * 60 * 1000);
    let whereParams = {
        date: {
            [sequelize.Op.gt]: today,
        },
    };
    if (req.query.courseId) {
        whereParams.id = req.query.courseId;
    }
    models.Course.findAll({
        where: whereParams,
        include: [
            {
                model: models.CourseType,
                required: true,
                attributes: ["name", "spaces"],
            },
            {
                model: models.Booking,
                attributes: ["userEmail"],
            },
        ],
        order: [["date", "ASC"]],
        limit: 10,
    })
        .then((courses) => {
            for (let course of courses) {
                course.name = course.CourseType.name;
                course.spaces = course.CourseType.spaces;
                course.spacesRemaining = course.spaces - course.Bookings.length;
                course.price = "£" + course.price.toFixed(2);
                course.formattedDate = new Date(course.date).toLocaleDateString("en-Gb", dateFormat);
            }
            res.render("index", {
                courses: courses,
            });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.get("/login", (req, res) => {
    if (req.session.user) {
        res.redirect("/account");
    } else {
        res.render("login", { email: req.query.email, title: "Login" });
    }
});

router.get("/register", (req, res) => {
    if (req.session.user) {
        res.redirect("/account");
    } else {
        res.render("register", { title: "Register" });
    }
});

router.post("/login", (req, res) => {
    models.User.findOne({
        where: {
            email: req.body.email,
        },
    })
        .then((user) => {
            if (user === null) {
                res.status(401).send("Incorrect credentials");
            } else {
                bcrypt.compare(req.body.password, user.password, (err, match) => {
                    if (err) {
                        res.status(500).send({ message: `Error${sendErr(err.message)}. Please try again later` });
                    } else {
                        if (match) {
                            req.session.user = user.email;
                            req.app.locals.user = {
                                firstName: user.firstName,
                                surname: user.surname,
                                permissions: user.permissions,
                                email: user.email,
                                licenseNumber: user.licenseNumber,
                                hgvLicense: user.hgvLicense,
                                pcvLicense: user.pcvLicense,
                                mobileNumber: user.mobileNumber,
                                postcode: user.postcode,
                                permissions: user.permissions,
                            };
                            res.sendStatus(200);
                        } else {
                            res.status(401).send("Incorrect credentials");
                        }
                    }
                });
            }
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/register", (req, res) => {
    models.User.findOne({
        where: {
            email: req.body.email,
        },
    })
        .then((user) => {
            if (user === null) {
                bcrypt.hash(req.body.password, 10, function (err, hash) {
                    if (err) {
                        res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
                    } else {
                        let userObj = {
                            email: req.body.email,
                            firstName: req.body.firstName.toUpperCase(),
                            surname: req.body.surname.toUpperCase(),
                            password: hash,
                            licenseNumber: req.body.licenseNumber,
                            hgvLicense: req.body.hgvLicense,
                            pcvLicense: req.body.pcvLicense,
                            mobileNumber: req.body.mobileNumber,
                            postcode: req.body.postcode,
                            permissions: "user",
                        };
                        models.User.create(userObj)
                            .then((user) => {
                                req.session.user = user.email;
                                delete userObj.password;
                                req.app.locals.user = userObj;
                                res.sendStatus(200);
                            })
                            .catch((err) => {
                                res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
                            });
                    }
                });
            } else {
                res.status(400).send("An account with this email address already exists. Try logging in instead.");
            }
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/updateUser", user, (req, res) => {
    models.User.update(
        {
            firstName: req.body.firstName.toUpperCase(),
            surname: req.body.surname.toUpperCase(),
            licenseNumber: req.body.licenseNumber,
            hgvLicense: req.body.hgvLicense,
            pcvLicense: req.body.pcvLicense,
            mobileNumber: req.body.mobileNumber,
            postcode: req.body.postcode,
        },
        {
            where: {
                email: req.session.user,
            },
        }
    )
        .then((user) => {
            res.sendStatus(200);
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/changePassword", user, (req, res) => {
    if (!req.body.oldPassword || !req.body.newPassword) {
        res.status(400).send("Old Password and New Password must be provided");
        return false;
    }
    models.User.findOne({
        where: {
            email: req.session.user,
        },
    })
        .then((user) => {
            if (user === null) {
                res.status(401).send("Incorrect credentials");
            } else {
                bcrypt.compare(req.body.oldPassword, user.password, (err, match) => {
                    if (err) {
                        res.status(500).send({ message: `Error${sendErr(err.message)}. Please try again later` });
                    } else {
                        if (match) {
                            bcrypt.hash(req.body.newPassword, 10, function (err, hash) {
                                if (err) {
                                    res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
                                } else {
                                    models.User.update(
                                        {
                                            password: hash,
                                        },
                                        {
                                            where: {
                                                email: req.session.user,
                                            },
                                        }
                                    )
                                        .then((user) => {
                                            res.sendStatus(200);
                                        })
                                        .catch((err) => {
                                            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
                                        });
                                }
                            });
                        } else {
                            res.status(401).send("Incorrect credentials");
                        }
                    }
                });
            }
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/logout", (req, res) => {
    try {
        req.session.destroy();
        req.app.locals.user = undefined;
        res.sendStatus(200);
    } catch (err) {
        res.send(`Error${sendErr(err.message)}. Please try again`);
    }
});

router.get("/forgotPassword", (req, res) => {
    if (req.session.user) {
        res.redirect("/account");
    } else {
        res.render("forgotPassword", { title: "Forgot Password" });
    }
});

router.post("/forgotPassword", async (req, res) => {
    if (!req.body.email) {
        res.status(400).send("Email must be provided");
        return false;
    }
    const newPassword = generator.generate({
        length: 6,
        numbers: true,
    });
    const hash = bcrypt.hashSync(newPassword, 10);
    let user = await models.User.findOne({
        where: {
            email: req.body.email,
        },
    });
    if (!user) {
        res.status(400).send("This email is not associated with an account. Please register now.");
        return false;
    }
    user.password = hash;
    user.save();

    let mailOptions = {
        from: USER_EMAIL,
        to: req.body.email,
        subject: "Your new password - Best CPC Training",
        html: `<body style="padding: 30px; box-sizing: border-box; width: 100%;"><img style="width: 300px; display: block; max-width:80%; margin: 0 auto;" src="${req.protocol + "://" + req.hostname}/imgs/logo.png"><br><h1 style="text-align: center;">Your temporary password is here!</h1><br><p><b>Your temporary password is: </b>${newPassword}<br>You should <a href="${req.protocol + "://" + req.hostname}/login">log in</a> and change your password immediately.</p><p>Please do not hesitate to <a href="${req.protocol + "://" + req.hostname}/contact">contact us</a> if you have any issues!</p></body>`,
    };

    let transporter = await createTransporter();

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            res.status(500).send(`There was an error sending your password reset email${sendErr(error.message)}. Please try again or contact us if the issue persists.`);
        } else {
            console.log("Email sent: " + info.response);
            res.sendStatus(200);
        }
    });
});

router.get("/account", user, (req, res) => {
    //get all user info
    models.User.findOne({
        where: {
            email: req.session.user,
        },
        attributes: ["email", "firstName", "surname", "licenseNumber", "hgvLicense", "pcvLicense", "mobileNumber", "postcode"],
        include: {
            model: models.Booking,
            required: false,
            attributes: ["id", "paid"],
            include: {
                model: models.Course,
                required: true,
                attributes: ["id", "price", "date"],
                include: {
                    model: models.CourseType,
                    required: true,
                    attributes: ["code", "name"],
                },
            },
        },
    })
        .then((user) => {
            let userObj = {
                email: user.email,
                firstName: user.firstName,
                surname: user.surname,
                licenseNumber: user.licenseNumber,
                hgvLicense: user.hgvLicense,
                pcvLicense: user.pcvLicense,
                mobileNumber: user.mobileNumber,
                postcode: user.postcode,
            };
            let bookings = user.Bookings.map((booking) => {
                return {
                    id: booking.id,
                    paid: booking.paid,
                    courseId: booking.Course.id,
                    code: booking.Course.CourseType.code,
                    price: booking.Course.price,
                    date: new Date(booking.Course.date).toLocaleDateString("en-Gb", dateFormat),
                    milliseconds: new Date(booking.Course.date).getTime(),
                    name: booking.Course.CourseType.name,
                };
            });
            bookings.sort((a, b) => {
                return a.milliseconds - b.milliseconds;
            });
            console.log(bookings);
            //get all courses which could be rearranged to
            let today = new Date();
            today.setTime(today.getTime() + 60 * 60 * 1000);
            models.Course.findAll({
                where: {
                    date: {
                        [sequelize.Op.gt]: today,
                    },
                },
                include: [
                    {
                        model: models.CourseType,
                        required: true,
                        attributes: ["code", "spaces"],
                    },
                    {
                        model: models.Booking,
                        attributes: ["userEmail"],
                    },
                ],
                order: [["date", "ASC"]],
            })
                .then((courses) => {
                    let coursesObj = {};
                    for (let course of courses) {
                        let courseObj = {};
                        courseObj.spaces = course.CourseType.spaces;
                        courseObj.spacesRemaining = course.CourseType.spaces - course.Bookings.length;
                        courseObj.price = course.price;
                        courseObj.formattedDate = new Date(course.date).toLocaleDateString("en-Gb", dateFormat);
                        courseObj.id = course.id;
                        if (Object.hasOwn(coursesObj, course.code)) {
                            coursesObj[course.code].push(courseObj);
                        } else {
                            coursesObj[course.code] = [courseObj];
                        }
                    }
                    res.render("account", {
                        title: "Your Account",
                        userDetails: userObj,
                        bookings: bookings,
                        today: today.getTime(),
                        courses: coursesObj,
                    });
                })
                .catch((err) => {
                    console.error(err);
                    res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
                });
        })
        .catch((err) => {
            console.error(err);
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.get("/basket", (req, res) => {
    res.render("basket", { title: "Basket", paypalClientId: PAYPAL_CLIENT_ID });
});

router.get("/getBasket", (req, res) => {
    if (req.query.courseId) {
        models.Course.findAll({
            where: {
                id: req.query.courseId,
            },
            include: [
                {
                    model: models.CourseType,
                    required: true,
                    attributes: ["name", "spaces"],
                },
            ],
            raw: true,
            order: [["date", "ASC"]],
        })
            .then((courses) => {
                for (let course of courses) {
                    course.name = course["CourseType.name"];
                    delete course["CourseType.name"];
                    course.spaces = course["CourseType.spaces"];
                    delete course["CourseType.spaces"];
                }
                res.status(200).send(courses);
            })
            .catch((err) => {
                res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
            });
    } else {
        res.status(200);
    }
});

router.get("/courses", (req, res) => {
    let today = new Date();
    today.setTime(today.getTime() + 60 * 60 * 1000);
    models.CourseType.findAll({
        include: {
            model: models.Course,
            where: {
                date: {
                    [sequelize.Op.gt]: today,
                },
            },
            required: false,
            include: {
                model: models.Booking,
                attributes: ["userEmail"],
            },
        },
        order: [
            ["name", "ASC"],
            [models.Course, "date", "ASC"],
        ],
    })
        .then((courses) => {
            let formattedCourses = [];
            for (let course of courses) {
                let formattedCourse = {
                    code: course.code,
                    name: course.name,
                    spaces: course.spaces,
                };
                //find next course with spaces
                let i = 0;
                while (i < course.Courses.length && course.Courses[i].Bookings.length >= course.spaces) {
                    i++;
                }
                //add next course details to object
                if (i < course.Courses.length) {
                    formattedCourse.nextDate = new Date(course.Courses[i].date).toLocaleDateString("en-Gb", dateFormat);
                    formattedCourse.nextPrice = "£" + course.Courses[i].price.toFixed(2);
                    formattedCourse.spacesRemaining = course.spaces - course.Courses[i].Bookings.length;
                    formattedCourse.nextId = course.Courses[i].id;
                }
                formattedCourses.push(formattedCourse);
            }
            res.render("courses", {
                title: "Courses",
                courses: formattedCourses,
            });
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.get("/course", (req, res) => {
    let today = new Date();
    today.setTime(today.getTime() + 60 * 60 * 1000);
    if (req.query.code) {
        models.CourseType.findOne({
            where: {
                code: req.query.code,
            },
            include: {
                model: models.Course,
                where: {
                    date: {
                        [sequelize.Op.gt]: today,
                    },
                },
                required: false,
                include: {
                    model: models.Booking,
                    attributes: ["userEmail"],
                },
            },
            order: [[models.Course, "date", "ASC"]],
        })
            .then((course) => {
                if (course) {
                    for (let i in course.Courses) {
                        course.Courses[i].spacesBooked = course.Courses[i].Bookings.length;
                        course.Courses[i].spacesRemaining = course.spaces - course.Courses[i].Bookings.length;
                        course.Courses[i].price = "£" + course.Courses[i].price.toFixed(2);
                        course.Courses[i].formattedDate = new Date(course.Courses[i].date).toLocaleDateString("en-Gb", dateFormat);
                    }
                    res.render("course", {
                        course: course,
                        title: course.name,
                    });
                } else {
                    res.redirect("/courses");
                }
            })
            .catch((err) => {
                res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
            });
    } else {
        res.redirect("/courses");
    }
});

router.get("/book", (req, res) => {
    let today = new Date();
    today.setTime(today.getTime() + 60 * 60 * 1000);
    let whereParams = {
        date: {
            [sequelize.Op.gt]: today,
        },
    };
    if (req.query.courseId) {
        whereParams.id = req.query.courseId;
    }
    models.Course.findAll({
        where: whereParams,
        include: [
            {
                model: models.CourseType,
                required: true,
                attributes: ["name", "spaces"],
            },
            {
                model: models.Booking,
                attributes: ["userEmail"],
            },
        ],
        order: [["date", "ASC"]],
    })
        .then((courses) => {
            for (let course of courses) {
                course.name = course.CourseType.name;
                course.spaces = course.CourseType.spaces;
                course.spacesRemaining = course.spaces - course.Bookings.length;
                course.price = "£" + course.price.toFixed(2);
                course.formattedDate = new Date(course.date).toLocaleDateString("en-Gb", dateFormat);
            }
            res.render("book", {
                title: "Book a course",
                courses: courses,
            });
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.get("/eligibility", (req, res) => {
    res.render("eligibility", {
        title: "Eligibility",
    });
});

router.get("/about", (req, res) => {
    res.render("about", {
        title: "About CPC",
    });
});

router.get("/trainer", (req, res) => {
    res.render("trainer", {
        title: "Your trainer",
    });
});

router.get("/contact", (req, res) => {
    res.render("contact", {
        title: "Contact",
        email: USER_EMAIL || "admin@bestcpctraining.co.uk",
    });
});

router.get("/termsAndConditions", (req, res) => {
    res.render("termsAndConditions", {
        title: "Terms and Conditions",
    });
});

router.post("/checkDiscount", (req, res) => {
    if (!req.body.code) {
        res.status(400).send("Code must be provided");
        return false;
    }
    models.Discount.findOne({
        where: {
            code: req.body.code.toUpperCase(),
        },
        attributes: ["code", "type", "amount", "expiryDate", "uses"],
        raw: true,
    })
        .then((discount) => {
            if (!discount || (discount.expiryDate && discount.expiryDate < new Date()) || (discount.uses && discount.uses <= 0)) {
                res.status(200).json({
                    valid: false,
                });
            } else {
                res.status(200).json({
                    valid: true,
                    code: discount.code,
                    type: discount.type,
                    amount: discount.amount,
                });
            }
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/rearrangeBooking", user, (req, res) => {
    if (!req.body.courseId || !req.body.id) {
        res.status(400).send("Id and courseId must be provided");
        return false;
    }
    models.Booking.update(
        {
            courseId: req.body.courseId,
        },
        {
            where: {
                id: req.body.id,
                userEmail: req.session.user,
            },
        }
    )
        .then((result) => {
            res.sendStatus(200);
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/cancelBooking", user, (req, res) => {
    if (!req.body.id) {
        res.status(400).send("Id must be provided");
        return false;
    }
    models.Booking.destroy({
        where: {
            id: req.body.id,
            userEmail: req.session.user,
        },
    })
        .then((result) => {
            res.sendStatus(200);
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/deleteAccount", user, (req, res) => {
    if (req.session.user) {
        models.User.destroy({
            where: {
                email: req.session.user,
            },
        })
            .then((result) => {
                req.session.destroy();
                req.app.locals.user = undefined;
                res.sendStatus(200);
            })
            .catch((err) => {
                res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
            });
    }
});

const generateAccessToken = async () => {
    try {
        if (!PAYPAL_CLIENT_ID || !PAYPAL_CLIENT_SECRET) {
            throw new Error("MISSING_API_CREDENTIALS");
        }

        const auth = Buffer.from(PAYPAL_CLIENT_ID + ":" + PAYPAL_CLIENT_SECRET).toString("base64");

        const response = await fetch(`${paypal_base}/v1/oauth2/token`, {
            method: "POST",

            body: "grant_type=client_credentials",

            headers: {
                Authorization: `Basic ${auth}`,
            },
        });

        const data = await response.json();

        return data.access_token;
    } catch (error) {
        console.error("Failed to generate Access Token:", error);
    }
};

async function handleResponse(response, usedDiscounts) {
    try {
        const jsonResponse = await response.json();
        return {
            jsonResponse,
            httpStatusCode: response.status,
            usedDiscounts,
        };
    } catch (err) {
        const errorMessage = await response.text();
        throw new Error(errorMessage);
    }
}

const createOrder = async (items, discounts, sessionEmail) => {
    const courses = await models.Course.findAll({
        where: {
            id: items,
        },
        attributes: ["id", "price", "date"],
        include: [
            {
                model: models.CourseType,
                required: true,
            },
            {
                model: models.Booking,
                required: false,
            },
        ],
    });
    if (sessionEmail) {
        for (let course of courses) {
            let booking = await models.Booking.findOne({
                where: {
                    courseId: course.id,
                    userEmail: sessionEmail,
                },
            });
            if (booking) {
                return {
                    httpStatusCode: 400,
                    jsonResponse: {
                        error: `You're already booked on the '${course.CourseType.name}' course on ${new Date(course.date).toLocaleDateString("en-Gb", dateFormat)}. Please remove it from your basket and try again.`,
                    },
                };
            }
        }
    }
    for (let course of courses) {
        if (course.Bookings.length >= course.CourseType.spaces) {
            return {
                httpStatusCode: 400,
                jsonResponse: {
                    error: `The '${course.CourseType.name}' course on ${new Date(course.date).toLocaleDateString("en-Gb", dateFormat)} is fully booked. Please remove it from your basket and try again.`,
                },
            };
        }
    }
    let totalBeforeDiscounts = courses.reduce((sum, course) => {
        return sum + course.price;
    }, 0);
    let total = totalBeforeDiscounts;
    totalBeforeDiscounts = totalBeforeDiscounts.toFixed(2);
    let usedDiscounts = [];
    if (discounts) {
        let dbDiscounts = await models.Discount.findAll({
            where: {
                code: discounts.map((discount) => discount.code),
            },
        });
        //sort dbDiscounts in reverse order by type so Set Price is done first, then Pounds Off, then Percent Off
        dbDiscounts.sort((a, b) => (a.type > b.type ? -1 : b.type > a.type ? 1 : 0));
        //calculate new total by applying each discount in order
        for (let discount of dbDiscounts) {
            if (total > 0 && (!discount.expiryDate || discount.expiryDate >= new Date()) && (!discount.uses || discount.uses >= 0)) {
                switch (discount.type) {
                    case "Set Price":
                        if (discount.amount < total) {
                            total = discount.amount;
                            usedDiscounts.push(discount.code);
                        }
                        break;
                    case "Pounds Off":
                        total -= discount.amount;
                        if (total < 0) total = 0;
                        usedDiscounts.push(discount.code);
                        break;
                    case "Percent Off":
                        total -= (total / 100) * discount.amount;
                        if (total < 0) total = 0;
                        discount.used = true;
                        usedDiscounts.push(discount.code);
                        break;
                }
            }
        }
    }
    total = parseFloat(total).toFixed(2);

    const accessToken = await generateAccessToken();
    const url = `${paypal_base}/v2/checkout/orders`;
    const payload = {
        intent: "CAPTURE",
        purchase_units: [
            {
                amount: {
                    currency_code: "GBP",
                    value: total,
                    breakdown: {
                        item_total: {
                            currency_code: "GBP",
                            value: totalBeforeDiscounts,
                        },
                        discount: {
                            currency_code: "GBP",
                            value: (totalBeforeDiscounts - total).toFixed(2),
                        },
                    },
                },
                items: courses.map((course) => {
                    return {
                        name: course.CourseType.name + " - " + new Date(course.date).toLocaleDateString("en-Gb", dateFormat),
                        unit_amount: {
                            currency_code: "GBP",
                            value: course.price.toFixed(2),
                        },
                        quantity: 1,
                    };
                }),
            },
        ],
    };

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            // Uncomment one of these to force an error for negative testing (in sandbox mode only).
            // Documentation: https://developer.paypal.com/tools/sandbox/negative-testing/request-headers/
            // "PayPal-Mock-Response": '{"mock_application_codes": "MISSING_REQUIRED_PARAMETER"}'
            // "PayPal-Mock-Response": '{"mock_application_codes": "PERMISSION_DENIED"}'
            // "PayPal-Mock-Response": '{"mock_application_codes": "INTERNAL_SERVER_ERROR"}'
        },
        method: "POST",
        body: JSON.stringify(payload),
    });

    return handleResponse(response, usedDiscounts);
};

router.post("/createOrder", async (req, res) => {
    if (!req.body.items || req.body.items.length === 0) {
        res.status(400).send("Items must be provided");
        return false;
    }

    try {
        const { jsonResponse, httpStatusCode, usedDiscounts } = await createOrder(req.body.items, req.body.discounts, req.session.user);
        if (jsonResponse && jsonResponse.id) {
            let newOrder = {
                id: jsonResponse.id,
                items: JSON.stringify(req.body.items),
            };
            if (usedDiscounts) newOrder.discounts = JSON.stringify(usedDiscounts);
            await models.Order.create(newOrder);
        }
        res.status(httpStatusCode).json(jsonResponse);
    } catch (err) {
        console.log(err);
        res.status(500).json({ error: `There was an error completing your booking${sendErr(err.message)}. You have not been charged, please try again later.` });
        //res.status(500).json({ error: `There was an error taking your payment${sendErr(err.message)}. Your spaces have been reserved - please contact us to complete payment.` });
    }
});

router.post("/completeOrder", async (req, res) => {
    const accessToken = await generateAccessToken();
    let order = await models.Order.findOne({
        where: {
            id: req.body.orderId,
        },
    });
    if (!order) {
        console.error("Could not find an order with the provided order ID");
        res.status(500).json({ error: `There was an error completing your booking. You have not been charged, please try again later.` });
        return false;
    }
    const url = `${paypal_base}/v2/checkout/orders/${req.body.orderId}/capture`;
    let response = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${accessToken}`,
            Prefer: "return=representation",
        },
    });
    if (!response.ok) {
        console.log(response);
        res.status(500).json({ error: `There was an error completing your booking. You have not been charged, please try again later.` });
        return false;
    }
    let json = await response.json();
    //payment completed
    let userEmail = req.session.user;
    let userCreated = false;
    let newPassword = "";
    if (!req.session.user) {
        newPassword = generator.generate({
            length: 6,
            numbers: true,
        });
        const hash = bcrypt.hashSync(newPassword, 10);
        let [dbUser, created] = await models.User.findOrCreate({
            where: {
                email: json.payer.email_address,
            },
            defaults: {
                email: json.payer.email_address,
                firstName: json.payer.name.given_name.toUpperCase(),
                surname: json.payer.name.surname.toUpperCase(),
                password: hash,
            },
        });
        if (created) userCreated = true;
        userEmail = dbUser.email;
    }
    let courses = JSON.parse(order.items);
    let discounts = order.discounts ? JSON.parse(order.discounts) : undefined;
    let bookings = await models.Booking.bulkCreate(
        courses.map((course) => {
            return {
                courseId: course,
                userEmail: userEmail,
                paid: true,
                orderId: json.id,
            };
        })
    );
    //payment was successful so mark discounts as used
    if (discounts) {
        let dbDiscounts = await models.Discount.findAll({
            where: {
                code: discounts,
                uses: {
                    [sequelize.Op.ne]: null,
                },
            },
        });
        for (let discount of dbDiscounts) {
            if (discount.uses && discount.uses > 0) {
                discount.uses = discount.uses - 1;
                await discount.save();
            }
        }
    }

    let dbCourses = await models.Course.findAll({
        where: {
            id: courses,
        },
        attributes: ["date", "price"],
        include: {
            model: models.CourseType,
            required: true,
            attributes: ["name"],
        },
    });

    //for testing
    if (userEmail.includes("personal.example.com")) userEmail = "joecherbert@me.com";

    //send confirmation email
    let mailOptions = {
        from: USER_EMAIL,
        to: userEmail,
        subject: "Your CPC Training is confirmed!",
        html: `<img style="width: 300px; display: block; max-width:80%; margin: 0 auto;" src="${req.protocol + "://" + req.hostname}/imgs/logo.png"><br><h1 style="text-align: center;">Your booking is confirmed at Best CPC Training!</h1><br><p><b>Booking ID:</b> ${json.id}</p><p><b>Ordered at:</b> ${new Date().toLocaleDateString("en-Gb", dateFormat)}</p>${userCreated ? "<p><b>Your temporary password is:</b> " + newPassword + "<br>You should <a href='" + req.protocol + "://" + req.hostname + "/login'>log in</a> and change your password as soon as you can. You will also need to complete your user details in your account page before your course begins.</p>" : ""}<p>Your courses are:</p><table style="width: 80%;border: 5px solid #81b3ec;margin: 0 auto;">${generateTable(dbCourses)}</table><p>All the details you need to join your course are in the attached PDF document. Please do not hesitate to <a href="${req.protocol + "://" + req.hostname}/contact">contact us</a> if you have any issues!</p>`,
        attachments: [
            {
                filename: "Best CPC Training Link & Candidate Form & Zoom instructions.pdf",
                path: req.protocol + "://" + req.hostname + "/assets/Best%20CPC%20Training%20Link%20%26%20Candidate%20Form%20%26%20Zoom%20instructions.pdf",
                contentType: "application/pdf",
            },
        ],
    };
    json.responseHtml =
        mailOptions.html +
        `<p>You will receive a confirmation email shortly with a copy of the PDF document below.</p><a class="button" href="/assets/Best%20CPC%20Training%20Link%20%26%20Candidate%20Form%20%26%20Zoom%20instructions.pdf", style="display: block; margin: 0 auto;">DOWNLOAD PDF</a>`;
    let transporter = await createTransporter();
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.error(error);
            res.status(500).json({
                error: `There was an error sending your confirmation email${sendErr(error.message)}. Your booking has been reserved and paid for. Please contact us and reference your order ID: ${json.id}`,
                json: json,
            });
        } else {
            console.log(json);
            console.log("Email sent: " + info.response);
            res.send(json);
        }
    });
});

function generateTable(courses) {
    let html = "";
    let odd = false;
    for (let course of courses) {
        html += `<tr style="${odd ? "background-color: #d9e9fc;" : ""}"><td style="padding: 10px; text-align: left;">${course.CourseType.name}</td><td style="padding: 10px; text-align: center">${new Date(course.date).toLocaleDateString("en-Gb", dateFormat)}</td><td style="padding: 10px; text-align: right">£${course.price.toFixed(2)}</td></tr>`;
        odd = !odd;
    }
    return html;
}

const createTransporter = async () => {
    try {
        const oauth2Client = new OAuth2(CLIENT_ID, CLIENT_SECRET, "https://developers.google.com/oauthplayground");

        oauth2Client.setCredentials({
            refresh_token: REFRESH_TOKEN,
        });

        const accessToken = await new Promise((resolve, reject) => {
            oauth2Client.getAccessToken((err, token) => {
                if (err) {
                    console.log("*ERR: ", err);
                    reject();
                }
                resolve(token);
            });
        });

        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                type: "OAuth2",
                user: USER_EMAIL,
                accessToken,
                clientId: CLIENT_ID,
                clientSecret: CLIENT_SECRET,
                refreshToken: REFRESH_TOKEN,
            },
        });
        return transporter;
    } catch (err) {
        return err;
    }
};

module.exports = router;
