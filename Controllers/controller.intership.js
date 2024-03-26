const intership = require('../Models/internship');
const User = require('../Models/user');
const job = require("../Models/job");


const AddIntership = async (req, res) => {
    try {
        const username = req.params.username;
        const { interTitle, interAdress, interLocation, interDescription, interPost, interfield, interStartDate, interApplicationDeadline, interRequiredSkills, interRequiredEducation, contactNumber, interOtherInformation } = req.body;

        // Créez d'abord l'instance de Job
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
            interOtherInformation: '',
        });

        // Enregistrez le nouvel emploi dans la collection des emplois (jobs)
        await newIntership.save();

        // Ensuite, mettez à jour l'utilisateur pour ajouter le nouvel emploi
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            {
                $push: {
                    intership: {
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
                        interOtherInformation: '',
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
    searchInternships
}