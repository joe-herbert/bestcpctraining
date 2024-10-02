let appliedDiscounts = [];
let totalWithoutDiscounts = 0;

document.addEventListener("DOMContentLoaded", () => {
    let basket = localStorage.getItem("basket");
    if (basket && basket !== []) {
        basket = JSON.parse(basket);
    } else {
        basket = {};
    }
    if (!basket || Object.keys(basket).length === 0) {
        document.getElementById("basket").classList.add("hide");
        document.getElementById("empty").classList.remove("hide");
        document.getElementById("basketContainer").classList.add("hide");
    } else {
        let params = new URLSearchParams(Object.keys(basket).map((s) => ["courseId", s]));
        fetch(`${window.location.origin}/getBasket?${params}`).then((response) => {
            if (response.ok) {
                response.json().then((response) => {
                    document.getElementById("basketSpinner").classList.add("hide");
                    let total = 0;
                    if (response.length === 0) {
                        document.getElementById("basket").classList.add("hide");
                    } else {
                        document.getElementById("total").classList.remove("hide");
                        for (course of response) {
                            let basket = document.getElementById("basket");
                            let wrapper = document.createElement("div");
                            let name = document.createElement("a");
                            let date = document.createElement("span");
                            let price = document.createElement("span");
                            let remove = document.createElement("button");
                            wrapper.dataset.id = course.id;
                            wrapper.classList.add("basketWrapper");
                            name.innerText = course.name;
                            name.href = `${window.location.origin}/course?code=${course.code}`;
                            name.classList.add("name");
                            date.innerText = new Date(course.date).toLocaleDateString("en-GB", {
                                timeZone: "Europe/London",
                                hourCycle: "h24",
                                weekday: "short",
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                            });
                            date.classList.add("date");
                            price.innerText = "£" + course.price.toFixed(2);
                            price.dataset.price = course.price;
                            price.classList.add("price");
                            remove.innerText = "Remove from basket";
                            remove.classList.add("removeButton");
                            remove.addEventListener("click", (event) => {
                                let courseToRemove = event.currentTarget.parentElement;
                                removeFromBasket(courseToRemove.dataset.id);
                                courseToRemove.parentElement.removeChild(courseToRemove);
                                let subtotal = document.getElementById("subtotal");
                                let total = subtotal.dataset.total - courseToRemove.getElementsByClassName("price")[0].dataset.price;
                                totalWithoutDiscounts = total;
                                subtotal.innerText = "£" + total.toFixed(2);
                                subtotal.dataset.total = total;
                                if (document.getElementById("basket").getElementsByClassName("basketWrapper").length === 0) {
                                    document.getElementById("basketContainer").classList.add("hide");
                                    document.getElementById("empty").classList.remove("hide");
                                } else {
                                    updateTotal();
                                }
                            });
                            wrapper.appendChild(name);
                            wrapper.appendChild(date);
                            wrapper.appendChild(price);
                            wrapper.appendChild(remove);
                            basket.appendChild(wrapper);
                            total += course.price;
                        }
                        totalWithoutDiscounts = total;
                        if (response.length === 5) {
                            checkDiscount("5COURSES");
                        } else {
                            updateTotal();
                        }
                        let subtotal = document.getElementById("subtotal");
                        subtotal.innerText = "£" + total.toFixed(2);
                        subtotal.dataset.total = total;
                    }
                });
            } else {
                response.text().then((text) => {
                    toast({
                        text: text || "Error getting the courses in your basket",
                        className: "error",
                    });
                });
            }
        });
    }
});

function checkDiscount(discount) {
    if (!discount) {
        discount = document.getElementById("discount").value;
    }
    if (appliedDiscounts.some((d) => d.code === discount)) {
        toast({
            text: "Discount already applied",
            className: "error",
        });
    } else {
        post(
            { code: discount },
            "checkDiscount",
            (response) => {
                if (response.valid) {
                    let discountStr = response.code + ": ";
                    if (response.type === "Set Price" || response.type === "Pounds Off") {
                        discountStr += "£";
                    }
                    discountStr += response.amount.toFixed(2);
                    if (response.type === "Percent Off") {
                        discountStr += "% Off";
                    } else if (response.type === "Pounds Off") {
                        discountStr += " Off";
                    }
                    let newDiscount = document.createElement("span");
                    newDiscount.classList.add("discount");
                    newDiscount.innerText = discountStr;
                    newDiscount.dataset.code = response.code;
                    newDiscount.addEventListener("click", (event) => {
                        let sender = event.currentTarget;
                        let code = sender.dataset.code;
                        let index = appliedDiscounts.findIndex((d) => d.code === code);
                        if (index > -1) {
                            appliedDiscounts.splice(index, 1);
                        }
                        sender.parentElement.removeChild(sender);
                        updateTotal();
                    });
                    document.getElementById("discounts").appendChild(newDiscount);
                    appliedDiscounts.push(response);
                    updateTotal();
                    document.getElementById("discount").value = "";
                    toast({
                        text: "Discount applied",
                        className: "success",
                    });
                } else {
                    toast({
                        text: "Invalid discount",
                        className: "error",
                    });
                }
            },
            "json"
        );
    }
}

