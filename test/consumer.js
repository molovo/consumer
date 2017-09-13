import 'isomorphic-fetch'
import server from './fixtures/server'
import listen from 'test-listen'
import {consume, Model, Collection} from '../lib/index'
import test from 'ava'

test('consumer instantiates correctly', async t => {
  const url = 'https://unicorns.rainbows'
  const api = consume(url)
  t.is(api._url, url)
})

test('consumer rejects non-string url', async t => {
  const error = t.throws(() => consume(123), TypeError)

  t.is(error.message, 'URL must be a string')
})

test('consumer merges passed options', async t => {
  const api = consume('https://unicorns.rainbows', {
    credentials: false
  })

  t.deepEqual(api._opts, {
    method: 'GET',
    credentials: false,
    headers: {
      'Content-Type': 'application/json'
    }
  })
})

test('chaining properties updates URL', async t => {
  const api = consume('https://unicorns.rainbows')

  t.is(api.users._url, 'https://unicorns.rainbows/users')
  t.is(api.users[123]._url, 'https://unicorns.rainbows/users/123')
  t.is(api.users[123].posts._url, 'https://unicorns.rainbows/users/123/posts')
  t.is(api.users['me/profile']._url, 'https://unicorns.rainbows/users/me/profile')
})

test('all() retrieves data', async t => {
  const url = await listen(server.listen())
  const api = consume(url)

  const books = await api.books.all()

  t.true(books instanceof Collection)
  t.is(books.length, 2)
  books.forEach((book) => t.true(book instanceof Model))
})

test('find() retrieves data', async t => {
  const url = await listen(server.listen())
  const api = consume(url)

  const book = await api.books.find(1)

  t.true(book instanceof Model)
  t.is(book.id, 1)
})

test('find() can collect into a specific model', async t => {
  const url = await listen(server.listen())
  const api = consume(url)

  class Book extends Model {
  }

  const book = await api.books.as(Book).find(1)
  t.is(book.constructor.name, 'Book')
  t.is(book.title, 'The Great Gatsby')
})

test('create() creates a new resource', async t => {
  const url = await listen(server.listen())
  const api = consume(url)

  const data = {
    title: 'The Catcher in the Rye',
    authorId: 3
  }
  const book = await api.books.create(data)

  t.true(book instanceof Model)
  t.is(book.title, data.title)
  t.is(book.authorId, data.authorId)
})

test('update() updates an existing resource', async t => {
  const url = await listen(server.listen())
  const api = consume(url)

  const book = await api.books.find(1)

  const data = {
    title: 'A changed title'
  }
  const updatedBook = await api.books.update(1, data)

  t.true(updatedBook instanceof Model)
  t.is(updatedBook.title, data.title)
  t.not(updatedBook.title, book.title)
})

test('delete() deletes a resource', async t => {
  const url = await listen(server.listen())
  const api = consume(url)

  t.true(await api.books.delete(1))
})

test('returns nothing for 404', async t => {
  const url = await listen(server.listen())
  const api = consume(url)

  const model = await api.notAnEndpoint.find(1)
  t.falsy(model)
})

test('rejects for any other status', async t => {
  const url = await listen(server.listen())
  const api = consume(url)

  return t.throws(api.thisEndpointErrors.find(1))
})
