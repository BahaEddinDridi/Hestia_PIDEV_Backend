const request = require('supertest');
const express = require('express');
const applicationRouter = require('../../Routes/application');
const ApplicationController = require('../../Controllers/controller.application');

const app = express();

app.use(express.json());
app.use('/application', applicationRouter);

jest.mock('../Controllers/controller.application');

describe('Application Routes', () => {
    it('should handle resume upload', async () => {
        ApplicationController.saveApplication.mockImplementation((req, res) => res.status(200).send('Resume uploaded'));
        const res = await request(app).post('/application/saveApplication').send({ /* your payload here */ });
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Resume uploaded');
    });

    it('should get available job applications', async () => {
        ApplicationController.getAvailableJobsApplications.mockImplementation((req, res) => res.status(200).send('Available jobs'));
        const res = await request(app).get('/application/getJobApplicationAvailable');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Available jobs');
    });

    it('should get unavailable job applications', async () => {
        ApplicationController.getUnavailableJobsApplications.mockImplementation((req, res) => res.status(200).send('Unavailable jobs'));
        const res = await request(app).get('/application/getJobApplicationNotAvailable');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Unavailable jobs');
    });

    it('should get available internship applications', async () => {
        ApplicationController.getAvailableInternshipApplications.mockImplementation((req, res) => res.status(200).send('Available internships'));
        const res = await request(app).get('/application/getIntershipsApplicationAvailable');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Available internships');
    });

    it('should get unavailable internship applications', async () => {
        ApplicationController.getUnavailableInternshipApplications.mockImplementation((req, res) => res.status(200).send('Unavailable internships'));
        const res = await request(app).get('/application/getIntershipsApplicationNotAvailable');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Unavailable internships');
    });

    it('should handle internship application save', async () => {
        ApplicationController.saveInternshipApplication.mockImplementation((req, res) => res.status(200).send('Internship application saved'));
        const res = await request(app).post('/application/saveInternshipApplication').send({ /* your payload here */ });
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Internship application saved');
    });

    it('should update application', async () => {
        ApplicationController.updateApplication.mockImplementation((req, res) => res.status(200).send('Application updated'));
        const res = await request(app).put('/application/updateApplication/1').send({ /* your payload here */ });
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Application updated');
    });

    it('should update internship application', async () => {
        ApplicationController.updateInternshipApplication.mockImplementation((req, res) => res.status(200).send('Internship application updated'));
        const res = await request(app).put('/application/updateInternshipApplication/1').send({ /* your payload here */ });
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Internship application updated');
    });

    it('should get applications by username', async () => {
        ApplicationController.getApplicationsByUsername.mockImplementation((req, res) => res.status(200).send('Applications by username'));
        const res = await request(app).get('/application/getApplicationsByUsername/testuser');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Applications by username');
    });

    it('should delete application', async () => {
        ApplicationController.deleteApplication.mockImplementation((req, res) => res.status(200).send('Application deleted'));
        const res = await request(app).delete('/application/deleteApplication/1');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Application deleted');
    });

    it('should update application status', async () => {
        ApplicationController.updateApplicationStatus.mockImplementation((req, res) => res.status(200).send('Application status updated'));
        const res = await request(app).put('/application/updatestatus').send({ /* your payload here */ });
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Application status updated');
    });

    it('should update internship application status', async () => {
        ApplicationController.updatestatuinter.mockImplementation((req, res) => res.status(200).send('Internship application status updated'));
        const res = await request(app).put('/application/updatestatusinter').send({ /* your payload here */ });
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Internship application status updated');
    });

    it('should handle calendar event', async () => {
        ApplicationController.calendar.mockImplementation((req, res) => res.status(200).send('Calendar event'));
        const res = await request(app).get('/application/calendrie/event');
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Calendar event');
    });

    it('should select interview date', async () => {
        ApplicationController.selectInterviewDate.mockImplementation((req, res) => res.status(200).send('Interview date selected'));
        const res = await request(app).put('/application/selecteddate').send({ /* your payload here */ });
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual('Interview date selected');
    });
});