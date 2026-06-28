/* =========================================
   CLASS ACTIVITY MANAGEMENT SYSTEM
   Part 1A
========================================= */

// =========================================
// GLOBAL VARIABLES
// =========================================

let assignmentMax = 20;
let practicalMax = 30;
let projectMax = 20;

let subjectList = [];
let serialNumber = 1;


// =========================================
// PAGE LOAD
// =========================================

window.onload = function () {

    setTodayDate();

    applyMarks();

    loadSubjects();

};


// =========================================
// SET TODAY DATE
// =========================================

function setTodayDate() {

    const today = new Date();

    document.getElementById("date").value =
        today.toISOString().split("T")[0];

}


// =========================================
// APPLY MAXIMUM MARKS
// =========================================

function applyMarks() {

    assignmentMax =
        parseInt(document.getElementById("assignmentMax").value) || 20;

    practicalMax =
        parseInt(document.getElementById("practicalMax").value) || 30;

    projectMax =
        parseInt(document.getElementById("projectMax").value) || 20;

    document.getElementById("assignmentHeading").innerHTML =
        `Assignment (${assignmentMax})`;

    document.getElementById("practicalHeading").innerHTML =
        `Practical (${practicalMax})`;

    document.getElementById("projectHeading").innerHTML =
        `Project (${projectMax})`;

}


// =========================================
// MANAGE SUBJECTS
// =========================================

function manageSubject() {

    let subject =
        prompt("Enter Subject Name");

    if (subject === null) return;

    subject = subject.trim();

    if (subject === "") {

        alert("Please enter a subject name.");

        return;

    }

    if (subjectList.includes(subject)) {

        alert("Subject already exists.");

        return;

    }

    subjectList.push(subject);

    addSubjectRow(subject);
	
	saveSubjects();

}


// =========================================
// ADD SUBJECT ROW
// =========================================

function addSubjectRow(subject) {

    const tbody =
        document.getElementById("activityBody");

    const row =
        document.createElement("tr");

    row.innerHTML = `
        <td>${serialNumber++}</td>

        <td class="subject-name">${subject}</td>

        <td>
            <input type="number"
                   min="0"
                   max="${assignmentMax}"
                   value="0"
                   oninput="calculateRow(this)">
        </td>

        <td>
            <input type="number"
                   min="0"
                   max="${practicalMax}"
                   value="0"
                   oninput="calculateRow(this)">
        </td>

        <td>
            <input type="number"
                   min="0"
                   max="${projectMax}"
                   value="0"
                   oninput="calculateRow(this)">
        </td>

<td class="total-cell">0</td>

        <td class="percentage-cell">0%</td>

        <td class="remarks-cell">-</td>

        <td>
            <button
                class="remove-btn"
                onclick="removeSubject(this)">
                Remove
            </button>
        </td>
    `;

    tbody.appendChild(row);

}


// =========================================
// CALCULATE TOTAL / PERCENTAGE
// =========================================

function calculateRow(input){

    const row = input.closest("tr");

    const inputs = row.querySelectorAll("input");

    const assignment =
        parseFloat(inputs[0].value) || 0;

    const practical =
        parseFloat(inputs[1].value) || 0;

    const project =
        parseFloat(inputs[2].value) || 0;

    const total =
        assignment + practical + project;

    const maxTotal =
        assignmentMax +
        practicalMax +
        projectMax;

    const percentage =
        (total / maxTotal) * 100;

    row.querySelector(".total-cell").innerHTML =
        total;

    row.querySelector(".percentage-cell").innerHTML =
        percentage.toFixed(2) + "%";

    let remarks = "Fail";

    if (percentage >= 90){

        remarks = "Excellent";

    }
    else if (percentage >= 75){

        remarks = "Very Good";

    }
    else if (percentage >= 60){

        remarks = "Good";

    }
    else if (percentage >= 35){

        remarks = "Pass";

    }

    row.querySelector(".remarks-cell").innerHTML =
        remarks;

}


// =========================================
// REMOVE SUBJECT
// =========================================

