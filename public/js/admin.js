document.addEventListener("DOMContentLoaded", () => {
    let input = document.getElementById("frontPageAdvert");
    input.addEventListener("change", () => {
        if (input.files.length >= 1) {
            const formData = new FormData();
            formData.append("advert", input.files[0]);
            fetch(`${window.location.origin}/admin/uploadAdvert`, {
                method: "POST",
                body: formData,
            }).then((response) => {
                console.log(response);
                if (response.ok) {
                    toast({
                        text: "Advert uploaded",
                        className: "success",
                    });
                } else {
                    toast({
                        text: "Error",
                        className: "error",
                    });
                }
            });
        }
    });
});

function generateNewPassword() {
    let email = document.getElementById("newPasswordEmail").value;
    if (email) {
        post(
            { email: email },
            "admin/newPassword",
            (response) => {
                document.getElementById("newPasswordOutput").innerText = "New password: " + response.password;
            },
            "json"
        );
    }
}
