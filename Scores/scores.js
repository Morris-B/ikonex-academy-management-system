
const API_URL = "http://localhost:5000/api/scores";
const STUDENTS_API = "http://localhost:5000/api/students";
const SUBJECTS_API = "http://localhost:5000/api/subjects";
const CLASSES_API = "http://localhost:5000/api/classes";

let students = [];
let subjects = [];

let editingId = null;

document.addEventListener("DOMContentLoaded", () => {

    loadStudents();
    loadSubjects();
    loadClasses();
});


// ================= STUDENTS =================

async function loadStudents(){

    const res = await fetch(STUDENTS_API);

    students = await res.json();

}


// ================= SUBJECTS =================

async function loadSubjects(){

    const res = await fetch(SUBJECTS_API);

    subjects = await res.json();

    let select =
    document.getElementById("statsSubject");

    subjects.forEach(subject=>{

        select.innerHTML += `
        <option value="${subject.id}">
        ${subject.subject_name}
        </option>
        `;

    });

}



// GOOGLE STYLE AUTOCOMPLETE

studentName.addEventListener("input", ()=>{

    let keyword =
    studentName.value.toLowerCase();

    studentSuggestions.innerHTML="";

    students
    .filter(s=>
        (`${s.first_name} ${s.last_name}`)
        .toLowerCase()
        .includes(keyword)
    )

    .forEach(student=>{

        studentSuggestions.innerHTML += `
        <div onclick="selectStudent('${student.first_name} ${student.last_name}')">
        ${student.first_name} ${student.last_name}
        </div>
        `;

    });

});


function selectStudent(name){

    studentName.value=name;

    studentSuggestions.innerHTML="";

}



subjectName.addEventListener("input", ()=>{

    let keyword =
    subjectName.value.toLowerCase();

    subjectSuggestions.innerHTML="";

    subjects
    .filter(s=>
        s.subject_name
        .toLowerCase()
        .includes(keyword)
    )

    .forEach(subject=>{

        subjectSuggestions.innerHTML += `
        <div onclick="selectSubject('${subject.subject_name}')">
        ${subject.subject_name}
        </div>
        `;

    });

});


function selectSubject(name){

    subjectName.value=name;

    subjectSuggestions.innerHTML="";

}



// SAVE SCORE

scoreForm.addEventListener("submit", async(e)=>{

e.preventDefault();

let student =
students.find(
s=>`${s.first_name} ${s.last_name}`===studentName.value
);

let subject =
subjects.find(
s=>s.subject_name===subjectName.value
);

if(!student || !subject){

alert("Student or subject not found");

return;

}

if (
    Number(catScore.value) < 0 ||
    Number(catScore.value) > 30
) {
    alert("CAT score must be between 0 and 30");
    return;
}

if (
    Number(examScore.value) < 0 ||
    Number(examScore.value) > 70
) {
    alert("Exam score must be between 0 and 70");
    return;
}
let body={

student_id:student.id,
subject_id:subject.id,
cat_score:Number(catScore.value),
exam_score:Number(examScore.value)

};


if(editingId==null){

await fetch(API_URL,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(body)
});

}
else{

await fetch(`${API_URL}/${editingId}`,{
method:"PUT",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify(body)
});

editingId=null;

}

alert("Saved");

scoreForm.reset();

});



// SEARCH

