/**
 * The consumer client
 */
class Consumer {
  /**
   * The base URL for this object
   *
   * @type {string}
   */
  _url = null

  /**
   * Default fetch options
   *
   * @type {string}
   */
  _opts = {
    method: 'GET',
    credentials: true,
    headers: {
      'Content-Type': 'application/json'
    }
  }

  /**
   * Create the consumer
   *
   * @param {string} url
   * @param {string} opts
   */
  constructor (url, opts) {
    if (typeof url !== 'string') {
      throw new TypeError('URL must be a string')
    }

    this._url = url

    opts = opts || {}
    this._opts = {
      ...this._opts,
      ...opts
    }
  }

  /**
   * Retrieve all items within an API endpoint
   *
   * @return {Promise<Response>}
   */
  all () {
    return fetch(`${this._url}`, {
      ...this._opts,
      method: 'GET'
    }).then(this._parseJson)
  }

  /**
   * Retrieve an individual item from an endpoint
   *
   * @param {string|int} id
   */
  get (id) {
    return fetch(`${this._url}/${id}`, {
      ...this._opts,
      method: 'GET'
    }).then(this._parseJson)
  }

  /**
   * Create a new item on the endpoint
   *
   * @param {object} data
   */
  create (data) {
    return fetch(`${this._url}`, {
      ...this._opts,
      method: 'POST',
      body: JSON.stringify(data)
    }).then(this._parseJson)
  }

  /**
   * Update an item on the endpoint
   *
   * @param {string|int} id
   * @param {object} data
   */
  update (id, data) {
    return fetch(`${this._url}/${id}`, {
      ...this._opts,
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(this._parseJson)
  }

  /**
   * Delete an item on the endpoint
   *
   * @param {string|int} id
   */
  delete (id) {
    return fetch(`${this._url}/${id}`, {
      ...this._opts,
      method: 'DELETE'
    }).then(this._parseJson)
  }

  /**
   * Parse the JSON response
   *
   * @param {Response} response
   */
  _parseJson (response) {
    return response.json()
  }
}

/**
 * The proxy handler to handle missing methods
 */
const handler = {
  get: function (target, name) {
    if (name in target) {
      return target[name]
    }

    return consume(`${target._url}/${name}`, target._opts)
  }
}

/**
 * The exposed wrapper to create the proxy
 *
 * @param {string} url
 * @param {object} opts
 */
const consume = (url, opts) => {
  const consumer = new Consumer(url, opts)
  return new Proxy(consumer, handler)
}

export default consume
