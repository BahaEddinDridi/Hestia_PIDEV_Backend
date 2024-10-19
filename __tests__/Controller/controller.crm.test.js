const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const CRM = require('../../Models/CRM');
const crmController = require('../../Controllers/controller.crm');

const app = express();
app.use(express.json());
app.post('/crm', crmController.addCRM);
app.get('/crm', crmController.getCRM);
app.put('/crm', crmController.updateCRM);

describe('CRM Controller', () => {
    beforeAll(async () => {
        const url = `mongodb://127.0.0.1/test_database`;
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    afterEach(async () => {
        await CRM.deleteMany({});
    });

    it('should add a new CRM', async () => {
        const crmData = { name: 'Test CRM', description: 'This is a test CRM' };
        const response = await request(app).post('/crm').send(crmData);
        expect(response.status).toBe(201);
        expect(response.body.name).toBe(crmData.name);
        expect(response.body.description).toBe(crmData.description);
    });

    it('should get all CRMs', async () => {
        const crmData = { name: 'Test CRM', description: 'This is a test CRM' };
        const newCRM = new CRM(crmData);
        await newCRM.save();

        const response = await request(app).get('/crm');
        expect(response.status).toBe(200);
        expect(response.body.length).toBe(1);
        expect(response.body[0].name).toBe(crmData.name);
        expect(response.body[0].description).toBe(crmData.description);
    });

    it('should update an existing CRM', async () => {
        const crmData = { name: 'Test CRM', description: 'This is a test CRM' };
        const newCRM = new CRM(crmData);
        await newCRM.save();

        const updatedData = { name: 'Updated CRM', description: 'This is an updated test CRM' };
        const response = await request(app).put('/crm').send(updatedData);
        expect(response.status).toBe(200);
        expect(response.body.name).toBe(updatedData.name);
        expect(response.body.description).toBe(updatedData.description);
    });

    it('should return 404 if CRM to update is not found', async () => {
        const updatedData = { name: 'Updated CRM', description: 'This is an updated test CRM' };
        const response = await request(app).put('/crm').send(updatedData);
        expect(response.status).toBe(404);
        expect(response.body.message).toBe('CRM not found');
    });
});