async function searchScores() {

    try {

        const mark = document.getElementById("passMark").value;

        if (!mark) {
            alert("Enter pass mark");
            return;
        }

        const response = await fetch(
            `${API_URL}/search/${mark}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch scores");
        }

        const data = await response.json();

        const table = document.getElementById("scoreTable");

        table.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {

            table.innerHTML = `
                <tr>
                    <td colspan="7">
                        No records found
                    </td>
                </tr>
            `;

            return;
        }

        data.forEach(score => {

            table.innerHTML += `
                <tr>

                    <td>
                        ${score.first_name} ${score.last_name}
                    </td>

                    <td>${score.subject_name}</td>

                    <td>${score.cat_score}</td>

                    <td>${score.exam_score}</td>

                    <td>${score.total}</td>

                    <td>${score.grade}</td>

                    <td>

                        <button onclick="
                        editScore(
                            ${score.id},
                            '${score.first_name} ${score.last_name}',
                            '${score.subject_name}',
                            ${score.cat_score},
                            ${score.exam_score}
                        )">
                        Edit
                        </button>

                        <button onclick="deleteScore(${score.id})">
                        Delete
                        </button>

                    </td>

                </tr>
            `;

        });

    }

    catch(error){

        console.log("SEARCH ERROR:", error);

        alert("Failed to load scores");

    }

}

async function viewStudentPerformance(){

    const admission =
    document.getElementById(
        "performanceStudent"
    ).value;

    const res = await fetch(
        `http://localhost:5000/api/scores/performance/${admission}`
    );

    const data = await res.json();

    let html = "";

    data.forEach(score=>{

        html += `
        <p>
        ${score.subject_name}
        :
        ${score.total}
        marks
        (
        ${score.grade}
        )
        </p>
        `;

    });

    document.getElementById(
        "performanceResult"
    ).innerHTML = html;
}

async function viewClassPerformance(){

    const classId =
    document.getElementById(
        "classPerformance"
    ).value;

    const subjectId =
    document.getElementById(
        "subjectPerformance"
    ).value;

     if (!classId || !subjectId) {

        alert("Select both class and subject");

        return;
    }

    try {

    const res =
    await fetch(
    `http://localhost:5000/api/scores/class-performance/${classId}/${subjectId}`
    );

      if (!response.ok) {

            throw new Error("Failed to fetch class performance");

        } 
    const data =
    await res.json();

    let html = "";

    data.forEach(student=>{

         html += `
                <tr>
                    <td>${student.first_name} ${student.last_name}</td>
                    <td>-</td>
                    <td>-</td>
                    <td>-</td>
                    <td>${student.total}</td>
                    <td>-</td>
                    <td>-</td>
                </tr>
            `;
        });

        document.getElementById("scoreTable").innerHTML = html;

    }

    catch(error){

        console.log(error);

        alert("Unable to load class performance");

    }

}

async function loadClasses(){

    const res =
    await fetch("http://localhost:5000/api/classes");

    const classes =
    await res.json();

    const select =
    document.getElementById("classPerformance");

    select.innerHTML =
    `<option value="">Select Class</option>`;

    classes.forEach(c=>{

        select.innerHTML += `
        <option value="${c.id}">
        ${c.stream_name}
        </option>
        `;

    });

}

function clearSearch(){

scoreTable.innerHTML="";
passMark.value="";

}



// DELETE

async function deleteScore(id){

await fetch(`${API_URL}/${id}`,{

method:"DELETE"

});

searchScores();

}



// STATISTICS

async function getStatistics() {

    const subjectId = document.getElementById("statsSubject").value;

    if (!subjectId) {
        alert("Please select a subject");
        return;
    }

    try {

        const response = await fetch(
            `${API_URL}/statistics/${subjectId}`
        );

        if (!response.ok) {
            throw new Error("Failed to fetch statistics");
        }

        const data = await response.json();

        document.getElementById("statistics").innerHTML = `
            <h3>Subject Statistics</h3>

            <p>
                <b>Total Students:</b>
                ${data.total_students}
            </p>

            <p>
                <b>Total Marks:</b>
                ${data.total_marks}
            </p>

            <p>
                <b>Average Marks:</b>
                ${Number(data.average_marks).toFixed(2)}
            </p>
        `;

    }

    catch (error) {

        console.log("STATISTICS ERROR:", error);

        alert("Failed to load statistics");

    }

}

async function loadPerformanceClasses() {

    try {

        const res = await fetch(CLASSES_API);

        const classes = await res.json();

        const select = document.getElementById("classPerformance");

        select.innerHTML =
        `<option value="">Select Class</option>`;

        classes.forEach(c => {

            select.innerHTML += `
                <option value="${c.id}">
                    ${c.stream_name}
                </option>
            `;

        });

    }

    catch(error){

        console.log(error);

    }

}

async function loadPerformanceSubjects() {

    try {

        const res = await fetch(SUBJECTS_API);

        const subjects = await res.json();

        const select =
        document.getElementById("subjectPerformance");

        select.innerHTML =
        `<option value="">Select Subject</option>`;

        subjects.forEach(subject => {

            select.innerHTML += `
                <option value="${subject.id}">
                    ${subject.subject_name}
                </option>
            `;

        });

    }

    catch(error){

        console.log(error);

    }

}

async function viewClassPerformance() {

    const classId =
    document.getElementById("classPerformance").value;

    const subjectId =
    document.getElementById("subjectPerformance").value;

    if (!classId || !subjectId) {

        alert("Select class and subject");

        return;

    }

    try {

        const res = await fetch(
            `${API_URL}/class-performance/${classId}/${subjectId}`
        );

        const data = await res.json();

        let html = `
        <table border="1">
        <tr>
            <th>Student</th>
            <th>Total</th>
        </tr>
        `;

        data.forEach(student => {

            html += `
            <tr>
                <td>
                    ${student.first_name}
                    ${student.last_name}
                </td>

                <td>
                    ${student.total}
                </td>
            </tr>
            `;

        });

        html += "</table>";

        document.getElementById(
            "classPerformanceResult"
        ).innerHTML = html;

    }

    catch(error){

        console.log(error);

        alert("Failed to load class performance");

    }

}

async function viewStudentPerformance() {

    const admission =
    document.getElementById(
        "performanceStudent"
    ).value.trim();

    if (!admission) {

        alert("Enter admission number");

        return;

    }

    try {

        const res = await fetch(
            `${API_URL}/performance/${admission}`
        );

        const data = await res.json();

        let html = `
        <table border="1">
        <tr>
            <th>Subject</th>
            <th>Total</th>
            <th>Grade</th>
        </tr>
        `;

        data.forEach(subject => {

            html += `
            <tr>

                <td>${subject.subject_name}</td>

                <td>${subject.total}</td>

                <td>${subject.grade}</td>

            </tr>
            `;

        });

        html += "</table>";

        document.getElementById(
            "performanceResult"
        ).innerHTML = html;

    }

    catch(error){

        console.log(error);

        alert("Failed to load performance");

    }

}

function clearStatistics() {

    // Reset the subject dropdown
    document.getElementById("statsSubject").selectedIndex = 0;

    // Remove statistics text
    document.getElementById("statistics").innerHTML = "";

}

loadPerformanceClasses();
loadPerformanceSubjects();
