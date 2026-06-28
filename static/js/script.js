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
    // AUTO DATE SET
    // ==========================
    function setDate() {
        if (!date) return;

        let today = new Date();
        let yyyy = today.getFullYear();
        let mm = String(today.getMonth() + 1).padStart(2, '0');
        let dd = String(today.getDate()).padStart(2, '0');

        date.value = '${yyyy}-${mm}-${dd}';
    }

    setDate();

    // ==========================
    // ADD STUDENT (FIXED)
    // ==========================
    window.addStudent = function () {

        let name = studentName.value.trim();
        let enroll = enrollment.value.trim();

        if (!name || !enroll) {
            alert("Please enter student details");
            return;
        }

        // duplicate check
        let rows = tableBody.querySelectorAll("tr");

        for (let row of rows) {
            if (row.cells[2].innerText === enroll) {
                alert("Enrollment already exists");
                return;
            }
        }

        totalStudents++;

        let row = document.createElement("tr");

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
                <button onclick="removeRow(this)"
                    style="background:#dc3545;color:white;border:none;padding:6px 10px;border-radius:5px;cursor:pointer;">
                    Remove
                </button>
            </td>
        `;

        tableBody.appendChild(row);

        studentName.value = "";
        enrollment.value = "";
        studentName.focus();
    };

    // ==========================
    // REMOVE ROW
    // ==========================
    window.removeRow = function (btn) {
        btn.parentElement.parentElement.remove();
        updateSerial();
    };

    // ==========================
    // UPDATE SERIAL NUMBERS
    // ==========================
    function updateSerial() {
        let rows = tableBody.querySelectorAll("tr");
        totalStudents = rows.length;

        rows.forEach((row, index) => {
            row.cells[0].innerText = index + 1;
        });
    }

    // ==========================
    // SAVE DATA TO FLASK
    // ==========================
    window.saveData = async function () {

        let subjectName = subject.value.trim();
        let facultyName = faculty.value.trim();
        let attendanceDate = date.value;

        if (!subjectName || !facultyName || !attendanceDate) {
            alert("Please fill all details");
            return;
        }

        let rows = tableBody.querySelectorAll("tr");

        if (rows.length === 0) {
            alert("No students added");
            return;
        }

        let students = [];

        rows.forEach(row => {
            students.push({
                srNo: row.cells[0].innerText,
                studentName: row.cells[1].innerText,
                enrollment: row.cells[2].innerText,
                status: row.cells[3].querySelector("select").value
            });
        });

        let data = {
            subject: subjectName,
            faculty: facultyName,
            date: attendanceDate,
            students: students
        };

        try {
            let res = await fetch("/save_attendance", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(data)
            });

            let result = await res.json();

            if (result.success) {
                alert("Attendance Saved Successfully");
            } else {
                alert("Save Failed");
            }

        } catch (err) {
            console.error(err);
            alert("Server Error");
        }
    };

    // ==========================
    // DOWNLOAD EXCEL
    // ==========================
    window.downloadData = function () {
        window.location.href = "/download_excel";
    };

});