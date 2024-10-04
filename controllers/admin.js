const express = require("express");
const router = express.Router();
const models = require("../models");
const { sendErr, dateFormat } = require("./base");
const sequelize = require("sequelize");
const { admin } = require("../middleware/admin");
const validDiscountTypes = ["Percent Off", "Pounds Off", "Set Price"];
const path = require("path");
const fs = require("fs");
const multer = require("multer");
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve(__dirname, "../public/imgs/"));
    },
    filename: function (req, file, cb) {
        let ext = path.extname(file.originalname);
        console.log(__dirname);
        if (ext === ".jpeg" || ext === ".jpg") {
            ext = ".jpg";
            try {
                fs.unlinkSync(path.resolve(__dirname, "../public/imgs/advert.png"));
            } catch {}
            cb(null, file.fieldname + ".jpg");
        } else if (ext === ".png") {
            try {
                fs.unlinkSync(path.resolve(__dirname, "../public/imgs/advert.jpg"));
            } catch {}
            cb(null, file.fieldname + ".png");
        } else {
            res.status(400).send("Image must be a PNG or JPG");
        }
    },
});
const upload = multer({ storage: storage });

router.get("/", admin, (req, res) => {
    res.render("admin", {
        title: "Admin",
    });
});

router.get("/courseTypes", admin, (req, res) => {
    models.CourseType.findAll({
        order: [["name", "ASC"]],
    })
        .then((types) => {
            res.render("courseTypes", {
                title: "Course Types - Admin",
                types: types,
            });
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/addCourseType", admin, (req, res) => {
    if (!req.body.code || !req.body.name || !req.body.descriptionA || !req.body.spaces) {
        res.status(400).send("Code, name, descriptionA and spaces must be provided");
        return false;
    }
    let newCourseType = {
        code: req.body.code,
        name: req.body.name,
        descriptionA: req.body.descriptionA,
        spaces: req.body.spaces,
    };
    if (req.body.descriptionB) newCourseType.descriptionB = req.body.descriptionB;
    models.CourseType.create(newCourseType)
        .then((dbCourseType) => {
            res.sendStatus(200);
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/updateCourseType", admin, (req, res) => {
    if (!req.body.code) {
        res.status(400).send("Code must be provided");
        return false;
    }
    let newCourseType = {
        code: req.body.code,
    };
    if (req.body.name) newCourseType.name = req.body.name;
    if (req.body.descriptionA) newCourseType.descriptionA = req.body.descriptionA;
    if (req.body.descriptionB) newCourseType.descriptionB = req.body.descriptionB;
    if (req.body.spaces) newCourseType.spaces = req.body.spaces;
    models.CourseType.update(newCourseType, {
        where: {
            code: req.body.code,
        },
    })
        .then((dbCourseType) => {
            res.sendStatus(200);
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/deleteCourseType", admin, (req, res) => {
    if (!req.body.code) {
        res.status(400).send("Code must be provided");
        return false;
    }
    models.Course.findAll({
        where: {
            code: req.body.code,
        },
    }).then((courses) => {
        models.Booking.destroy({
            where: {
                courseId: courses.map((course) => course.id),
            },
        }).then((bookingsDeleted) => {
            models.Course.destroy({
                where: {
                    code: req.body.code,
                },
            }).then((coursesDeleted) => {
                models.CourseType.destroy({
                    where: {
                        code: req.body.code,
                    },
                })
                    .then((result) => {
                        res.sendStatus(200);
                    })
                    .catch((err) => {
                        res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
                    });
            });
        });
    });
});

function toISOString(date) {
    if (typeof date === "string") date = new Date(date);
    console.log(date.getTimezoneOffset());
    pad = function (num) {
        return (num < 10 ? "0" : "") + num;
    };

    return date.getFullYear() + "-" + pad(date.getMonth() + 1) + "-" + pad(date.getDate()) + "T" + pad(date.getHours()) + ":" + pad(date.getMinutes()) + ":" + pad(date.getSeconds());
}

router.get("/courses", admin, (req, res) => {
    models.Course.findAll({
        order: [["date", "ASC"]],
        include: {
            model: models.Booking,
            required: false,
            attributes: ["id"],
        },
    })
        .then((courses) => {
            courses.forEach((course) => {
                course.formattedDate = formatDate(course.date);
                course.price = course.price.toFixed(2);
                course.bookings = course.Bookings.length;
                course.milliseconds = new Date(course.date).getTime();
                delete course.Bookings;
            });
            models.CourseType.findAll()
                .then((courseTypes) => {
                    console.log(courseTypes);
                    courses.forEach((course) => {
                        let type = courseTypes.find((t) => t.code === course.code);
                        course.spaces = type.spaces;
                    });
                    let nextSaturday = new Date();
                    nextSaturday.setDate(nextSaturday.getDate() + (6 - nextSaturday.getDay()));
                    nextSaturday.setHours(9, 0, 0);
                    let today = new Date();
                    today.setTime(today.getTime() + 60 * 60 * 1000);
                    res.render("adminCourses", {
                        title: "Courses - Admin",
                        courses: courses,
                        defaultDate: nextSaturday,
                        courseTypes: courseTypes,
                        today: today,
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

function dateToUTC(date) {
    console.log("!", date);
    if (typeof date === "string") {
        date = new Date(date);
    }
    console.log("!!", date.toISOString(), date);
    return date.toISOString();
}

function formatDate(date) {
    let temp = new Date(date);
    temp.setUTCHours(temp.getHours() + 1);
    let d = temp.toISOString();

    console.log(d.substring(0, d.length - 5));
    return d.substring(0, d.length - 5);
    /*
	let month = "" + (d.getMonth() + 1);
	let day = "" + d.getDate();
	let year = d.getFullYear();
	let hours = "" + d.getHours();
	let minutes = "" + d.getMinutes();

	if (month.length < 2) month = "0" + month;
	if (day.length < 2) day = "0" + day;
	if (hours.length < 2) hours = "0" + hours;
	if (minutes.length < 2) minutes = "0" + minutes;

	return `${year}-${month}-${day}T${hours}:${minutes}`;
	*/
}

router.post("/addCourse", admin, (req, res) => {
    if (!req.body.date || !req.body.price || !req.body.code) {
        res.status(400).send("Date, price and code must be provided");
        return false;
    }
    let newCourse = {
        date: dateToUTC(req.body.date),
        price: req.body.price,
        code: req.body.code,
    };
    if (req.body.name) newCourse.name = req.body.name;
    if (req.body.description) newCourse.description = req.body.description;
    models.Course.create(newCourse)
        .then((dbCourse) => {
            res.status(200).json({ id: dbCourse.id });
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/updateCourse", admin, (req, res) => {
    if (!req.body.id) {
        res.status(400).send("Id must be provided");
        return false;
    }
    let newCourse = {
        id: req.body.id,
    };
    if (req.body.date) newCourse.date = dateToUTC(req.body.date);
    if (req.body.price) newCourse.price = req.body.price;
    if (req.body.code) newCourse.code = req.body.code;
    if (req.body.name) newCourse.name = req.body.name;
    if (req.body.description) newCourse.description = req.body.description;
    models.Course.update(newCourse, {
        where: {
            id: req.body.id,
        },
    })
        .then((dbCourse) => {
            res.sendStatus(200);
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/deleteCourse", admin, (req, res) => {
    if (!req.body.id) {
        res.status(400).send("Id must be provided");
        return false;
    }
    console.log(req.body.id);
    models.Booking.destroy({
        where: {
            courseId: req.body.id,
        },
    }).then((bookingsDeleted) => {
        models.Course.destroy({
            where: {
                id: req.body.id,
            },
        })
            .then((result) => {
                res.sendStatus(200);
            })
            .catch((err) => {
                res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
            });
    });
});

router.post("/userExists", admin, (req, res) => {
    if (!req.body.email) {
        res.status(400).send("Email must be provided");
        return false;
    }
    models.User.findOne({
        where: {
            email: req.body.email,
        },
        attributes: ["email"],
    })
        .then((user) => {
            if (user === null) {
                res.status(200).json({ found: false });
            } else {
                res.status(200).json({ found: true });
            }
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.get("/bookings", admin, (req, res) => {
    models.Booking.findAll({
        include: [
            {
                model: models.User,
            },
            {
                model: models.Course,
            },
        ],
        order: [
            [models.Course, "date", "ASC"],
            [models.User, "email", "ASC"],
        ],
    })
        .then((bookings) => {
            models.Course.findAll({
                attributes: ["id", "date", "code"],
                order: [["date", "ASC"]],
            })
                .then((courses) => {
                    let courseDates = [];
                    for (let course of courses) {
                        courseDates.push({
                            id: course.id,
                            date: course.date,
                            formattedDate: new Date(course.date).toLocaleString("en-GB", dateFormat) + " - " + course.code,
                        });
                    }
                    bookings.forEach((booking) => {
                        booking.Course.formattedDate = new Date(booking.Course.date).toLocaleString("en-GB", dateFormat) + " - " + booking.Course.code;
                        booking.milliseconds = new Date(booking.Course.date).getTime();
                    });
                    let today = new Date();
                    today.setTime(today.getTime() + 60 * 60 * 1000);
                    res.render("bookings", {
                        title: "Bookings - Admin",
                        bookings: bookings,
                        courseDates: courseDates,
                        today: today,
                    });
                })
                .catch((err) => {
                    res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
                });
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/addBooking", admin, (req, res) => {
    if (!req.body.courseId || !req.body.userEmail) {
        res.status(400).send("Course ID and user email must be provided");
        return false;
    }
    models.User.findOne({
        where: {
            email: req.body.userEmail,
        },
    })
        .then((user) => {
            if (user) {
                addBooking(req, res, req.body.userEmail, user);
            } else {
                let newUser = {
                    email: req.body.userEmail,
                };
                if (req.body.firstName) newUser.firstName = req.body.firstName.toUpperCase();
                if (req.body.surname) newUser.surname = req.body.surname.toUpperCase();
                if (req.body.licenseNumber) newUser.licenseNumber = req.body.licenseNumber;
                if (req.body.hgvLicense !== undefined) newUser.hgvLicense = req.body.hgvLicense;
                if (req.body.pcvLicense !== undefined) newUser.pcvLicense = req.body.pcvLicense;
                if (req.body.mobileNumber) newUser.mobileNumber = req.body.mobileNumber;
                if (req.body.postcode) newUser.postcode = req.body.postcode;
                models.User.create(newUser)
                    .then((dbUser) => {
                        addBooking(req, res, dbUser.email, dbUser);
                    })
                    .catch((err) => {
                        res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
                    });
            }
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

function addBooking(req, res, email, user) {
    let newBooking = {
        courseId: req.body.courseId,
        userEmail: email,
    };
    if (req.body.paid !== undefined) newBooking.paid = req.body.paid;
    models.Booking.create(newBooking)
        .then((dbBooking) => {
            res.status(200).json({
                id: dbBooking.id,
                userEmail: user.email,
                firstName: user.firstName,
                surname: user.surname,
                mobileNumber: user.mobileNumber,
                postcode: user.postcode,
                licenseNumber: user.licenseNumber,
                hgvLicense: user.hgvLicense,
                pcvLicense: user.pcvLicense,
            });
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
}

router.post("/updateBooking", admin, (req, res) => {
    if (!req.body.id || !req.body.courseId || !req.body.userEmail) {
        res.status(400).send("Id, course id and user email must be provided");
        return false;
    }
    models.User.findOne({
        where: {
            email: req.body.userEmail,
        },
        attributes: ["email"],
    })
        .then((user) => {
            if (user) {
                if (req.body.firstName) user.firstName = req.body.firstName.toUpperCase();
                if (req.body.surname) user.surname = req.body.surname.toUpperCase();
                if (req.body.licenseNumber) user.licenseNumber = req.body.licenseNumber;
                if (req.body.hgvLicense !== undefined) user.hgvLicense = req.body.hgvLicense;
                if (req.body.pcvLicense !== undefined) user.pcvLicense = req.body.pcvLicense;
                if (req.body.mobileNumber) user.mobileNumber = req.body.mobileNumber;
                if (req.body.postcode) user.postcode = req.body.postcode;
                user.save()
                    .then((user) => {
                        updateBooking(req, res, req.body.userEmail);
                    })
                    .catch((err) => {
                        res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
                    });
            } else {
                let newUser = {
                    email: req.body.userEmail,
                };
                if (req.body.firstName) newUser.firstName = req.body.firstName.toUpperCase();
                if (req.body.surname) newUser.surname = req.body.surname.toUpperCase();
                if (req.body.licenseNumber) newUser.licenseNumber = req.body.licenseNumber;
                if (req.body.hgvLicense !== undefined) newUser.hgvLicense = req.body.hgvLicense;
                if (req.body.pcvLicense !== undefined) newUser.pcvLicense = req.body.pcvLicense;
                if (req.body.mobileNumber) newUser.mobileNumber = req.body.mobileNumber;
                if (req.body.postcode) newUser.postcode = req.body.postcode;
                models.User.create(newUser)
                    .then((dbUser) => {
                        updateBooking(req, res, dbUser.email);
                    })
                    .catch((err) => {
                        res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
                    });
            }
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

function updateBooking(req, res, email) {
    let newBooking = {
        id: req.body.id,
        courseId: req.body.courseId,
        userEmail: req.body.userEmail,
    };
    if (req.body.paid !== undefined) newBooking.paid = req.body.paid;
    models.Booking.update(newBooking, {
        where: {
            id: req.body.id,
        },
    })
        .then((dbBooking) => {
            res.sendStatus(200);
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
}

router.post("/deleteBooking", admin, (req, res) => {
    if (!(req.body.id || (req.body.courseId && req.body.userEmail))) {
        res.status(400).send("Id or course id and user email must be provided");
        return false;
    }
    let where = {};
    if (req.body.id) {
        where.id = req.body.id;
    } else {
        where.courseId = req.body.courseId;
        where.userEmail = req.body.userEmail;
    }
    models.Booking.destroy({
        where: where,
    })
        .then((result) => {
            res.sendStatus(200);
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.get("/discounts", admin, (req, res) => {
    models.Discount.findAll({
        order: [["code", "ASC"]],
    })
        .then((discounts) => {
            discounts.forEach((discount) => {
                if (discount.expiryDate) {
                    discount.formattedDate = new Date(discount.expiryDate).toLocaleString("en-GB", dateFormat);
                }
                switch (discount.type) {
                    case "Set Price":
                    case "Pounds Off":
                        discount.formattedAmount = "£" + discount.amount.toFixed(2);
                        break;
                    case "Percent Off":
                        discount.formattedAmount = discount.amount.toFixed(2) + "%";
                        break;
                }
            });
            res.render("discounts", {
                title: "Discounts - Admin",
                discounts: discounts,
                validDiscountTypes: validDiscountTypes,
            });
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/addDiscount", admin, (req, res) => {
    console.log(req.body.code, req.body.type, req.body.amount);
    if (!req.body.code || !req.body.type || req.body.amount === undefined) {
        res.status(400).send("Code, type and amount must be provided");
        return false;
    }
    let newDiscount = {
        code: req.body.code.toUpperCase(),
        type: req.body.type,
        amount: req.body.amount,
    };
    if (req.body.expiryDate) newDiscount.expiryDate = req.body.expiryDate;
    if (req.body.uses) newDiscount.uses = req.body.uses;
    models.Discount.create(newDiscount)
        .then((dbDiscount) => {
            res.status(200).json({ id: dbDiscount.id });
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/updateDiscount", admin, (req, res) => {
    if (!req.body.id) {
        res.status(400).send("Id must be provided");
        return false;
    }
    let newDiscount = {
        id: req.body.id,
    };
    if (req.body.code) newDiscount.code = req.body.code.toUpperCase();
    if (req.body.type) newDiscount.type = req.body.type;
    if (req.body.amount) newDiscount.amount = req.body.amount;
    if (req.body.expiryDate) newDiscount.expiryDate = req.body.expiryDate;
    if (req.body.uses) newDiscount.uses = req.body.uses;
    models.Discount.update(newDiscount, {
        where: {
            id: req.body.id,
        },
    })
        .then((dbDiscount) => {
            res.sendStatus(200);
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/deleteDiscount", admin, (req, res) => {
    if (!req.body.id) {
        res.status(400).send("Id must be provided");
        return false;
    }
    models.Discount.destroy({
        where: {
            id: req.body.id,
        },
    })
        .then((result) => {
            res.sendStatus(200);
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

router.post("/uploadAdvert", admin, upload.single("advert"), (req, res) => {
    res.sendStatus(200);
});

router.post("/getCSVData", admin, (req, res) => {
    if (!req.body.id) {
        res.status(400).send("Id must be provided");
        return false;
    }
    console.log("1");
    models.Course.findOne({
        where: {
            id: req.body.id,
        },
        attributes: ["date", "code"],
        include: {
            model: models.Booking,
            required: true,
            attributes: ["paid"],
            include: {
                model: models.User,
                required: true,
                attributes: ["firstName", "surname", "licenseNumber", "hgvLicense", "pcvLicense", "email", "mobileNumber", "postcode"],
            },
        },
    })
        .then((course) => {
            console.log("2");
            if (course) {
                let filename = new Date(course.date).toLocaleString("en-GB", dateFormat) + " - " + course.code;
                let titles = ["Name", "License Number", "Category", "Email", "Mobile", "Postcode", "Paid"];
                let rows = [];
                for (let booking of course.Bookings) {
                    rows.push({
                        name: (booking.User.firstName + " " || "") + (booking.User.surname || ""),
                        licenseNumber: booking.User.licenseNumber || "",
                        category: (booking.User.hgvLicense ? "C" : "") + (booking.User.pcvLicense ? "D" : ""),
                        email: booking.User.email,
                        mobile: booking.User.mobileNumber || "",
                        postcode: booking.User.postcode || "",
                        paid: booking.paid ? "Yes" : "No",
                    });
                }
                console.log("3");
                res.status(200).json({
                    filename: filename,
                    titles: titles,
                    rows: rows,
                });
            } else {
                res.status(500).send(`Couldn't find this course in the database. Please try again later`);
            }
        })
        .catch((err) => {
            res.status(500).send(`Error${sendErr(err.message)}. Please try again later`);
        });
});

const generator = require("generate-password");
const bcrypt = require("bcrypt");
const { core } = require("@paypal/checkout-server-sdk");

router.post("/newPassword", admin, async (req, res) => {
    if (!req.body.email) {
        res.status(400).send("Email must be provided");
        return false;
    }
    const password = generator.generate({
        length: 6,
        numbers: true,
    });
    let user = await models.User.findOne({
        where: {
            email: req.body.email,
        },
    });
    if (user) {
        const hash = bcrypt.hashSync(password, 10);
        user.password = hash;
        await user.save();
        //send password
        res.status(200).json({ password: password });
    } else {
        res.status(400).send("No user with this email");
    }
});

module.exports = router;
