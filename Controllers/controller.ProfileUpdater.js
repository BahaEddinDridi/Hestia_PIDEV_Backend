const user = require('../Models/user');
const pdfparse = require("pdf-parse");
const fs = require("fs").promises;
const path = require("path");
const Groq = require("groq-sdk");
const groq = new Groq();
const multer = require('multer');


async function extractPDFText(pdfPath) {
    try {
        const filePath = path.resolve(__dirname, '..', 'Resumes', 'MOHSEN BERNAOU1 (ENG).pdf');
        const data = await pdfparse(filePath);
        
        const combinedText = data.text; // Use data.text directly, as it's already the extracted text
        return combinedText;
    } catch (error) {
        console.error(error);
        throw new Error('Error extracting PDF text');
    }
}

async function GetUser(id) {
    try {
        const users = await user.findById(id);
        const UserData = {
            name: users.firstName + ' ' + users.lastName,
            email: users.email,
            location: users.location,
            phoneNumber: users.phoneNumber,
            experience: users.experience,
            education: users.education,
            skills: users.skills,
            project: users.project,
        };
        // Convert UserData JSON to a string
        const userDataString = JSON.stringify(UserData);
        return userDataString;
    } catch (error) {
        console.error(error);
        throw new Error('Error extracting user data');
    }
}
async function GetUserJSON(id) {
    try {
        const users = await user.findById(id);
        const UserData = {
            firstName: users.firstName,
            email: users.email,
            location: users.location,
            phoneNumber: users.phoneNumber,
            experience: users.experience,
            education: users.education,
            skills: users.skills,
            project: users.project,
        };
       
        return UserData;
    } catch (error) {
        console.error(error);
        throw new Error('Error extracting user data');
    }
}

const CompareUserDataAndCV = async (req, res) => {
    try {
        const { id } = req.params;
        const cv= req.file;
        const cvText = await extractPDFText(cv);
        
        
        
        const UserInformation = await GetUser(id);
        
        // Call chatbot to compare user data and CV text
        const updatedUserData = await processCVAndUserData(cvText,UserInformation, id);
        
        


        res.status(200).json(updatedUserData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


async function processCVAndUserData(cvText,UserInformation, userId) {
    try {
        // Construct messages for chatbot interaction
        const messages = [
            { role: "user", content: cvText }, // CV text (as a string)
            { role: "user", content: UserInformation }, // User data (as a JSON string)
            { role: "system", content: "Compare the resume and user data and return in the user data what is missing from the user resume  only in a json format and no confirmation message is needed only the json format is demanded,in a code format,not text at the end neather only json and only add the email ,phone number,expirience ,education,skill and project add them to the already given user data and do not write missingData just give it directly Combine the resume and user data, and return only the missing information from the resume in the user data. Return the result in JSON format without any confirmation message. Add the missing email, phone number, experience, education, skills, and project directly to the user data and only write the date in the jsonformat DATE YYYY-MM-DDTHH:mm:ss.sssZ and never write present always in this format DATE YYYY-MM-DDTHH:mm:ss.sssZ." } // System message
        ];

        // Call the chatbot to get completions
        const completions = await groq.chat.completions.create({
            messages,
            model: "mixtral-8x7b-32768",
            temperature: 0.5,
            max_tokens: 1024,
            top_p: 1,
            stop: null,
            stream: false
        });
        
        // Extract the response content
        const jsonResponse = completions.choices[0]?.message?.content || "";
        
        const jsonStartIndex = jsonResponse.indexOf('{'); // Find the start index of the JSON n 
        if (jsonStartIndex === -1) {
            throw new Error('JSON data not found in the response');
        }
        const jsonOutput = jsonResponse.substring(jsonStartIndex); // Extract the JSON part
        
        // Parse the JSON output
        const parsedJsonOutput = JSON.parse(jsonOutput);
        

        const mergedUserData = mergeUserDatas(await GetUserJSON(userId), parsedJsonOutput);
        
         // Update user data in the database
        await updateUserInDatabase(userId, mergedUserData);
        
        // Return the merged user data
        return mergedUserData;
    } catch (error) {
        console.error(error);
        throw new Error('Error processing chatbot interaction');
    }
}

function mergeUserDatas(existingUserData, additionalData) {
    if (additionalData.email && typeof additionalData.email === 'string') {
        existingUserData.email =  existingUserData.email;
    }
    if (additionalData.phoneNumber && typeof additionalData.phoneNumber === 'string') {
        existingUserData.phoneNumber =  existingUserData.phoneNumber;
    }
    if (additionalData.experience && Array.isArray(additionalData.experience)) {
        // Concatenate the additional experience array with the existing one
        existingUserData.experience = existingUserData.experience.concat(additionalData.experience);
        // Handle "Present Day" for endDate
        existingUserData.experience.forEach(exp => {
            if (exp.endDate === "Present Day") {
                exp.endDate = new Date(); // Assign current date
            }
        });
    }
    if (additionalData.skills && Array.isArray(additionalData.skills)) {
        existingUserData.skills = existingUserData.skills.concat(additionalData.skills);
    }
    return existingUserData;
}



async function updateUserInDatabase(userId, userData) {
    try {
        // Find the user by ID
        const updatedUser = await user.findById(userId);
        
        // Update user data
        updatedUser.email = userData.email;
        updatedUser.phoneNumber = userData.phoneNumber;
        updatedUser.experience = userData.experience;
        updatedUser.education = userData.education;
        updatedUser.skills = userData.skills;
        updatedUser.project = userData.project;
        
        // Save the updated user
        await updatedUser.save();
        console.log('User data updated successfully');
    } catch (error) {
        console.error(error);
        throw new Error('Error updating user data in the database');
    }
}


  
module.exports = {
    
    CompareUserDataAndCV
};