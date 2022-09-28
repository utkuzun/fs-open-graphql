import { useQuery } from '@apollo/client'
import { useState } from 'react'

import { ALL_BOOKS } from '../queries'

const Books = (props) => {
  const result = useQuery(ALL_BOOKS)
  const [genreSelected, setGenreSelected] = useState('all')

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return null
  }

  const books = result.data.allBooks
  const filteredBooks = books.filter(
    (book) => genreSelected === 'all' || book.genres.includes(genreSelected)
  )

  const genres = books
    .reduce((acc, curr) => {
      curr.genres.forEach((genre) => {
        acc = acc.includes(genre) ? acc : acc.concat(genre)
      })

      return acc
    }, [])
    .concat('all')

  return (
    <div>
      <h2>books</h2>

      <h4>in genre patterns</h4>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>author</th>
            <th>published</th>
          </tr>
          {filteredBooks.map((a) => (
            <tr key={a._id}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className='genres'>
        {genres.map((genre) => (
          <button onClick={() => setGenreSelected(genre)} key={genre}>
            {genre}
          </button>
        ))}
      </div>
    </div>
  )
}

export default Books
