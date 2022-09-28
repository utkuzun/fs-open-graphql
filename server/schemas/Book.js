const { gql } = require('apollo-server')
const Book = require('../models/Book')
const Author = require('../models/Author')

const { PubSub } = require('graphql-subscriptions')
const pubsub = new PubSub()

const { UserInputError } = require('apollo-server-express')

const bookTypes = gql`
  type Book {
    title: String!
    published: Int!
    author: Author!
    _id: ID!
    genres: [String!]!
  }

  extend type Query {
    bookCount: Int!
    allBooks(author: String, genre: String): [Book!]!
  }

  extend type Mutation {
    addBook(
      title: String!
      published: Int!
      author: String!
      genres: [String!]!
    ): Book!
  }
  extend type Subscription {
    bookAdded: Book!
  }
`

const bookResolvers = {
  Query: {
    bookCount: async () => await Book.collection.countDocuments(),
    allBooks: async (root, args) => {
      const books = await Book.find({}).populate('author', {})
      return books
    },
  },

  Mutation: {
    addBook: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new UserInputError('Not authenticated!!')
      }
      try {
        let author = await Author.findOne({ name: args.author })

        if (!author) {
          author = await Author.create({ name: args.author })
        }

        const newBook = await Book.create({
          ...args,
          author: author._id,
        })

        author = await Author.findByIdAndUpdate(
          { _id: author._id },
          {
            books: author.books.concat(newBook._id),
          },
          {
            new: true,
            runValidators: true,
          }
        )
        const bookFinal = await Book.findOne({ _id: newBook._id }).populate(
          'author',
          {}
        )
        pubsub.publish('BOOK_ADDED', { bookAdded: bookFinal })
        return bookFinal
      } catch (error) {
        if (error.name === 'ValidationError') {
          Object.keys(error.errors).forEach((attr) => {
            throw new UserInputError(`${attr} validation failed`, {
              invalidArgs: attr,
            })
          })
        }
        if (error.name === 'MongoServerError') {
          Object.keys(error.keyValue).forEach((attr) => {
            throw new UserInputError(`${attr} validation failed`, {
              invalidArgs: attr,
            })
          })
        }
      }
    },
  },

  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(['BOOK_ADDED']),
    },
  },
}

module.exports = { bookTypes, bookResolvers }
