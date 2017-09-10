# Consumer

[![npm](http://img.shields.io/npm/v/api-consumer.svg?style=flat)](https://badge.fury.io/js/api-consumer) [![tests](http://img.shields.io/travis/molovo/consumer/master.svg?style=flat)](https://travis-ci.org/molovo/consumer) [![dependencies](http://img.shields.io/david/molovo/consumer.svg?style=flat)](https://david-dm.org/molovo/consumer)

A tiny REST API consumer for JavaScript projects

### Installation

```sh
npm install --save api-consumer
```

This project uses modern JavaScript API's, and does not polyfill anything. To use Consumer in older browsers, you will need to provide your own polyfills for `fetch`, `Promise` and `Proxy` as required.

### Usage

Consumer uses proxy objects to allow using chainable properties to construct a url for a REST API endpoint, and then execute the request for you. Each property you chain is appended to the url, and returns a new proxy. If you call one of the methods `all`, `get`, `create`, `update`, or `delete` at any point in the chain, a `fetch` request is executed, and the parsed JSON response is returned to you in a Promise.

See below for a brief explanation of functionality, or try out Consumer in the playground on [RunKit](https://runkit.com/molovo/api-consumer).

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
const user = await api.users.get(123)

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

### License & Contributing

- Details on the license [can be found here](LICENSE.md)
- Details on running tests and contributing [can be found here](contributing.md)