function updateTotal() {
    //sort appliedDiscounts by type in reverse order so it goes Set Price -> Pounds Off -> Percent Off
    appliedDiscounts.sort((a, b) => (a.type > b.type ? -1 : b.type > a.type ? 1 : 0));
    //calculate new total by applying each discount in order
    let total = appliedDiscounts.reduce((total, discount) => {
        switch (discount.type) {
            case "Set Price":
                if (discount.amount < total) {
                    total = discount.amount;
                }
                break;
            case "Pounds Off":
                total -= discount.amount;
                if (total < 0) total = 0;
                break;
            case "Percent Off":
                total -= (total / 100) * discount.amount;
                if (total < 0) total = 0;
                break;
        }
        return total;
    }, totalWithoutDiscounts);
    let totalPrice = document.getElementById("totalPrice");
    totalPrice.innerText = "£" + total.toFixed(2);
    totalPrice.dataset.total = total;
}

function showCheckout() {
    if (document.getElementById("termsAndConditions").checked) {
        document.getElementById("checkoutContainer").classList.remove("hide");
        document.getElementById("checkoutTotal").innerText = "Total: " + document.getElementById("totalPrice").innerText;
    } else {
        toast({
            text: "You must accept the terms and conditions to check out",
            className: "error",
        });
    }
}

let paypal_buttons = paypal.Buttons({
    async createOrder() {
        let basket = JSON.parse(localStorage.getItem("basket"));
        const response = await fetch(`${window.location.origin}/createOrder`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                items: Object.keys(basket),
                discounts: appliedDiscounts,
            }),
        });

        let orderData = await response.json();
        if (orderData.error) {
            if (orderData.json) {
                toast({
                    text: orderData.error,
                    className: "error",
                });
                orderData = orderData.json;
            } else {
                throw new Error(orderData.error);
            }
        }

        if (orderData.id) {
            return orderData.id;
        }
        const errorDetail = orderData?.details?.[0];
        const errorMessage = errorDetail ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})` : JSON.stringify(orderData);

        throw new Error(errorMessage);
    },
    async onApprove(data, actions) {
        try {
            const response = await fetch(`${window.location.origin}/completeOrder`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    orderId: data.orderID,
                }),
            });

            const orderData = await response.json();
            // Three cases to handle:
            //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
            //   (2) Other non-recoverable errors -> Show a failure message
            //   (3) Successful transaction -> Show confirmation or thank you message

            const errorDetail = orderData?.details?.[0];

            if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
                // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                // recoverable state, per
                // https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                return actions.restart();
            } else if (errorDetail) {
                // (2) Other non-recoverable errors -> Show a failure message
                throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
            } else if (!orderData.purchase_units) {
		    console.error(orderData);
                throw new Error(JSON.stringify(orderData));
            } else {
                // (3) Successful transaction -> Show confirmation or thank you message
                // Or go to another URL:  actions.redirect('thank_you.html');
                const transaction = orderData?.purchase_units?.[0]?.payments?.captures?.[0] || orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
                console.log(
                    `Transaction ${transaction.status}: ${transaction.id}<br>
          <br>See console for all available details`
                );
                console.log("Capture result", orderData, JSON.stringify(orderData, null, 2));
                document.getElementById("orderID").innerText = orderData.id;
                document.getElementById("paymentComplete").innerHTML = orderData.responseHtml;
                document.getElementById("paymentComplete").classList.remove("hide");
                document.getElementById("checkoutContainer").classList.add("hide");
                localStorage.setItem("basket", []);
                document.getElementById("basketCount").dataset.basket = "0";
                toast({
                    text: "Order complete!",
                    className: "success",
                });
                paypal_buttons.close();
            }
        } catch (error) {
            console.error(error);
            toast({
                text: "There was an error taking your payment. Please try again or contact us.",
                className: "error",
            });
        }
    },
    onCancel: function (data) {
        toast({
            text: "Payment cancelled",
            className: "error",
        });
    },
    onError: function (err) {
        console.error(err);
        toast({
            text: err.message || "There was an error taking your payment. Please try again or contact us.",
            className: "error",
        });
    },
});
paypal_buttons.render("#paypal");
