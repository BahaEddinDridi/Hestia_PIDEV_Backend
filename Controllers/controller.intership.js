const intership = require('../Models/internship');
const User = require('../Models/user');


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



module.exports = {
    AddIntership,
}