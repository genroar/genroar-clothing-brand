jest.setTimeout(10000); 
const request = require('supertest');
const express = require('express');
const { adminLogin } = require('../../controllers/admin.controller');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { pool } = require('../../config/db');
const { http } = require('../../utils/http');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

jest.mock('../../config/db', () => ({
    pool: {
        connect: jest.fn(),
    },
}));

const app = express();
app.use(express.json());
app.post('/login', adminLogin);

describe('Admin Controller - Login', () => {

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should return a token for valid credentials', async () => {
        const mockUser = { id: 1, username: 'admin', password: 'hashedPassword' };
        pool.connect.mockResolvedValueOnce({
            query: jest.fn().mockResolvedValueOnce({ rows: [mockUser] }),
            release: jest.fn(),
        });

        bcrypt.compare.mockResolvedValueOnce(true);
        jwt.sign.mockReturnValueOnce('mockToken');

        const response = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'password' });

        expect(response.status).toBe(http.success);
        expect(response.body.token).toBe('mockToken');
    });

    it('should return 401 for invalid credentials', async () => {
        pool.connect.mockResolvedValueOnce({
            query: jest.fn().mockResolvedValueOnce({ rows: [] }),
            release: jest.fn(),
        });

        const response = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'password' });

        expect(response.status).toBe(http.unauthorized);
        expect(response.body.error).toBe('Invalid credentials');
    });

    it('should return 400 if username or password is missing', async () => {
        const response = await request(app)
            .post('/login')
            .send({ username: '', password: '' });
        expect(response.status).toBe(http.badRequest);
        expect(response.body.error).toBe('Username and password are required');
    });

    it('should return 500 on server error', async () => {
        // Mock the pool.connect to throw an error
        pool.connect.mockImplementationOnce(() => {
            throw new Error('Database error');
        });
    
        // Make the request to the login endpoint
        const response = await request(app)
            .post('/login')
            .send({ username: 'admin', password: 'password' });
    
        // Assert the response status and error message
        expect(response.status).toBe(http.serverError);
        expect(response.body.error).toBe('Internal server error');
    }, 20000);
    
});