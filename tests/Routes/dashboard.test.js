const request = require('supertest');
const express = require('express');
const dashboardRouter = require('../../Routes/dashboard');

const app = express();

app.use(express.json());
app.use('/dashboard', dashboardRouter);

describe('Dashboard Routes', () => {
    it('should fetch all users', async () => {
        const res = await request(app).get('/dashboard/users');
        expect(res.statusCode).toEqual(200);
        // Add more assertions based on your response structure
    });

    it('should add a new user', async () => {
        const newUser = { name: 'John Doe', email: 'john@example.com' };
        const res = await request(app).post('/dashboard/adduser').send(newUser);
        expect(res.statusCode).toEqual(201);
        // Add more assertions based on your response structure
    });

    it('should fetch a user by ID', async () => {
        const userId = 'someUserId';
        const res = await request(app).get(`/dashboard/user/${userId}`);
        expect(res.statusCode).toEqual(200);
        // Add more assertions based on your response structure
    });

    it('should delete a user by ID', async () => {
        const userId = 'someUserId';
        const res = await request(app).delete(`/dashboard/users/${userId}`);
        expect(res.statusCode).toEqual(200);
        // Add more assertions based on your response structure
    });

    it('should update a user role by ID', async () => {
        const userId = 'someUserId';
        const updatedRole = { role: 'admin' };
        const res = await request(app).put(`/dashboard/users/${userId}`).send(updatedRole);
        expect(res.statusCode).toEqual(200);
        // Add more assertions based on your response structure
    });

    it('should count users', async () => {
        const res = await request(app).get('/dashboard/count');
        expect(res.statusCode).toEqual(200);
        // Add more assertions based on your response structure
    });

    it('should export users to Excel', async () => {
        const res = await request(app).get('/dashboard/export-excel');
        expect(res.statusCode).toEqual(200);
        // Add more assertions based on your response structure
    });

    it('should export users to PDF', async () => {
        const res = await request(app).get('/dashboard/export-pdf');
        expect(res.statusCode).toEqual(200);
        // Add more assertions based on your response structure
    });

    it('should change user status by ID', async () => {
        const userId = 'someUserId';
        const res = await request(app).put(`/dashboard/users/${userId}/change-status`);
        expect(res.statusCode).toEqual(200);
        // Add more assertions based on your response structure
    });

    it('should fetch user by username for admin', async () => {
        const username = 'adminUser';
        const res = await request(app).get(`/dashboard/ProfilAdmin/${username}`);
        expect(res.statusCode).toEqual(200);
        // Add more assertions based on your response structure
    });

    it('should update user by username for admin', async () => {
        const username = 'adminUser';
        const updatedData = { email: 'newemail@example.com' };
        const res = await request(app).put(`/dashboard/ProfilAdmin/${username}/update`).send(updatedData);
        expect(res.statusCode).toEqual(200);
        // Add more assertions based on your response structure
    });

    it('should deactivate user profile by ID automatically', async () => {
        const userId = 'someUserId';
        const res = await request(app).put(`/dashboard/${userId}/deactivate`);
        expect(res.statusCode).toEqual(200);
        // Add more assertions based on your response structure
    });

    it('should fetch holidays for admin', async () => {
        const res = await request(app).get('/dashboard/api/holidaysAdmin');
        expect(res.statusCode).toEqual(200);
        // Add more assertions based on your response structure
    });
});