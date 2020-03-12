import 'isomorphic-fetch'
import server from './fixtures/server'
import listen from 'test-listen'
import { consume, Model, Collection } from '../lib/index'
import test from 'ava'

test('can be updated', async t => {
  const url = await listen(server())
  const api = consume(url)

  // Retrieve the resource first
  const book = await api.books.find(1)

  book.title = 'A new title'
  await book.save()

  t.true(book instanceof Model)
  t.is(book.title, 'A new title')
  t.is(book.id, 1)
})

test('can be updated with mass assignment', async t => {
  const url = await listen(server())
  const api = consume(url)

  // Retrieve the resource first
  const book = await api.books.find(2)

  await book.update({
    title: 'A new title'
  })

  t.true(book instanceof Model)
  t.is(book.title, 'A new title')
  t.is(book.id, 2)
})

test('must define consumer', async t => {
  class Book extends Model { }
  const error = t.throws(() => new Book(), ReferenceError)
  t.is(error.message, 'Book.consumer must be defined as an instance of Consumer')
})

test('can be deleted', async t => {
  const url = await listen(server())
  const api = consume(url)

  // Retrieve the resource first
  const book = await api.books.find(1)

  t.true(await book.delete())
})

test('prefers changed data when retrieving values', async t => {
  const url = await listen(server())
  const api = consume(url)

  const book = await api.books.find(1)
  const title = book.title

  book.title = 'Testing'
  t.is(book.title, 'Testing')
  t.not(book.title, title)
})

test('can create as instance', async t => {
  const url = await listen(server())
  const api = consume(url)

  class Book extends Model {
  }
  Book.consumer = api.books // This should be a static property within the
  // class but for some reason ava doesn't like them

  const book = new Book()

  t.false(book._stored)
  t.falsy(book.id)

  book.title = 'My Awesome Book'
  book.authorId = 2
  await book.save()

  t.true(book._stored)
  t.is(book.primaryKey, 3)
})

test('can retrieve all statically', async t => {
  const url = await listen(server())
  const api = consume(url)

  class Book extends Model {
  }
  Book.consumer = api.books // This should be a static property within the
  // class but for some reason ava doesn't like them

  // Retrieve the resource first
  const books = await Book.all()
  t.true(books instanceof Collection)
  t.is(books.length, 2)
  books.forEach((book) => t.true(book instanceof Book))
})

test('can retrieve item statically', async t => {
  const url = await listen(server())
  const api = consume(url)

  class Book extends Model {
  }
  Book.consumer = api.books // This should be a static property within the
  // class but for some reason ava doesn't like them

  // Retrieve the resource first
  const book = await Book.find(1)
  t.true(book instanceof Book)
  t.is(book.title, 'The Great Gatsby')
})

test('can create statically', async t => {
  const url = await listen(server())
  const api = consume(url)

  class Book extends Model {
  }
  Book.consumer = api.books // This should be a static property within the
  // class but for some reason ava doesn't like them

  const book = await Book.create({
    title: 'My Awesome Book',
    authorId: 3
  })
  t.true(book instanceof Book)
})

test('can update statically', async t => {
  const url = await listen(server())
  const api = consume(url)

  class Book extends Model {
  }
  Book.consumer = api.books // This should be a static property within the
  // class but for some reason ava doesn't like them

  const book = await Book.update(1, {
    title: 'My Awesome Book',
    authorId: 3
  })
  t.true(book instanceof Book)
  t.is(book.id, 1)
})
