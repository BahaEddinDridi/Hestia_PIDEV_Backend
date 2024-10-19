const mongoose = require('mongoose');
const Project = require('../../Models/Project');
const { MongoMemoryServer } = require('mongodb-memory-server');
const supertest = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

let mongoServer;
let app;
let request;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });

    app = express();
    app.use(bodyParser.json());

    app.post('/projects', async (req, res) => {
        try {
            const project = new Project(req.body);
            await project.save();
            res.status(201).send(project);
        } catch (error) {
            res.status(400).send(error);
        }
    });

    request = supertest(app);
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('Project Model Test', () => {
    it('should create a project successfully', async () => {
        const projectData = {
            title: 'Test Project',
            description: 'Test Description',
            startDate: new Date(),
            endDate: new Date(),
        };

        const response = await request.post('/projects').send(projectData);
        expect(response.status).toBe(201);
        expect(response.body.title).toBe(projectData.title);
        expect(response.body.description).toBe(projectData.description);
    });

    it('should fail to create a project without a title', async () => {
        const projectData = {
            description: 'Test Description',
            startDate: new Date(),
            endDate: new Date(),
        };

        const response = await request.post('/projects').send(projectData);
        expect(response.status).toBe(400);
    });


});