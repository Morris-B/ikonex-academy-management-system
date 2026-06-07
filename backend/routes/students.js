const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ===================================
// GET ALL STUDENTS
// ===================================
router.get("/", (req, res) => {

    const sql = `
        SELECT
            students.id,
            students.admission_no,
            students.first_name,
            students.last_name,
            students.class_id,
            class_streams.stream_name
        FROM students
        LEFT JOIN class_streams
            ON students.class_id = class_streams.id
    `;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(results);

    });

});


// ===================================
// SEARCH STUDENT
// ===================================
router.get("/search/:admission_no", (req, res) => {

    const admission_no = req.params.admission_no;

    const sql = `
        SELECT
            students.id,
            students.admission_no,
            students.first_name,
            students.last_name,
            students.class_id,
            class_streams.stream_name
        FROM students
        LEFT JOIN class_streams
            ON students.class_id = class_streams.id
        WHERE students.admission_no = ?
    `;

    db.query(sql, [admission_no], (err, results) => {

        if (err) {
            return res.status(500).json(err);
        }

        if (results.length === 0) {
    return res.status(404).json({ message: "Student not found" });
}

res.json(results[0]);

    });

});


// ===================================
// VIEW STUDENTS BY CLASS
// ===================================
router.get("/class/:id", (req, res) => {

    const classId = req.params.id;

    const sql = `
        SELECT
            students.id,
            students.admission_no,
            students.first_name,
            students.last_name,
            students.class_id,
            class_streams.stream_name
        FROM students
        LEFT JOIN class_streams
            ON students.class_id = class_streams.id
        WHERE students.class_id = ?
    `;

    db.query(sql, [classId], (err, results) => {

        if (err) {
            console.log(err);
            return res.status(500).json(err);
        }

        res.json(results);

    });

});


// ===================================
// ADD STUDENT
// ===================================
router.post("/", (req, res) => {

    const {
        admission_no,
        first_name,
        last_name,
        class_id
    } = req.body;

    const sql = `
        INSERT INTO students
        (
            admission_no,
            first_name,
            last_name,
            class_id
        )
        VALUES (?, ?, ?, ?)
    `;

    db.query(
        sql,
        [admission_no, first_name, last_name, class_id],
        (err) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "Student added successfully"
            });

        }
    );

});


// ===================================
// UPDATE
// ===================================
router.put("/:id", (req, res) => {

    const id = req.params.id;

    const {
        admission_no,
        first_name,
        last_name,
        class_id
    } = req.body;

    const sql = `
        UPDATE students
        SET
            admission_no=?,
            first_name=?,
            last_name=?,
            class_id=?
        WHERE id=?
    `;

    db.query(
        sql,
        [
            admission_no,
            first_name,
            last_name,
            class_id,
            id
        ],
        (err) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "Student updated successfully"
            });

        }
    );

});


// ===================================
// DELETE
// ===================================
router.delete("/:id", (req, res) => {

    db.query(
        "DELETE FROM students WHERE id=?",
        [req.params.id],
        (err) => {

            if (err) {
                return res.status(500).json(err);
            }

            res.json({
                message: "Student deleted successfully"
            });

        }
    );

});

module.exports = router;