import React, { useEffect } from 'react'
import { useState } from 'react'
import { useMutation } from '@apollo/client'
import { LOGIN, CURRENT_USER } from '../queries'

const Login = ({ show, setToken, setPage }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const [login, result] = useMutation(LOGIN, {
    refetchQueries: [{ query: CURRENT_USER }],
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
  })

  useEffect(() => {
    if (result.data) {
      const token = result.data.login.value
      setToken(token)
      localStorage.setItem('user-token', token)
      setPage('authors')
    }

    setUsername('')
    setPassword('')
  }, [result.data])

  if (!show) {
    return null
  }

  const handleLogin = (e) => {
    e.preventDefault()
    login({
      variables: { username, password },
    })

    setPassword('')
  }

  return (
    <form onSubmit={handleLogin}>
      <div className='input-field'>
        <label>Username : </label>
        <input
          type='text'
          value={username}
          onChange={({ target }) => setUsername(target.value)}
        />
      </div>
      <div className='input-field'>
        <label>Password : </label>
        <input
          type='password'
          value={password}
          onChange={({ target }) => setPassword(target.value)}
        />
      </div>
      <button type='submit'>Login</button>
    </form>
  )
}

export default Login
