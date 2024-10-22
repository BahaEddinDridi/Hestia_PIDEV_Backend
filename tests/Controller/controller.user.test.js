const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const User = require('../../Models/user');
const Notification = require('../../Models/Notification');
const userController = require('../../Controllers/controller.user');

const app = express();
app.use(express.json());
app.post('/register', userController.registerUser);
app.put('/updateprofile/:username', userController.updateprofile);
app.get('/user/:username', userController.getinfouser);
app.post('/uploadimage', userController.uploadimage);
app.post('/uploadcoverimage', userController.uploadcoverimage);
app.post('/deactivate', userController.deactivatedaccount);
app.get('/getimage', userController.getimagbyapp);
app.get('/getuserbyid', userController.getUserById);
app.get('/getusersbyuserid/:userId', userController.getUsersByUserId);
app.get('/getallusers', userController.getAllUsers);
app.get('/getoneuserbyid/:userId', userController.getOneUserById);

describe('User Controller', () => {
    beforeAll(async () => {
        const url = `mongodb://127.0.0.1/test_db`;
        await mongoose.connect(url, { useNewUrlParser: true, useUnifiedTopology: true });
    });

    afterAll(async () => {
        await mongoose.connection.db.dropDatabase();
        await mongoose.connection.close();
    });

    describe('registerUser', () => {
        it('should register a new user', async () => {
            const res = await request(app).post("/register").send({
              firstName: "John",
              lastName: "Doe",
              birthDate: "1990-01-01",
              username: "johndoe",
              email: "johndoe@example.com",
              password: "password123",
              gender: "male",
              role: "jobSeeker",
              CompanyLink: "http://example.com",
              Country: "USA",
            });
            expect(res.statusCode).toEqual(201);
            expect(res.body).toHaveProperty('message', 'User registered successfully');
        });
    });

    describe('updateprofile', () => {
        it('should update user profile', async () => {
            const user = new User({
              firstName: "John",
              lastName: "Doe",
              birthDate: "1990-01-01",
              username: "johndoe",
              email: "johndoe@example.com",
              password: "password123",
              gender: "male",
              role: "jobSeeker",
              CompanyLink: "http://example.com",
              Country: "USA",
            });
            await user.save();

            const res = await request(app)
                .put(`/updateprofile/${user.username}`)
                .send({
                    firstName: 'Jane',
                    lastName: 'Doe',
                    birthDate: '1990-01-01',
                    username: 'janedoe',
                    email: 'janedoe@example.com',
                    location: 'New York',
                    phoneNumber: '1234567890',
                    title: 'Developer',
                    accountVisibility: 'private',
                    skills: ['JavaScript', 'Node.js']
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('message', 'Profile updated successfully');
        });
    });

    describe('getinfouser', () => {
        it('should get user info', async () => {
            const user = new User({
              firstName: "John",
              lastName: "Doe",
              birthDate: "1990-01-01",
              username: "johndoe",
              email: "johndoe@example.com",
              password: "password123",
              gender: "male",
              role: "jobSeeker",
              CompanyLink: "http://example.com",
              Country: "USA",
            });
            await user.save();

            const res = await request(app).get(`/user/${user.username}`);
            expect(res.statusCode).toEqual(200);
            expect(res.body).toHaveProperty('username', 'johndoe');
        });
    });

    // Add more tests for other functions similarly
});