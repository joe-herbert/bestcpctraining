exports.sendErr = (errMessage, req) => {
	console.error(errMessage);
    if (req != undefined) {
        if (req.app.get("env") === "development") {
            return ": " + errMessage;
        } else {
            if (req.session && req.session.userId) {
                models.User.findOne({
                    where: {
                        id: req.session.userId,
                    },
                    attributes: ["permissions"],
                }).then((user) => {
                    if (user.permissions === "admin") {
                        return ": " + errMessage;
                    } else {
                        console.log(errMessage);
                        return "";
                    }
                });
            } else {
                console.log(errMessage);
                return "";
            }
        }
    }
    return "";
};

exports.dateFormat = {
    timeZone: "Europe/London",
    hourCycle: "h24",
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
};
