const API_URL = "http://localhost:5000/api/classes";
const API = "http://localhost:5000/api/classes";
let editingClassId = null;

document.addEventListener("DOMContentLoaded", () => {

    // Table starts empty
    document.getElementById("classTable").innerHTML = "";

});

async function loadAllClasses() {

    const res = await fetch(API);
    const classes = await res.json();

    let html = "";

    classes.forEach(c => {

        html += `
            <div class="class-card">
                <h3>${c.stream_name}</h3>
                <p>Total Students: ${c.total_students}</p>

                <button onclick="viewClassDetails(${c.id})">
                    View Details
                </button>

                <button onclick="viewClassStudents(${c.id})">
                    View Students
                </button>
            </div>
        `;

    });

    document.getElementById("classContainer").innerHTML = html;
}
// ================= ADD / UPDATE CLASS =================

document.getElementById("classForm").addEventListener("submit", async (e) => {

    e.preventDefault();

    const stream_name =
        document.getElementById("className").value.trim();

    let response;

    try {

        if (editingClassId === null) {

            response = await fetch(API_URL, {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    stream_name
                })

            });

        }

        else {

            response = await fetch(`${API_URL}/${editingClassId}`, {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    stream_name
                })

            });

        }

        const data = await response.json();

        alert(data.message);

        if (response.ok) {

            document.getElementById("classForm").reset();

            document.getElementById("searchClass").value = "";

            document.getElementById("classTable").innerHTML = "";

            editingClassId = null;

        }

    }

    catch (error) {

        console.log(error);

        alert("Server not responding");

    }

});

async function viewClassStudents(id) {

    const res = await fetch(`${API}/students/${id}`);
    const students = await res.json();

    let html = `<h2>Students in Class</h2>`;

    if (students.length === 0) {
        html += "<p>No students in this class</p>";
    } else {

        students.forEach(s => {

            html += `
                <div class="student-card">
                    ${s.admission_no} - 
                    ${s.first_name} ${s.last_name}
                </div>
            `;

        });

    }

    html += `<br><button onclick="loadAllClasses()">Back</button>`;

    document.getElementById("classContainer").innerHTML = html;
}

// ================= SEARCH CLASS =================

async function searchClass() {

    const stream_name =
        document.getElementById("searchClass").value.trim();

    if (!stream_name) {

        alert("Enter class name");

        return;

    }

    const response =
        await fetch(`${API_URL}/search/${stream_name}`);

    const data = await response.json();

    let table =
        document.getElementById("classTable");

    table.innerHTML = "";

    if (data.length === 0) {

        table.innerHTML = `
        <tr>

            <td colspan="4">
                No class found
            </td>

        </tr>
        `;

        return;

    }

    data.forEach(cls => {

        table.innerHTML += `

        <tr>

            <td>${cls.id}</td>

            <td>${cls.stream_name}</td>

            <td>${cls.total_students}</td>

            <td>

                <button
                onclick="editClass(
                    ${cls.id},
                    '${cls.stream_name}'
                )">

                    Edit

                </button>

                <button
                onclick="deleteClass(${cls.id})">

                    Delete

                </button>

            </td>

        </tr>

        `;

    });

}


// ================= EDIT =================

function editClass(id, stream_name) {

    document.getElementById("className").value =
        stream_name;

    editingClassId = id;

}


// ================= DELETE =================

async function deleteClass(id) {

    if (!confirm("Delete this class?"))
        return;

    await fetch(`${API_URL}/${id}`, {

        method: "DELETE"

    });

    clearSearch();

}

// ================= VIEW ALL SUBJECTS =================
async function loadAllSubjects() {

    try {

        const res = await fetch("http://localhost:5000/api/subjects");
        const subjects = await res.json();

        const table = document.getElementById("subjectTable");

        table.innerHTML = "";

        subjects.forEach(sub => {

            table.innerHTML += `
                <tr>
                    <td>${sub.id}</td>
                    <td>${sub.subject_name}</td>
                    <td>${sub.subject_code}</td>
                    <td>
                        <button onclick="deleteSubject(${sub.id})">Delete</button>
                    </td>
                </tr>
            `;
        });

    } catch (err) {
        console.log("LOAD SUBJECT ERROR:", err);
        alert("Failed to load subjects");
    }
}




// ================= CLEAR =================

function clearSearch() {

    document.getElementById("searchClass").value = "";

    document.getElementById("classTable").innerHTML = "";

}

function closeClassView() {

    document.getElementById("classContainer").innerHTML = "";

}
