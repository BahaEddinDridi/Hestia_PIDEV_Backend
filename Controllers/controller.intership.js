const Intership = require('../Models/internship'); 
const User = require('../Models/user');
const job = require("../Models/job");



const AddIntership = async (req, res) => {
    try {
        const username = req.params.username;
        const { interCommpanyName, interTitle, interType, interAdress, interLocation, interDescription, interPost, interfield, interStartDate, interApplicationDeadline, interRequiredSkills, interRequiredEducation, contactNumber, interOtherInformation, interImage } = req.body;

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
        const savedIntership = await newIntership.save();

        // Récupérez l'ID du nouvel internat sauvegardé
        const intershipId = savedIntership._id;

        // Ensuite, mettez à jour l'utilisateur pour ajouter le nouvel internat avec le même ID
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            {
                $push: {
                    intership: {
                        _id: intershipId, // Utilisez le même ID pour référencer l'internat
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

///////////////////////////// Update ITERNSHIP /////////////////////////////////////////
const UpdateInternship = async (req, res) => {
    try {
        const interId = req.params.interId; // Extract internship ID from request parameters
        const updateFields = req.body; // Extract updated fields from request body

        // Find the internship by ID and update it with the new fields
        const updatedInternship = await Intership.findByIdAndUpdate(interId, updateFields, { new: true });

        if (!updatedInternship) {
            return res.status(404).json({ error: 'Internship offer not found' });
        }

        // Update the internship in the user's internship array
        const updatedUser = await User.findOneAndUpdate(
            { 'intership._id': interId }, // Match user by internship ID
            { $set: { 'intership.$': updatedInternship } }, // Update the matched internship in the user's internship array
            { new: true }
        );

        res.json({ success: true, data: { updatedInternship, updatedUser } });
    } catch (error) {
        console.error('Error updating internship offer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




module.exports = {
    AddIntership,
    getAllInternships,
    searchInternships,
    UpdateInternship,
}
