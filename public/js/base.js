const maxBasketItems = 5;

function toast(options) {
    Toastify({
        ...{
            duration: 5000,
            gravity: "top",
            position: "center",
            offset: {
                y: 80,
            },
        },
        ...options,
    }).showToast();
}

document.addEventListener("DOMContentLoaded", () => {
    let basket = localStorage.getItem("basket");
    if (basket && basket !== []) {
        basket = JSON.parse(basket);
    } else {
        basket = {};
    }
    document.getElementById("basketCount").dataset.basket = Object.keys(basket).length;
    document.querySelectorAll(".addToBasket").forEach((button) => {
        if (Object.keys(basket).includes(button.dataset.id)) {
            button.classList.add("inBasket");
        }
    });
    addAccordionEventListeners();
});

function logout() {
    post(undefined, "logout", (response) => {
        window.location.reload();
    });
}

function addToBasket(courseId, courseCode, willRedirect) {
    let basket = localStorage.getItem("basket");
    if (basket && basket !== []) {
        basket = JSON.parse(basket);
    } else {
        basket = {};
    }
    if (Object.keys(basket).includes(courseId)) {
        removeFromBasket(courseId);
        return true;
    } else {
        if (Object.keys(basket).length < maxBasketItems) {
            if (!Object.values(basket).includes(courseCode)) {
                basket[courseId] = courseCode;
                document.getElementById("basketCount").dataset.basket = Object.keys(basket).length;
                localStorage.setItem("basket", JSON.stringify(basket));
                toast({
                    text:
                        "Course added to the basket!" +
                        (willRedirect ? " You will be redirect back to the course page in 1 second." : window.location.pathname.includes("basket") ? "" : " Click here to checkout now"),
                    className: "success",
                    destination: "/basket",
                });
                return true;
            } else {
                toast({
                    text: "A course of this type is already in the basket",
                    className: "error",
                });
            }
        } else {
            toast({
                text: `You can only book ${maxBasketItems} courses at a time`,
                className: "error",
            });
        }
    }
    return false;
}

function removeFromBasket(courseId) {
    let basket = localStorage.getItem("basket");
    if (basket && basket !== []) {
        basket = JSON.parse(basket);
    } else {
        basket = {};
    }
    delete basket[courseId];
    document.getElementById("basketCount").dataset.basket = Object.keys(basket).length;
    localStorage.setItem("basket", JSON.stringify(basket));
    toast({
        text: "Course removed from the basket!" + (window.location.pathname.includes("basket") ? "" : " Click here to view the basket now"),
        className: "success",
        destination: "/basket",
    });
}

function post(data, url, callback, responseType) {
    let obj = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
    };
    if (data) obj.body = JSON.stringify(data);
    fetch(`${window.location.origin}/${url}`, obj)
        .then((response) => {
            if (response.ok) {
                switch (responseType) {
                    case "json":
                        response.json().then((json) => callback(json));
                        break;
                    default:
                        response.text().then((text) => callback(text));
                }
            } else {
                response.text().then((text) => {
                    toast({
                        text: text,
                        className: "error",
                    });
                });
            }
        })
        .catch((e) => {
            console.error(e.error);
            toast({
                text: "Error: " + e.message,
                className: "error",
            });
        });
}

function addAccordionEventListeners() {
    let acc = document.getElementsByClassName("accordion");
    for (let i in acc) {
        if (typeof acc[i] === "object") {
            acc[i].addEventListener("click", function () {
                this.classList.toggle("active");
                let panel = this.nextElementSibling;
                if (panel.style.maxHeight) {
                    panel.style.maxHeight = null;
                } else {
                    panel.style.maxHeight = getAccordionDivScrollHeight(this.nextElementSibling) + 25 + "px";
                }
            });
        }
    }
}

function resizeAccordionDiv(accordionDiv) {
    accordionDiv.style.maxHeight = getAccordionDivScrollHeight(accordionDiv) + 25 + "px";
}

function getAccordionDivScrollHeight(accordionDiv) {
    let clone = accordionDiv.cloneNode(true);
    clone.classList.add("forTesting");
    clone.style.width = getComputedStyle(accordionDiv).width;
    document.getElementsByTagName("body")[0].appendChild(clone);
    let height = clone.scrollHeight + parseInt(getComputedStyle(clone).paddingTop) + parseInt(getComputedStyle(clone).paddingBottom);
    document.getElementsByTagName("body")[0].removeChild(clone);
    return height;
}

//from https://stackoverflow.com/a/2450976/4437968
function shuffle(array) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
}
