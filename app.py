from flask import (
    Flask,
    render_template,
    request,
    jsonify,
    send_file,
    session,
    redirect,
    url_for
)

from openpyxl import Workbook

from datetime import (
    datetime,
    timedelta
)

from functools import wraps

import sqlite3
import os
import json

app = Flask(__name__)

# ==================================================
# SECURITY
# ==================================================

app.secret_key = (
    "CHANGE_THIS_TO_A_LONG_RANDOM_SECRET_KEY"
)

app.permanent_session_lifetime = timedelta(
    hours=8
)

# ==================================================
# FOLDERS & FILES
# ==================================================

ATTENDANCE_FOLDER = "attendance_data"
STUDENT_FOLDER = "student"

CLASS_ACTIVITY_FILE = "class_activity_data.json"
SUBJECTS_FILE = "subjects.json"

# ==================================================
# LOGIN SYSTEM
# ==================================================

DATABASE_FILE = "users.db"

LOGIN_ACTIVITY_FILE = (
    "login_activity.json"
)

os.makedirs(ATTENDANCE_FOLDER, exist_ok=True)
os.makedirs(STUDENT_FOLDER, exist_ok=True)

# ==================================================
# DATABASE INITIALIZATION
# ==================================================

def initialize_database():

    connection = sqlite3.connect(
        DATABASE_FILE
    )

    cursor = connection.cursor()

    cursor.execute("""

        CREATE TABLE IF NOT EXISTS users(

            id INTEGER PRIMARY KEY AUTOINCREMENT,

            username TEXT UNIQUE,

            password TEXT,

            full_name TEXT,

            role TEXT

        )

    """)

    connection.commit()

    connection.close()

# ==================================================
# LOGIN ACTIVITY FILE
# ==================================================

def initialize_login_activity():

    if not os.path.exists(
        LOGIN_ACTIVITY_FILE
    ):

        with open(

            LOGIN_ACTIVITY_FILE,

            "w",

            encoding="utf-8"

        ) as file:

            json.dump(

                [],

                file,

                indent=4,

                ensure_ascii=False

            )

# ==================================================
# INITIALIZE FILES
# ==================================================

initialize_database()

initialize_login_activity()


# ==================================================
# LOGIN HELPER FUNCTIONS
# ==================================================

from werkzeug.security import (
    generate_password_hash,
    check_password_hash
)

def get_connection():

    return sqlite3.connect(
        DATABASE_FILE
    )

def create_default_users():

    connection = get_connection()

    cursor = connection.cursor()

    users = [

    (
        "ronit",
        generate_password_hash(
            "Ronit@123"
        ),
        "Ronit Choudhary",
        "admin"
    ),

    (
        "teacher1",
        generate_password_hash(
            "Teacher@123"
        ),
        "Faculty 1",
        "teacher"
    ),

    (
        "teacher2",
        generate_password_hash(
            "Teacher@123"
        ),
        "Faculty 2",
        "teacher"
    ),

    (
        "teacher3",
        generate_password_hash(
            "Teacher@123"
        ),
        "Faculty 3",
        "teacher"
    )

]

    for user in users:

        cursor.execute(

            """

            INSERT OR IGNORE INTO users

            (

                username,

                password,

                full_name,

                role

            )

            VALUES

            (?, ?, ?, ?)

            """,

            user

        )

    connection.commit()

    connection.close()

create_default_users()
# ==================================================
# LOGIN REQUIRED DECORATOR
# ==================================================

def login_required(function):

    @wraps(function)

    def wrapper(*args, **kwargs):

        if "user_id" not in session:

            return redirect(

                url_for("admin")

            )

        return function(

            *args,

            **kwargs

        )

    return wrapper

# ==================================================
# ADMIN REQUIRED DECORATOR
# ==================================================

def admin_required(function):

    @wraps(function)

    def wrapper(*args, **kwargs):

        if "user_role" not in session:

            return redirect(

                url_for("admin")

            )

        if session["user_role"] != "admin":

            return "Access Denied", 403

        return function(

            *args,

            **kwargs

        )

    return wrapper
    # ==================================================
# LOGIN ACTIVITY
# ==================================================

