function formatAmount(element) {
    let typeSelect = element.closest(".discount").querySelector(".discountType");
    let val = element.value.charAt(0) === "£" ? element.value.substring(1) : element.value;
    element.value = calculateFormatAmount(typeSelect.value, val);
}

function calculateFormatAmount(type, amount) {
    if (type === "Set Price" || type === "Pounds Off") {
        let num = parseFloat(amount);
        if (isNaN(num)) {
            return "";
        } else {
            if (num < 0) num = 0;
            return "£" + num.toFixed(2);
        }
    } else if (type === "Percent Off") {
        let num = parseFloat(amount);
        if (isNaN(num)) {
            return "";
        } else {
            if (num > 100) num = 100;
            else if (num < 0) num = 0;
            return num.toFixed(2) + "%";
        }
    }
}

function parseAmount(amount) {
    if (amount.charAt(0) === "£") {
        return parseFloat(amount.substring(1));
    } else {
        return parseFloat(amount);
    }
}

function update(form) {
    let data = {
        id: form.id.value,
    };
    if (form.code.value) data.code = form.code.value;
    if (form.type.value) data.type = form.type.value;
    if (form.amount.value) data.amount = parseAmount(form.amount.value);
    if (form.expiryDate.value) data.expiryDate = form.expiryDate.value;
    if (form.uses.value) data.uses = form.uses.value;
    post(data, "admin/updateDiscount", (response) => {
        toast({
            text: "Discount updated",
            className: "success",
        });
    });
}

function create(form) {
    let data = {
        code: form.code.value,
        type: form.type.value,
        amount: parseAmount(form.amount.value),
    };
    if (form.expiryDate.value) data.expiryDate = form.expiryDate.value;
    if (form.uses.value) data.uses = form.uses.value;
    post(
        data,
        "admin/addDiscount",
        (response) => {
            let newForm = document.createElement("form");
            newForm.classList.add("discount");
            newForm.onsubmit = () => {
                update(newForm);
                return false;
            };
            newForm.innerHTML = `<input class="hide" type="text" name="id" value="${response.id}" readonly="">
<div class="input-container">
    <input class="code" type="text" id="code${data.code}" name="code" value="${data.code}" placeholder=" " required=""><label class="label" for="code${data.code}">Discount Code</label>
    <div class="underline"></div>
</div>
<div class="input-container">
    <select class="discountType" name="type" id="type${data.code}" autocomplete="off" onchange="formatAmount(this.parentElement.nextElementSibling.querySelector('.amount'))" required="">${document.getElementById("type").innerHTML}</select>
    <label class="label" for="type${data.code}">Discount Type</label>
    <div class="underline"></div>
</div>
<div class="input-container">
    <input class="amount" type="text" id="amount${data.code}" name="amount" value="${calculateFormatAmount(data.type, data.amount)}" placeholder=" " onchange="formatAmount(this)" required=""><label class="label" for="amount${data.code}">Amount</label>
    <div class="underline"></div>
</div>
<div class="input-container">
    <input class="expiryDate" type="datetime-local" id="expiryDate${data.code}" name="expiryDate" placeholder=" " onchange="this.dataset.value=this.value"${data.expiryDate ? ' value="' + data.expiryDate + '"' : ""}><label class="label" for="expiryDate${data.code}">Expiry Date and Time</label>
    <div class="underline"></div>
</div>
<div class="input-container">
    <input class="uses" type="number" id="uses${data.code}" name="uses" placeholder=" "${data.uses ? ' value="' + data.uses + '"' : ""}><label class="label" for="uses${data.code}">Uses Remaining</label>
    <div class="underline"></div>
</div>
<div class="buttons"><button type="submit">Update</button><button onclick="destroy(this)">Delete</button></div>`;
            newForm.querySelector("select").selectedIndex = document.getElementById("type").selectedIndex;
            document.getElementById("discounts").appendChild(newForm);
            form.reset();
            toast({
                text: "Discount created",
                className: "success",
            });
        },
        "json"
    );
}

function destroy(button) {
    let form = button.closest("form");
    if (window.confirm(`Are you sure you want to delete discount '${form.code.value}'? This cannot be undone.`)) {
        let data = {
            id: form.id.value,
        };
        post(data, "admin/deleteDiscount", (response) => {
            form.parentElement.removeChild(form);
            toast({
                text: "Discount deleted",
                className: "success",
            });
        });
    }
}
