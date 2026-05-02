const request = require('supertest');
const app = require('../app');

jest.mock('../database', () => ({
    execute: jest.fn(),
    query: jest.fn()
}));

const db = require('../database');

describe('SQL Injection Test', () => {

    it('should block SQL injection in secure mode', async () => {

        app.set('isSecureMode', () => true);

        db.execute.mockResolvedValue([[]]);

        const res = await request(app)
            .post('/search-sql')
            .send({ id: "1 OR 1=1" });

        expect(res.statusCode).toBe(200);
        expect(res.text).toContain("Invalid user ID");
    });

});