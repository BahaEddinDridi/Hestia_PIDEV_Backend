const user = require('../Models/user');
const pdfparse = require("pdf-parse");
const fs = require("fs");
const path = require("path");
const Groq = require("groq-sdk");
const groq = new Groq();
const multer = require('multer');
const https = require('https');
const { promisify } = require('util');

async function CompareUserDataAndCV(req, res) {
    try {
        const { id } = req.params;
        const { resume } = req.body;
        
        // Upload user's resume URL
        await uploadResume(id, resume);
        
        // Extract text from the resume
        const cvText = await extractPDFText(resume);

        // Get user information from the database
        const UserInformation = await GetUser(id);

        // Process user information and resume text
        const updatedUserData = await processCVAndUserData(cvText, UserInformation, id);

        res.status(200).json(updatedUserData);
        console.log('User data updated successfully');
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
async function uploadResume(userId, resumeURL) {
    try {
        const userToUpdate = await user.findById(userId);
        userToUpdate.resume = resumeURL;
        await userToUpdate.save();
       console.log('Resume URL updated successfully');
        return userToUpdate;
    } catch (error) {
        console.error(error);
        throw new Error('Error updating user data in the database');
    }
}
async function extractPDFText(pdfUrl) {
    try {
        const destination = path.resolve(__dirname, '..', 'Resumes', 'downloaded_file.pdf');
        const file = fs.createWriteStream(destination);

        // Create a promise for the file download and write operation
        const downloadPromise = new Promise((resolve, reject) => {
            const request = https.get(pdfUrl, function (response) {
                response.pipe(file);
                file.on('finish', function () {
                    file.close(resolve); // Resolve the promise when file writing is complete
                });
            });

            request.on('error', function (err) {
                fs.unlink(destination, (err) => {
                    if (err) {
                        console.error('Error deleting file:', err);
                    } else {
                        console.log('File deleted successfully');
                    }
                });
                reject(err); // Reject the promise if there's an error during download
            });
        });

        // Wait for the file download and write operation to complete
        await downloadPromise;

        // Parse the downloaded PDF file
        const data = await pdfparse(destination);
        const combinedText = data.text;

        // Delete the downloaded file
        fs.unlink(destination, (err) => {
            if (err) {
                console.error('Error deleting file:', err);
            } else {
                console.log('File deleted successfully');
            }
        });
        console.log('PDF text extracted successfully');
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
            
            experience: users.experience,
            education: users.education,
            skills: users.skills,
            project: users.project,
        };
        // Convert UserData JSON to a string
        const userDataString = JSON.stringify(UserData);
        console.log('User data extracted successfully in text format');
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
            
            experience: users.experience,
            education: users.education,
            skills: users.skills,
            project: users.project,
        };
        console.log('User data extracted successfully in JSON format');
        return UserData;
    } catch (error) {
        console.error(error);
        throw new Error('Error extracting user data');
    }
}

