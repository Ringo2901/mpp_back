const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'aT6uH4K9zYxL2QbF5RvD8eW1oJmN3XpF7zR0CkU8lYgW9MnT5jLk2B3eVxZqO';

class AuthService {
    constructor() {
        this.users = [];
    }

    async register(username, password) {
        const existingUser = this.users.find(user => user.username === username);
        if (existingUser) {
            throw new Error('User already exists');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = { username, password: hashedPassword };
        this.users.push(user);

        return { message: 'User registered successfully' };
    }

    async login(username, password) {
        const user = this.users.find(user => user.username === username);
        if (!user) {
            throw new Error('Invalid username or password');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            throw new Error('Invalid username or password');
        }

        const token = jwt.sign({ username: user.username }, SECRET_KEY, { expiresIn: '1h' });

        return token;
    }

    verifyToken(token) {
        try {
            return jwt.verify(token, SECRET_KEY);
        } catch (err) {
            throw new Error('Invalid token');
        }
    }
}

module.exports = new AuthService();
