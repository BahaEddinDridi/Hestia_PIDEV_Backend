const User = require('../Models/user');


const AddEducation = async (req, res) =>{
try{
    const username=req.params.username;
    const { school, degree, startDate, endDate}=req.body;
    const updatedUser = await User.findOneAndUpdate(
        { username: username },
        {
            $push: {
                education: {
                    school,
                    degree,
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
const DeleteEducation= async (req, res) =>{
try{
    const username = req.params.username;
    const educationId = req.params.educationId;
    const user=await User.findOne({ username: username });
    if(!user){
        return res.status(404).json({message:"User not found."});
    }
    const educationIndex=user.education.findIndex(edu=>edu._id.toString()===educationId);
    if(educationIndex === -1){
        return res.status(404).json({message:"Education with this ID was not found."});
    }
    user.education.splice(educationIndex,1);
    await user.save();
    res.status(200).json({message:"Education was successfully suppressed",data:user.education});
}catch(error) {
    res.status(500).json({ message: "An error occurred while deleting education.", error: error.message });
}
}
module.exports={
    AddEducation,
    DeleteEducation
}