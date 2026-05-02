const request = require('supertest');
const app = require('../app');

describe('XSS Protection', () => {

    it('should sanitize script input in secure mode', async () => {

        // FORCE SECURE MODE
        app.set('isSecureMode', () => true);

        const res = await request(app)
            .post('/search-xss')
            .send({ name: "<script>alert('x')</script>" });

        expect(res.text).not.toContain("<script>");
    });

});