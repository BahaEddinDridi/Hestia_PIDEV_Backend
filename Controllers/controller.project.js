const User = require('../Models/user');

//ajouter un project 
const Addproject = async (req, res) =>{
try{
    const username=req.params.username;
    const { title, startDate, endDate,description}=req.body;
    const updatedUser = await User.findOneAndUpdate(
        { username: username },
        {
            $push: {
                project: {
                    title,
                    description,
                    startDate,
                    endDate,
                  
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
const Deleteproject = async (req, res) => {
    try {
        const { username, projectId } = req.params;

        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            { $pull: { project: { _id: projectId } } },
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
const Updateproject = async (req, res) => {
    try {
        const { username, projectId } = req.params;
        const { title, startDate, endDate, description } = req.body;

        const updatedUser = await User.findOneAndUpdate(
            { username, 'project._id': projectId },
            {
                $set: {
                    'project.$.title': title,
                    'project.$.startDate': startDate,
                    'project.$.endDate': endDate,
                    'project.$.description': description,
                },
            },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ error: 'project not found' });
        }

        res.json({ success: true, data: updatedUser });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};
const getAllproject = async (req, res) => {
    try {
        const { username } = req.params;

        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const project = user.project;

        res.json({ success: true, data: project });
    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ error: 'Server error' });
    }
};
module.exports={
    Addproject,
    Deleteproject,
    Updateproject,
    getAllproject,
}