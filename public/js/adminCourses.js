function update(form) {
    let data = {
        id: form.id.value,
        date: dateToUTC(form.date.value),
        price: parseFloat(form.price.value.substring(1)),
        code: form.code.value,
    };
    post(data, "admin/updateCourse", (response) => {
        toast({
            text: "Course updated",
            className: "success",
        });
    });
}

function create(form) {
    let data = {
        date: dateToUTC(form.date.value),
        price: parseFloat(form.price.value.substring(1)),
        code: form.code.value,
    };
    post(
        data,
        "admin/addCourse",
        (response) => {
            let newForm = document.createElement("form");
            newForm.classList.add("course");
            newForm.onsubmit = "update(this); return false;";
            newForm.innerHTML = `<input class="hide" type="text" name="id" value="${response.id}" readonly="">
<div class="input-container">
    <input class="date" type="datetime-local" name="date" id="date${response.id}" value="${data.date}" placeholder=" " onchange="this.dataset.value=this.value" data-value="${data.date}" required=""><label class="label" for="date${response.id}">Date</label>
    <div class="underline"></div>
</div>
<div class="input-container">
    <input class="price" type="text" name="price" id="price${response.id}" value="£${data.price.toFixed(2)}" placeholder=" " onchange="let val = this.value.charAt(0) === '£' ? this.value.substring(1) : this.value; let num = parseFloat(val); this.value = isNaN(num) ? '' : '£' + num.toFixed(2);" required=""><label class="label" for="price${response.id}">Price</label>
    <div class="underline"></div>
</div>
<div class="input-container">
    <select name="code" id="code${response.id}" placeholder=" " autocomplete="off" required="">${document.getElementById("code").innerHTML}</select>
    <label class="label" for="code${response.id}">Course Type</label>
    <div class="underline"></div>
</div>
<div class="buttons"><button type="submit">Update</button><button onclick="destroy(this)">Delete</button></div>`;
            newForm.querySelector("select").selectedIndex = document.getElementById("code").selectedIndex;
            document.getElementById("courses").appendChild(newForm);
            form.reset();
            toast({
                text: "Course created",
                className: "success",
            });
        },
        "json"
    );
}

function destroy(button) {
    let form = button.closest("form");
    if (window.confirm(`WARNING: This will also delete all bookings linked to this course.\nAre you sure you want to delete this course? This cannot be undone.`)) {
        let data = {
            id: form.id.value,
        };
        post(data, "admin/deleteCourse", (response) => {
            form.parentElement.removeChild(form);
            toast({
                text: "Course deleted",
                className: "success",
            });
        });
    }
}

function generateCSV(courseId) {
    post(
        {
            id: courseId,
        },
        "admin/getCSVData",
        (response) => {
            exportToCsv(response.filename, response.rows, response.titles);
        },
        "json"
    );
}

//slightly edited but mostly from https://stackoverflow.com/a/24922761/4437968
function exportToCsv(filename, rows, titles) {
    var processRow = function (row) {
        var finalVal = "";
        //for (var j = 0; j < row.length; j++) {
        var first = true;
        for (var key in row) {
            if (row.hasOwnProperty(key)) {
                var innerValue = row[key] === null ? "" : row[key].toString();
                if (row[key] instanceof Date) {
                    innerValue = row[key].toLocaleString();
                }
                var result = innerValue.replace(/"/g, '""');
                if (result.search(/("|,|\n)/g) >= 0) {
                    result = '"' + result + '"';
                }
                if (!first) {
                    finalVal += ",";
                }
                first = false;
                finalVal += result;
            }
        }
        return finalVal + "\n";
    };

    var csvFile = "";
    if (titles == undefined) {
        csvFile = Object.keys(rows[0]).map(propNameToTitle).join() + "\n";
    } else {
        csvFile = titles.join() + "\n";
    }
    for (var i = 0; i < rows.length; i++) {
        csvFile += processRow(rows[i]);
    }

    var blob = new Blob([csvFile], { type: "text/csv;charset=utf-8;" });
    if (navigator.msSaveBlob) {
        // IE 10+
        navigator.msSaveBlob(blob, filename);
    } else {
        var link = document.createElement("a");
        if (link.download !== undefined) {
            // feature detection
            // Browsers that support HTML5 download attribute
            var url = URL.createObjectURL(blob);
            link.setAttribute("href", url);
            link.setAttribute("download", filename);
            link.style.visibility = "hidden";
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            toast({
                text: "Download started",
                className: "success",
            });
        } else {
            csvFile = "data:text/csv;charset=utf-8," + csvFile;
            var encodedUri = encodeURI(csvContent);
            window.open(encodedUri);
        }
    }
}

function dateToUTC(date) {
	console.log("!", date);
	if (typeof date === "string") {
		date = new Date(date);
	}
	console.log("!!", date.toISOString(), date);
	return date.toISOString();
}
