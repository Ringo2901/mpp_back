const express = require('express');
const cors = require('cors');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const { ApolloServer, gql } = require('apollo-server-express');
const { getTasks, createTask, updateTask, deleteTask, getFile } = require('./services/taskService');
const authService = require('./services/authService');

const app = express();

app.use(cors({
    origin: 'http://localhost:4200',
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const typeDefs = gql`
  type Task {
    id: ID!
    title: String!
    status: String!
    dueDate: String!
    file: String
    fileName: String
  }

  type Query {
    tasks: [Task!]!
    getFile(filename: String!): String!
  }

  type Mutation {
    register(username: String!, password: String!): String!
    login(username: String!, password: String!): String!
    logout: String!
    createTask(title: String!, status: String!, dueDate: String!, file: String, fileName: String): Task!
    updateTask(id: ID!, title: String!, status: String!, dueDate: String!): Task!
    deleteTask(id: ID!): ID!
  }
`;

const resolvers = {
    Query: {
        tasks: () => getTasks(),
        getFile: (_, { filename }) => {
            try {
                return getFile(filename);
            } catch (err) {
                throw new Error(err.message);
            }
        },
    },
    Mutation: {
        register: async (_, { username, password }) => {
            try {
                const result = await authService.register(username, password);
                return 'Registered successfully';
            } catch (err) {
                throw new Error(err.message);
            }
        },
        login: async (_, { username, password }, { res }) => {
            try {
                const token = await authService.login(username, password);
                // Установка токена в cookie
                res.cookie('token', token, { httpOnly: true });
                return 'Logged in successfully';
            } catch (err) {
                throw new Error(err.message);
            }
        },
        logout: (_, __, { res }) => {
            res.clearCookie('token');
            return 'Logged out successfully';
        },
        createTask: (_, { title, status, dueDate, file, fileName }) => {
            try {
                return createTask({ title, status, dueDate, file, fileName });
            } catch (err) {
                throw new Error(err.message);
            }
        },
        updateTask: (_, { id, title, status, dueDate }) => {
            try {
                return updateTask(id, { title, status, dueDate });
            } catch (err) {
                throw new Error(err.message);
            }
        },
        deleteTask: (_, { id }) => {
            try {
                deleteTask(id);
                return id;
            } catch (err) {
                throw new Error(err.message);
            }
        },
    },
};

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req, res }) => ({ req, res }),
});

server.start().then(() => {
    server.applyMiddleware({ app, path: '/',     cors: {
            origin: 'http://localhost:4200',
            credentials: true,
        },});

    const PORT = 3000;
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} and GraphQL is available at http://localhost:${PORT}/`);
    });
});
