async function loginSubmit(form) {
    const data = {
        email: form.email.value,
        password: form.password.value,
    };
    post(data, "login", (response) => {
        if (document.referrer && !document.referrer.includes("login") && !document.referrer.includes("register")) {
            window.location.href = document.referrer;
        } else {
            window.location.href = window.location.origin;
        }
    });
}

async function registerSubmit(form) {
    if (!form.hgvLicense.checked && !form.pcvLicense.checked) {
        form.hgvLicense.setCustomValidity("You must have either an HGV or PCV license");
        return false;
    }
    const data = {
        email: form.email.value,
        firstName: form.firstName.value,
        surname: form.surname.value,
        password: form.password.value,
        licenseNumber: form.licenseNumber.value?.toUpperCase(),
        hgvLicense: form.hgvLicense.checked,
        pcvLicense: form.pcvLicense.checked,
        mobileNumber: "+" + phoneInput.getSelectedCountryData().dialCode + " " + form.mobileNumber.value,
        postcode: form.postcode.value?.toUpperCase(),
    };
    post(data, "register", (response) => {
        if (document.referrer && !document.referrer.includes("login") && !document.referrer.includes("register")) {
            window.location.href = document.referrer;
        } else {
            window.location.href = window.location.origin;
        }
    });
}
