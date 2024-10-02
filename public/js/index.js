document.addEventListener("DOMContentLoaded", () => {
    let testimonialsWrapper = document.getElementById("testimonials");
    shuffle(testimonials);
    for (let testimonial of testimonials) {
        let div = document.createElement("div");
        div.classList.add("testimonial");
        let quote = document.createElement("div");
        quote.classList.add("quote");
        quote.innerText = testimonial.quote;
        let author = document.createElement("div");
        author.classList.add("author");
        author.innerText = testimonial.author;
        div.appendChild(quote);
        div.appendChild(author);
        testimonialsWrapper.appendChild(div);
    }
});

function testimonialsLeft() {
    let testimonials = document.getElementById("testimonials");
    let dims = testimonials.getBoundingClientRect();
    let x = document.getElementById("testimonialsWrapper").getBoundingClientRect().x;
    if (dims.left + dims.width - x > 0) {
        testimonials.style.left = testimonials.scrollWidth * -1 + dims.width + "px";
    } else {
        testimonials.style.left = dims.left + dims.width - x + "px";
    }
}

function testimonialsRight() {
    let testimonials = document.getElementById("testimonials");
    let dims = testimonials.getBoundingClientRect();
    let x = document.getElementById("testimonialsWrapper").getBoundingClientRect().x;
    if (dims.left - (window.innerWidth - x) <= testimonials.scrollWidth * -1) {
        testimonials.style.left = "0px";
    } else {
        testimonials.style.left = dims.left - (window.innerWidth - x) + "px";
    }
}
