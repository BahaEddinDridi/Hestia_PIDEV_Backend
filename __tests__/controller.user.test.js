const request = require('supertest');
const app = require('../app'); // Assuming this is the file where your Express app is defined
const User = require('../Models/user');

describe('User Controller', () => {
  let user;

  beforeAll(async () => {
    // Create a test user
    user = new User({
      firstName: 'John',
      lastName: 'Doe',
      birthDate: '1990-01-01',
      username: 'johndoe',
      email: 'johndoe@example.com',
      password: 'password',
      gender: 'male',
      location: 'New York',
      phoneNumber: '1234567890',
      accountVisibility: 'public',
      title: 'Software Engineer',
      experience: [],
      education: [],
      project: [],
      role: 'user',
      CompanyLink: 'example.com',
      Country: 'USA',
    });
    await user.save();
  });

  afterAll(async () => {
    // Clean up the test user
    await User.deleteMany();
  });

  describe('POST /register', () => {
    it('should register a new user', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          firstName: 'Jane',
          lastName: 'Smith',
          birthDate: '1995-02-15',
          username: 'janesmith',
          email: 'janesmith@example.com',
          password: 'password',
          gender: 'female',
          location: 'Los Angeles',
          phoneNumber: '9876543210',
          accountVisibility: 'private',
          title: 'Web Developer',
          experience: [],
          education: [],
          project: [],
          role: 'user',
          CompanyLink: 'example.com',
          Country: 'USA',
        });

      expect(response.status).toBe(201);
      expect(response.body.message).toBe('User registered successfully');
    });

    it('should return an error if registration fails', async () => {
      const response = await request(app)
        .post('/register')
        .send({
          // Missing required fields
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  describe('PUT /updateprofile/:username', () => {
    it('should update the profile of an existing user', async () => {
      const response = await request(app)
        .put(`/updateprofile/${user.username}`)
        .send({
          firstName: 'Updated',
          lastName: 'User',
          birthDate: '1990-01-01',
          username: 'johndoe',
          email: 'johndoe@example.com',
          location: 'Updated Location',
          phoneNumber: '1234567890',
          accountVisibility: 'public',
          title: 'Software Engineer',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Profile updated successfully');
      expect(response.body.userToUpdate.firstName).toBe('Updated');
      expect(response.body.userToUpdate.lastName).toBe('User');
      expect(response.body.userToUpdate.location).toBe('Updated Location');
    });

    it('should return an error if user not found', async () => {
      const response = await request(app)
        .put('/updateprofile/nonexistentuser')
        .send({
          // Updated profile data
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should return an error if update fails', async () => {
      const response = await request(app)
        .put(`/updateprofile/${user.username}`)
        .send({
          // Invalid profile data
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  // Add more test cases for other controller methods...

});