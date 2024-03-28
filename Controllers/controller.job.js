const Job = require('../Models/job');
const User = require('../Models/user');

///////////////////////////////////////// ADD JOB////////////////////////////////////////////////
const AddJob = async (req, res) => {
    try {
        const username = req.params.username;
        const { jobCommpanyName, jobTitle, jobAdress, jobLocation, jobDescription, salary, jobfield, jobStartDate, jobApplicationDeadline, jobRequiredSkills, jobRequiredEducation, jobRequiredExperience, jobOtherInformation, jobPost, jobImage } = req.body;
        
        // Créez d'abord l'instance de Job
        const newJob = new Job({
            jobCommpanyName,
            jobTitle,
            jobAdress,
            jobLocation,
            jobDescription,
            salary,
            jobfield,
            jobStartDate,
            jobApplicationDeadline,
            jobRequiredSkills,
            jobRequiredEducation,
            jobRequiredExperience,
            jobOtherInformation:'',
            jobPost,
            jobImage,
        });
        
        // Enregistrez le nouvel emploi dans la collection des emplois (jobs)
        const savedJob = await newJob.save();

        // Récupérez l'ID du nouvel emploi sauvegardé
        const jobId = savedJob._id;

        // Ensuite, mettez à jour l'utilisateur pour ajouter le nouvel emploi avec le même ID
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            {
                $push: {
                    job: {
                        _id: jobId, // Utilisez le même ID pour référencer l'emploi
                        jobCommpanyName,
                        jobTitle,
                        jobAdress,
                        jobLocation,
                        jobDescription,
                        salary,
                        jobfield,
                        jobStartDate,
                        jobApplicationDeadline,
                        jobRequiredSkills,
                        jobRequiredEducation,
                        jobRequiredExperience,
                        jobOtherInformation,
                        jobPost,
                        jobImage,
                    }
                }
            },
            { new: true }
        );

        res.json({ success: true, data: updatedUser });
    } catch (error) {
        console.error('Erreur :', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}


const getAllJobs = async (req, res) => {
    try {
        let filters = {};

        if (req.query.location) {
            filters.jobLocation = req.query.location;
        }

        if (req.query.jobExperience) {
            filters.jobRequiredExperience = req.query.jobExperience;
        }

        if (req.query.jobField) {
            filters.jobfield = req.query.jobField;
        }
        const jobs = await Job.find(filters);
        res.json(jobs);
    } catch (error) {
        console.error('Error fetching jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const searchJobs = async (req, res) => {
    try {
        const query = req.query.query.toLowerCase();
        // Use Mongoose to find jobs that match the query
        const filteredJobs = await Job.find({
            $or: [
                { jobTitle: { $regex: query, $options: 'i' } }, // Case-insensitive search for jobTitle
                { jobPost: { $regex: query, $options: 'i' } }   // Case-insensitive search for jobPost
            ]
        });
        res.json(filteredJobs);
    } catch (error) {
        console.error('Error searching for jobs:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const getJobById = async (req, res) => {
    try {
        const jobId = req.params.jobId;
        const foundJob = await Job.findById(jobId);
        if (!foundJob) {
            return res.status(404).json({ error: 'Job offer not found' });
        }
        res.json(foundJob);
    } catch (error) {
        console.error('Error fetching job offer by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

///////////////////////////// Update JOB/////////////////////////////////////////
const UpdateJob = async (req, res) => {
    try {
        const jobId = req.params.jobId; // Extract job ID from request parameters
        const updateFields = req.body; // Extract updated fields from request body

        // Find the job by ID and update it with the new fields
        const updatedJob = await Job.findByIdAndUpdate(jobId, updateFields, { new: true });

        if (!updatedJob) {
            return res.status(404).json({ error: 'Job offer not found' });
        }

        // Update the job in the user's job array
        const updatedUser = await User.findOneAndUpdate(
            { 'job._id': jobId }, // Match user by job ID
            { $set: { 'job.$': updatedJob } }, // Update the matched job in the user's job array
            { new: true }
        );

        res.json({ success: true, data: { updatedJob, updatedUser } });
    } catch (error) {
        console.error('Error updating job offer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




module.exports = {
    AddJob,
    getAllJobs,
    searchJobs,
    getJobById,
    UpdateJob,
}
