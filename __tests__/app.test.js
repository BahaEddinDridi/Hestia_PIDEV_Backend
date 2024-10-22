const request = require('supertest');
const { app } = require('../app');
const morgan = require('morgan');

describe('Middleware Tests', () => {
    it('should use morgan middleware', () => {
        const middlewares = app._router.stack;
        const morganMiddleware = middlewares.find(middleware => middleware.name === 'logger');
        expect(morganMiddleware).toBeDefined();
    });

    it('should log requests using morgan', async () => {
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
        await request(app).get('/auth');
        expect(logSpy).toHaveBeenCalled();
        logSpy.mockRestore();
    });
});