def save_login_activity(username):

    activities = []

    if os.path.exists(LOGIN_ACTIVITY_FILE):

        with open(
            LOGIN_ACTIVITY_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            try:
                activities = json.load(file)
            except:
                activities = []

    now = datetime.now()

    seven_days_ago = now - timedelta(days=7)

    activities = [

        item

        for item in activities

        if datetime.fromisoformat(
            item["time"]
        ) >= seven_days_ago

    ]

    activities.append({

        "username": username,

        "time": now.isoformat()

    })

    with open(

        LOGIN_ACTIVITY_FILE,

        "w",

        encoding="utf-8"

    ) as file:

        json.dump(

            activities,

            file,

            indent=4,

            ensure_ascii=False

        )
    

# ==================================================
# HOME PAGE
# ==================================================

@app.route("/")

def home():

    if "user_id" not in session:

        return redirect(

            url_for("admin")

        )

    return render_template(

        "index.html"

    )
    # ==================================================
# ADMIN LOGIN PAGE
# ==================================================

@app.route("/admin")
def admin():

    if "user_id" in session:

        return redirect(
            url_for("home")
        )

    return render_template(
        "admin.html"
    )

# ==================================================
# LOGIN
# ==================================================

@app.route(
    "/login",
    methods=["POST"]
)
def login():

    data = request.get_json()

    username = data.get(
        "username"
    )

    password = data.get(
        "password"
    )

    connection = get_connection()

    cursor = connection.cursor()

    cursor.execute(

        """

        SELECT

            id,
            username,
            password,
            full_name,
            role

        FROM users

        WHERE username=?

        """,

        (username,)

    )

    user = cursor.fetchone()

    connection.close()

    if (
        user
        and
        check_password_hash(
            user[2],
            password
        )
    ):

        session.permanent = True

        session["user_id"] = user[0]
        session["username"] = user[1]
        session["full_name"] = user[3]
        session["user_role"] = user[4]
        
        save_login_activity(
            user[1] 
            )

        return jsonify({

            "success": True,

            "role": user[4]

        })

    return jsonify({

        "success": False,

        "message": "Invalid Username or Password"

    })

# ==================================================
# LOGOUT
# ==================================================

@app.route("/logout")
def logout():

    session.clear()

    return redirect(
        url_for("admin")
    )
    
    # ==================================================
# LOGIN ACTIVITY
# ==================================================

@app.route("/login_activity")
@login_required
def login_activity():

    if not os.path.exists(
        LOGIN_ACTIVITY_FILE
    ):

        return jsonify([])

    with open(

        LOGIN_ACTIVITY_FILE,

        "r",

        encoding="utf-8"

    ) as file:

        try:

            activities = json.load(file)

        except:

            activities = []

    return jsonify(

        activities

    )
# ==================================================
# ATTENDANCE PAGE
# ==================================================

@app.route("/attendance/<semester>")
@login_required
def attendance(semester):
    return render_template(
        "attendance.html",
        semester=semester
    )


# ==================================================
# SAVE ATTENDANCE
# ==================================================

@app.route("/save_attendance", methods=["POST"])
@login_required
def save_attendance():

    try:

        data = request.get_json()

        semester = data.get(
            "semester",
            "semester1"
        )

        timestamp = datetime.now().strftime(
            "%Y-%m-%d_%H-%M-%S"
        )

        filename = f"{semester}_{timestamp}.json"

        filepath = os.path.join(
            ATTENDANCE_FOLDER,
            filename
        )

        with open(
            filepath,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                data,
                file,
                indent=4,
                ensure_ascii=False
            )

        return jsonify({

            "success": True,
            "file": filename

        })

    except Exception as e:

        return jsonify({

            "success": False,
            "error": str(e)

        })


# ==================================================
# GET ATTENDANCE
# ==================================================

@app.route("/get_all/<semester>")
@login_required
def get_all(semester):

    try:

        filepath = os.path.join(
            ATTENDANCE_FOLDER,
            f"{semester}.json"
        )

        if not os.path.exists(filepath):
            return jsonify([])

        with open(
            filepath,
            "r",
            encoding="utf-8"
        ) as file:

            try:
                data = json.load(file)
            except:
                data = []

        return jsonify(data)

    except Exception as e:

        return jsonify({

            "success": False,
            "error": str(e)

        })
# ==================================================
# DOWNLOAD ATTENDANCE EXCEL
# ==================================================

@app.route("/download_excel/<semester>")
@login_required
def download_excel(semester):
    semester=semester.upper()

    try:

        files = [

            file for file in os.listdir(ATTENDANCE_FOLDER)

            if file.startswith(semester)
            and file.endswith(".json")

        ]

        if not files:
            return "No attendance data available."

        latest_file = max(

            files,

            key=lambda file: os.path.getmtime(
                os.path.join(
                    ATTENDANCE_FOLDER,
                    file
                )
            )

        )

        filepath = os.path.join(
            ATTENDANCE_FOLDER,
            latest_file
        )

        with open(
            filepath,
            "r",
            encoding="utf-8"
        ) as file:

            record = json.load(file)

        wb = Workbook()
        ws = wb.active
        ws.title = "Attendance"

        ws.append([
            "Subject",
            "Faculty",
            "Date",
            "Sr No",
            "Student Name",
            "Enrollment",
            "Status"
        ])

        for student in record.get("students", []):

            ws.append([

                record.get("subject", ""),
                record.get("faculty", ""),
                record.get("date", ""),

                student.get("srNo", ""),
                student.get("studentName", ""),
                student.get("enrollment", ""),
                student.get("status", "")

            ])

        excel_name = latest_file.replace(
            ".json",
            ".xlsx"
        )

        excel_path = os.path.join(
            ATTENDANCE_FOLDER,
            excel_name
        )

        wb.save(excel_path)

        return send_file(
            excel_path,
            as_attachment=True
        )

    except Exception as e:

        return jsonify({

            "success": False,
            "error": str(e)

        })


# ==================================================
# CLASS ACTIVITY PAGE
# ==================================================

@app.route("/class_activity/<semester>")
@login_required
def class_activity(semester):

    return render_template(
        "class_activity.html",
        semester=semester
    )


# ==================================================
# SAVE SUBJECTS
# ==================================================

@app.route("/save_subjects", methods=["POST"])
@login_required
def save_subjects():

    try:

        data = request.get_json()

        semester = data.get("semester")
        subjects = data.get("subjects", [])

        if os.path.exists(SUBJECTS_FILE):

            with open(
                SUBJECTS_FILE,
                "r",
                encoding="utf-8"
            ) as file:

                try:
                    all_subjects = json.load(file)
                except:
                    all_subjects = {}

        else:

            all_subjects = {}

        all_subjects[semester] = subjects

        with open(
            SUBJECTS_FILE,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                all_subjects,
                file,
                indent=4,
                ensure_ascii=False
            )

        return jsonify({
            "success": True
        })

    except Exception as e:

        return jsonify({

            "success": False,
            "error": str(e)

        })


# ==================================================
# GET SUBJECTS
# ==================================================

@app.route("/get_subjects/<semester>")
@login_required
def get_subjects(semester):

    try:

        if not os.path.exists(SUBJECTS_FILE):
            return jsonify([])

        with open(
            SUBJECTS_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            try:
                all_subjects = json.load(file)
            except:
                all_subjects = {}

        return jsonify(
            all_subjects.get(semester, [])
        )

    except Exception as e:

        return jsonify({

            "success": False,
            "error": str(e)

        })
        # ==================================================
# SAVE STUDENT
# ==================================================

@app.route("/save_student", methods=["POST"])
@login_required
def save_student():

    try:

        data = request.get_json()

        semester = data.get("semester")
        student = data.get("student")

        file_path = os.path.join(
            STUDENT_FOLDER,
            f"{semester}.json"
        )

        students = []

        if os.path.exists(file_path):

            with open(
                file_path,
                "r",
                encoding="utf-8"
            ) as file:

                try:
                    students = json.load(file)
                except:
                    students = []

        # Prevent duplicate enrollment
        for s in students:

            if s["enrollment"] == student["enrollment"]:

                return jsonify({
                    "success": False,
                    "message": "Enrollment already exists."
                })

        students.append(student)

        with open(
            file_path,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                students,
                file,
                indent=4,
                ensure_ascii=False
            )

        return jsonify({"success": True})

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        })


