const request = require('supertest');
const express = require('express');
const router = require('../../Routes/gptchatbot');
const controllerGptchatbot = require('../../Controllers/controller.gptchatbot');

const app = express();
app.use(express.json());
app.use('/gptchatbot', router);

jest.mock('../Controllers/controller.gptchatbot');

describe('GPT Chatbot Routes', () => {
    const userID = '12345';

    describe('POST /AddGptchatbot/:userID', () => {
        it('should call controllerGptchatbot.main', async () => {
            controllerGptchatbot.main.mockImplementation((req, res) => res.status(200).send('Success'));

            const response = await request(app)
                .post(`/gptchatbot/AddGptchatbot/${userID}`)
                .send({ data: 'test data' });

            expect(response.status).toBe(200);
            expect(response.text).toBe('Success');
            expect(controllerGptchatbot.main).toHaveBeenCalled();
        });
    });

    describe('POST /UpdateUserDataFromCV/:userID', () => {
        it('should call controllerGptchatbot.updateUserDataFromCV', async () => {
            controllerGptchatbot.updateUserDataFromCV.mockImplementation((req, res) => res.status(200).send('Updated'));

            const response = await request(app)
                .post(`/gptchatbot/UpdateUserDataFromCV/${userID}`)
                .send({ data: 'updated data' });

            expect(response.status).toBe(200);
            expect(response.text).toBe('Updated');
            expect(controllerGptchatbot.updateUserDataFromCV).toHaveBeenCalled();
        });
    });
});