
const db = require("../config/db");

// Get all events
const getAllEvents = (req, res) => {
    const sql = `
        SELECT e.*, u.name AS admin_name
        FROM events e
        LEFT JOIN users u ON e.created_by = u.id
        ORDER BY e.event_date ASC
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch events"
            });
        }

        res.json(results);
    });
};

// Get one event
const getEventById = (req, res) => {
    const sql = "SELECT * FROM events WHERE id = ?";

    db.query(sql, [req.params.id], (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({
                message: "Failed to fetch event"
            });
        }

        if (results.length === 0) {
            return res.status(404).json({
                message: "Event not found"
            });
        }

        res.json(results[0]);
    });
};

// Create an event (admin only; route must apply auth and admin middleware)
const createEvent = (req, res) => {
    const {
        title,
        description,
        event_date,
        location,
        capacity
    } = req.body;

    if (!title || !event_date) {
        return res.status(400).json({
            message: "Title and event date are required"
        });
    }

    const eventCapacity = capacity === undefined ? 100 : Number(capacity);

    if (!Number.isInteger(eventCapacity) || eventCapacity < 1) {
        return res.status(400).json({
            message: "Capacity must be a positive whole number"
        });
    }

    const sql = `
        INSERT INTO events
        (title, description, event_date, location, capacity, created_by)
        VALUES (?, ?, ?, ?, ?, ?)
    `;

    db.query(
        sql,
        [
            title,
            description || null,
            event_date,
            location || null,
            eventCapacity,
            req.user.id
        ],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Failed to create event"
                });
            }

            res.status(201).json({
                message: "Event created successfully",
                eventId: result.insertId
            });
        }
    );
};

// Update an event (admin only; route must apply auth and admin middleware)
const updateEvent = (req, res) => {
    const {
        title,
        description,
        event_date,
        location,
        capacity
    } = req.body;

    if (!title || !event_date) {
        return res.status(400).json({
            message: "Title and event date are required"
        });
    }

    const eventCapacity = Number(capacity);

    if (!Number.isInteger(eventCapacity) || eventCapacity < 1) {
        return res.status(400).json({
            message: "Capacity must be a positive whole number"
        });
    }

    const sql = `
        UPDATE events
        SET title = ?, description = ?, event_date = ?,
            location = ?, capacity = ?
        WHERE id = ?
    `;

    db.query(
        sql,
        [
            title,
            description || null,
            event_date,
            location || null,
            eventCapacity,
            req.params.id
        ],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Failed to update event"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Event not found"
                });
            }

            res.json({
                message: "Event updated successfully"
            });
        }
    );
};

// Delete an event (admin only; route must apply auth and admin middleware)
const deleteEvent = (req, res) => {
    db.query(
        "DELETE FROM events WHERE id = ?",
        [req.params.id],
        (err, result) => {
            if (err) {
                console.error(err);
                return res.status(500).json({
                    message: "Failed to delete event"
                });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({
                    message: "Event not found"
                });
            }

            res.json({
                message: "Event deleted successfully"
            });
        }
    );
};

module.exports = {
    getAllEvents,
    getEventById,
    createEvent,
    updateEvent,
    deleteEvent
};
