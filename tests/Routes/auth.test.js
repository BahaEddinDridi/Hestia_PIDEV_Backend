const request = require('supertest');
const express = require('express');
const authRoutes = require('../../Routes/auth'); // Adjust the path if necessary

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
    it('should handle Google callback', async () => {
        const response = await request(app).post('/auth/google/callback');
        expect(response.statusCode).toBe(200);
    });

    it('should login user', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({ username: 'testuser', password: 'testpassword' });
        expect(response.statusCode).toBe(200);
    });

    it('should refresh token', async () => {
        const response = await request(app).get('/auth/refresh');
        expect(response.statusCode).toBe(200);
    });

    it('should logout user', async () => {
        const response = await request(app).post('/auth/logout');
        expect(response.statusCode).toBe(200);
    });

    it('should access protected route', async () => {
        const response = await request(app).get('/auth/protected-route');
        expect(response.statusCode).toBe(200);
    });

    it('should handle GitHub callback', async () => {
        const response = await request(app).get('/auth/github/callback');
        expect(response.statusCode).toBe(200);
    });

    it('should handle LinkedIn callback', async () => {
        const response = await request(app).post('/auth/linkedin/callback');
        expect(response.statusCode).toBe(200);
        expect(response.body).toHaveProperty('accessToken', 'your_access_token');
    });

    it('should update password', async () => {
        const response = await request(app)
            .post('/auth/updatePassword')
            .send({ oldPassword: 'oldpassword', newPassword: 'newpassword' });
        expect(response.statusCode).toBe(200);
    });

    it('should send verification email', async () => {
        const response = await request(app)
            .post('/auth/send-email')
            .send({ email: 'test@example.com' });
        expect(response.statusCode).toBe(200);
    });

    it('should reset password via email', async () => {
        const response = await request(app).post('/auth/Reset_Passwords_Mail/123');
        expect(response.statusCode).toBe(200);
    });

    it('should add recovery email', async () => {
        const response = await request(app)
            .post('/auth/addRecoveryMail')
            .send({ email: 'recovery@example.com' });
        expect(response.statusCode).toBe(200);
    });

    it('should set security question', async () => {
        const response = await request(app)
            .post('/auth/SecurityQuestion')
            .send({ question: 'Your first pet?', answer: 'Fluffy' });
        expect(response.statusCode).toBe(200);
    });

    it('should verify security question', async () => {
        const response = await request(app)
            .post('/auth/verifySecurityQuestion')
            .send({ question: 'Your first pet?', answer: 'Fluffy' });
        expect(response.statusCode).toBe(200);
    });

    it('should receive mail', async () => {
        const response = await request(app)
            .post('/auth/receiveMail')
            .send({ email: 'test@example.com' });
        expect(response.statusCode).toBe(200);
    });
});