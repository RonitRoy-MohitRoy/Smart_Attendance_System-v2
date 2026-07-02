console.log("SCRIPT LOADED");

// ==========================
// WAIT FOR PAGE LOAD
// ==========================
document.addEventListener("DOMContentLoaded", function () {

    // ==========================
    // ELEMENTS
    // ==========================
    const tableBody = document.querySelector("#attendanceTable tbody");

    const studentName = document.getElementById("studentName");
    const enrollment = document.getElementById("enrollment");
    const subject = document.getElementById("subject");
    const faculty = document.getElementById("faculty");
    const date = document.getElementById("date");

    let totalStudents = 0;

    // ==========================
    // GET CURRENT SEMESTER
    // ==========================
    function getSemester() {
        return document.getElementById("semester").innerText.trim();
    }

    // ==========================
    // AUTO DATE SET
    // ==========================
    function setDate() {

        if (!date) return;

        const today = new Date();

        const yyyy = today.getFullYear();
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");

        date.value = `${yyyy}-${mm}-${dd}`;
    }

    setDate();

    // ==========================
    // LOAD STUDENTS
    // ==========================
    loadStudents();

    async function loadStudents() {

        const semester = getSemester();

        try {

            const response = await fetch(`/get_students/${semester}`);
            const students = await response.json();

            tableBody.innerHTML = "";
            totalStudents = 0;

            students.forEach(student => {

                totalStudents++;

                const row = document.createElement("tr");

                row.innerHTML = `
                    <td>${totalStudents}</td>
                    <td>${student.studentName}</td>
                    <td>${student.enrollment}</td>
                    <td>
                        <select>
                            <option value="Present">Present</option>
                            <option value="Absent">Absent</option>
                        </select>
                    </td>
                    <td>
                        <button class="remove-btn"
                            onclick="removeRow(this)">
                            Remove
                        </button>
                    </td>
                `;

                tableBody.appendChild(row);

            });

        } catch (error) {

            console.error("Load Students Error:", error);

        }

    }
	
	// ==========================
// ADD STUDENT
// ==========================
window.addStudent = async function () {

    const name = studentName.value.trim();
    const enroll = enrollment.value.trim();
    const semester = getSemester();

    if (!name || !enroll) {
        alert("Please enter student details");
        return;
    }

    // Duplicate check in table
    const rows = tableBody.querySelectorAll("tr");

    for (let row of rows) {
        if (row.cells[2].innerText === enroll) {
            alert("Enrollment already exists.");
            return;
        }
    }

    try {

        const response = await fetch("/save_student", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({

                semester: semester,

                student: {
                    studentName: name,
                    enrollment: enroll
                }

            })

        });

        const result = await response.json();

        if (!result.success) {
            alert(result.message || "Unable to save student.");
            return;
        }

        totalStudents++;

        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${totalStudents}</td>
            <td>${name}</td>
            <td>${enroll}</td>
            <td>
                <select>
                    <option value="Present">Present</option>
                    <option value="Absent">Absent</option>
                </select>
            </td>
            <td>
                <button class="remove-btn"
                        onclick="removeRow(this)">
                    Remove
                </button>
            </td>
        `;

        tableBody.appendChild(row);

        studentName.value = "";
        enrollment.value = "";
        studentName.focus();

    } catch (error) {

        console.error("Save Student Error:", error);
        alert("Server Error");

    }

};

// ==========================
// REMOVE STUDENT
// ==========================
window.removeRow = async function (btn) {

    if (!confirm("Remove this student permanently?")) {
        return;
    }

    const row = btn.closest("tr");

    const enrollment = row.cells[2].innerText;
    const semester = getSemester();

    try {

        const response = await fetch("/delete_student", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                semester: semester,
                enrollment: enrollment
            })

        });

        const result = await response.json();

        if (result.success) {

            row.remove();
            updateSerial();

        } else {

            alert(result.error || "Unable to delete student.");

        }

    } catch (error) {

        console.error("Delete Student Error:", error);
        alert("Server Error");

    }

};

// ==========================
// UPDATE SERIAL NUMBERS
// ==========================
function updateSerial() {

    const rows = tableBody.querySelectorAll("tr");

    totalStudents = rows.length;

    rows.forEach((row, index) => {
        row.cells[0].innerText = index + 1;
    });

}

// ==========================
// SAVE ATTENDANCE
// ==========================
window.saveData = async function () {

    const subjectName = subject.value.trim();
    const facultyName = faculty.value.trim();
    const attendanceDate = date.value;
    const semester = getSemester();

    if (!subjectName || !facultyName || !attendanceDate) {
        alert("Please fill all details.");
        return;
    }

    const rows = tableBody.querySelectorAll("tr");

    if (rows.length === 0) {
        alert("No students available.");
        return;
    }

    const students = [];

    rows.forEach(row => {

        students.push({
            srNo: row.cells[0].innerText,
            studentName: row.cells[1].innerText,
            enrollment: row.cells[2].innerText,
            status: row.cells[3].querySelector("select").value
        });

    });

    const data = {

        semester: semester,
        subject: subjectName,
        faculty: facultyName,
        date: attendanceDate,
        students: students

    };

    try {

        const response = await fetch("/save_attendance", {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(data)

        });

        const result = await response.json();

        if (result.success) {
            alert("Attendance Saved Successfully.");
        } else {
            alert(result.error || "Unable to save attendance.");
        }

    } catch (error) {

        console.error("Save Attendance Error:", error);
        alert("Server Error");

    }

};

// ==========================
// DOWNLOAD EXCEL
// ==========================
window.downloadData = function (semester) {

    window.location.href = "/download_excel/" + semester;

};

});