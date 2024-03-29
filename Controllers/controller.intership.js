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
        const savedintern = await newIntership.save();
        // Récupérez l'identifiant unique généré par la base de données
        const internId = savedintern._id;

        // Ensuite, mettez à jour l'utilisateur pour ajouter le nouvel internat
        const updatedUser = await User.findOneAndUpdate(
            { username: username },
            {
                $push: {
                    intership: {
                        _id: internId,
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
        const internships = await Intership.find(filters);
        res.json(internships);
    } catch (error) {
        console.error('Error fetching internships:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const searchInternships = async (req, res) => {
    try {
        const query = req.query.query.toLowerCase();
        const filteredInternships = await Intership.find({
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

const getInterById = async (req, res) => {
    try {
        const internId = req.params.internId;
        const foundinter = await Intership.findById(internId);
        if (!foundinter) {
            return res.status(404).json({ error: 'Job offer not found' });
        }
        res.json(foundinter);
    } catch (error) {
        console.error('Error fetching job offer by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};


const UpdateInter = async (req, res) => {
    try {
        const internId = req.params.internId; // Extract job ID from request parameters
        const updateFields = req.body; // Extract updated fields from request body

        // Find the job by ID and update it with the new fields
        const UpdateInter = await Intership.findByIdAndUpdate(internId, updateFields, { new: true });

        if (!UpdateInter) {
            return res.status(404).json({ error: 'Job offer not found' });
        }

        // Update the job in the user's job array
        const updatedUser = await User.findOneAndUpdate(
            { 'intership._id': internId }, // Match user by job ID
            { $set: { 'intership.$': UpdateInter } }, // Update the matched job in the user's job array
            { new: true }
        );

        res.json({ success: true, data: { UpdateInter, updatedUser } });
    } catch (error) {
        console.error('Error updating job offer:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

module.exports = {
    AddIntership,
    getAllInternships,
    searchInternships,
    getInterById,
    UpdateInter,
}
