const job = require('../Models/job');
const User = require('../Models/user');
const mongoose = require('mongoose');

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

//get all opportunities by role opportunities passe
const getJobsByRoleAndDeadlinefinalized = async (req, res) => {
    try {
        const { role } = req.params;
        const today = new Date();
        const usersWithJobs = await User.find(
            { role: { $in: ['professional', 'teacher'] }, job: { $exists: true, $ne: [] } },
            { username: 1, job: 1 }
        ).populate('job');

        const filteredJobs = usersWithJobs.map(user => ({
            username: user.username,
            jobs: user.job.filter(job => job && job.jobApplicationDeadline && new Date(job.jobApplicationDeadline) < today)
        })).filter(user => user.jobs.length > 0);
        
        
        if (!filteredJobs || filteredJobs.length === 0) {
            return res.status(404).json({ message: 'No users with jobs found for the specified role and deadline' });
        }

        res.json(filteredJobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
//get all opportunities by role opportunities dispo
const getJobsByRoleAndFutureDeadline = async (req, res) => {
    try {
        const { role } = req.params;
        const today = new Date();
        const usersWithJobs = await User.find(
            { role: { $in: ['professional', 'teacher'] }, job: { $exists: true, $ne: [] } },
            { username: 1, job: 1 }
        ).populate('job');

        const filteredJobs = usersWithJobs.map(user => ({
            username: user.username,
            jobs: user.job.filter(job => job && job.jobApplicationDeadline && new Date(job.jobApplicationDeadline) > today)
        })).filter(user => user.jobs.length > 0);
        
        if (!filteredJobs || filteredJobs.length === 0) {
            return res.status(404).json({ message: 'No users with jobs found for the specified role and future deadline' });
        }

        res.json(filteredJobs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

//delete job By ID 
const deleteJobByIdAndUsername = async (req, res) => {
    try {
        const { id, username } = req.params;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Vérifier si l'emploi existe dans le tableau des emplois de l'utilisateur
        const jobIndex = user.job.findIndex(job => job && job._id.toString() === id);

        if (jobIndex === -1) {
            return res.status(404).json({ message: 'Job not found for this user' });
        }

        // Récupérer l'ID de l'emploi à supprimer
        const jobIdToDelete = user.job[jobIndex]._id;

        // Supprimer l'emploi du tableau des emplois de l'utilisateur
        user.job.splice(jobIndex, 1);

        // Sauvegarder les modifications de l'utilisateur
        await user.save();

        // Supprimer l'emploi de la collection des emplois (Job)
        await job.deleteOne({ _id: jobIdToDelete });

        res.json({ message: 'Job deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};




//add job bnafs id 
const AddJob1 = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

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
            jobOtherInformation,
            jobPost,
        });

        // Enregistrez le nouvel emploi dans la collection des emplois (jobs)
        await newJob.save();

        // Mettez à jour l'utilisateur pour ajouter le nouvel emploi
        user.job.push(newJob);
        await user.save();

        res.json({ success: true, data: newJob });
    } catch (error) {
        console.error('Erreur :', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};





module.exports = {
    AddJob,
    getJobsByRoleAndDeadlinefinalized,
    getJobsByRoleAndFutureDeadline,
    deleteJobByIdAndUsername,
    AddJob1,
    
}