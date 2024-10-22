const request = require('supertest');
const { app, io, sendNotificationToAdmin, getUser } = require('../../app');
const http = require('http');
const socketIoClient = require('socket.io-client');

let server;
let clientSocket;

beforeAll((done) => {
    server = http.createServer(app);
    server.listen(() => {
        const port = server.address().port;
        clientSocket = socketIoClient(`http://localhost:${port}`);
        clientSocket.on('connect', done);
    });
});

afterAll((done) => {
    clientSocket.close();
    server.close(done);
});

describe('Express Routes', () => {
    test('GET /auth should return 200', async () => {
        const res = await request(app).get('/auth');
        expect(res.statusCode).toBe(200);
    });

    test('GET /user should return 200', async () => {
        const res = await request(app).get('/user');
        expect(res.statusCode).toBe(200);
    });

    // Add more tests for other routes as needed
});

describe('Socket.io', () => {
    test('should connect to socket.io server', (done) => {
        clientSocket.on('connect', () => {
            expect(clientSocket.connected).toBe(true);
            done();
        });
    });

    test('should add user and get users', (done) => {
        clientSocket.emit('addUser', 'testUserId');
        clientSocket.on('getUsers', (users) => {
            expect(users).toEqual(expect.arrayContaining([{ userId: 'testUserId', socketId: expect.any(String) }]));
            done();
        });
    });

    test('should send and receive message', (done) => {
        const message = { senderId: 'testSenderId', receiverId: 'testReceiverId', text: 'Hello' };
        clientSocket.emit('sendMessage', message);
        clientSocket.on('getMessage', (msg) => {
            expect(msg).toEqual(message);
            done();
        });
    });

    // Add more tests for other socket.io events as needed
});

describe('Utility Functions', () => {
    test('getUser should return user by userId', () => {
        const userId = 'testUserId';
        const socketId = 'testSocketId';
        addUser(userId, socketId);
        const user = getUser(userId);
        expect(user).toEqual({ userId, socketId });
    });

    test('sendNotificationToAdmin should emit newNotification to all connected admins', () => {
        const message = 'Test Notification';
        const mockEmit = jest.fn();
        connectedAdmins['adminSocketId'] = { emit: mockEmit };
        sendNotificationToAdmin(message);
        expect(mockEmit).toHaveBeenCalledWith('newNotification', message);
    });

    // Add more tests for other utility functions as needed
});