# ==================================================
# GET STUDENTS
# ==================================================

@app.route("/get_students/<semester>")
@login_required
def get_students(semester):

    try:

        file_path = os.path.join(
            STUDENT_FOLDER,
            f"{semester}.json"
        )

        if not os.path.exists(file_path):
            return jsonify([])

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as file:

            try:
                students = json.load(file)
            except:
                students = []

        return jsonify(students)

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        })


# ==================================================
# DELETE STUDENT
# ==================================================

@app.route("/delete_student", methods=["POST"])
def delete_student():

    try:

        data = request.get_json()

        semester = data.get("semester")
        enrollment = data.get("enrollment")

        file_path = os.path.join(
            STUDENT_FOLDER,
            f"{semester}.json"
        )

        if not os.path.exists(file_path):

            return jsonify({"success": False})

        with open(
            file_path,
            "r",
            encoding="utf-8"
        ) as file:

            students = json.load(file)

        students = [

            student

            for student in students

            if student["enrollment"] != enrollment

        ]

        with open(
            file_path,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                students,
                file,
                indent=4,
                ensure_ascii=False
            )

        return jsonify({"success": True})

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        })

# ==================================================
# UPDATE STUDENT
# ==================================================

@app.route("/update_student", methods=["POST"])
def update_student():

    try:

        data = request.get_json()

        semester = data.get("semester")
        enrollment = data.get("enrollment")
        student_name = data.get("studentName")

        # -----------------------------
        # Update Student File
        # -----------------------------

        student_file = os.path.join(
            STUDENT_FOLDER,
            f"{semester}.json"
        )

        if os.path.exists(student_file):

            with open(student_file, "r", encoding="utf-8") as file:
                students = json.load(file)

            for student in students:

                if student["enrollment"] == enrollment:
                    student["studentName"] = student_name

            with open(student_file, "w", encoding="utf-8") as file:
                json.dump(
                    students,
                    file,
                    indent=4,
                    ensure_ascii=False
                )

        # -----------------------------
        # Update Class Activity File
        # -----------------------------

        if os.path.exists(CLASS_ACTIVITY_FILE):

            with open(CLASS_ACTIVITY_FILE, "r", encoding="utf-8") as file:
                activities = json.load(file)

            for activity in activities:

                if (
                    activity["semester"] == semester and
                    activity["enrollment"] == enrollment
                ):
                    activity["studentName"] = student_name

            with open(CLASS_ACTIVITY_FILE, "w", encoding="utf-8") as file:
                json.dump(
                    activities,
                    file,
                    indent=4,
                    ensure_ascii=False
                )

        return jsonify({
            "success": True
        })

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        })

