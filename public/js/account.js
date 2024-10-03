function rearrange(booking) {
    document.getElementById("rearrangeName").innerText = booking.dataset.name;
    let container = document.getElementById("rearrangeCourses");
    container.dataset.bookingid = booking.dataset.id;
    container.innerHTML = "";
	//bit of a hack to show all courses for rearranging from a SAVE course
    let allCourses = [];
    for (const [key, value] of Object.entries(courses)) {
	if (key !== "SAVE") {
	    allCourses.push(value.map(x => {x.formattedDate = key + ": " + x.formattedDate; return x;}));
	}
    }
    let allowedCourses = booking.dataset.code === "SAVE" ? allCourses.flat() : courses[booking.dataset.code];
    for (let course of allowedCourses) {
        if (course.price === parseFloat(booking.dataset.price) && course.id !== booking.dataset.courseid && course.spacesRemaining > 0) {
            let courseDiv = document.createElement("div");
            courseDiv.classList.add("rearrangeCourse");
            courseDiv.dataset.bookingid = booking.dataset.id;
            courseDiv.dataset.courseid = course.id;
            let date = document.createElement("span");
            date.classList.add("rearrangeDate");
            date.innerText = course.formattedDate;
            let button = document.createElement("button");
            button.innerText = "Rearrange";
            button.addEventListener("click", (event) => {
                let targetCourseDiv = event.currentTarget.parentElement;
                post(
                    {
                        id: targetCourseDiv.dataset.bookingid,
                        courseId: targetCourseDiv.dataset.courseid,
                    },
                    "rearrangeBooking",
                    (response) => {
                        window.location.reload();
                    }
                );
            });
            courseDiv.appendChild(date);
            courseDiv.appendChild(button);
            container.appendChild(courseDiv);
        }
    }
    if (!container.firstElementChild) {
        container.innerHTML = "There are no dates to swap to at the moment.";
    }
    document.getElementById("rearrange").classList.remove("hide");
}

function saveCourseForLater() {
    post({
	id: document.getElementById("rearrangeCourses").dataset.bookingid,
	courseId: "bcd63e30-f28a-401b-81d1-e576bd564e47",
    },
    "rearrangeBooking",
    (response) => {
	window.location.reload();
    });
}

function cancel(booking) {
    if (window.confirm("Are you sure you want to cancel this booking? You will not receive a refund. For any issues please contact us!")) {
        post({ id: booking.dataset.id }, "cancelBooking", (response) => {
            booking.parentElement.removeChild(booking);
            toast({
                text: "Booking cancelled",
                className: "success",
            });
        });
    }
}

function updateDetails(form) {
    if (!form.hgvLicense.checked && !form.pcvLicense.checked) {
        form.hgvLicense.setCustomValidity("You must have either an HGV or PCV license");
        toast({
            text: "You must have either an HGV or PCV license",
            className: "error",
        });
        return false;
    }
    const data = {
        firstName: form.firstName.value,
        surname: form.surname.value,
        licenseNumber: form.licenseNumber.value?.toUpperCase(),
        hgvLicense: form.hgvLicense.checked,
        pcvLicense: form.pcvLicense.checked,
        mobileNumber: form.mobileNumber.value,
        postcode: form.postcode.value?.toUpperCase(),
    };
    post(data, "updateUser", (response) => {
        toast({
            text: "User details successfully updated",
            className: "success",
        });
    });
}

function deleteAccount() {
    if (window.confirm("Are you sure you want to delete your account? This will also delete all of your bookings and cannot be undone.")) {
        if (window.confirm("Please confirm your account should immediately and permanently be deleted")) {
            post({}, "deleteAccount", (response) => {
                window.location.href = window.location.origin;
            });
        }
    }
}

function repeatedPasswordChange(form) {
    if (form.newPassword === form.newPasswordRepeated) {
        form.newPasswordRepeated.setCustomValidity("");
    }
}

function checkboxChecked(form) {
    form.hgvLicense.setCustomValidity("");
}

function changePassword(form) {
    if (form.newPassword.value !== form.newPasswordRepeated.value) {
        form.newPasswordRepeated.setCustomValidity("This doesn't match the password you've entered above.");
        toast({
            text: "This doesn't match the password you've entered above.",
            className: "error",
        });
        return false;
    }
    post({ oldPassword: form.oldPassword.value, newPassword: form.newPassword.value }, "changePassword", (response) => {
        toast({
            text: "Password changed",
            className: "success",
        });
    });
}
