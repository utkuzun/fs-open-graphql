import { useQuery } from '@apollo/client'

import { ALL_BOOKS } from '../queries'

const Recomends = (props) => {
  const result = useQuery(ALL_BOOKS)

  if (!props.show) {
    return null
  }

  if (result.loading) {
    return null
  }

  const books = result.data.allBooks
  const filteredBooks = books.filter(
    (book) => props.user && book.genres.includes(props.user.favouriteGenre)
  )

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
    </div>
  )
}

export default Recomends
