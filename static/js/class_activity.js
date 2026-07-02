/* ==========================================================
   CLASS ACTIVITY MANAGEMENT SYSTEM
   VERSION 2.0
   PART 1
   Global Variables + Page Load + Utility Functions
========================================================== */

// ==========================================================
// MARK SETTINGS
// ==========================================================

const assignmentMax = 20;
const practicalMax = 30;
const projectMax = 20;


// ==========================================================
// GLOBAL VARIABLES
// ==========================================================

let selectedStudent = null;

let attendanceStudents = [];

let subjectList = [];

let serialNumber = 1;


// ==========================================================
// PAGE LOAD
// ==========================================================

window.onload = function () {

    initializePage();

};


// ==========================================================
// INITIALIZE PAGE
// ==========================================================

function initializePage() {

    setTodayDate();

    resetActivityTable();

    disableManageSubject();

}


// ==========================================================
// TODAY DATE
// ==========================================================

function setTodayDate() {

    const today = new Date();

    document.getElementById("date").value =
        today.toISOString().split("T")[0];

}


// ==========================================================
// RESET TABLE
// ==========================================================

function resetActivityTable() {

    document.getElementById("activityBody").innerHTML = "";

    serialNumber = 1;

}


// ==========================================================
// CLEAR SUBJECT LIST
// ==========================================================

function clearSubjects() {

    subjectList = [];

}


// ==========================================================
// ENABLE MANAGE SUBJECT BUTTON
// ==========================================================

function enableManageSubject() {

    document.getElementById(
        "manageSubjectBtn"
    ).disabled = false;

}


// ==========================================================
// DISABLE MANAGE SUBJECT BUTTON
// ==========================================================

function disableManageSubject() {

    document.getElementById(
        "manageSubjectBtn"
    ).disabled = true;

}


// ==========================================================
// CLEAR COMPLETE PAGE
// ==========================================================

function clearCompleteActivity() {

    resetActivityTable();

    clearSubjects();

    selectedStudent = null;

    disableManageSubject();

}


// ==========================================================
// END OF PART 1
// ==========================================================

console.log(
    "Class Activity JS V2 - Part 1 Loaded Successfully"
);
/* ==========================================================
   PART 2
   Student Selection + Subject Management
========================================================== */

// ==========================================================
// ENTER STUDENT
// ==========================================================

async function selectTemplateStudent() {

    const semester =
        document.getElementById("semester").innerText.trim();

    try {

        const response =
            await fetch(`/get_students/${semester}`);

        attendanceStudents =
            await response.json();

        if (!attendanceStudents || attendanceStudents.length === 0) {

            alert("No students found.");

            return;

        }

        let list = "";

        attendanceStudents.forEach((student, index) => {

            list += `${index + 1}. ${student.studentName}\n`;

        });

        const choice =
            prompt("Select Template Student\n\n" + list);

        if (choice === null)
            return;

        const index =
            parseInt(choice) - 1;

        if (
            isNaN(index) ||
            index < 0 ||
            index >= attendanceStudents.length
        ) {

            alert("Invalid Student.");

            return;

        }

        selectedStudent =
            attendanceStudents[index];

        resetActivityTable();

        clearSubjects();

        enableManageSubject();

        alert(
            "Template Student Selected.\nNow add all subjects."
        );

    }

    catch (error) {

        console.error(error);

        alert("Unable to load students.");

    }

}
// ==========================================================
// MANAGE SUBJECTS
// ==========================================================

function manageSubject() {

    if (!selectedStudent) {

        alert("Select first student.");

        return;

    }

    const subject =
        prompt("Enter Subject Name");

    if (subject === null)
        return;

    const newSubject =
        subject.trim();

    if (newSubject === "") {

        alert("Subject cannot be empty.");

        return;

    }

    if (subjectList.includes(newSubject)) {

        alert("Subject already exists.");

        return;

    }

    subjectList.push(newSubject);

    addSubjectRow(newSubject);

}


// ==========================================================
// SAVE SUBJECT LIST
// ==========================================================

