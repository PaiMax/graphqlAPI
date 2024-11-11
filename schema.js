const { gql } = require('apollo-server-express');

const typeDefs = gql`
  type User {
    id: ID!
    username: String!
    token: String
  }

  type Query {
    getUser(id: ID!): User
  }

  type Mutation {
    login(username: String!, password: String!): User
    signup(username: String!, password: String!): User
  }
`;

module.exports = typeDefs;
