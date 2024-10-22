const request = require('supertest');
const express = require('express');
const notificationRoutes = require('../../Routes/notification');

const app = express();

app.use(express.json());
app.use('/notifications', notificationRoutes);

describe('Notification Routes', () => {
    it('should get notifications by user ID', async () => {
        const response = await request(app).get('/notifications/getNotificationsByUser/1');
        expect(response.status).toBe(200);
        // Add more assertions based on your expected response
    });

    it('should mark notifications as read', async () => {
        const response = await request(app)
            .post('/notifications/markNotificationsAsRead')
            .send({ userId: 1 });
        expect(response.status).toBe(200);
        // Add more assertions based on your expected response
    });

    it('should get notifications by date', async () => {
        const response = await request(app).get('/notifications/NotificationsByDate/1');
        expect(response.status).toBe(200);
        // Add more assertions based on your expected response
    });

    it('should get notifications by date and recipient ID', async () => {
        const response = await request(app).get('/notifications/NotificationsByDateAndRecepientId/2023-10-01/1');
        expect(response.status).toBe(200);
        // Add more assertions based on your expected response
    });

    it('should get notifications count stat by user ID', async () => {
        const response = await request(app).get('/notifications/getNotificationsCountStat/1');
        expect(response.status).toBe(200);
        // Add more assertions based on your expected response
    });
});