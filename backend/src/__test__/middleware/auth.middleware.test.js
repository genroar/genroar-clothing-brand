const jwt = require('jsonwebtoken');
const { http } = require('../../utils/http');
const auth = require('../../middleware/auth');

describe('Auth Middleware', () => {
    it('should return 401 if token is missing', () => {
        const req = {
            header: jest.fn().mockReturnValue(null)
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(http.unauthorized);
        expect(res.json).toHaveBeenCalledWith({ error: 'No token provided' });
    });

    it('should return 401 if token is invalid', () => {
        const req = {
            header: jest.fn().mockReturnValue('Bearer invalidtoken')
        };
        const res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn()
        };
        const next = jest.fn();

        jwt.verify = jest.fn(() => { throw new Error('Invalid token'); });

        auth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(http.unauthorized);
        expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
    });
});
