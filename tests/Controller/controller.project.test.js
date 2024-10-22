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
    let server;
    let userId;

    beforeAll(async () => {
        server = app.listen(4000);
        const user = new User({ username: 'testuser', project: [] });
        await user.save();
        userId = user._id;
    });

    afterAll(async () => {
        await User.deleteMany({});
        server.close();
        mongoose.connection.close();
    });

    describe('Addproject', () => {
        it('should add a project to the user', async () => {
            const res = await request(server)
                .post('/projects/testuser')
                .send({
                    title: 'New Project',
                    startDate: '2023-01-01',
                    endDate: '2023-12-31',
                    description: 'Project description',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.project.length).toBe(1);
            expect(res.body.data.project[0].title).toBe('New Project');
        });
    });

    describe('Deleteproject', () => {
        it('should delete a project from the user', async () => {
            const user = await User.findOne({ username: 'testuser' });
            const projectId = user.project[0]._id;

            const res = await request(server)
                .delete(`/projects/testuser/${projectId}`);

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.project.length).toBe(0);
        });
    });

    describe('Updateproject', () => {
        it('should update a project of the user', async () => {
            const user = await User.findOneAndUpdate(
                { username: 'testuser' },
                { $push: { project: { title: 'Old Project', startDate: '2023-01-01', endDate: '2023-12-31', description: 'Old description' } } },
                { new: true }
            );
            const projectId = user.project[0]._id;

            const res = await request(server)
                .put(`/projects/testuser/${projectId}`)
                .send({
                    title: 'Updated Project',
                    startDate: '2023-01-01',
                    endDate: '2023-12-31',
                    description: 'Updated description',
                });

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.project[0].title).toBe('Updated Project');
        });
    });

    describe('getAllproject', () => {
        it('should get all projects of the user', async () => {
            const res = await request(server)
                .get('/projects/testuser');

            expect(res.status).toBe(200);
            expect(res.body.success).toBe(true);
            expect(res.body.data.length).toBe(1);
        });
    });
});