# ==================================================
# SAVE CLASS ACTIVITY
# ==================================================
@app.route("/save_class_activity", methods=["POST"])
def save_class_activity():

    try:
        data = request.get_json()

        semester = data.get("semester")
        faculty = data.get("faculty")
        date = data.get("date")
        activity_data = data.get("activityData", [])

        if os.path.exists(CLASS_ACTIVITY_FILE):
            with open(CLASS_ACTIVITY_FILE, "r", encoding="utf-8") as file:
                try:
                    all_data = json.load(file)
                except:
                    all_data = []
        else:
            all_data = []

        # Remove old records for this semester (fresh overwrite style)
        all_data = [
            r for r in all_data
            if r.get("semester") != semester
        ]

        # Add new structured data
        for student in activity_data:
            all_data.append({
                "semester": semester,
                "studentName": student["studentName"],
                "enrollment": student["enrollment"],
                "faculty": faculty,
                "date": date,
                "subjects": student["subjects"]
            })

        with open(CLASS_ACTIVITY_FILE, "w", encoding="utf-8") as file:
            json.dump(all_data, file, indent=4, ensure_ascii=False)

        return jsonify({
            "success": True,
            "message": "Class Activity Saved Successfully"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        })
# ==================================================
# DELETE CLASS ACTIVITY SUBJECT
# ==================================================

@app.route("/delete_class_activity", methods=["POST"])
def delete_class_activity():

    try:

        data = request.get_json()

        semester = data.get("semester")
        enrollment = data.get("enrollment")
        subject = data.get("subject")

        if not os.path.exists(CLASS_ACTIVITY_FILE):

            return jsonify({"success": True})

        with open(
            CLASS_ACTIVITY_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            try:
                all_data = json.load(file)
            except:
                all_data = []

        for record in all_data:

            if (
                record.get("semester") == semester
                and
                record.get("enrollment") == enrollment
            ):

                record["subjects"] = [

                    item

                    for item in record.get("subjects", [])

                    if item.get("subject") != subject

                ]

                break

        with open(
            CLASS_ACTIVITY_FILE,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                all_data,
                file,
                indent=4,
                ensure_ascii=False
            )

        return jsonify({"success": True})

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        })

