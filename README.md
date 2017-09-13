# Consumer

[![npm](http://img.shields.io/npm/v/api-consumer.svg?style=flat)](https://badge.fury.io/js/api-consumer) [![tests](http://img.shields.io/travis/molovo/consumer/master.svg?style=flat)](https://travis-ci.org/molovo/consumer) [![dependencies](http://img.shields.io/david/molovo/consumer.svg?style=flat)](https://david-dm.org/molovo/consumer)

A tiny REST API consumer for JavaScript projects

## Installation

```sh
npm install --save api-consumer
```

This project uses modern JavaScript API's, and does not polyfill anything. To use Consumer in older browsers, you will need to provide your own polyfills for `fetch`, `Promise` and `Proxy` as required.

## Usage

Consumer uses proxy objects to allow using chainable properties to construct a url for a REST API endpoint, and then execute the request for you. Each property you chain is appended to the url, and returns a new proxy. If you call one of the methods `all`, `find`, `create`, `update`, or `delete` at any point in the chain, a `fetch` request is executed, and the parsed JSON response is returned to you in a Promise.

See below for a brief explanation of functionality, or try out Consumer in the playground on [RunKit](https://runkit.com/molovo/api-consumer).

### Making Requsests

```js
import consume from 'api-consumer'

// Create the proxy with your API's base URL
const api = consume('https://your.domain.com/api')

// GET https://your.domain.com/api/users
const users = await api.users.all()

// GET https://your.domain.com/api/your/deeply/nested/endpoint
const users = await api.your.deeply.nested.endpoint.all()

// GET https://your.domain.com/api/users/123/posts
const posts = await api.users[123].posts.all()

// GET https://your.domain.com/api/users/123
const user = await api.users.find(123)

// POST https://your.domain.com/api/users
const newUser = await api.users.create({
  name: 'James Dinsdale',
  email: 'hi@molovo.co'
})

// PUT https://your.domain.com/api/users/123
const updatedUser = await api.users.update(123, {
  name: 'A new name'
})

// DELETE https://your.domain.com/api/users/123
const deletedUser = await api.users.delete(123)
```

### Using Models

By default, a request made with a consumer returns a `Model` instance, or a `Collection`.

```js
import {consume, Model} from 'api-consumer'
const api = consume('https://your.domain.com/api')

// GET https://your.domain.com/api/books
// @returns {Promise<Collection[Model]>}
const book = await api.books.all(123)

// GET https://your.domain.com/api/books/123
// @returns {Promise<Model>}
const book = await api.books.find(123)
book.title = 'A new title'

// PUT https://your.domain.com/api/books/123
// @returns {Promise<Boolean>}
let saved = await book.save()

// DELETE https://your.domain.com/api/books/123
// @returns {Promise<Boolean>}
let deleted = await book.delete()
```

You can extend the model's functionality by creating your own model classes.

```js
import {consume, Model} from 'api-consumer'
const api = consume('https://your.domain.com/api')

// Extend the model class
class Book extends Model {
  // Specify a Consumer instance to use as an endpoint
  static consumer = api.books

  // Optionally specify a custom primary key field (The default is 'id')
  // The value of this field is used in the URL for update, create and delete
  static primaryKeyField = 'uuid'

  // Override getters and setters
  get title () {
    return 'Rainbows!'
  }
}
```

Now you can query your model class directly.

```js
// GET https://your.domain.com/api/books
const books = await Book.all()

// GET https://your.domain.com/api/books/123
const book = await Book.find(123)
book.title = 'A new title'

// PUT https://your.domain.com/api/books/123
let saved = await book.save()

// DELETE https://your.domain.com/api/books/123
let deleted = await book.delete()
```

You can also use the constructor to create new resources.

```js
const book = new Book()
book.title = 'A title'
book.author = 'Joe Bloggs'

// POST https://your.domain.com/api/books
// @returns {Promise<Boolean>}
let created = await book.save()

// Creating statically has the same effect
// @returns {Promise<Model>}
const book = Book.create({
  title: 'A title',
  author: 'Joe Bloggs'
})
```

#### Overiding `fetch` options

The default options passed to `fetch` are:

```js
{
  credentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
}
```

You can override these by passing an object as the second argument to `consume`.

```js
const api = consume('https://myapi.com', {
  credentials: false
})
```

**NOTE:** Specifying `method` in the default options will have no effect, since it is overridden by each of the executing methods.

## License & Contributing

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](contributing.md)
