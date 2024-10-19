const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../Models/user');
const { Addproject, Deleteproject, Updateproject, getAllproject } = require('../../Controllers/controller.project');

const app = express();
app.use(express.json());
app.post('/projects/:username', Addproject);
app.delete('/projects/:username/:projectId', Deleteproject);
app.put('/projects/:username/:projectId', Updateproject);
app.get('/projects/:username', getAllproject);

describe('Project Controller', () => {
    beforeAll(async () => {
        const url = `mongodb://127.0.0.1/test_database`;
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    describe('Addproject', () => {
        it('should add a project to the user', async () => {
            const user = new User({ username: 'testuser', project: [] });
            await user.save();

            const response = await request(app)
                .post('/projects/testuser')
                .send({ title: 'Test Project', startDate: '2023-01-01', endDate: '2023-12-31', description: 'Test Description' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.project.length).toBe(1);
            expect(response.body.data.project[0].title).toBe('Test Project');
        });
    });

    describe('Deleteproject', () => {
        it('should delete a project from the user', async () => {
            const user = new User({ username: 'testuser', project: [{ _id: new mongoose.Types.ObjectId(), title: 'Test Project' }] });
            await user.save();

            const projectId = user.project[0]._id;

            const response = await request(app)
                .delete(`/projects/testuser/${projectId}`);

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.project.length).toBe(0);
        });
    });

    describe('Updateproject', () => {
        it('should update a project for the user', async () => {
            const user = new User({ username: 'testuser', project: [{ _id: new mongoose.Types.ObjectId(), title: 'Old Title' }] });
            await user.save();

            const projectId = user.project[0]._id;

            const response = await request(app)
                .put(`/projects/testuser/${projectId}`)
                .send({ title: 'New Title', startDate: '2023-01-01', endDate: '2023-12-31', description: 'Updated Description' });

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.project[0].title).toBe('New Title');
        });
    });

    describe('getAllproject', () => {
        it('should get all projects for the user', async () => {
            const user = new User({ username: 'testuser', project: [{ title: 'Test Project' }] });
            await user.save();

            const response = await request(app)
                .get('/projects/testuser');

            expect(response.status).toBe(200);
            expect(response.body.success).toBe(true);
            expect(response.body.data.length).toBe(1);
            expect(response.body.data[0].title).toBe('Test Project');
        });
    });
});