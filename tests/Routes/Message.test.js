const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const Message = require('../../Models/Message');
const messageRouter = require('../../Routes/Message');

const app = express();
app.use(express.json());
app.use('/messages', messageRouter);

describe('Message Routes', () => {
    beforeAll(async () => {
        const url = `mongodb://127.0.0.1/message_test_db`;
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    describe('POST /messages', () => {
        it('should create a new message', async () => {
            const newMessage = { text: 'Hello, World!', ConversationId: '12345' };
            const response = await request(app).post('/messages').send(newMessage);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('_id');
            expect(response.body.text).toBe(newMessage.text);
        });
    });

    describe('GET /messages/:conversationId', () => {
        it('should get messages by conversationId', async () => {
            const conversationId = '12345';
            const response = await request(app).get(`/messages/${conversationId}`);
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
        });
    });

    describe('GET /messages/lastMessage/:conversationId', () => {
        it('should get the last message of a conversation', async () => {
            const conversationId = '12345';
            const response = await request(app).get(`/messages/lastMessage/${conversationId}`);
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('_id');
        });
    });
});