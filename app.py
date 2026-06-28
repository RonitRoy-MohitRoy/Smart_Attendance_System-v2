from flask import Flask, render_template, request, jsonify, send_file
import json
import os
from openpyxl import Workbook

app = Flask(__name__)

# =============================
# DATA FILE
# =============================
DATA_FILE = "attendance_data.json"
CLASS_ACTIVITY_FILE ="class_activity_data.json"
SUBJECTS_FILE="subjects.json"


# =============================
# HOME PAGE
# =============================
@app.route("/")
def home():
    return render_template("index.html")


# =============================
# ATTENDANCE PAGE
# =============================
@app.route("/attendance/<semester>")
def attendance(semester):
    return render_template("attendance.html", semester=semester)


# =============================
# SAVE ATTENDANCE
# =============================
@app.route("/save_attendance", methods=["POST"])
def save_attendance():
    try:
        new_data = request.get_json()

        # load existing data
        if os.path.exists(DATA_FILE):
            try:
                with open(DATA_FILE, "r",encoding="utf-8") as f:
                    all_data = json.load(f)
            except:
                all_data = []
        else:
            all_data = []

        all_data.append(new_data)

        with open(DATA_FILE, "w",encoding="utf-8") as f:
            json.dump(all_data, f, indent=4,ensure_ascii=False)

        return jsonify({"success": True})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


# =============================
# GET ALL DATA
# =============================
@app.route("/get_all", methods=["GET"])
def get_all():
    try:
        if os.path.exists(DATA_FILE):
            with open(DATA_FILE, "r",encoding="utf-8") as f:
                try:
                    data = json.load(f)
                except:
                    data = []
            return jsonify(data)

        return jsonify([])

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


# =============================
# DOWNLOAD EXCEL
# =============================
@app.route("/download_excel")
def download_excel():
    try:
        if not os.path.exists(DATA_FILE):
            return "No data available"

        with open(DATA_FILE, "r",encoding="utf-8") as f:
            all_data = json.load(f)

        wb = Workbook()
        ws = wb.active
        ws.title = "Attendance"

        # header
        ws.append([
            "Subject",
            "Faculty",
            "Date",
            "SrNo",
            "Student Name",
            "Enrollment",
            "Status"
        ])

        # data fill
        for record in all_data:
            subject = record.get("subject", "")
            faculty = record.get("faculty", "")
            date = record.get("date", "")

            for s in record.get("students", []):
                ws.append([
                    subject,
                    faculty,
                    date,
                    s.get("srNo", ""),
                    s.get("studentName", ""),
                    s.get("enrollment", ""),
                    s.get("status", "")
                ])

        file_name = "attendance.xlsx"
        wb.save(file_name)

        return send_file(file_name, as_attachment=True)

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

# =============================
# CLASS ACTIVITY PAGE
# =============================
@app.route("/class_activity/<semester>")
def class_activity(semester):
    return render_template("class_activity.html", semester=semester)


# =============================
# SAVE SUBJECTS
# =============================
@app.route("/save_subjects", methods=["POST"])
def save_subjects():
    try:
        data = request.get_json()

        semester = data.get("semester")
        subjects = data.get("subjects", [])

        # Load existing subjects
        if os.path.exists(SUBJECTS_FILE):
            with open(SUBJECTS_FILE, "r", encoding="utf-8") as f:
                try:
                    all_subjects = json.load(f)
                except:
                    all_subjects = {}
        else:
            all_subjects = {}

        # Save subjects for this semester
        all_subjects[semester] = subjects

        with open(SUBJECTS_FILE, "w", encoding="utf-8") as f:
            json.dump(all_subjects, f, indent=4, ensure_ascii=False)

        return jsonify({
            "success": True,
            "message": "Subjects saved successfully."
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })
# =============================
# GET SUBJECTS
# =============================
@app.route("/get_subjects/<semester>")
def get_subjects(semester):
    try:

        if not os.path.exists(SUBJECTS_FILE):
            return jsonify([])

        with open(SUBJECTS_FILE, "r", encoding="utf-8") as f:
            try:
                all_subjects = json.load(f)
            except:
                all_subjects = {}

        return jsonify(all_subjects.get(semester, []))

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })


# =============================
# SAVE CLASS ACTIVITY
# =============================
@app.route("/save_class_activity", methods=["POST"])
def save_class_activity():

    try:

        new_data = request.get_json()

        if os.path.exists(CLASS_ACTIVITY_FILE):

            with open(CLASS_ACTIVITY_FILE, "r", encoding="utf-8") as f:
                try:
                    all_data = json.load(f)
                except:
                    all_data = []

        else:

            all_data = []

        all_data.append(new_data)

        with open(CLASS_ACTIVITY_FILE, "w", encoding="utf-8") as f:
            json.dump(
                all_data,
                f,
                indent=4,
                ensure_ascii=False
            )

        return jsonify({
            "success": True,
            "message": "Class Activity Saved Successfully"
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        })
        
# =============================
# DOWNLOAD CLASS ACTIVITY EXCEL
# =============================
@app.route("/download_class_activity")
def download_class_activity():

    try:

        if not os.path.exists(CLASS_ACTIVITY_FILE):
            return "No Class Activity Data Available"

        with open(CLASS_ACTIVITY_FILE, "r", encoding="utf-8") as f:
            all_data = json.load(f)

        wb = Workbook()
        ws = wb.active
        ws.title = "Class Activity"

        # Header
        ws.append([
            "Semester",
            "Student Name",
            "Enrollment",
            "Faculty",
            "Date",
            "Subject",
            "Assignment",
            "Practical",
            "Project",
            "Total",
            "Percentage",
            "Remarks"
        ])

        # Data
        for record in all_data:

            semester = record.get("semester", "")
            student_name = record.get("studentName", "")
            enrollment = record.get("enrollment", "")
            faculty = record.get("faculty", "")
            date = record.get("date", "")

            for subject in record.get("subjects", []):

                ws.append([
                    semester,
                    student_name,
                    enrollment,
                    faculty,
                    date,
                    subject.get("subject", ""),
                    subject.get("assignment", ""),
                    subject.get("practical", ""),
                    subject.get("project", ""),
                    subject.get("total", ""),
                    subject.get("percentage", ""),
                    subject.get("remarks", "")
                ])

        file_name = "class_activity.xlsx"
        wb.save(file_name)

        return send_file(file_name, as_attachment=True)

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        })

# =============================
# RUN SERVER
# =============================
if __name__ == "__main__":
    app.run(host="0.0.0.0",port=5000,debug=True)