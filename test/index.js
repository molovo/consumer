import consume from '../lib/index'
import test from 'ava'

test('consumer instantiates correctly', (t) => {
  const url = 'https://unicorns.rainbows'
  const api = consume(url)
  t.is(api._url, url)
})

test('consumer merges passed options', (t) => {
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

test('chaining properties updates URL', (t) => {
  const api = consume('https://unicorns.rainbows')

  t.is(api.users._url, 'https://unicorns.rainbows/users')
  t.is(api.users[123]._url, 'https://unicorns.rainbows/users/123')
  t.is(api.users[123].posts._url, 'https://unicorns.rainbows/users/123/posts')
})
