const express = require("express");
const router = express.Router();
const db = require("../config/db");

// ================= GET REPORT =================
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
            console.log(err);
            return res.status(500).json({ message: "DB error" });
        }

        // IMPORTANT FIX (this is why you saw "student not found")
        if (!result || result.length === 0 || !result[0].student_id) {
            return res.status(404).json({ message: "Student not found" });
        }

        let totalMarks = 0;

        result.forEach(r => {
            totalMarks += Number(r.total || 0);
        });

        const average = totalMarks / result.length;

        let grade = "E";
        if (average >= 80) grade = "A";
        else if (average >= 70) grade = "B";
        else if (average >= 60) grade = "C";
        else if (average >= 50) grade = "D";

        res.json({
            student: `${result[0].first_name} ${result[0].last_name}`,
            admission_no: result[0].admission_no,
            class: result[0].class_name || "Not Assigned",
            data: result,
            totalMarks,
            average: average.toFixed(2),
            grade
        });
    });
});

router.get("/search/:mark", (req, res) => {

    const mark = req.params.mark;

    const sql = `
        SELECT
            scores.id,
            students.first_name,
            students.last_name,
            subjects.subject_name,
            scores.cat_score,
            scores.exam_score,
            scores.total,

            CASE
                WHEN scores.total >= 80 THEN 'A'
                WHEN scores.total >= 70 THEN 'B'
                WHEN scores.total >= 60 THEN 'C'
                WHEN scores.total >= 50 THEN 'D'
                ELSE 'E'
            END AS grade

        FROM scores

        JOIN students
            ON scores.student_id = students.id

        JOIN subjects
            ON scores.subject_id = subjects.id

        WHERE scores.total >= ?
    `;

    db.query(sql,[mark],(err,result)=>{

        if(err){
            console.log(err);
            return res.status(500).json({
                message:"Database error"
            });
        }

        res.json(result);

    });

});

// ================= SUBJECT STATISTICS =================
router.get("/statistics/:subjectId", (req, res) => {

    const subjectId = req.params.subjectId;

    const sql = `
        SELECT
            COUNT(scores.id) AS total_students,
            SUM(scores.total) AS total_marks,
            AVG(scores.total) AS average_marks
        FROM scores
        WHERE scores.subject_id = ?
    `;

    db.query(sql, [subjectId], (err, result) => {

        if (err) {
            console.log(err);

            return res.status(500).json({
                message: "Database error"
            });
        }

        res.json({
            total_students: result[0].total_students || 0,
            total_marks: result[0].total_marks || 0,
            average_marks: result[0].average_marks || 0
        });

    });

});
router.get(
"/performance/:admission",
(req,res)=>{

const admission =
req.params.admission;

const sql = `
SELECT
subjects.subject_name,
scores.total,
scores.grade
FROM scores
JOIN students
ON scores.student_id = students.id
JOIN subjects
ON scores.subject_id = subjects.id
WHERE students.admission_no = ?
`;

db.query(
sql,
[admission],
(err,result)=>{

if(err)
return res.status(500).json(err);

res.json(result);

});

});

router.get(
"/class-performance/:classId/:subjectId",
(req,res)=>{

const classId = req.params.classId;
const subjectId = req.params.subjectId;

const sql = `
SELECT
students.first_name,
students.last_name,
scores.total
FROM scores
JOIN students
ON scores.student_id = students.id
WHERE students.class_id = ?
AND scores.subject_id = ?
ORDER BY scores.total DESC
`;

db.query(
sql,
[classId,subjectId],
(err,result)=>{

if(err)
return res.status(500).json({
        message:"Database error"
    });

res.json(result);

});

});

// ================= ADD SCORE =================
router.post("/", (req, res) => {

    const {
        student_id,
        subject_id,
        cat_score,
        exam_score
    } = req.body;

    const total =
        Number(cat_score) + Number(exam_score);

    // Check duplicate score
    const checkSql = `
        SELECT *
        FROM scores
        WHERE student_id = ?
        AND subject_id = ?
    `;

    db.query(
        checkSql,
        [student_id, subject_id],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Database error"
                });

            }

            // Student already has marks for this subject
            if (result.length > 0) {

                return res.status(400).json({
                    message:
                    "This student already has marks for this subject"
                });

            }

            // Calculate grade
            let grade = "E";

            if (total >= 80)
                grade = "A";

            else if (total >= 70)
                grade = "B";

            else if (total >= 60)
                grade = "C";

            else if (total >= 50)
                grade = "D";

            // Save score
            const insertSql = `
                INSERT INTO scores
                (
                    student_id,
                    subject_id,
                    cat_score,
                    exam_score,
                    total,
                    grade
                )
                VALUES (?, ?, ?, ?, ?, ?)
            `;

            db.query(
                insertSql,
                [
                    student_id,
                    subject_id,
                    cat_score,
                    exam_score,
                    total,
                    grade
                ],
                (err, result) => {

                    if (err) {

                        console.log(err);

                        return res.status(500).json({
                            message: "Failed to save score"
                        });

                    }

                    res.json({
                        message:
                        "Score saved successfully"
                    });

                });

        });

});

// ================= UPDATE SCORE =================
router.put("/:id", (req, res) => {

    const id = req.params.id;

    const {
        student_id,
        subject_id,
        cat_score,
        exam_score
    } = req.body;

    const total =
        Number(cat_score) + Number(exam_score);

    let grade = "E";

    if (total >= 80)
        grade = "A";
    else if (total >= 70)
        grade = "B";
    else if (total >= 60)
        grade = "C";
    else if (total >= 50)
        grade = "D";

    const sql = `
        UPDATE scores
        SET
            student_id = ?,
            subject_id = ?,
            cat_score = ?,
            exam_score = ?,
            total = ?,
            grade = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            student_id,
            subject_id,
            cat_score,
            exam_score,
            total,
            grade,
            id
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Update failed"
                });

            }

            res.json({
                message:
                "Score updated successfully"
            });

        });

});

// ================= DELETE SCORE =================
router.delete("/:id", (req, res) => {

    const id = req.params.id;

    const sql = `
        DELETE FROM scores
        WHERE id = ?
    `;

    db.query(
        sql,
        [id],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Delete failed"
                });

            }

            res.json({
                message:
                "Score deleted successfully"
            });

        });

});


module.exports = router;