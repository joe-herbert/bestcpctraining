function cpcAllowed(message, button) {
    document.getElementById("notAllowed").classList.add("hide");
    document.getElementById("cpcAllowedMessage").innerText = message;
    document.getElementById("cpcAllowed").classList.remove("hide");
    button.classList.add("clicked");
    let no = button.nextElementSibling;
    no.classList.remove("clicked");
    if (button.dataset.id === "1") {
        document.getElementById("question2").classList.add("hide");
        document.getElementById("yes2").classList.remove("clicked");
        document.getElementById("no2").classList.remove("clicked");
    }
    if (button.dataset.id === "1" || button.dataset.id === "2") {
        document.getElementById("question3").classList.add("hide");
        document.getElementById("yes3").classList.remove("clicked");
        document.getElementById("no3").classList.remove("clicked");
    }
}

function showQuestion(id, button) {
    document.getElementById("cpcAllowed").classList.add("hide");
    if (id !== "notAllowed") {
        document.getElementById("notAllowed").classList.add("hide");
    }
    document.getElementById(id).classList.remove("hide");
    button.classList.add("clicked");
    let yes = button.previousElementSibling;
    yes.classList.remove("clicked");
}
