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
            name: users.firstName + ' ' + users.lastName,
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
            { role: "system", content: "Compare the resume and user data and return in the user data what is missing from the user resume  only in a json format and no confimation message is needed only the json format is demanded,in a code format,not text at the end neather only json and only add the email ,phone number,expirience ,education,skill and project add them to the already given user data and do not write missingData just give it directly Combine the resume and user data, and return only the missing information from the resume in the user data. Return the result in JSON format without any confirmation message. Add the missing email, phone number, experience, education, skills, and project directly to the user data and only write the date in the jsonformat DATE YYYY-MM-DDTHH:mm:ss.sssZ." } // System message
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
        const jsonStartIndex = jsonResponse.indexOf('{'); // Find the start index of the JSON
        const jsonOutput = jsonResponse.substring(jsonStartIndex); // Extract the JSON part

        // Parse the JSON output
        const parsedJsonOutput = JSON.parse(jsonOutput);
        console.log(parsedJsonOutput);

        const mergedUserData = mergeUserData(GetUserJSON(userId), parsedJsonOutput);

         // Update user data in the database
        await updateUserInDatabase(userId, mergedUserData);

        // Return the merged user data
        return mergedUserData;
    } catch (error) {
        console.error(error);
        throw new Error('Error processing chatbot interaction');
    }
}

function mergeUserData(existingUserData, additionalData) {
    const mergedUserData = { ...existingUserData };

    // Add missing fields from the additional data
    if (additionalData.email && typeof additionalData.email === 'string') {
        mergedUserData.email = additionalData.email;
    }
    if (additionalData.phoneNumber && typeof additionalData.phoneNumber === 'string') {
        mergedUserData.phoneNumber = additionalData.phoneNumber;
    }
    if (additionalData.experience && Array.isArray(additionalData.experience)) {
        mergedUserData.experience = additionalData.experience;
    }
    if (Array.isArray(additionalData.education)) {
        // Check each educational experience in additionalData
        additionalData.education.forEach((edu, index) => {
            // Check if startDate is a valid date string or Date object
            if (typeof edu.startDate === 'string' || edu.startDate instanceof Date) {
                // Update the corresponding educational experience in mergedUserData
                mergedUserData.education[index] = edu;
            }
        });
    }
    if (additionalData.skills && Array.isArray(additionalData.skills)) {
        mergedUserData.skills = additionalData.skills;
    }
    if (additionalData.project && Array.isArray(additionalData.project)) {
        mergedUserData.project = additionalData.project;
    }

    return mergedUserData;
}


async function updateUserInDatabase(userId, userData) {
    try {
        // Update user data in the database
        await user.findByIdAndUpdate(userId, {
            $set: userData
        });
    } catch (error) {
        console.error(error);
        throw new Error('Error updating user data in the database');
    }
}


  
module.exports = {
    
    CompareUserDataAndCV
};