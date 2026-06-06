const express = require("express");
const router = express.Router();
const db = require("../config/db");


// ================= GET ALL SUBJECTS =================
router.get("/", (req, res) => {

    const sql = `
        SELECT *
        FROM subjects
        ORDER BY subject_name
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

router.get("/all", (req, res) => {

    const sql = `SELECT * FROM subjects`;

    db.query(sql, (err, results) => {

        if (err) {
            return res.status(500).json({ message: "Database error" });
        }

        res.json(results);

    });

});

// ================= SEARCH SUBJECT =================
router.get("/search/:subject_name", (req, res) => {

    const sql = `
        SELECT *
        FROM subjects
        WHERE subject_name = ?
    `;

    db.query(sql, [req.params.subject_name], (err, results) => {

        if (err) {
            console.log(err);
            return res.status(500).json({
                message: "Database error"
            });
        }

        res.json(results);

    });

});

router.post("/assign", (req, res) => {

    const { subject_id, class_id } = req.body;

    if (!subject_id || !class_id) {
        return res.status(400).json({
            message: "Select both subject and class"
        });
    }

    // 🔥 CHECK IF ALREADY ASSIGNED
    const checkSql = `
        SELECT * FROM class_subjects
        WHERE subject_id = ? AND class_id = ?
    `;

    db.query(checkSql, [subject_id, class_id], (err, results) => {

        if (err) {
            return res.status(500).json({
                message: "Database error"
            });
        }

        // ❌ ALREADY EXISTS
        if (results.length > 0) {
            return res.status(400).json({
                message: "Subject already assigned to this class"
            });
        }

        // ✅ INSERT IF NOT EXISTS
        const insertSql = `
            INSERT INTO class_subjects (subject_id, class_id)
            VALUES (?, ?)
        `;

        db.query(insertSql, [subject_id, class_id], (err) => {

            if (err) {
                return res.status(500).json({
                    message: "Assignment failed"
                });
            }

            res.json({
                message: "Subject assigned successfully"
            });

        });

    });

});

// ================= ADD SUBJECT =================
router.post("/", (req, res) => {

    const { subject_name, subject_code } = req.body;

    const checkSql = `
        SELECT *
        FROM subjects
        WHERE subject_name = ?
        OR subject_code = ?
    `;

    db.query(
        checkSql,
        [subject_name, subject_code],
        (err, results) => {

            if (err) {
                console.log(err);
                return res.status(500).json({
                    message: "Database error"
                });
            }

            if (results.length > 0) {

                return res.status(400).json({
                    message: "Subject already exists"
                });

            }

            const sql = `
                INSERT INTO subjects
                (subject_name, subject_code)
                VALUES (?, ?)
            `;

            db.query(
                sql,
                [subject_name, subject_code],
                (err, result) => {

                    if (err) {
                        console.log(err);
                        return res.status(500).json({
                            message: "Database error"
                        });
                    }

                    res.json({
                        message: "Subject added successfully"
                    });

                });

        });

});


// ================= UPDATE SUBJECT =================
router.put("/:id", (req, res) => {

    const id = req.params.id;

    const {
        subject_name,
        subject_code
    } = req.body;

    const sql = `
        UPDATE subjects
        SET
            subject_name = ?,
            subject_code = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            subject_name,
            subject_code,
            id
        ],
        (err, result) => {

            if (err) {

                console.log(err);

                return res.status(500).json({
                    message: "Database error"
                });

            }

            res.json({
                message: "Subject updated successfully"
            });

        });

});


// ================= DELETE SUBJECT =================
router.delete("/:id", (req, res) => {

    const sql = `
        DELETE FROM subjects
        WHERE id = ?
    `;

    db.query(sql, [req.params.id], (err, result) => {

        if (err) {

            console.log(err);

            return res.status(500).json({
                message: "Database error"
            });

        }

        res.json({
            message: "Subject deleted successfully"
        });

    });

});


module.exports = router;