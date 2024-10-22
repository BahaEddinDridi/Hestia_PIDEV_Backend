const request = require('supertest');
const express = require('express');
const router = require('../../Routes/intership');

const app = express();

app.use(express.json());
app.use('/api', router);

describe('Intership Routes', () => {
    it('should add an internship', async () => {
        const response = await request(app)
            .post('/api/AddIntership/testuser')
            .send({ title: 'Test Internship', description: 'Test Description' });
        expect(response.status).toBe(200);
        // Add more assertions based on your controller's response
    });

    it('should get all internships', async () => {
        const response = await request(app).get('/api/getAllInternships');
        expect(response.status).toBe(200);
        // Add more assertions based on your controller's response
    });

    it('should get internships by role and deadline', async () => {
        const response = await request(app).get('/api/getAllIntershipsOpportDeadlinefinalized');
        expect(response.status).toBe(200);
        // Add more assertions based on your controller's response
    });

    it('should get future internships by role', async () => {
        const response = await request(app).get('/api/getAllFuturIntershipsOpport');
        expect(response.status).toBe(200);
        // Add more assertions based on your controller's response
    });

    it('should delete an internship by id and username', async () => {
        const response = await request(app).delete('/api/deleteIntership/testuser/1');
        expect(response.status).toBe(200);
        // Add more assertions based on your controller's response
    });

    it('should get an internship by id', async () => {
        const response = await request(app).get('/api/getInternshipById/1');
        expect(response.status).toBe(200);
        // Add more assertions based on your controller's response
    });

    it('should update an internship', async () => {
        const response = await request(app)
            .put('/api/UpdateInternship/1')
            .send({ title: 'Updated Internship', description: 'Updated Description' });
        expect(response.status).toBe(200);
        // Add more assertions based on your controller's response
    });

    it('should get applications by internship id', async () => {
        const response = await request(app).get('/api/getapp/1');
        expect(response.status).toBe(200);
        // Add more assertions based on your controller's response
    });
});