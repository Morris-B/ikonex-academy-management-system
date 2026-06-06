const API_URL = "http://localhost:5000/api/subjects";

let editingSubjectId = null;


// Start with empty table
document.addEventListener("DOMContentLoaded", () => {

    document.getElementById("subjectTable").innerHTML = "";

});


// ================= ADD OR UPDATE =================
document.getElementById("subjectForm")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    const subject_name =
        document.getElementById("subjectName").value.trim();

    const subject_code =
        document.getElementById("subjectCode").value.trim();

    const subjectData = {
        subject_name,
        subject_code
    };

    let response;

    if (editingSubjectId === null) {

        response = await fetch(API_URL, {

            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify(subjectData)

        });

    }

    else {

        response = await fetch(
            `${API_URL}/${editingSubjectId}`,
            {

                method: "PUT",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify(subjectData)

            }
        );

        editingSubjectId = null;

    }

    const data = await response.json();

    alert(data.message);

    if (response.ok) {

        document.getElementById("subjectForm").reset();

        document.getElementById("subjectTable").innerHTML = "";

    }

});


// ================= SEARCH =================
async function searchSubject() {

    const subjectName =
        document.getElementById("searchSubject").value.trim();

    if (!subjectName) {

        alert("Enter subject name");

        return;

    }

    try {

        const response =
            await fetch(`${API_URL}/search/${subjectName}`);

        const data = await response.json();

        const table =
            document.getElementById("subjectTable");

        table.innerHTML = "";

        if (data.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="4">
                        No subject found
                    </td>
                </tr>
            `;

            return;

        }

        data.forEach(subject => {

            table.innerHTML += `
                <tr>

                    <td>${subject.id}</td>

                    <td>
                        ${subject.subject_name}
                    </td>

                    <td>
                        ${subject.subject_code}
                    </td>

                    <td>

                        <button
                        onclick="editSubject(
                        ${subject.id},
                        '${subject.subject_name}',
                        '${subject.subject_code}'
                        )">

                        Edit

                        </button>

                        <button
                        onclick="deleteSubject(${subject.id})">

                        Delete

                        </button>

                    </td>

                </tr>
            `;

        });

    }

    catch (error) {

        console.log(error);

        alert("Search failed");

    }

}



async function loadAllSubjects() {

    const res = await fetch("http://localhost:5000/api/subjects/all");

    const data = await res.json();

    let html = "";

    data.forEach(sub => {

        html += `
            <tr>
                <td>${sub.id}</td>
                <td>${sub.subject_name}</td>
                <td>${sub.subject_code}</td>
                <td>-</td>
            </tr>
        `;

    });

    document.getElementById("subjectTable").innerHTML = html;

}

async function loadSubjectDropdown() {

    const res = await fetch("http://localhost:5000/api/subjects/all");
    const data = await res.json();

    const select = document.getElementById("subjectSelect");

    select.innerHTML = `<option value="">Select Subject</option>`;

    data.forEach(s => {
        select.innerHTML += `
            <option value="${s.id}">
                ${s.subject_name}
            </option>
        `;
    });

}

async function loadClassDropdown() {

    const res = await fetch("http://localhost:5000/api/classes");
    const data = await res.json();

    const select = document.getElementById("classSelect");

    select.innerHTML = `<option value="">Select Class Stream</option>`;

    data.forEach(c => {
        select.innerHTML += `
            <option value="${c.id}">
                ${c.stream_name}
            </option>
        `;
    });

}

async function assignSubjectToClass() {

    const subject_id = document.getElementById("subjectSelect").value;
    const class_id = document.getElementById("classSelect").value;

    if (!subject_id || !class_id) {
        alert("Select both subject and class");
        return;
    }

    try {

        const res = await fetch("http://localhost:5000/api/subjects/assign", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ subject_id, class_id })
        });

        const data = await res.json();

        alert(data.message);

        // ✅ RESET FORM AFTER SUCCESS OR FAIL
        if (res.ok) {

            document.getElementById("subjectSelect").value = "";
            document.getElementById("classSelect").value = "";

        }

    } catch (err) {
        console.log(err);
        alert("Assignment failed");
    }
}

// ================= EDIT =================
function editSubject(
    id,
    subject_name,
    subject_code
) {

    document.getElementById("subjectName").value =
        subject_name;

    document.getElementById("subjectCode").value =
        subject_code;

    editingSubjectId = id;

}


// ================= DELETE =================
async function deleteSubject(id) {

    if (!confirm("Delete this subject?"))
        return;

    await fetch(
        `${API_URL}/${id}`,
        {
            method: "DELETE"
        }
    );

    clearSearch();

}


// ================= CLEAR =================
function clearSearch() {

    document.getElementById("searchSubject").value = "";

    document.getElementById("subjectTable").innerHTML = "";

}

function clearSubjectsView() {
    document.getElementById("subjectTable").innerHTML = "";
    document.getElementById("clearSubjectsBtn").style.display = "none";
}

window.clearSubjectsView = clearSubjectsView;

loadSubjectDropdown();
loadClassDropdown();

const SUBJECT_API = "http://localhost:5000/api/subjects";

// ================= VIEW ALL SUBJECTS =================
async function loadAllSubjects() {

    try {

        const res = await fetch(SUBJECT_API);

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

    } catch (error) {
        console.log("LOAD SUBJECT ERROR:", error);
        alert("Failed to load subjects");
    }
}
