const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const typeDefs = require('./schema.ts');
const resolvers = require('./resolvers');


const app = express();
const JWT_SECRET = '54564564544yjjgju'; 


app.use((req, res, next) => {
  const token = req.headers.authorization;

  if (token) {
    try {
      req.user = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' }); 
    }
  }
  next();
});

// initialize Apollo Server
const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => ({ user: req.user, JWT_SECRET, redisClient: null }), 
});

// function to start the server and apply middleware
async function startServer() {
 
  server.context = ({ req }) => ({ user: req.user, JWT_SECRET});

  await server.start(); // Await server start
  server.applyMiddleware({ app });
  mongoose.connect('mongodb://localhost:27017/simpleGraphQL', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      console.log('MongoDB connected successfully!');
      app.listen(4000, () =>
        console.log('Server running on http://localhost:4000/graphql')
      );
    })
    .catch((err) => {
      console.log('Error connecting to MongoDB:', err);
    });
}


startServer();
