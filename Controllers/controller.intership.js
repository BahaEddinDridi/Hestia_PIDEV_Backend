const Intership = require('../Models/internship'); 
const User = require('../Models/user');
const job = require("../Models/job");

const AddIntership = async (req, res) => {
    try {
        const username = req.params.username;
        const { interCommpanyName,interTitle,interType, interAdress, interLocation, interDescription, interPost, interfield, interStartDate, interApplicationDeadline, interRequiredSkills, interRequiredEducation, contactNumber, interOtherInformation,interImage } = req.body;

        // Créez d'abord l'instance de Intership
        const newIntership = new Intership({
            interCommpanyName,
            interTitle, 
            interType,
            interAdress,
            interLocation,
            interDescription,
            interPost,
            interfield,
            interStartDate,
            interApplicationDeadline,
            interRequiredSkills,
            interRequiredEducation,
            contactNumber,
            interOtherInformation,
            interImage,
        });

        // Enregistrez le nouvel internat dans la collection des internats (interships)
        await newIntership.save();

        // Ensuite, mettez à jour l'utilisateur pour ajouter le nouvel internat
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            {
                $push: {
                    intership: {
                        interTitle,
                        interType,
                        interAdress,
                        interLocation,
                        interDescription,
                        interPost,
                        interfield,
                        interStartDate,
                        interApplicationDeadline,
                        interRequiredSkills,
                        interRequiredEducation,
                        contactNumber,
                        interOtherInformation,
                        interOtherInformation,
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

//add interships avec le meme id 
const AddIntership1 = async (req, res) => {
    try {
        const username = req.params.username;
        const user = await User.findOne({ username: username });

        if (!user) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }

        const { interTitle, interAdress, interLocation, interDescription, interPost, interfield, interStartDate, interApplicationDeadline, interRequiredSkills, interRequiredEducation, contactNumber, interOtherInformation } = req.body;

        // Créez d'abord l'instance de Intership
        const newIntership = new intership({
            interTitle,
            interAdress,
            interLocation,
            interDescription,
            interPost,
            interfield,
            interStartDate,
            interApplicationDeadline,
            interRequiredSkills,
            interRequiredEducation,
            contactNumber,
            interOtherInformation,
        });

        // Enregistrez le nouvel internship dans la collection des internships
        await newIntership.save();

        // Mettez à jour l'utilisateur pour ajouter le nouvel internship
        user.intership.push(newIntership);
        await user.save();

        res.json({ success: true, data: newIntership });
    } catch (error) {
        console.error('Erreur :', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

//get all interships opportunities passed
const getInternshipsByRoleAndDeadline = async (req, res) => {
    try {
        const { role } = req.params;
        const today = new Date();
        const usersWithInternships = await User.find(
            { role: { $in: ['professional', 'teacher'] }, intership: { $exists: true, $ne: [] } },
            { username: 1, intership: 1 }
        ).populate('intership');

        const filteredInternships = usersWithInternships.map(user => ({
            username: user.username,
            interships: user.intership.filter(intership => intership && intership.interApplicationDeadline && new Date(intership.interApplicationDeadline) < today)
        })).filter(user => user.interships.length > 0);
        
        if (!filteredInternships || filteredInternships.length === 0) {
            return res.status(404).json({ message: 'No users with interships found for the specified role and deadline' });
        }

        res.json(filteredInternships);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

//get all futur interships opportunities 
const getFutureInternshipsByRole = async (req, res) => {
    try {
        const today = new Date();
        const usersWithInternships = await User.find(
            { role: { $in: ['professional', 'teacher'] }, intership: { $exists: true, $ne: [] } },
            { username: 1, intership: 1 }
        ).populate('intership');

        const futureInternships = usersWithInternships.map(user => {
            if (user.intership && Array.isArray(user.intership)) {
                return {
                    username: user.username,
                    interships: user.intership.filter(intership => intership && intership.interApplicationDeadline && new Date(intership.interApplicationDeadline) > today)
                };
            }
            return null;
        }).filter(user => user && user.interships.length > 0);
        
        if (!futureInternships || futureInternships.length === 0) {
            return res.status(404).json({ message: 'No users with future interships found for the specified role' });
        }

        res.json(futureInternships);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};
//delete intership By id 
const deleteInternshipByIdAndUsername = async (req, res) => {
    try {
        const { id, username } = req.params;

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ username });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Vérifier si l'internship existe dans le tableau des internships de l'utilisateur
        const internshipIndex = user.intership.findIndex(intership => intership && intership._id.toString() === id);

        if (internshipIndex === -1) {
            return res.status(404).json({ message: 'Internship not found for this user' });
        }

        // Récupérer l'ID de l'internship à supprimer
        const internshipIdToDelete = user.intership[internshipIndex]._id;

        // Supprimer l'internship du tableau des internships de l'utilisateur
        user.intership.splice(internshipIndex, 1);

        // Sauvegarder les modifications de l'utilisateur
        await user.save();

        // Supprimer l'internship de la collection des internships (Internship)
        await intership.deleteOne({ _id: internshipIdToDelete });

        res.json({ message: 'Internship deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};






const getAllInternships = async (req, res) => {
    try {
        let filters = {};
        if (req.query.education) {
            filters.interRequiredEducation= req.query.education;
        }
        if (req.query.location) {
            filters.interLocation = req.query.location;
        }
        if (req.query.field) {
            filters.interfield = req.query.field;
        }
        const internships = await intership.find(filters);
        res.json(internships);
    } catch (error) {
        console.error('Error fetching internships:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const searchInternships = async (req, res) => {
    try {
        const query = req.query.query.toLowerCase();
        const filteredInternships = await intership.find({
            $or: [
                { interTitle: { $regex: query, $options: 'i' } },
                { interPost: { $regex: query, $options: 'i' } }
            ]
        });
        res.json(filteredInternships);
    } catch (error) {
        console.error('Error searching for Internships:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    AddIntership,
    getAllInternships,
    searchInternships,
    AddIntership1,
    getInternshipsByRoleAndDeadline,
    getFutureInternshipsByRole,
   deleteInternshipByIdAndUsername
}
