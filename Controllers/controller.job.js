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



module.exports = {
    AddJob,
}