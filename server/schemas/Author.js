const { gql } = require('apollo-server')
const Author = require('../models/Author')
const Book = require('../models/Book')

const authorTypes = gql`
  type Author {
    name: String!
    _id: ID!
    born: Int
    bookCount: Int!
    books: [Book!]!
  }

  extend type Query {
    authorCount: Int!
    allAuthors: [Author!]!
  }

  extend type Mutation {
    editAuthor(_id: ID!, setBornTo: Int!): Author
  }
`

const authorResolvers = {
  Query: {
    authorCount: async () => await Author.collection.countDocuments(),
    allAuthors: async () => {
      const authors = await Author.find({}).populate('books', {})
      return authors
    },
  },

  Mutation: {
    editAuthor: async (root, args, { currentUser }) => {
      if (!currentUser) {
        throw new UserInputError('Not authenticated!!')
      }

      const author = await Author.findOneAndUpdate(
        { _id: args._id },
        { born: args.setBornTo },
        {
          new: true,
          runValidators: true,
        }
      )

      if (!author)
        throw new UserInputError('Person doesn"t exist!!', {
          invalidArgs: args.name,
        })

      return author
    },
  },

  Author: {
    bookCount: async (root, args) => {
      const authorBooks = await Book.find({ author: root.id })

      return authorBooks.length
    },
    books: (root, args) => root.books,
  },
}

module.exports = { authorTypes, authorResolvers }
