const User = require('../Models/user');

//ajouter un experience 
const AddExperience = async (req, res) =>{
try{
    const username=req.params.username;
    const { title, company, startDate, endDate,description}=req.body;
    const updatedUser = await User.findOneAndUpdate(
        { username: username },
        {
            $push: {
                experience: {
                    title,
                    company,
                    startDate,
                    endDate,
                    description,
                },
            },
        },
        { new: true }
    );
res.json({ success: true, data: updatedUser });
} catch (error) {
    console.error('Erreur :', error.message);
    res.status(500).json({ error: 'Erreur serveur' });
}
}

//delete experience
const DeleteExperience = async (req, res) => {
    try {
        const { username, experienceId } = req.params;

        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            { $pull: { experience: { _id: experienceId } } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ success: true, data: updatedUser });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};

//update experience 
const UpdateExperience = async (req, res) => {
    try {
        const { username, experienceId } = req.params;
        const { title, company, startDate, endDate, description } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { username, 'experience._id': experienceId },
            {
                $set: {
                    'experience.$.title': title,
                    'experience.$.company': company,
                    'experience.$.startDate': startDate,
                    'experience.$.endDate': endDate,
                    'experience.$.description': description,
                },
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'Experience not found' });
        }

        res.json({ success: true, data: updatedUser });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};
//get all experience 
const getAllExperiences = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const experiences = user.experience;

        res.json({ success: true, data: experiences });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};


module.exports={
    AddExperience,
    DeleteExperience,
    UpdateExperience,
    getAllExperiences,
}