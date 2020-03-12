import http from 'http'
import jsonServer from 'json-server'
import clone from 'clone'
import data from './db.json'

const server = () => {
  // Create the JSON Server instance
  const router = jsonServer.router(clone(data))
  const middlewares = jsonServer.defaults()
  const server = jsonServer.create()
  server.use(middlewares)
  server.use(
    (req, res, next) => {
      if (req.path === '/thisEndpointErrors/1') {
        return res.sendStatus(400)
      }

      next()
    },
    (req, res, next) => {
      if (req.path === '/') return next()
      router.db.setState(clone(data))
      next()
    },
    router)

  return http.createServer(server)
}

export default server
