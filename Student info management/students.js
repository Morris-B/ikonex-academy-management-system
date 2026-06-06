const API_URL = "http://localhost:5000/api/students";
const CLASS_API = "http://localhost:5000/api/classses";

let editingStudentId = null;

// ================= PAGE LOAD =================
document.addEventListener("DOMContentLoaded", () => {
    loadClasses();
    loadViewClasses();
});

// ================= LOAD CLASS DROPDOWN =================
async function loadClasses() {

    try {

        const response = await fetch(CLASS_API);
        const classes = await response.json();

        const select = document.getElementById("class");

        select.innerHTML = `<option value="">Select Class</option>`;

        classes.forEach(cls => {

            select.innerHTML += `
                <option value="${cls.id}">
                    ${cls.stream_name}
                </option>
            `;

        });

    } catch (error) {

        console.log(error);

    }

}

// ================= FORM SUBMIT =================
document.getElementById("studentForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const studentData = {

        admission_no: document.getElementById("admission").value.trim(),
        first_name: document.getElementById("firstname").value.trim(),
        last_name: document.getElementById("lastname").value.trim(),
        class_id: document.getElementById("class").value

    };

    try {

        let response;

        if (editingStudentId === null) {

            response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(studentData)

            });

        } else {

            response = await fetch(`${API_URL}/${editingStudentId}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(studentData)

            });

        }

        const data = await response.json();

        alert(data.message);

        document.getElementById("studentForm").reset();

        editingStudentId = null;

    }

    catch (error) {

        console.log(error);

        alert("Server error");

    }

});

// ================= LOAD ALL STUDENTS =================
async function loadStudents() {

    try {

        const response = await fetch(API_URL);

        const students = await response.json();

        displayStudents(students);

    }

    catch (error) {

        console.log(error);

    }

}

// ================= SEARCH STUDENT =================
async function searchStudent() {

    const admissionNo =
        document.getElementById("searchAdmission").value.trim();

    if (!admissionNo) {

        alert("Enter admission number");

        return;

    }

    try {

        const response =
            await fetch(`${API_URL}/search/${admissionNo}`);

        const students = await response.json();

        displayStudents(students);

    }

    catch (error) {

        console.log(error);

    }

}

// ================= DELETE =================
async function deleteStudent(id) {

    if (!confirm("Delete this student?")) return;

    try {

        await fetch(`${API_URL}/${id}`, {

            method: "DELETE"

        });

        loadStudents();

    }

    catch (error) {

        console.log(error);

    }

}

// ================= EDIT =================
function editStudent(
    id,
    admission_no,
    first_name,
    last_name,
    class_id
) {

    document.getElementById("admission").value = admission_no;
    document.getElementById("firstname").value = first_name;
    document.getElementById("lastname").value = last_name;
    document.getElementById("class").value = class_id;

    editingStudentId = id;

}

// ================= DISPLAY STUDENTS =================
function displayStudents(students) {

    const table = document.getElementById("studentTable");

    table.innerHTML = "";

    if (students.length === 0) {

        table.innerHTML = `
            <tr>
                <td colspan="4">
                    No students found
                </td>
            </tr>
        `;

        return;

    }

    students.forEach(student => {

        table.innerHTML += `
            <tr>

                <td>${student.admission_no}</td>

                <td>
                    ${student.first_name}
                    ${student.last_name}
                </td>

                <td>
                    ${student.stream_name}
                </td>

                <td>

                    <button onclick="editStudent(
                        ${student.id},
                        '${student.admission_no}',
                        '${student.first_name}',
                        '${student.last_name}',
                        ${student.class_id}
                    )">
                        Edit
                    </button>

                    <button onclick="deleteStudent(${student.id})">
                        Delete
                    </button>

                </td>

            </tr>
        `;

    });

}

// ================= LOAD VIEW CLASS DROPDOWN =================
async function loadViewClasses() {

    try {

        const response = await fetch(CLASS_API);

        const classes = await response.json();

        const select = document.getElementById("viewClass");

        if (!select) return;

        select.innerHTML =
            '<option value="">Select Class Stream</option>';

        classes.forEach(cls => {

            select.innerHTML += `
                <option value="${cls.id}">
                    ${cls.stream_name}
                </option>
            `;

        });

    }

    catch (error) {

        console.log(error);

    }

}

async function filterByClass() {

    const classId = document.getElementById("filterClass").value;

    if (!classId) {
        alert("Please select a class stream");
        return;
    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/students/class/${classId}`
        );

        const students = await response.json();

        let html = "";

        students.forEach(student => {

            html += `
                <tr>
                    <td>${student.admission_no}</td>
                    <td>${student.first_name} ${student.last_name}</td>
                    <td>${student.stream_name}</td>
                    <td>
                        <button onclick="editStudent(
                            ${student.id},
                            '${student.admission_no}',
                            '${student.first_name}',
                            '${student.last_name}',
                            ${student.class_id}
                        )">
                            Edit
                        </button>

                        <button onclick="deleteStudent(${student.id})">
                            Delete
                        </button>
                    </td>
                </tr>
            `;

        });

        document.getElementById("studentTable").innerHTML = html;

    }

    catch (error) {

        console.log(error);

        alert("Failed to load students");

    }

}

// ================= VIEW BY CLASS =================
async function viewByClass() {

    const classId = document.getElementById("viewClass").value;

    if (!classId) {

        alert("Select class stream");

        return;

    }

    try {

        const response = await fetch(
            `${API_URL}/class/${classId}`
        );

        const students = await response.json();

        displayStudents(students);

    }

    catch (error) {

        console.log(error);

    }

}

async function loadClassFilter() {

    try {

        const response = await fetch(
            "http://localhost:5000/api/classes"
        );

        const classes = await response.json();

        const select = document.getElementById("filterClass");

        select.innerHTML =
            '<option value="">Select Class Stream</option>';

        classes.forEach(c => {

            select.innerHTML += `
                <option value="${c.id}">
                    ${c.stream_name}
                </option>
            `;

        });

    }

    catch (error) {

        console.log(error);

    }

}

loadClassFilter();
// ================= CLEAR SEARCH =================
function clearSearch() {

    document.getElementById("searchAdmission").value = "";

    document.getElementById("studentTable").innerHTML = "";

}