function removeSubject(button){

    if(!confirm("Remove this subject?")){

        return;

    }

    const row =
        button.closest("tr");

    const subject =
        row.cells[1].innerText;

    subjectList =
        subjectList.filter(item => item !== subject);

    row.remove();

    updateSerialNumbers();
	
	saveSubjects();

}


// =========================================
// UPDATE SERIAL NUMBER
// =========================================

function updateSerialNumbers(){

    serialNumber = 1;

    document
        .querySelectorAll("#activityBody tr")
        .forEach(row => {

            row.cells[0].innerHTML =
                serialNumber++;

        });

}

// =========================================
// LOAD SUBJECTS
// =========================================

async function loadSubjects() {

    const semester =
        document.getElementById("semester").innerText.trim();

    try {

        const response =
            await fetch(`/get_subjects/${encodeURIComponent(semester)}`);

        const subjects =
            await response.json();

        subjectList = [];
        serialNumber = 1;

        document.getElementById("activityBody").innerHTML = "";

        subjects.forEach(subject => {

            subjectList.push(subject);

            addSubjectRow(subject);

        });

    }

    catch (error) {

        console.error(error);

    }

}


// =========================================
// SAVE SUBJECTS
// =========================================

async function saveSubjects() {

    const semester =
        document.getElementById("semester").innerText.trim();

    try {

        const response = await fetch("/save_subjects", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                semester: semester,

                subjects: subjectList

            })

        });

        const result = await response.json();

        if (result.success) {

            alert("Subjects saved successfully.");

        }

        else {

            alert(result.error);

        }

    }

    catch (error) {

        console.error(error);

        alert("Unable to save subjects.");

    }

}

// =========================================
// SAVE CLASS ACTIVITY
// =========================================

async function saveActivity() {

    const semester =
        document.getElementById("semester").innerText.trim();

    const studentName =
        document.getElementById("studentName").value.trim();

    const enrollment =
        document.getElementById("enrollment").value.trim();

    const faculty =
        document.getElementById("faculty").value.trim();

    const date =
        document.getElementById("date").value;

    if (
        studentName === "" ||
        enrollment === "" ||
        faculty === "" ||
        date === ""
    ) {

        alert("Please fill all student details.");

        return;

    }

    const subjects = [];

    document
        .querySelectorAll("#activityBody tr")
        .forEach(row => {

            const inputs =
                row.querySelectorAll("input");

            subjects.push({

                subject:
                    row.cells[1].innerText,

                assignment:
                    inputs[0].value,

                practical:
                    inputs[1].value,

                project:
                    inputs[2].value,

                total:
                    row.querySelector(".total-cell").innerText,

                percentage:
                    row.querySelector(".percentage-cell").innerText,

                remarks:
                    row.querySelector(".remarks-cell").innerText

            });

        });

    try {

        const response =
            await fetch("/save_class_activity", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    semester,
                    studentName,
                    enrollment,
                    faculty,
                    date,
                    subjects

                })

            });

        const result =
            await response.json();

        if (result.success) {

            alert("Class Activity Saved Successfully.");

        }

        else {

            alert(result.error);

        }

    }

    catch (error) {

        console.error(error);

        alert("Unable to save data.");

    }

}

// =========================================
// SEARCH STUDENT
// =========================================

async function searchStudent() {

    const enrollment =
        document.getElementById("enrollment").value.trim();

    if (enrollment === "") {

        alert("Enter Enrollment Number.");

        return;

    }

    try {

        const response =
            await fetch("/get_all");

        const data =
            await response.json();

        const student =
            data.find(item =>
                item.enrollment === enrollment
            );

        if (!student) {

            alert("Student not found.");

            return;

        }

        document.getElementById("studentName").value =
            student.studentName || "";

        document.getElementById("faculty").value =
            student.faculty || "";

    }

    catch (error) {

        console.error(error);

        alert("Unable to search student.");

    }

}


// =========================================
// DOWNLOAD CLASS ACTIVITY
// =========================================

function downloadActivity() {

    window.location.href =
        "/download_class_activity";

}