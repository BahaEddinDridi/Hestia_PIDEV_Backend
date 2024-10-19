const request = require('supertest');
const app = require('../app'); // Assuming this is the file where your Express app is defined
const User = require('../Models/user');

describe('Project Controller', () => {
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

  describe('PUT /updateproject/:username', () => {
    it('should update the project list of an existing user', async () => {
      const response = await request(app)
        .put(`/updateproject/${user.username}`)
        .send({
          title: 'New Project',
          description: 'This is a new project',
          startDate: '2022-01-01',
          endDate: '2022-12-31',
        });

      expect(response.status).toBe(200);
      expect(response.body.message).toBe('Project updated successfully');
      expect(response.body.updatedUser.project).toHaveLength(1);
      expect(response.body.updatedUser.project[0].title).toBe('New Project');
      expect(response.body.updatedUser.project[0].description).toBe('This is a new project');
      expect(response.body.updatedUser.project[0].startDate).toBe('2022-01-01');
      expect(response.body.updatedUser.project[0].endDate).toBe('2022-12-31');
    });

    it('should return an error if user not found', async () => {
      const response = await request(app)
        .put('/updateproject/nonexistentuser')
        .send({
          title: 'New Project',
          description: 'This is a new project',
          startDate: '2022-01-01',
          endDate: '2022-12-31',
        });

      expect(response.status).toBe(404);
      expect(response.body.error).toBe('User not found');
    });

    it('should return an error if update fails', async () => {
      const response = await request(app)
        .put(`/updateproject/${user.username}`)
        .send({
          // Invalid project data
        });

      expect(response.status).toBe(500);
      expect(response.body.error).toBe('Internal Server Error');
    });
  });

  // Add more test cases for other controller methods...

});