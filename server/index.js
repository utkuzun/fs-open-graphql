require('dotenv').config()
const { ApolloServer, UserInputError } = require('apollo-server-express')
const {
  ApolloServerPluginDrainHttpServer,
  ApolloServerPluginLandingPageLocalDefault,
} = require('apollo-server-core')

const { makeExecutableSchema } = require('@graphql-tools/schema')
const { gql } = require('apollo-server')

const { WebSocketServer } = require('ws')
const { useServer } = require('graphql-ws/lib/use/ws')

const express = require('express')
const http = require('http')

const { default: mongoose } = require('mongoose')
const jwt = require('jsonwebtoken')

const { bookTypes, bookResolvers } = require('./schemas/Book')
const { authorTypes, authorResolvers } = require('./schemas/Author')

const { merge } = require('lodash')

const Author = require('./models/Author')
const Book = require('./models/Book')
const User = require('./models/User')

const MONGODB_URI = process.env.MONGODB_URI

const typeDefs = gql`
  type User {
    username: String!
    favouriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

  type Query {
    me: User
  }

  type Mutation {
    createUser(username: String!, favouriteGenre: String!): User
    login(username: String!, password: String!): Token
  }

  type Subscription {
    _empty: String
  }
`

const resolvers = {
  Query: {
    me: (root, args, { currentUser }) => currentUser,
  },

  Mutation: {
    createUser: async (root, args) => {
      try {
        const user = await User.create({ ...args })
        return user
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: args,
        })
      }
    },

    login: async (root, args) => {
      const user = await User.findOne({ username: args.username })

      if (!user || args.password !== 'supret') {
        throw new UserInputError('Invalid credentials!!', {
          invalidArgs: args,
        })
      }

      const userForToken = { username: user.username, id: user._id }
      const token = jwt.sign(userForToken, process.env.SECRET_KEY)

      return { value: token }
    },
  },
}

const start = async () => {
  const app = express()
  const httpServer = http.createServer(app)

  const schema = makeExecutableSchema({
    typeDefs: [typeDefs, bookTypes, authorTypes],
    resolvers: merge(resolvers, bookResolvers, authorResolvers),
  })

  // Creating the WebSocket server
  const wsServer = new WebSocketServer({
    // This is the `httpServer` we created in a previous step.
    server: httpServer,
    // Pass a different path here if your ApolloServer serves at
    // a different path.
    path: '/',
  })

  // Hand in the schema we just created and have the
  // WebSocketServer start listening.
  const serverCleanup = useServer({ schema }, wsServer)

  const server = new ApolloServer({
    schema,
    context: async ({ req }) => {
      const auth = req ? req.headers.authorization : null
      if (auth && auth.toLowerCase().startsWith('bearer ')) {
        const decodedToken = jwt.verify(
          auth.substring(7),
          process.env.SECRET_KEY
        )
        const currentUser = await User.findById(decodedToken.id)
        return { currentUser }
      }
    },
    plugins: [
      ApolloServerPluginDrainHttpServer({ httpServer }),
      // Proper shutdown for the WebSocket server.
      {
        async serverWillStart() {
          return {
            async drainServer() {
              await serverCleanup.dispose()
            },
          }
        },
      },
      ApolloServerPluginLandingPageLocalDefault({ embed: true }),
    ],
  })

  try {
    await mongoose.connect(MONGODB_URI)

    await server.start()

    server.applyMiddleware({
      app,
      path: '/',
    })

    const PORT = 4001

    httpServer.listen(PORT, () =>
      console.log(`Server is now running on http://localhost:${PORT}`)
    )
  } catch (error) {
    console.log(error)
  }
}

start()