async function saveSubjects() {

    const semester =
        document.getElementById("semester").innerText.trim();

    try {

        await fetch("/save_subjects", {

            method: "POST",

            headers: {

                "Content-Type": "application/json"

            },

            body: JSON.stringify({

                semester: semester,

                subjects: subjectList

            })

        });

    }

    catch (error) {

        console.error(error);

    }

}


// ==========================================================
// END OF PART 2
// ==========================================================

console.log(
    "Class Activity JS V2 - Part 2 Loaded Successfully"
);

/* ==========================================================
   PART 3
   Import Students From Attendance
========================================================== */
// ==========================================================
// ATTENDANCE ADD
// ==========================================================

function attendanceAdd() {

    if (!selectedStudent) {

        alert("Please select template student first.");

        return;

    }

    if (subjectList.length === 0) {

        alert("Please add subjects first.");

        return;

    }

    resetActivityTable();

    attendanceStudents.forEach(student => {

        subjectList.forEach(subject => {

            addStudentSubjectRow(student, subject);

        });

    });

    alert("Attendance students imported successfully.");

}
// ==========================================================
// ADD STUDENT + SUBJECT ROW
// ==========================================================

function addStudentSubjectRow(student, subject) {

    const tbody =
        document.getElementById("activityBody");

    const row =
        document.createElement("tr");

    row.innerHTML = `

<td>${serialNumber++}</td>

<td class="student-name">
${student.studentName}
</td>

<td class="enrollment" style="display:none;">
${student.enrollment}
</td>

<td class="subject-name">
${subject}
</td>

<td>
<input
type="number"
min="0"
max="${assignmentMax}"
value="0"
oninput="calculateRow(this)">
</td>

<td>
<input
type="number"
min="0"
max="${practicalMax}"
value="0"
oninput="calculateRow(this)">
</td>

<td>
<input
type="number"
min="0"
max="${projectMax}"
value="0"
oninput="calculateRow(this)">
</td>

<td class="total-cell">0</td>

<td class="percentage-cell">0%</td>

<td class="remarks-cell">Fail</td>

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
function addSubjectRow(subject) {

    if (!selectedStudent)
        return;

    addStudentSubjectRow(selectedStudent, subject);

}
// ==========================================================
// CALCULATE MARKS
// ==========================================================

function calculateRow(input) {

    const row = input.closest("tr");

    const inputs = row.querySelectorAll("input");

    const assignment = Number(inputs[0].value) || 0;
    const practical = Number(inputs[1].value) || 0;
    const project = Number(inputs[2].value) || 0;

    const total = assignment + practical + project;

    const max = assignmentMax + practicalMax + projectMax;

    const percentage = (total / max) * 100;

    row.querySelector(".total-cell").innerText = total;

    row.querySelector(".percentage-cell").innerText =
        percentage.toFixed(2) + "%";

    let remarks = "Fail";

    if (percentage >= 90)
        remarks = "Excellent";

    else if (percentage >= 75)
        remarks = "Very Good";

    else if (percentage >= 60)
        remarks = "Good";

    else if (percentage >= 35)
        remarks = "Pass";

    row.querySelector(".remarks-cell").innerText = remarks;

}

// ==========================================================
// END OF PART 3
// ==========================================================

console.log(
    "Class Activity JS V2 - Part 3 Loaded Successfully"
);

/* ==========================================================
   PART 4
   Save + Load Class Activity
========================================================== */

// ==========================================================
// SAVE CLASS ACTIVITY
// ==========================================================
async function saveActivity() {

    const semester =
        document.getElementById("semester").innerText.trim();

    const faculty =
        document.getElementById("faculty").value.trim();

    const date =
        document.getElementById("date").value;

    if (faculty === "") {
        alert("Enter Faculty Name.");
        return;
    }

    // ==============================
    // GROUP DATA BY STUDENT
    // ==============================
    const studentMap = {};

    document.querySelectorAll("#activityBody tr").forEach(row => {

        const inputs = row.querySelectorAll("input");

        const studentName =
            row.querySelector(".student-name").innerText;

        const enrollment =
            row.querySelector(".enrollment").innerText;

        const subject =
            row.querySelector(".subject-name").innerText;

        const assignment = Number(inputs[0].value) || 0;
        const practical = Number(inputs[1].value) || 0;
        const project = Number(inputs[2].value) || 0;

        const total = assignment + practical + project;
        const max = 70;
        const percentage = (total / max) * 100;

        let remarks = "Fail";
        if (percentage >= 90) remarks = "Excellent";
        else if (percentage >= 75) remarks = "Very Good";
        else if (percentage >= 60) remarks = "Good";
        else if (percentage >= 35) remarks = "Pass";

        if (!studentMap[enrollment]) {
            studentMap[enrollment] = {
                studentName,
                enrollment,
                subjects: []
            };
        }

        studentMap[enrollment].subjects.push({
            subject,
            assignment,
            practical,
            project,
            total,
            percentage: percentage.toFixed(2) + "%",
            remarks
        });
    });

    const activityData = Object.values(studentMap);

    try {

        const response = await fetch("/save_class_activity", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                semester,
                faculty,
                date,
                activityData
            })
        });

        const result = await response.json();

        if (result.success) {
            alert("Activity Saved Successfully.");
        } else {
            alert(result.error || "Save failed");
        }

    } catch (error) {
        console.error(error);
        alert("Server error while saving.");
    }
}
// ==========================================================
// LOAD CLASS ACTIVITY
// ==========================================================

async function loadClassActivity() {

    const semester =
        document.getElementById("semester").innerText.trim();

    try {

        const response =
            await fetch(`/get_class_activity/${semester}`);

        const data =
            await response.json();

        if (!data || data.length === 0)
            return;

        resetActivityTable();

        data.forEach(item => {

            addStudentSubjectRow(

                {

                    studentName:
                        item.studentName,

                    enrollment:
                        item.enrollment

                },

                item.subject

            );

            const row =
                document.querySelector(
                    "#activityBody tr:last-child"
                );

            const inputs =
                row.querySelectorAll("input");

            inputs[0].value =
                item.assignment;

            inputs[1].value =
                item.practical;

            inputs[2].value =
                item.project;

            calculateRow(inputs[0]);

        });

    }

    catch (error) {

        console.error(error);

    }

}


/* ==========================================================
   END OF PART 4
========================================================== */

console.log(
    "Class Activity JS V2 - Part 4 Loaded Successfully"
);

/* ==========================================================
   PART 5
   Helper Functions + Download + Print
========================================================== */

// ==========================================================
// REMOVE SUBJECT ROW
// ==========================================================

function removeSubject(button) {

    if (!confirm("Remove this subject?"))
        return;

    const row =
        button.closest("tr");

    row.remove();

    updateSerialNumbers();

}


// ==========================================================
// UPDATE SERIAL NUMBERS
// ==========================================================

function updateSerialNumbers() {

    serialNumber = 1;

    document
        .querySelectorAll("#activityBody tr")
        .forEach(row => {

            row.cells[0].innerText =
                serialNumber++;

        });

}


// ==========================================================
// DOWNLOAD EXCEL
// ==========================================================

function downloadActivity() {

    window.location.href =
        "/download_class_activity";

}


// ==========================================================
// PRINT PAGE
// ==========================================================

function printActivity() {

    window.print();

}


// ==========================================================
// GO TO HOME
// ==========================================================

function goHome() {

    window.location.href = "/";

}


// ==========================================================
// RESET COMPLETE PAGE
// ==========================================================

function resetActivity() {

    clearCompleteActivity();

    document.getElementById("faculty").value = "";

    setTodayDate();

}


// ==========================================================
// SEARCH STUDENT
// ==========================================================

function searchStudent(name) {

    return attendanceStudents.find(student =>

        student.studentName === name

    );

}


// ==========================================================
// CHECK SUBJECT EXISTS
// ==========================================================

function subjectExists(subject) {

    return subjectList.includes(subject);

}


// ==========================================================
// ADD SUBJECT IF NOT EXISTS
// ==========================================================

function addSubject(subject) {

    if (subjectExists(subject))
        return;

    subjectList.push(subject);

}


// ==========================================================
// END OF FILE
// ==========================================================

console.clear();

console.log("====================================");

console.log("Class Activity JS V2 Loaded");

console.log("Version : 2.0");

console.log("Status  : Ready");

console.log("====================================");