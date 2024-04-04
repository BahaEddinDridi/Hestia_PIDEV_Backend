const CRM = require('../Models/CRM');

// Add a new CRM
const addCRM = async (req, res) => {
    try {
        const newCRM = new CRM(req.body);
        await newCRM.save();
        res.status(201).json(newCRM);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
}
const getCRM = async (req, res) => {
    try {
        const crm = await CRM.find();
        res.status(200).json(crm);
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
}
const updateCRM = async (req, res) => {
    try {
        const updatedData = req.body;
        
        // Find the only CRM document (assuming there's only one)
        const existingCRM = await CRM.findOne();
        if (!existingCRM) {
            return res.status(404).json({ message: "CRM not found" });
        }

        // Update the existing CRM document with the new data
        Object.assign(existingCRM, updatedData);

        // Save the updated CRM document
        await existingCRM.save();

        res.status(200).json(existingCRM); // Respond with the updated CRM document
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
module.exports={
    addCRM
    ,getCRM
    ,updateCRM
};