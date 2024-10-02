document.addEventListener("DOMContentLoaded", () => {
    refreshCoursesInBasket();
});

function refreshCoursesInBasket() {
    let basket = localStorage.getItem("basket");
    if (basket && basket !== []) {
        basket = JSON.parse(basket);
    } else {
        basket = {};
    }
    document.querySelectorAll(".courseBook").forEach((element) => {
        if (Object.values(basket).includes(element.dataset.code)) {
            element.classList.add("courseInBasket");
        } else {
            element.classList.remove("courseInBasket");
        }
    });
}
