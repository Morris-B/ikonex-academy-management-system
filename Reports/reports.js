const API_URL = "http://localhost:5000/api/reports";

document.getElementById("reportForm")
.addEventListener("submit", async (e) => {

    e.preventDefault();

    const admission =
        document.getElementById("admissionNo")
        .value
        .trim();

    if (!admission) {

        alert("Enter admission number");

        return;

    }

    try {

        const response = await fetch(
            `http://localhost:5000/api/reports/student/${admission}`
        );

        if (!response.ok) {

            throw new Error(
                "Server returned " + response.status
            );

        }

        const data = await response.json();

        console.log(data);

        renderReport(data);

    }

    catch(error){

        console.error(
            "REPORT ERROR:",
            error
        );

        document.getElementById(
            "reportCard"
        ).innerHTML =
        "<p>Cannot connect to reports server</p>";

        alert(
            "Cannot connect to reports server"
        );

    }

});
function renderReport(data) {

const container = document.getElementById("reportCard");

container.innerHTML = `
<div id="reportContent">

    <h2>STUDENT REPORT CARD</h2>

    <p><strong>Name:</strong> ${data.student}</p>

    <p><strong>Admission No:</strong> ${data.admission_no}</p>

    <p><strong>Class:</strong> ${data.class}</p>

    <hr>

    <table border="1" width="100%">
        <thead>
            <tr>
                <th>Subject</th>
                <th>CAT</th>
                <th>Exam</th>
                <th>Total</th>
            </tr>
        </thead>

        <tbody>

        ${data.data.map(r => `
            <tr>
                <td>${r.subject_name || "-"}</td>
                <td>${r.cat_score || 0}</td>
                <td>${r.exam_score || 0}</td>
                <td>${r.total || 0}</td>
            </tr>
        `).join("")}

        </tbody>

    </table>

    <hr>

    <h3>Total Marks: ${data.totalMarks}</h3>

    <h3>Average: ${data.average}</h3>

    <h3>Grade: ${data.grade}</h3>

</div>

<br>

<button onclick="generatePDF()">
    Download PDF
</button>
`;

}

async function loadClasses() {

    const res =
    await fetch("http://localhost:5000/api/classes");

    const classes = await res.json();

    const select =
    document.getElementById("classReport");

    classes.forEach(cls => {

        select.innerHTML += `
            <option value="${cls.id}">
                ${cls.stream_name}
            </option>
        `;

    });

}

loadClasses();

async function generateClassReport() {

    const classId =
    document.getElementById("classReport").value;

    if (!classId) {

        alert("Select a class");

        return;

    }

    const res =
    await fetch(
        `http://localhost:5000/api/reports/class/${classId}`
    );

    const data = await res.json();

    let html = `

    <div class="report-card">

    <h2>Class Performance Report</h2>

    <table border="1" width="100%">

    <tr>

        <th>Admission No</th>
        <th>Name</th>
        <th>Total Marks</th>
        <th>Average</th>
        <th>Grade</th>

    </tr>
    `;

    data.forEach(student => {

        html += `

        <tr>

            <td>${student.admission_no}</td>

            <td>
                ${student.first_name}
                ${student.last_name}
            </td>

            <td>${student.total_marks}</td>

            <td>${student.average_marks}</td>

            <td>${student.grade}</td>

        </tr>

        `;

    });

    html += "</table></div>";

    document.getElementById(
        "classReportCard"
    ).innerHTML = html;

}

function downloadClassPDF() {

    const element =
    document.getElementById("classReportCard");

    html2pdf()
        .from(element)
        .save("Class_Performance_Report.pdf");

}

function generatePDF() {

const element = document.getElementById("reportContent");

html2pdf()
    .set({
        margin: 0.5,
        filename: "student-report-card.pdf",
        image: {
            type: "jpeg",
            quality: 0.98
        },
        html2canvas: {
            scale: 2
        },
        jsPDF: {
            unit: "in",
            format: "a4",
            orientation: "portrait"
        }
    })
    .from(element)
    .save();

}
