const request = require('supertest');
const express = require('express');
const recommendationRouter = require('../../Routes/recommendation');
const recommendationController = require('../../Controllers/controller.recommendation');

jest.mock('../Controllers/controller.recommendation');

const app = express();
app.use(express.json());
app.use('/recommendations', recommendationRouter);

describe('GET /recommendations/recommendUser/:userId', () => {
    it('should call recommendUser controller with the correct userId', async () => {
        const userId = '12345';
        recommendationController.recommendUser.mockImplementation((req, res) => {
            res.status(200).send({ message: 'User recommended' });
        });

        const response = await request(app).get(`/recommendations/recommendUser/${userId}`);

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('User recommended');
        expect(recommendationController.recommendUser).toHaveBeenCalledWith(expect.objectContaining({
            params: { userId }
        }), expect.anything());
    });

    it('should return 500 if there is an error in the controller', async () => {
        const userId = '12345';
        recommendationController.recommendUser.mockImplementation((req, res) => {
            res.status(500).send({ error: 'Internal Server Error' });
        });

        const response = await request(app).get(`/recommendations/recommendUser/${userId}`);

        expect(response.status).toBe(500);
        expect(response.body.error).toBe('Internal Server Error');
    });
});