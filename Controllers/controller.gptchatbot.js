const Groq = require("groq-sdk");
const groq = new Groq();
const User = require('../Models/user');
const experience = require('../Models/Experience');
const education = require('../Models/Education');
const project = require('../Models/Project');

// Array to store chat history
let chatHistory = [];

// Function to generate chatbot response
const getGroqChatCompletion = async (userInput, userId) => {
    try {
        // Retrieve user information based on the user ID
        const userData = await User.findById(userId)
            .populate('experience')
            .populate('education')
            .populate('project');

        // Extract user data
        const { firstName, experience, education, project } = userData;

        // Generate greeting message incorporating user data
        let greetingMessage = `Hello ${firstName}! I'm Mr. Green, your friendly assistant. `;
        
        // Include experience information
        if (experience.length > 0) {
            greetingMessage += `Regarding your experiences, here is the information:\n\n`;
            experience.forEach((exp, index) => {
                greetingMessage += `${index + 1}. Experience: ${exp.title}\n`;
                greetingMessage += `   - Company: ${exp.company}\n`;
                greetingMessage += `   - Start Date: ${exp.startDate}\n`;
                greetingMessage += `   - End Date: ${exp.endDate}\n`;
                greetingMessage += `   - Description: ${exp.description}\n\n`;
            });
        } else {
            greetingMessage += `Regarding your experiences, I couldn't find any information.\n\n`;
        }
        
        // Include education information
        if (education.length > 0) {
            greetingMessage += `Regarding your education, here is the information:\n\n`;
            education.forEach((edu, index) => {
                greetingMessage += `${index + 1}. Education: ${edu.degree} at ${edu.school}\n`;
                greetingMessage += `   - Start Date: ${edu.startDate}\n`;
                greetingMessage += `   - End Date: ${edu.endDate}\n\n`;
            });
        } else {
            greetingMessage += `Regarding your education, I couldn't find any information.\n\n`;
        }
        
        // Include project information
        if (project.length > 0) {
            greetingMessage += `Regarding your projects, here is the information:\n\n`;
            project.forEach((proj, index) => {
                greetingMessage += `${index + 1}. Project: ${proj.title}\n`;
                greetingMessage += `   - Description: ${proj.description}\n`;
                greetingMessage += `   - Start Date: ${proj.startDate}\n`;
                greetingMessage += `   - End Date: ${proj.endDate}\n\n`;
            });
        } else {
            greetingMessage += `Regarding your projects, I couldn't find any information.\n\n`;
        }

        greetingMessage += `How can I assist you today?`;

        return groq.chat.completions.create({
            messages: [
                { role: "system", content: greetingMessage },
                { role: "user", content: userInput } // Use user's input message here
            ],
            model: "mixtral-8x7b-32768",
            temperature: 0.5,
            max_tokens: 1024,
            top_p: 1,
            stop: null,
            stream: false
        });
    } catch (error) {
        console.error('Error retrieving user data:', error);
        throw error;
    }
};



// Function to handle incoming messages and generate responses
const main = async (req, res) => {
    try {
        const userInput = req.body.message; // Assuming the user's message is sent in the 'message' field of the request body
        const userId = req.params.userID; // Assuming the user ID is passed as a route parameter
        
        // Check if user wants to exit
        if (userInput.toLowerCase() === 'exit') {
            chatHistory = []; // Clear chat history
            res.json({ response: 'Chat history cleared. Goodbye!' });
            return;
        }

        // Add user message to chat history
        chatHistory.push({ role: "user", content: userInput });

        // Generate chatbot response
        const chatCompletion = await getGroqChatCompletion(userInput, userId);
        const response = chatCompletion.choices[0]?.message?.content || "";

        // Add chatbot response to chat history
        chatHistory.push({ role: "system", content: response });

        res.json({ response });
    } catch (error) {
        console.error('Error processing message:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
const updateUserDataFromCV = async (cvText, userId) => {
    try {
        // Retrieve user data based on the user ID
        const userData = await User.findById(userId);

        // Generate chatbot response with the CV text and user data
        const chatCompletion = await processCVAndUserData(cvText, userData, "Compare the CV with my profile and return the updated user data in the form of a JSON string. of the user data.");
        const updatedUserData = chatCompletion.choices[0]?.message?.content;

        // Update user data with the new information
        const updatedUser = await User.findByIdAndUpdate(userId, updatedUserData, { new: true });

        return updatedUser;
    } catch (error) {
        console.error('Error updating user data from CV:', error);
        throw new Error('Error updating user data from CV');
    }
};
const processCVAndUserData = async (cvText, userData ,content) => {
    try {
        // Generate chatbot response
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                { role: "system", content: content },
                { role: "user", content: cvText }, // Sending CV text as user input
                { role: "user", content: JSON.stringify(userData) } // Sending user data as JSON string
            ],
            model: "mixtral-8x7b-32768",
            temperature: 0.5,
            max_tokens: 1024,
            top_p: 1,
            stop: null,
            stream: false
        });

        // Extract the response from the chatbot
        const response = chatCompletion.choices[0]?.message?.content || "";

        // Convert the response JSON string back to an object
        const updatedUserData = JSON.parse(response);

        // Log the updated user data
        console.log("Updated User Data:", updatedUserData);

        // Return the updated user data
        return updatedUserData;
    } catch (error) {
        console.error('Error processing CV and user data:', error);
        throw new Error('Error processing CV and user data');
    }
};

module.exports = {
    main,
    updateUserDataFromCV
};
