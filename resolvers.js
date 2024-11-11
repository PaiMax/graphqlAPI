const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');
const client = require('./index');
const { createClient } = require('redis');

const resolvers = {
  Mutation: {
    async signup(_, { username, password }, { JWT_SECRET }) {
      
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new Error('Username is already taken');
      }


      const hashedPassword = await bcrypt.hash(password, 10);

      // create a new user
      const user = new User({
        username,
        password: hashedPassword,
      });

      await user.save();

      // generate token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

      return { id: user.id, username: user.username, token };
    },

    async login(_, { username, password }, { JWT_SECRET }) {
      const user = await User.findOne({ username });
      if (!user) {
        throw new Error('User not found');
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        throw new Error('Invalid password');
      }

      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '1h' });

      return { id: user.id, username: user.username, token };
    }
  },

  Query: {
    async getUser(_,{id}) {
        const redisClient = createClient({url: 'redis://localhost:6379'});
        redisClient.on('error', (err) => console.log('Redis Client Error', err));
        await redisClient.connect();
       
        console.log(id);
        
        const cacheKey = id;
      if (!id) {
        throw new Error('Unauthorized');
      }
     
      const redisGet = async (key) => await redisClient.get(key);
      const redisSet = async (key, value, expireSeconds = null) => {
        if (expireSeconds != null) {
          await redisClient.setEx(key, expireSeconds, value);
        } else {
          await redisClient.set(key, value);
        }
      };
     const cachedUsers= redisGet(id);
      if (cachedUsers) {
        console.log('Fetching from cache');
        return JSON.parse(cachedUsers);
      }
      console.log('Fetching from database');
      const users=User.findById(id);
     // await client.set(cacheKey, JSON.stringify(users), 'EX', 3600);
      await redisSet(cacheKey, JSON.stringify(users), 3600);
      


      return users;
    },

   
  }
};

module.exports = resolvers;
