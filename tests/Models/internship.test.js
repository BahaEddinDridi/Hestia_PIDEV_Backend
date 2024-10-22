const mongoose = require('mongoose');
const Internship = require('../../Models/internship');
const skills = require('../../skill/skills.json');

describe('Internship Model Test', () => {
    beforeAll(async () => {
        await mongoose.connect('mongodb://127.0.0.1:27017/testdb', {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    it('should create and save an internship successfully', async () => {
        const validInternship = new Internship({
            interCompanyId: new mongoose.Types.ObjectId(),
            interCommpanyName: 'Test Company',
            interTitle: 'Test Internship',
            interAdress: '123 Test St',
            interLocation: 'Tunis',
            interDescription: 'This is a test internship',
            interPost: 'Intern',
            interfield: 'Computer Science',
            interStartDate: new Date(),
            interApplicationDeadline: new Date(),
            interRequiredSkills: [skills.skills[0]],
            interRequiredEducation: 'Bachelor degree 1st year',
            contactNumber: 1234567890,
            interOtherInformation: 'No additional info',
            interType: 'Summer Internship',
            interImage: 'testimage.jpg',
            internshipApplications: [],
        });

        const savedInternship = await validInternship.save();
        expect(savedInternship._id).toBeDefined();
        expect(savedInternship.interCommpanyName).toBe('Test Company');
        expect(savedInternship.interTitle).toBe('Test Internship');
    });

    it('should fail to create an internship without required fields', async () => {
        const invalidInternship = new Internship({
            interCommpanyName: 'Test Company',
        });

        let err;
        try {
            await invalidInternship.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.interTitle).toBeDefined();
    });

    it('should fail to create an internship with invalid enum value', async () => {
        const invalidInternship = new Internship({
            interCompanyId: new mongoose.Types.ObjectId(),
            interCommpanyName: 'Test Company',
            interTitle: 'Test Internship',
            interAdress: '123 Test St',
            interLocation: 'Invalid Location',
            interDescription: 'This is a test internship',
            interPost: 'Intern',
            interfield: 'Computer Science',
            interStartDate: new Date(),
            interApplicationDeadline: new Date(),
            interRequiredSkills: [skills.skills[0]],
            interRequiredEducation: 'Bachelor degree 1st year',
            contactNumber: 1234567890,
            interOtherInformation: 'No additional info',
            interType: 'Summer Internship',
            interImage: 'testimage.jpg',
            internshipApplications: [],
        });

        let err;
        try {
            await invalidInternship.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
        expect(err.errors.interLocation).toBeDefined();
    });
});