function formSubmit(form) {
    if (form.email.value) {
        post(
            { email: form.email.value },
            "forgotPassword",
            (response) => {
                document.getElementById("success").classList.remove("hide");
            },
            "text"
        );
    }
}
