const API_URL = "http://localhost:5000/api/dashboard";

document.addEventListener("DOMContentLoaded", loadDashboard);

async function loadDashboard() {

    try {

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error("Unable to fetch dashboard data");
        }

        const data = await response.json();

        document.getElementById("totalStudents").textContent =
            data.totalStudents;

        document.getElementById("totalClasses").textContent =
            data.totalClasses;

        document.getElementById("totalSubjects").textContent =
            data.totalSubjects;

    }

    catch (error) {

        console.error("Dashboard Error:", error);

    }

}