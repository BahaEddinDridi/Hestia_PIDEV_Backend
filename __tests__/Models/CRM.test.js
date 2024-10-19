const mongoose = require('mongoose');
const CRM = require('../../Models/CRM');
const { MongoMemoryServer } = require('mongodb-memory-server');
const supertest = require('supertest');
const app = require('../../app'); // Assuming you have an Express app in app.js

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

describe('CRM Model Test', () => {
    it('should create & save CRM successfully', async () => {
        const validCRM = new CRM({
            PrivacyPolicy: 'https://example.com/privacy',
            TermsOfService: 'https://example.com/terms',
            Location: '123 Main St',
            Email: 'contact@example.com',
            PhoneNumber: 1234567890,
            Description: 'A sample company',
            CompanyName: 'Example Inc.',
            CompanyLink: 'https://example.com',
            SocialMedia: {
                Facebook: 'https://facebook.com/example',
                Twitter: 'https://twitter.com/example',
                LinkedIn: 'https://linkedin.com/company/example',
                Instagram: 'https://instagram.com/example'
            }
        });
        const savedCRM = await validCRM.save();
        expect(savedCRM._id).toBeDefined();
        expect(savedCRM.PrivacyPolicy).toBe(validCRM.PrivacyPolicy);
        expect(savedCRM.TermsOfService).toBe(validCRM.TermsOfService);
        expect(savedCRM.Location).toBe(validCRM.Location);
        expect(savedCRM.Email).toBe(validCRM.Email);
        expect(savedCRM.PhoneNumber).toBe(validCRM.PhoneNumber);
        expect(savedCRM.Description).toBe(validCRM.Description);
        expect(savedCRM.CompanyName).toBe(validCRM.CompanyName);
        expect(savedCRM.CompanyLink).toBe(validCRM.CompanyLink);
        expect(savedCRM.SocialMedia.Facebook).toBe(validCRM.SocialMedia.Facebook);
        expect(savedCRM.SocialMedia.Twitter).toBe(validCRM.SocialMedia.Twitter);
        expect(savedCRM.SocialMedia.LinkedIn).toBe(validCRM.SocialMedia.LinkedIn);
        expect(savedCRM.SocialMedia.Instagram).toBe(validCRM.SocialMedia.Instagram);
    });

    it('should fail to create CRM without required fields', async () => {
        const invalidCRM = new CRM({
            // Missing required fields
        });
        let err;
        try {
            await invalidCRM.save();
        } catch (error) {
            err = error;
        }
        expect(err).toBeInstanceOf(mongoose.Error.ValidationError);
    });
});