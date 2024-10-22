const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Conversation = require('../../Models/Conversation');
const User = require('../../Models/user');
const conversationRoute = require('../../Routes/Conversation');

const app = express();
app.use(express.json());
app.use('/conversations', conversationRoute);

describe('Conversation Routes', () => {
    beforeAll(async () => {
        const url = `mongodb://127.0.0.1/test_database`;
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    describe('POST /conversations', () => {
        it('should create a new conversation', async () => {
            const senderId = new mongoose.Types.ObjectId();
            const receiverId = new mongoose.Types.ObjectId();

            const res = await request(app)
                .post('/conversations')
                .send({ senderId, receiverId });

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.members).toContain(senderId.toString());
            expect(res.body.members).toContain(receiverId.toString());
        });
    });

    describe('GET /conversations/:userId', () => {
        it('should get conversations of a user', async () => {
            const userId = new mongoose.Types.ObjectId();
            const conversation = new Conversation({ members: [userId, new mongoose.Types.ObjectId()] });
            await conversation.save();

            const res = await request(app).get(`/conversations/${userId}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body.length).toBeGreaterThan(0);
            expect(res.body[0].members).toContain(userId.toString());
        });
    });

    describe('GET /conversations/find/:firstUserId/:secondUserId', () => {
        it('should get or create a conversation between two users', async () => {
            const firstUserId = new mongoose.Types.ObjectId();
            const secondUserId = new mongoose.Types.ObjectId();

            const res = await request(app).get(`/conversations/find/${firstUserId}/${secondUserId}`);

            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('_id');
            expect(res.body.members).toContain(firstUserId.toString());
            expect(res.body.members).toContain(secondUserId.toString());
        });
    });
});