const Course = require('../models/Course');
const User = require('../models/User');
const Notification = require('../models/Notification');

// Get all courses
const getCourses = async (req, res) => {
    try {
        const courses = await Course.find()
            .populate('coordinator', 'name email')
            .populate('educators', 'name email')
            .sort({ createdAt: -1 });
        res.status(200).json(courses);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Create a new course
const createCourse = async (req, res) => {
    try {
        const { title, description, category, price, thumbnail } = req.body;
        
        // 1. Create the Course
        const course = await Course.create({
            title, description, category, price, thumbnail,
            coordinator: req.user.id
        });

        // 2. TRIGGER NOTIFICATION: Find all Learners
        const learners = await User.find({ role: 'learner' });
        
        // Professional category labels
        const getCategoryLabel = (category) => {
            switch (category) {
                case 'Development': return 'Software Development';
                case 'Design': return 'Graphic Design';
                case 'Business': return 'Business & Finance';
                default: return category;
            }
        };
        
        if (learners.length > 0) {
            const notifications = learners.map(user => ({
                userId: user._id,
                message: `📢 New Course Alert: "${title}" is now available in ${getCategoryLabel(category)}!`,
                type: 'info'
            }));
            
            await Notification.insertMany(notifications);
        }

        res.status(201).json(course);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// const createCourse = async (req, res) => {
//     try {
//         const { title, description, category, price, thumbnail } = req.body;
        
//         console.log("Step 1: Creating Course..."); 

//         const course = await Course.create({
//             title, description, category, price, thumbnail,
//             coordinator: req.user.id
//         });

//         console.log("Step 2: Course Created. Finding Learners..."); 

//         // TRIGGER NOTIFICATION
    
//         const learners = await User.find({ role: 'learner' });
        
//         console.log(`Step 3: Found ${learners.length} learners.`); 

//         if (learners.length > 0) {
//             const notifications = learners.map(user => ({
//                 userId: user._id,
//                 message: `📢 New Course Alert: "${title}" is now available in ${category}!`,
//                 type: 'info'
//             }));
            
//             await Notification.insertMany(notifications);
//             console.log("Step 4: Notifications saved to Database."); 
//         } else {
//             console.log("Step 4: No learners found to notify."); 
//         }

//         res.status(201).json(course);
//     } catch (error) {
//         console.error("Error in createCourse:", error); 
//         res.status(500).json({ message: error.message });
//     }
// };

//Update a course
const updateCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Check ownership
        if (course.coordinator.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedCourse);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Delete a course
const deleteCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        if (course.coordinator.toString() !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await course.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Enroll Student (Mock Payment Success)
const enrollCourse = async (req, res) => {
    try {
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Add student to enrolled list if not already there
        if (!course.enrolledStudents.includes(req.user.id)) {
            course.enrolledStudents.push(req.user.id);
            await course.save();
        }
        res.status(200).json({ message: 'Enrolled successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Assign educator to course
const assignEducator = async (req, res) => {
    try {
        const { educatorId } = req.body;
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Check if coordinator or admin
        if (course.coordinator.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Check if educator exists and has role educator
        const educator = await User.findById(educatorId);
        if (!educator || educator.role !== 'educator') {
            return res.status(400).json({ message: 'Invalid educator' });
        }

        // Add educator if not already assigned
        if (!course.educators.includes(educatorId)) {
            course.educators.push(educatorId);
            await course.save();

            // Notify educator
            await Notification.create({
                userId: educatorId,
                message: `You have been assigned as an educator for the course "${course.title}"`,
                type: 'success'
            });
        }
        res.status(200).json({ message: 'Educator assigned successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Unassign educator from course
const unassignEducator = async (req, res) => {
    try {
        const { educatorId } = req.body;
        const course = await Course.findById(req.params.id);
        if (!course) return res.status(404).json({ message: 'Course not found' });

        // Check if coordinator or admin
        if (course.coordinator.toString() !== req.user.id && req.user.role !== 'admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        // Remove educator
        course.educators = course.educators.filter(id => id.toString() !== educatorId);
        await course.save();

        res.status(200).json({ message: 'Educator unassigned successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getCourses, createCourse, updateCourse, deleteCourse, enrollCourse, assignEducator, unassignEducator };