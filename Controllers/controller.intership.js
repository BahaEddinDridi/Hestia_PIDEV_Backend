const Intership = require('../Models/internship'); 
const User = require('../Models/user');
const job = require("../Models/job");
const Notification=require("../Models/Notification");



const AddIntership = async (req, res) => {
    try {
        const username = req.params.username;
        const { interCompanyId ,interCommpanyName, interTitle, interType, interAdress, interLocation, interDescription, interPost, interfield, interStartDate, interApplicationDeadline, interRequiredSkills, interRequiredEducation, contactNumber, interOtherInformation, interImage } = req.body;

        // Créez d'abord l'instance de Intership
        const newIntership = new Intership({
            interCompanyId ,
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
                        interCompanyId ,
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
         // Envoie une notification à l'administrateur
         const adminUser = await User.findOne({ role: 'admin' });
         if (adminUser) {
             const adminId = adminUser._id; // Récupérer l'ID de l'administrateur
 
             const notification = new Notification({
                 recipientId: adminId, // Remplacez par l'ID de l'admin
                 type: 'Intership Opportunities',
                 message: `A new Intership ${newIntership.interTitle} has been added by ${newIntership.interCommpanyName}  `,
             });
 
             await notification.save();
             console.log(notification);
         }
     

        res.json({ success: true, data: updatedUser });
    } catch (error) {
        console.error('Erreur :', error.message);
        res.status(500).json({ error: 'Erreur serveur' });
    }
}


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
        await Intership.deleteOne({ _id: internshipIdToDelete });

        res.json({ message: 'Internship deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};









const getAllInternships = async (req, res) => {
    try {
        let filters = {};
        if (req.query.type) {
            filters.interType= req.query.type;
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




const getInternshipById = async (req, res) => {
    try {
        const internshipId = req.params.internshipId;
        console.log(internshipId)
        const foundInternship = await Intership.findById(internshipId);
        if (!foundInternship) {
            console.log("Internship not found");
            return res.status(404).json({ error: 'Internship offer not found' });
        }
        res.json(foundInternship);
    } catch (error) {
        console.error('Error fetching Internship offer by ID:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const getappbyintershipid =async (req,res) =>{
    try{
        const intershipid = req.params.intershipid;
        const intershipfond=await Intership.findById(intershipid);
        if(!intershipfond){
            return res.status(404).json({message:'inter offer not found'});
         }
         const internshipApplications=intershipfond.internshipApplications;
         res.json(internshipApplications);
    }catch (err){
        res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    AddIntership,
    getAllInternships,
    searchInternships,
     UpdateInternship,
    getInternshipsByRoleAndDeadline,
    getFutureInternshipsByRole,
    deleteInternshipByIdAndUsername,
    getInternshipById,
    getappbyintershipid,
}
