function update(form) {
    let data = {
        id: form.id.value,
        courseId: form.date.value,
        userEmail: form.email.value,
        hgvLicense: form.hgvLicense.checked,
        pcvLicense: form.pcvLicense.checked,
        paid: form.paid.checked,
    };
    if (form.firstName.value && form.firstName.value !== "") data.firstName = form.firstName.value;
    if (form.surname.value && form.surname.value !== "") data.surname = form.surname.value;
    if (form.licenseNumber.value && form.licenseNumber.value !== "") data.licenseNumber = form.licenseNumber.value.toUpperCase();
    if (form.mobileNumber.value && form.mobileNumber.value !== "") data.mobileNumber = form.mobileNumber.value;
    if (form.postcode.value && form.postcode.value !== "") data.postcode = form.postcode.value.toUpperCase();
    post(data, "admin/updateBooking", (response) => {
        toast({
            text: "Booking updated",
            className: "success",
        });
        hideUserDetails(form.querySelector(".userDetails"));
    });
}

function create(form) {
    let data = {
        courseId: form.date.value,
        userEmail: form.email.value,
        hgvLicense: form.hgvLicense.checked,
        pcvLicense: form.pcvLicense.checked,
        paid: form.paid.checked,
    };
    if (form.firstName.value && form.firstName.value !== "") data.firstName = form.firstName.value;
    if (form.surname.value && form.surname.value !== "") data.surname = form.surname.value;
    if (form.licenseNumber.value && form.licenseNumber.value !== "") data.licenseNumber = form.licenseNumber.value.toUpperCase();
    if (form.mobileNumber.value && form.mobileNumber.value !== "") data.mobileNumber = form.mobileNumber.value;
    if (form.postcode.value && form.postcode.value !== "") data.postcode = form.postcode.value.toUpperCase();
    post(
        data,
        "admin/addBooking",
        (response) => {
            let newForm = document.createElement("form");
            newForm.classList.add("booking");
            newForm.onsubmit = "update(this); return false;";
            newForm.innerHTML = `<input class="hide" type="text" name="id" value="${response.id}" readonly="">
<div class="input-container">
    <select class="date" name="date" id="date${response.id}" placeholder=" " autocomplete="off" required="">${document.getElementById("date").innerHTML}</select>
    <label class="label" for="date${response.id}">Date</label>
    <div class="underline"></div>
</div>
<div class="input-container">
    <input class="email" type="email" id="email${response.id}" name="email" value="${response.userEmail}" placeholder=" " onchange="checkUserEmail(this)" required=""><label class="label" for="email${response.id}">Email</label>
    <div class="underline"></div>
</div>
<button onclick="this.innerText = this.innerText == 'Show User' ? 'Hide User' : 'Show User'; this.nextElementSibling.classList.toggle('hide')">Show User</button>
<div class="userDetails hide">
    <div class="input-container">
        <input class="firstName" type="text" id="firstName${response.id}" name="firstName" value="${response.firstName}" placeholder=" " disabled=""><label class="label" for="firstName${response.id}">First name</label>
        <div class="underline"></div>
    </div>
    <div class="input-container">
        <input class="surname" type="text" id="surname${response.id}" name="surname" value="${response.surname}" placeholder=" " disabled=""><label class="label" for="surname${response.id}">Surname</label>
        <div class="underline"></div>
    </div>
    <div class="input-container">
        <input class="mobileNumber" type="text" id="mobileNumber${response.id}" name="mobileNumber" value="${response.mobileNumber}" placeholder=" " disabled=""><label class="label" for="mobileNumber${response.id}">Mobile number</label>
        <div class="underline"></div>
    </div>
    <div class="input-container">
        <input class="postcode" type="text" id="postcode${response.id}" name="postcode" value="${response.postcode}" placeholder=" " disabled=""><label class="label" for="postcode${response.id}">Postcode</label>
        <div class="underline"></div>
    </div>
    <div class="input-container">
        <input class="licenseNumber" type="text" id="licenseNumber${response.id}" name="licenseNumber" value="${response.licenseNumber}" placeholder="" disabled=""><label class="label" for="licenseNumber${response.id}">License number</label>
        <div class="underline"></div>
    </div>
    <div class="input-container"><input class="required hgvLicense" type="checkbox" name="hgvLicense" ${response.hgvLicense ? 'checked="" ' : ""}disabled=""><label for="hgvLicense">HGV License</label><br><br><input class="required pcvLicense" type="checkbox" name="pcvLicense" ${response.pcvLicense ? 'checked="" ' : ""}disabled=""><label for="pcvLicense">PCV License</label></div>
</div>
<div class="buttons"><button type="submit">Update</button><button onclick="destroy(this)">Delete</button></div>`;
            document.getElementById("bookings").appendChild(newForm);
            newForm.querySelector("select").selectedIndex = document.getElementById("date").selectedIndex;
            form.reset();
            showUserDetails(form.querySelector(".userDetails"));
            toast({
                text: "Booking created",
                className: "success",
            });
        },
        "json"
    );
}

function destroy(button) {
    let form = button.closest("form");
    if (window.confirm(`Are you sure you want to delete this booking'? This cannot be undone.`)) {
        let data = {
            id: form.id.value,
        };
        post(data, "admin/deleteBooking", (response) => {
            form.parentElement.removeChild(form);
            toast({
                text: "Booking deleted",
                className: "success",
            });
        });
    }
}

function checkUserEmail(emailInput) {
    let userDetails = emailInput.closest("form").querySelector(".userDetails");
    if (emailInput.value && emailInput.value !== "") {
        post(
            { email: emailInput.value },
            "admin/userExists",
            (response) => {
                if (response && response.found) {
                    hideUserDetails(userDetails);
                } else {
                    showUserDetails(userDetails);
                }
            },
            "json"
        );
    } else {
        showUserDetails(userDetails);
    }
}

function showUserDetails(userDetails) {
    let button = userDetails.closest("form").querySelector(".showButton");
    button.innerText = button.innerText == 'Show User' ? 'Hide User' : 'Show User';
    userDetails.querySelector(".email").disabled = false;
    userDetails.querySelector(".mobileNumber").disabled = false;
    userDetails.querySelector(".postcode").disabled = false;
    userDetails.querySelector(".licenseNumber").disabled = false;
    userDetails.querySelector(".hgvLicense").disabled = false;
    userDetails.querySelector(".pcvLicense").disabled = false;
    userDetails.classList.remove("hide");
}

function hideUserDetails(userDetails) {
    let button = userDetails.closest("form").querySelector(".showButton");
    button.innerText = button.innerText == 'Show User' ? 'Hide User' : 'Show User';
    userDetails.classList.add("hide");
    userDetails.querySelector(".email").disabled = true;
    userDetails.querySelector(".mobileNumber").disabled = true;
    userDetails.querySelector(".postcode").disabled = true;
    userDetails.querySelector(".licenseNumber").disabled = true;
    userDetails.querySelector(".hgvLicense").disabled = true;
    userDetails.querySelector(".pcvLicense").disabled = true;
}
