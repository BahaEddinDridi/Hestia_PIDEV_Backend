const request = require('supertest');
const express = require('express');
const router = require('../../Routes/Scraping');

const app = express();
app.use('/api', router);

describe('Scraping Routes', () => {
    test('GET /api/scraper/:location/:keywords should call scrapLinkedin', async () => {
        const response = await request(app).get('/api/scraper/NewYork/Developer');
        expect(response.status).toBe(200);
    });

    test('GET /api/scraper/skills should call extractSkillsFromJobs', async () => {
        const response = await request(app).get('/api/scraper/skills');
        expect(response.status).toBe(200);
    });

    test('GET /api/scraper/topSkills should call topSkills', async () => {
        const response = await request(app).get('/api/scraper/topSkills');
        expect(response.status).toBe(200);
    });

    test('GET /api/scraper/exportPDF should call exportPDF', async () => {
        const response = await request(app).get('/api/scraper/exportPDF');
        expect(response.status).toBe(200);
    });

    test('GET /api/scraper/exportExcel should call exportExcel', async () => {
        const response = await request(app).get('/api/scraper/exportExcel');
        expect(response.status).toBe(200);
    });

    test('GET /api/scraper/topLocations should call topLocations', async () => {
        const response = await request(app).get('/api/scraper/topLocations');
        expect(response.status).toBe(200);
    });

    test('GET /api/scraper/topEmploymentType should call topEmploymentType', async () => {
        const response = await request(app).get('/api/scraper/topEmploymentType');
        expect(response.status).toBe(200);
    });

    test('GET /api/scraper/topCompanies should call topCompanies', async () => {
        const response = await request(app).get('/api/scraper/topCompanies');
        expect(response.status).toBe(200);
    });

    test('GET /api/scraper/topSeniorityLevel should call topSeniorityLevel', async () => {
        const response = await request(app).get('/api/scraper/topSeniorityLevel');
        expect(response.status).toBe(200);
    });
});