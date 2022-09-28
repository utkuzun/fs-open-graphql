import { gql } from '@apollo/client'

export const ALL_AUTHORS = gql`
  query {
    allAuthors {
      name
      born
      bookCount
      _id
    }
  }
`

export const ALL_BOOKS = gql`
  query {
    allBooks {
      title
      published
      author {
        name
        _id
      }
      genres
      _id
    }
  }
`

export const ADD_BOOK = gql`
  mutation Mutation(
    $title: String!
    $published: Int!
    $author: String!
    $genres: [String!]!
  ) {
    addBook(
      title: $title
      published: $published
      author: $author
      genres: $genres
    ) {
      title
      published
      author {
        name
      }
      _id
      genres
    }
  }
`

export const EDIT_BIRTH = gql`
  mutation Mutation($_id: ID!, $setBornTo: Int!) {
    editAuthor(_id: $_id, setBornTo: $setBornTo) {
      name
      _id
      born
      bookCount
    }
  }
`

export const LOGIN = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password) {
      value
    }
  }
`

export const CURRENT_USER = gql`
  query Me {
    me {
      username
      favouriteGenre
      id
    }
  }
`

export const SUBSCRIBE_ADD_POST = gql`
  subscription Subscription {
    bookAdded {
      author {
        name
        _id
      }
      title
      _id
    }
  }
`
