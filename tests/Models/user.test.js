const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../../Models/user');
const { MongoMemoryServer } = require('mongodb-memory-server');
const supertest = require('supertest');
const app = require('../../app'); // Assuming you have an Express app

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe('User Model Test Suite', () => {
    it('should create & save user successfully', async () => {
        const validUser = new User({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
            role: 'jobSeeker',
        });
        const savedUser = await validUser.save();

        expect(savedUser._id).toBeDefined();
        expect(savedUser.username).toBe(validUser.username);
        expect(savedUser.email).toBe(validUser.email);
        expect(savedUser.role).toBe(validUser.role);
    });

    it('should fail to create user without required fields', async () => {
        const userWithoutRequiredField = new User({ username: 'testuser' });
        let err;
        try {
            const savedUserWithoutRequiredField = await userWithoutRequiredField.save();
            error = savedUserWithoutRequiredField;
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.email).toBeDefined();
    });

    it('should hash the password before saving', async () => {
        const user = new User({
            username: 'testuser',
            email: 'testuser@example.com',
            password: 'password123',
            role: 'jobSeeker',
        });
        await user.save();
        const savedUser = await User.findOne({ username: 'testuser' });
        const isMatch = await bcrypt.compare('password123', savedUser.password);
        expect(isMatch).toBe(true);
    });

    it('should return true if the password is valid', async () => {
        const user = new User({
            username: 'testuser',
            email: 'testuser@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'jobSeeker',
        });
        await user.save();
        const isValid = await user.isValidPassword('password123');
        expect(isValid).toBe(true);
    });

    it('should return false if the password is invalid', async () => {
        const user = new User({
            username: 'testuser',
            email: 'testuser@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'jobSeeker',
        });
        await user.save();
        const isValid = await user.isValidPassword('wrongpassword');
        expect(isValid).toBe(false);
    });

    it('should block the account after 3 failed login attempts in a day', async () => {
        const user = new User({
            username: 'testuser',
            email: 'testuser@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'jobSeeker',
            loginAttempts: [
                { timestamp: new Date() },
                { timestamp: new Date() },
                { timestamp: new Date() },
            ],
        });
        await user.save();
        const isBlocked = user.isAccountBlocked();
        expect(isBlocked).toBe(true);
    });

    it('should not block the account if less than 3 failed login attempts in a day', async () => {
        const user = new User({
            username: 'testuser',
            email: 'testuser@example.com',
            password: await bcrypt.hash('password123', 10),
            role: 'jobSeeker',
            loginAttempts: [
                { timestamp: new Date() },
                { timestamp: new Date() },
            ],
        });
        await user.save();
        const isBlocked = user.isAccountBlocked();
        expect(isBlocked).toBe(false);
    });
});