async function processCVAndUserData(cvText, UserInformation, userId) {
    try {
        // Construct messages for chatbot interaction
        const messages = [
            { role: "user", content: cvText }, // CV text (as a string)
            { role: "user", content: UserInformation }, // User data (as a JSON string)
            { role: "system", content: "Compare the resume and user data and return in the user data what is missing from the user resume  only in a json format and no confirmation message is needed only the json format is demanded,in a code format,not text at the end neather only json and only add the email ,expirience ,education,skill and project add them to the already given user data and do not write missingData just give it directly Combine the resume and user data, and return only the missing information from the resume in the user data. Return the result in JSON format without any confirmation message. Add the missing email, experience, education, skills, and project directly to the user data and only write the date in the jsonformat DATE YYYY-MM-DDTHH:mm:ss.sssZ and never write present always in this format DATE YYYY-MM-DDTHH:mm:ss.sssZ, add a title to the project and dont add email in skills and only add skills each one in a string alone no need to be specific if it's frontend or backend or devops. only write code format and dont give any comments  add title to the projects and in the education write the school and never write present always write the format data that i gave to you and add the description to the experience and the projects and always return the json code output the education have{school,degree,startDate,endDate,description}date format is Date with jsonformat DATE YYYY-MM-DDTHH:mm:ss.sssZ the experience have {title,company,startDate,endDate,description} date format is Date with jsonformat DATE YYYY-MM-DDTHH:mm:ss.sssZ the project have {title,description,startDate,endDate } date format is Date with jsonformat DATE YYYY-MM-DDTHH:mm:ss.sssZ and dont add technologies in the projects and only write json do not write anything else then the json i want" } // System message
        ];

        // Call the chatbot to get completions
        const completions = await groq.chat.completions.create({
            messages,
            model: "mixtral-8x7b-32768",
            temperature: 0.5,
            max_tokens: 1024*4,
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
        
        
        
        const mergedUserData = mergeUserData(await GetUserJSON(userId), parsedJsonOutput);

        // Update user data in the database
        await updateUserInDatabase(userId, mergedUserData);
        console.log('User data updated successfully in the database FINAL');
        // Return the merged user data
        return mergedUserData;
    } catch (error) {
        console.error(error);
        throw new Error('Error processing chatbot interaction');
    }
}
function mergeUserData(existingUserData, additionalData) {
    updateEmail(existingUserData, additionalData);
    console.log('Email updated successfully');
    
    mergeExperience(existingUserData, additionalData);
    console.log('Experience merged successfully');
    mergeSkills(existingUserData, additionalData);
    console.log('Skills merged successfully');
    mergeProjects(existingUserData, additionalData);
    console.log('Projects merged successfully');
    mergeEducation(existingUserData, additionalData);
    console.log('Education merged successfully');
    console.log('-------------------------------');
    console.log('User data merged successfully');
    return existingUserData;
}
function updateEmail(existingUserData, additionalData) {
    if (additionalData.email && typeof additionalData.email === 'string') {
        if (existingUserData.email !== additionalData.email) {
            existingUserData.email = additionalData.email;
        }
    }
}
function mergeExperience(existingUserData, additionalData) {
    if (additionalData.experience && Array.isArray(additionalData.experience)) {
        existingUserData.experience = existingUserData.experience.concat(additionalData.experience);
    }
}
function mergeSkills(existingUserData, additionalData) {
    if (additionalData.skills && Array.isArray(additionalData.skills)) {
        additionalData.skills.forEach(skill => {
            if (!existingUserData.skills.includes(skill)) {
                existingUserData.skills.push(skill);
            }
        });
    }
}
function mergeProjects(existingUserData, additionalData) {
    if (additionalData.project && Array.isArray(additionalData.project)) {
        additionalData.project.forEach(proj => {
            // Check if the project already exists in the user data
            const exists = existingUserData.project.some(existingProj => {
                return existingProj.title === proj.title;
            });
            // If the project doesn't exist, add it to the user data
            if (!exists) {
                existingUserData.project.push(proj);
            }
        });
    }
}
function mergeEducation(existingUserData, additionalData) {
    if (additionalData.education && Array.isArray(additionalData.education)) {
        additionalData.education.forEach(edu => {
            const exists = existingUserData.education.some(existingEdu => {
                return existingEdu.degree === edu.degree && existingEdu.school === edu.school;
            });
            if (!exists) {
                existingUserData.education.push(edu);
            }
        });
    }
}
async function updateUserInDatabase(userId, userData) {
    try {
        // Find the user by ID
        const updatedUser = await user.findById(userId);

        // Update user data fields
        if (userData.email) {
            updatedUser.email = userData.email;
        }
        
        if (userData.experience) {
            // Handle "present" value for experience endDate
            userData.experience.forEach(exp => {
                if (exp.endDate === "present") {
                    exp.endDate = new Date().toISOString(); // Set to current date and time
                }
            });
            updatedUser.experience = userData.experience;
        }
        if (userData.education) {
            updatedUser.education = userData.education;
        }
        if (userData.skills) {
            updatedUser.skills = userData.skills;
        }
        if (userData.project) {
            // Handle "present" value for project endDate
            userData.project.forEach(proj => {
                if (proj.endDate === "present") {
                    proj.endDate = new Date().toISOString(); // Set to current date and time
                }
            });
            updatedUser.project = userData.project;
            
        }

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