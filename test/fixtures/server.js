import jsonServer from 'json-server'
import clone from 'clone'
import data from './db.json'

// Create the JSON Server instance
const router = jsonServer.router(clone(data))
const middlewares = jsonServer.defaults()
const server = jsonServer.create()
server.use(middlewares)
server.use(router)

// Add an additional handler which resets the data prior
// to each request
server.use((req, res, next) => {
  if (req.path === '/') return next()
  router.db.setState(clone(data))
  next()
})

export default server
