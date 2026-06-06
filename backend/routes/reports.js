const express = require("express");
const router = express.Router();
const db = require("../config/db");

router.get("/student/:admission", (req, res) => {

const admission = req.params.admission;

const sql = `
    SELECT
        s.id AS student_id,
        s.first_name,
        s.last_name,
        s.admission_no,
        cs.stream_name,
        sub.subject_name,
        sc.cat_score,
        sc.exam_score,
        sc.total
    FROM students s
    LEFT JOIN scores sc
        ON sc.student_id = s.id
    LEFT JOIN subjects sub
        ON sc.subject_id = sub.id
    LEFT JOIN class_streams cs
        ON s.class_id = cs.id
    WHERE TRIM(s.admission_no) = TRIM(?)
`;

db.query(sql, [admission], (err, result) => {

    if (err) {
        return res.status(500).json({
            message: "Database error",
            err
        });
    }

    if (!result || result.length === 0) {
        return res.status(404).json({
            message: "Student not found"
        });
    }

    let totalMarks = 0;

    result.forEach(r => {
        totalMarks += Number(r.total || 0);
    });

    const average = result.length > 0
        ? totalMarks / result.length
        : 0;

    let grade = "E";

    if (average >= 80) grade = "A";
    else if (average >= 70) grade = "B";
    else if (average >= 60) grade = "C";
    else if (average >= 50) grade = "D";

    res.json({
        student: `${result[0].first_name} ${result[0].last_name}`,
        admission_no: result[0].admission_no,
        class: result[0].stream_name || "Not Assigned",
        data: result,
        totalMarks,
        average: average.toFixed(2),
        grade
    });

});

});

router.get("/class/:id", (req, res) => {

    const classId = req.params.id;

    const sql = `
        SELECT
            s.admission_no,
            s.first_name,
            s.last_name,
            SUM(sc.total) AS total_marks,
            ROUND(AVG(sc.total),2) AS average_marks,

            CASE
                WHEN AVG(sc.total)>=80 THEN 'A'
                WHEN AVG(sc.total)>=70 THEN 'B'
                WHEN AVG(sc.total)>=60 THEN 'C'
                WHEN AVG(sc.total)>=50 THEN 'D'
                ELSE 'E'
            END AS grade

        FROM students s

        JOIN scores sc
            ON s.id = sc.student_id

        WHERE s.class_id = ?

        GROUP BY s.id

        ORDER BY average_marks DESC
    `;

    db.query(sql, [classId], (err, result) => {

        if (err) {
            return res.status(500).json(err);
        }

        // ✅ ADD RANKING HERE (CORRECT PLACE)
        result.forEach((student, index) => {
            student.position = index + 1;
        });

        res.json(result);
    });

});
router.get(
"/subject-position/:subjectId/:classId",
(req,res)=>{

const subjectId = req.params.subjectId;
const classId = req.params.classId;

const sql = `
SELECT
students.first_name,
students.last_name,
scores.total

FROM scores

JOIN students
ON scores.student_id = students.id

WHERE scores.subject_id = ?
AND students.class_id = ?

ORDER BY scores.total DESC
`;

db.query(
sql,
[subjectId,classId],
(err,result)=>{

if(err)
return res.status(500).json(err);

result.forEach((student,index)=>{

student.position = index + 1;

});

res.json(result);

});

});

module.exports = router;
