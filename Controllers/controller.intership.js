const Intership = require('../Models/internship'); 
const User = require('../Models/user');

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

module.exports = {
    AddIntership,
}
