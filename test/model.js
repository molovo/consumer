import 'isomorphic-fetch'
import server from './fixtures/server'
import listen from 'test-listen'
import {consume, Model} from '../lib/index'
import test from 'ava'

test.serial('Model can be updated', async t => {
  const url = await listen(server.listen())
  const api = consume(url)

  // Retrieve the resource first
  const book = await api.books.find(1)
  t.is(book.title, 'The Great Gatsby')

  book.title = 'A new title'
  return book.save()
    .then((book) => {
      t.is(book.constructor.name, 'Model')
      t.is(book.title, 'A new title')
      t.is(book.id, 1)
    })
})

test.serial('Model can be updated with mass assignment', async t => {
  const url = await listen(server.listen())
  const api = consume(url)

  // Retrieve the resource first
  const book = await api.books.find(1)
  t.is(book.title, 'The Great Gatsby')

  return book.update({
    title: 'A new title'
  }).then((book) => {
    t.is(book.constructor.name, 'Model')
    t.is(book.title, 'A new title')
    t.is(book.id, 1)
  })
})

test.serial('Model can be deleted', async t => {
  const url = await listen(server.listen())
  const api = consume(url)

  // Retrieve the resource first
  const book = await api.books.find(1)
  t.is(book.title, 'The Great Gatsby')

  const response = await book.delete()
  t.true(response.ok)
})

test.serial('Model can retrieve all statically', async t => {
  const url = await listen(server.listen())
  const api = consume(url)

  class Book extends Model {
  }
  Book.consumer = api.books // This should be a static property within the
                            // class but for some reason ava doesn't like them

  // Retrieve the resource first
  const books = await Book.all()
  t.is(books.length, 2)
  books.forEach((book) => t.true(book instanceof Book));
})

test.serial('Model can retrieve item statically', async t => {
  const url = await listen(server.listen())
  const api = consume(url)

  class Book extends Model {
  }
  Book.consumer = api.books // This should be a static property within the
                            // class but for some reason ava doesn't like them

  // Retrieve the resource first
  const book = await Book.find(1)
  t.is(book.title, 'The Great Gatsby')
})