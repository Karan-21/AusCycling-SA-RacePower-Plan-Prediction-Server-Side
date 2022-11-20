const admin = require("../../services/Admin.service");

/**
 * POST /course - Creates a new course.
 *
 * @returns
 */
const addCourse = async (req, res) => {
    const { userId, courseName, courseVisibility, courseData } = req.body;

    try {
        const newCourseRef = await admin.firestore().collection("Course").doc();
        await newCourseRef.set({
            user_id: userId,
            created_at: Math.floor(Date.now() / 1000),
            course_name: courseName,
            course_visibility: courseVisibility,
            course_data: courseData,
        });

        res.status(200).send("Successfully Added Course.");
    } catch (err) {
        console.log(err);
        res.status(500).send("Bad Request.");
    }
};

module.exports = addCourse;
