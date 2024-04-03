const { Types: { ObjectId } } = require('mongoose');
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
//get jobApplication Available 
const getAvailableJobsApplications = async (req, res) => {
    try {
        const today = new Date();
        const jobs = await Job.find({
            jobApplicationDeadline: { $gt: today },
            jobApplications: { $exists: true, $not: { $size: 0 } },
            jobCommpanyName: { $exists: true },
        }).select('jobCommpanyName jobTitle jobApplicationDeadline jobApplications');
        
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching available jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//get jobApplication Not Available
const getUnavailableJobsApplications = async (req, res) => {
    try {
        const today = new Date();
        const jobs = await Job.find({
            jobApplicationDeadline: { $lt: today },
            jobApplications: { $exists: true, $not: { $size: 0 } },
            jobCommpanyName: { $exists: true },
        }).select('jobCommpanyName jobTitle jobApplicationDeadline jobApplications');
        
        res.status(200).json(jobs);
    } catch (error) {
        console.error('Error fetching unavailable jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

//delete application par son id 
// const deleteJobApplicationById = async (jobId, applicationId) => {
//     try {
//         if (!jobId || !applicationId || !ObjectId.isValid(jobId) || !ObjectId.isValid(applicationId)) {
//             throw new Error("Invalid job or application ID");
//         }

//         const job = await Job.findByIdAndUpdate(jobId, {
//             $pull: { jobApplications: applicationId }
//         });
//         if (!job) {
//             throw new Error("Job not found");
//         }

//         const application = await Application.findByIdAndDelete(applicationId);
//         if (!application) {
//             throw new Error("Application not found");
//         }

//         return { message: "Application deleted successfully" };
//     } catch (error) {
//         console.error("Error deleting application:", error);
//         throw new Error("Internal server error");
//     }
// };
module.exports = { 
    saveApplication,
    getAvailableJobsApplications,
    getUnavailableJobsApplications,
    
 };