# ==================================================
# GET CLASS ACTIVITY
# ==================================================

@app.route("/get_class_activity/<semester>/<enrollment>")
def get_class_activity(semester, enrollment):

    try:

        if not os.path.exists(CLASS_ACTIVITY_FILE):
            return jsonify({})

        with open(
            CLASS_ACTIVITY_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            try:
                all_data = json.load(file)
            except:
                all_data = []

        for record in all_data:

            if (
                record.get("semester") == semester
                and
                record.get("enrollment") == enrollment
            ):

                return jsonify(record)

        return jsonify({})

    except Exception as e:

        return jsonify({

            "success": False,
            "error": str(e)

        })

# ==================================================
# ADD ATTENDANCE STUDENTS
# ==================================================

@app.route("/add_attendance_students", methods=["POST"])
def add_attendance_students():

    try:

        data = request.get_json()

        semester = data.get("semester")
        first_enrollment = data.get("enrollment")
        subjects = data.get("subjects", [])

        student_file = os.path.join(
            STUDENT_FOLDER,
            f"{semester}.json"
        )

        if not os.path.exists(student_file):

            return jsonify({
                "success": False,
                "error": "Student list not found."
            })

        with open(
            student_file,
            "r",
            encoding="utf-8"
        ) as file:

            students = json.load(file)

        if os.path.exists(CLASS_ACTIVITY_FILE):

            with open(
                CLASS_ACTIVITY_FILE,
                "r",
                encoding="utf-8"
            ) as file:

                try:
                    all_data = json.load(file)
                except:
                    all_data = []

        else:

            all_data = []

        for student in students:

            if student["enrollment"] == first_enrollment:
                continue

            already_exists = False

            for record in all_data:

                if (
                    record.get("semester") == semester
                    and
                    record.get("enrollment") == student["enrollment"]
                ):

                    already_exists = True
                    break

            if already_exists:
                continue

            subject_rows = []

            for subject in subjects:

                subject_rows.append({

                    "subject": subject,

                    "assignment": 0,
                    "practical": 0,
                    "project": 0,
                    "total": 0,
                    "percentage": "0%",
                    "remarks": "Fail"

                })

            all_data.append({

                "semester": semester,
                "studentName": student["studentName"],
                "enrollment": student["enrollment"],
                "faculty": "",
                "date": "",
                "subjects": subject_rows

            })

        with open(
            CLASS_ACTIVITY_FILE,
            "w",
            encoding="utf-8"
        ) as file:

            json.dump(
                all_data,
                file,
                indent=4,
                ensure_ascii=False
            )

        return jsonify({
            "success": True
        })

    except Exception as e:

        return jsonify({

            "success": False,
            "error": str(e)

        })

# ==================================================
# DOWNLOAD CLASS ACTIVITY EXCEL
# ==================================================

@app.route("/download_class_activity")
def download_class_activity():

    try:

        if not os.path.exists(CLASS_ACTIVITY_FILE):
            return "No Class Activity Data Available"

        with open(
            CLASS_ACTIVITY_FILE,
            "r",
            encoding="utf-8"
        ) as file:

            try:
                all_data = json.load(file)
            except:
                all_data = []

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

            for subject in record.get("subjects", []):

                ws.append([

                    record.get("semester", ""),
                    record.get("studentName", ""),
                    record.get("enrollment", ""),
                    record.get("faculty", ""),
                    record.get("date", ""),

                    subject.get("subject", ""),
                    subject.get("assignment", ""),
                    subject.get("practical", ""),
                    subject.get("project", ""),
                    subject.get("total", ""),
                    subject.get("percentage", ""),
                    subject.get("remarks", "")

                ])

        excel_file = "class_activity.xlsx"

        wb.save(excel_file)

        return send_file(
            excel_file,
            as_attachment=True
        )

    except Exception as e:

        return jsonify({
            "success": False,
            "error": str(e)
        })


# ==================================================
# RUN SERVER
# ==================================================

if __name__ == "__main__":

    initialize_database()

    create_default_users()

    initialize_login_activity()

    app.run(

        host="0.0.0.0",

        port=5000,

        debug=True

    )