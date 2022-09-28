import React, { useState } from 'react'

import { useMutation } from '@apollo/client'
import { EDIT_BIRTH, ALL_AUTHORS } from '../queries'
// import { useEffect } from 'react'

const EditBirth = ({ authors }) => {
  const [name, setName] = useState('')
  const [birth, setBirth] = useState(0)

  const [editBirth] = useMutation(EDIT_BIRTH, {
    refetchQueries: [{ query: ALL_AUTHORS }],
    onError: (error) => {
      console.log(error.graphQLErrors[0].message)
    },
  })

  //   useEffect(() => {
  //     console.log(result.data)
  //     if (result.data && result.data.editBirth === null) {
  //       console.log('person not found')
  //     }
  //   }, [result.data])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name) {
      return
    }
    editBirth({
      variables: { _id: name, setBornTo: Number(birth) },
    })

    setName('')
    setBirth(0)
  }

  return (
    <form onSubmit={handleSubmit}>
      <h2>set birthyear</h2>
      <div>
        <label>name : </label>
        <select
          name='name'
          value={name}
          onChange={(e) => setName(e.target.value)}
        >
          <option value=''>select a name</option>
          {authors.map((author) => {
            return (
              <option key={author._id} value={author._id}>
                {author.name}
              </option>
            )
          })}
        </select>
      </div>
      <div>
        <label>birth : </label>
        <input
          type='number'
          name='birth'
          value={birth}
          onChange={(e) => setBirth(e.target.value)}
        />
      </div>
      <button type='submit'>Change birth</button>
    </form>
  )
}

export default EditBirth
