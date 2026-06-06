const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/", (req, res) => {

    const query = `
    SELECT
    (SELECT COUNT(*) FROM students) AS totalStudents,
    (SELECT COUNT(*) FROM class_streams) AS totalClasses,
    (SELECT COUNT(*) FROM subjects) AS totalSubjects
    `;

    db.query(query, (err, result) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(result[0]);

    });

});

module.exports = router;