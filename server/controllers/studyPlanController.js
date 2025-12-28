const StudyPlan = require('../models/StudyPlan');

//     Add a new week to the study plan
//   Private (Educator/Coordinator)
const createStudyPlan = async (req, res) => {
    try {
        const { courseId, week, topic, content, resources } = req.body;

        // Check if user is authorized for this course
        const Course = require('../models/Course');
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Check authorization: coordinator or assigned educator
        const isCoordinator = req.user.role === 'coordinator';
        const isAssignedEducator = req.user.role === 'educator' && 
            course.educators.some(edu => edu.toString() === req.user.id);

        if (!isCoordinator && !isAssignedEducator) {
            return res.status(403).json({ 
                message: 'Not authorized to create study plans for this course' 
            });
        }

        const plan = await StudyPlan.create({
            course: courseId,
            week,
            topic,
            content,
            resources
        });

        res.status(201).json(plan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//     Get study plan for a specific course
//  Private (Registered users)
const getStudyPlan = async (req, res) => {
    try {
        // Find all plans for this specific courseId
        const plans = await StudyPlan.find({ course: req.params.courseId });
        res.status(200).json(plans);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//  Delete a study plan
const deleteStudyPlan = async (req, res) => {
    try {
        const plan = await StudyPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });
        
        await plan.deleteOne();
        res.status(200).json({ id: req.params.id });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


// Update a study plan

const updateStudyPlan = async (req, res) => {
    try {
        const plan = await StudyPlan.findById(req.params.id);
        if (!plan) return res.status(404).json({ message: 'Plan not found' });

        // Update fields
        plan.week = req.body.week || plan.week;
        plan.topic = req.body.topic || plan.topic;
        plan.content = req.body.content || plan.content;
        plan.resources = req.body.resources || plan.resources;

        const updatedPlan = await plan.save();
        res.status(200).json(updatedPlan);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { createStudyPlan, getStudyPlan, deleteStudyPlan, updateStudyPlan };