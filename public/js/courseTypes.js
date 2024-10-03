function update(form) {
    let data = {
        code: form.code.value,
        name: form.name.value,
        spaces: form.spaces.value,
        descriptionA: form.descriptionA.value,
    };
    if (form.descriptionB.value && form.descriptionB.value !== "") data.descriptionB = form.descriptionB.value;
    post(data, "admin/updateCourseType", (response) => {
        toast({
            text: "Course type updated",
            className: "success",
        });
    });
}

function create(form) {
    let data = {
        code: form.code.value,
        name: form.name.value,
        spaces: form.spaces.value,
        descriptionA: form.descriptionA.value,
    };
    if (form.descriptionB.value && form.descriptionB.value !== "") data.descriptionB = form.descriptionB.value;
    post(data, "admin/addCourseType", (response) => {
        let newForm = document.createElement("form");
        newForm.classList.add("type");
        newForm.onsubmit = "update(this); return false;";
        newForm.innerHTML = `<input class="hide" type="text" name="code" value="${data.code}" readonly="">
                <div class="input-container">
                    <input class="name" type="text" name="name" id="name${data.code}" value="${data.name}" placeholder=" " required="">
                    <label class="label" for="name${data.code}">Name</label>
                    <div class="underline"></div>
                </div>
                <div class="input-container">
                    <input class="spaces" type="number" name="spaces" id="spaces${data.code}" value="${data.spaces}" placeholder=" " required="">
                    <label class="label" for="spaces${data.code}">Spaces</label>
                    <div class="underline"></div>
                </div>
                <div class="input-container">
                    <textarea class="description" name="descriptionA" id="descriptionA${data.code}" placeholder=" " required="">${data.descriptionA}</textarea>
                    <label class="label" for="descriptionA${data.code}">Description A</label>
                    <div class="underline"></div>
                </div>
                <div class="input-container">
                    <textarea class="description" name="descriptionB" id="descriptionB${data.code}" placeholder=" ">${data.descriptionB}</textarea>
                    <label class="label" for="descriptionB${data.code}">Description B</label>
                    <div class="underline"></div>
                </div>
                <button type="submit">Update</button>
                <button onclick="destroy(this)">Delete</button>`;
        form.reset();
        toast({
            text: "Course type created",
            className: "success",
        });
    });
}

function destroy(button) {
    let form = button.closest("form");
    if (window.confirm(`WARNING: This will also delete all courses of this type and all bookings linked to those courses.\nAre you sure you want to delete course type '${form.name.value}'? This cannot be undone.`)) {
        let data = {
            code: form.code.value,
        };
        post(data, "admin/deleteCourseType", (response) => {
            form.parentElement.removeChild(form);
            toast({
                text: "Course type deleted",
                className: "success",
            });
        });
    }
}
