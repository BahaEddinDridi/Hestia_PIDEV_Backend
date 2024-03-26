const job = require('../Models/job');
const User = require('../Models/user');


const AddJob = async (req, res) => {
    try {
        const username = req.params.username;
        const { jobTitle, jobAdress, jobLocation, jobDescription, salary, jobfield, jobStartDate, jobApplicationDeadline, jobRequiredSkills, jobRequiredEducation, jobRequiredExperience, jobOtherInformation, jobPost } = req.body;
        
        // Créez d'abord l'instance de Job
        const newJob = new job({
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
        });
        
        // Enregistrez le nouvel emploi dans la collection des emplois (jobs)
        await newJob.save();

        // Ensuite, mettez à jour l'utilisateur pour ajouter le nouvel emploi
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            {
                $push: {
                    job: {
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
        const jobs = await job.find(filters);
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
        const filteredJobs = await job.find({
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
        const foundJob = await job.findById(jobId);
        if (!foundJob) {
            return res.status(404).json({ error: 'Job offer not found' });
        }
        res.json(foundJob);
    } catch (error) {
        console.error('Error fetching job offer by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = {
    AddJob,
    getAllJobs,
    searchJobs,
    getJobById
}