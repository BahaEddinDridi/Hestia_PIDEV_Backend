const request = require('supertest');
const express = require('express');
const { main, updateUserDataFromCV } = require('../../Controllers/controller.gptchatbot');
const User = require('../../Models/user');
const groq = require('groq-sdk');

jest.mock('../Models/user');
jest.mock('groq-sdk');

const app = express();
app.use(express.json());
app.post('/chat/:userID', main);

describe('Controller GPT Chatbot Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('main function', () => {
        it('should return a greeting message with user data', async () => {
            const mockUser = {
                _id: 'user123',
                firstName: 'John',
                experience: [{ title: 'Developer', company: 'Company A', startDate: '2020-01-01', endDate: '2021-01-01', description: 'Developed software' }],
                education: [{ degree: 'BSc Computer Science', school: 'University A', startDate: '2015-01-01', endDate: '2019-01-01' }],
                project: [{ title: 'Project A', description: 'A project', startDate: '2019-01-01', endDate: '2020-01-01' }]
            };

            User.findById.mockResolvedValue(mockUser);
            groq.chat.completions.create.mockResolvedValue({
                choices: [{ message: { content: 'Hello John! How can I assist you today?' } }]
            });

            const response = await request(app)
                .post('/chat/user123')
                .send({ message: 'Hello' });

            expect(response.status).toBe(200);
            expect(response.body.response).toContain('Hello John!');
        });

        it('should return an error if user data retrieval fails', async () => {
            User.findById.mockRejectedValue(new Error('User not found'));

            const response = await request(app)
                .post('/chat/user123')
                .send({ message: 'Hello' });

            expect(response.status).toBe(500);
            expect(response.body.error).toBe('Internal server error');
        });

        it('should clear chat history and return a goodbye message on "exit"', async () => {
            const response = await request(app)
                .post('/chat/user123')
                .send({ message: 'exit' });

            expect(response.status).toBe(200);
            expect(response.body.response).toBe('Chat history cleared. Goodbye!');
        });
    });

    describe('updateUserDataFromCV function', () => {
        it('should update user data from CV text', async () => {
            const mockUser = { _id: 'user123', firstName: 'John' };
            const updatedUserData = { firstName: 'John', experience: [], education: [], project: [] };

            User.findById.mockResolvedValue(mockUser);
            groq.chat.completions.create.mockResolvedValue({
                choices: [{ message: { content: JSON.stringify(updatedUserData) } }]
            });
            User.findByIdAndUpdate.mockResolvedValue(updatedUserData);

            const result = await updateUserDataFromCV('CV text', 'user123');

            expect(result).toEqual(updatedUserData);
        });

        it('should throw an error if updating user data fails', async () => {
            User.findById.mockRejectedValue(new Error('User not found'));

            await expect(updateUserDataFromCV('CV text', 'user123')).rejects.toThrow('Error updating user data from CV');
        });
    });
});