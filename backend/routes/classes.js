const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ======================================
// GET ALL CLASSES WITH TOTAL STUDENTS
// ======================================
router.get("/", (req, res) => {

    const sql = `
        SELECT
            class_streams.id,
            class_streams.stream_name,
            COUNT(students.id) AS total_students
        FROM class_streams
        LEFT JOIN students
            ON class_streams.id = students.class_id
        GROUP BY class_streams.id
        ORDER BY class_streams.stream_name
    `;

    db.query(sql, (err, results) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Database error"
            });
        }

        res.json(results);

    });

});


// ======================================
// SEARCH CLASS BY NAME
// ======================================
router.get("/search/:stream_name", (req, res) => {

    const stream_name = req.params.stream_name;

    const sql = `
        SELECT
            class_streams.id,
            class_streams.stream_name,
            COUNT(students.id) AS total_students
        FROM class_streams
        LEFT JOIN students
            ON class_streams.id = students.class_id
        WHERE class_streams.stream_name = ?
        GROUP BY class_streams.id
    `;

    db.query(sql, [stream_name], (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database error"
            });

        }

        res.json(results);

    });

});


router.get("/details/:id", (req, res) => {

    const classId = req.params.id;

    const sql = `
        SELECT 
            c.id,
            c.stream_name,
            COUNT(s.id) AS total_students
        FROM class_streams c
        LEFT JOIN students s ON s.class_id = c.id
        WHERE c.id = ?
        GROUP BY c.id
    `;

    db.query(sql, [classId], (err, results) => {

        if (err) {
            console.log(err);
            return res.status(500).json({ message: "Database error" });
        }

        if (results.length === 0) {
            return res.status(404).json({ message: "Class not found" });
        }

        res.json(results[0]);

    });

});

// ======================================
// ADD CLASS
// ======================================
router.post("/", (req, res) => {

    const { stream_name } = req.body;

    const checkSql = `
        SELECT *
        FROM class_streams
        WHERE stream_name = ?
    `;

    db.query(checkSql, [stream_name], (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database error"
            });

        }

        // Prevent duplicate classes
        if (results.length > 0) {

            return res.status(400).json({
                message: "Class already exists"
            });

        }

        const insertSql = `
            INSERT INTO class_streams
            (stream_name)
            VALUES (?)
        `;

        db.query(insertSql, [stream_name], (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Database error"
                });

            }

            res.json({
                message: "Class added successfully"
            });

        });

    });

});


// ======================================
// UPDATE CLASS
// ======================================
router.put("/:id", (req, res) => {

    const id = req.params.id;
    const { stream_name } = req.body;

    // Prevent duplicate names except itself
    const checkSql = `
        SELECT *
        FROM class_streams
        WHERE stream_name = ?
        AND id <> ?
    `;

    db.query(checkSql, [stream_name, id], (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database error"
            });

        }

        if (results.length > 0) {

            return res.status(400).json({
                message: "Another class with that name already exists"
            });

        }

        const sql = `
            UPDATE class_streams
            SET stream_name = ?
            WHERE id = ?
        `;

        db.query(sql, [stream_name, id], (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Database error"
                });

            }

            res.json({
                message: "Class updated successfully"
            });

        });

    });

});

router.get("/students/:id", (req, res) => {

    const classId = req.params.id;

    const sql = `
        SELECT 
            id,
            admission_no,
            first_name,
            last_name
        FROM students
        WHERE class_id = ?
    `;

    db.query(sql, [classId], (err, results) => {

        if (err) {
            return res.status(500).json(err);
        }

        res.json(results);

    });

});

// ======================================
// DELETE CLASS
// ======================================
router.delete("/:id", (req, res) => {

    const id = req.params.id;

    // Check whether students belong to this class
    const checkSql = `
        SELECT *
        FROM students
        WHERE class_id = ?
    `;

    db.query(checkSql, [id], (err, results) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database error"
            });

        }

        if (results.length > 0) {

            return res.status(400).json({
                message: "Cannot delete class because students are assigned to it"
            });

        }

        const deleteSql = `
            DELETE FROM class_streams
            WHERE id = ?
        `;

        db.query(deleteSql, [id], (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Database error"
                });

            }

            res.json({
                message: "Class deleted successfully"
            });

        });

    });

});


module.exports = router;