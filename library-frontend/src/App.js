import { useState } from 'react'
import { useApolloClient, useQuery, useSubscription } from '@apollo/client'
import { useEffect } from 'react'

import { CURRENT_USER, SUBSCRIBE_ADD_POST } from './queries'

import Authors from './components/Authors'
import Books from './components/Books'
import NewBook from './components/NewBook'
import Login from './components/Login'
import Recomends from './components/Recomends'

const App = () => {
  const [page, setPage] = useState('authors')
  const [token, setToken] = useState()
  const [user, setUser] = useState()

  const result = useQuery(CURRENT_USER)
  const client = useApolloClient()

  useSubscription(SUBSCRIBE_ADD_POST, {
    onSubscriptionData: ({ subscriptionData }) => {
      const {
        author: { name },
        title,
      } = subscriptionData.data.bookAdded
      window.alert(`${title} by ${name} added!!`)
    },
  })

  useEffect(() => {
    const currentUser = result.data && result.data.me
    setUser(currentUser)
  }, [result.data])

  useEffect(() => {
    setToken(localStorage.getItem('user-token'))
  }, [token])

  const logout = () => {
    setToken(null)
    client.resetStore()
    localStorage.clear()
    setPage('authors')
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage('authors')}>authors</button>
        <button onClick={() => setPage('books')}>books</button>
        {token ? (
          <>
            <button onClick={() => setPage('recomends')}>recomends</button>
            <button onClick={() => setPage('add')}>add book</button>
            <button onClick={logout}>logout</button>
          </>
        ) : (
          <button onClick={() => setPage('login')}>Login</button>
        )}
      </div>

      <Authors show={page === 'authors'} />

      <Books show={page === 'books'} />
      <Recomends user={user} show={page === 'recomends'} />

      <NewBook show={page === 'add'} />
      <Login show={page === 'login'} setToken={setToken} setPage={setPage} />
    </div>
  )
}

export default App
