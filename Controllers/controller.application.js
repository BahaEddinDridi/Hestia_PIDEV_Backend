const Application = require('../Models/Application');
const User = require('../Models/user');
const Job = require('../Models/job');

const saveApplication = async (req, res) => {
    try {
        const { fullName, email, phoneNumber,applicantUsername, motivationLetter, resume, userId, jobId } = req.body;

        const job = await Job.findById(jobId).populate('jobApplications');
        const userHasApplied = job.jobApplications.some(application => application.applicantUsername === applicantUsername);
        if (userHasApplied) {
            return res.status(400).json({ error: 'User has already applied for this job' });
        }

        const user = await User.findById(userId);

        const newApplication = new Application({
            fullName,
            email,
            phoneNumber,
            applicantUsername,
            submitDate : new Date(),
            motivationLetter,
            resume,
        });
        await newApplication.save();

        user.applications.push(newApplication);
        job.jobApplications.push(newApplication);


        await Promise.all([user.save(),job.save()]);
        res.status(201).json({ message: 'Application saved successfully' });
    } catch (error) {
        console.error('Error saving application:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = { saveApplication };
