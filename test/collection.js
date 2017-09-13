import server from './fixtures/server'
import listen from 'test-listen'
import {consume, Collection, Model} from '../lib/index'
import test from 'ava'

test('can be created with models', async t => {
  const url = await listen(server.listen())
  const api = consume(url)
  const models = Collection.from([new Model({}, api), new Model({}, api)])
  t.is(models.length, 2)
})

test('rejects any other type', async t => {
  const error = t.throws(() => {
    Collection.from([1, 2, 3])
  }, TypeError)

  t.is(error.message, 'A collection may only contain instances of Model')
})
