import Model from './model'

/**
 * The consumer client
 */
export class Consumer {
  /**
   * The model class to use with this API endpoint
   */
  _model = Model

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
   * @return {Promise<Model>}
   */
  all () {
    return fetch(`${this._url}`, {
      ...this._opts,
      method: 'GET'
    }).then(this._parseJson)
      .then(this._collect.bind(this))
  }

  /**
   * Retrieve an individual item from an endpoint
   *
   * @param {string|int} id
   *
   * @return {Promise<Model>}
   */
  find (id) {
    return fetch(`${this._url}/${id}`, {
      ...this._opts,
      method: 'GET'
    }).then(this._parseJson)
      .then(this._collect.bind(this))
  }

  /**
   * Create a new item on the endpoint
   *
   * @param {object} data
   *
   * @return {Promise<Model>}
   */
  create (data) {
    return fetch(`${this._url}`, {
      ...this._opts,
      method: 'POST',
      body: JSON.stringify(data)
    }).then(this._parseJson)
      .then(this._collect.bind(this))
  }

  /**
   * Update an item on the endpoint
   *
   * @param {string|int} id
   * @param {object} data
   *
   * @return {Promise<Model>}
   */
  update (id, data) {
    return fetch(`${this._url}/${id}`, {
      ...this._opts,
      method: 'PUT',
      body: JSON.stringify(data)
    }).then(this._parseJson)
      .then(this._collect.bind(this))
  }

  /**
   * Delete an item on the endpoint
   *
   * @param {string|int} id
   *
   * @return {Promise<object>}
   */
  delete (id) {
    return fetch(`${this._url}/${id}`, {
      ...this._opts,
      method: 'DELETE'
    }).then(this._parseJson)
  }

  /**
   * The model class to use with this API endpoint
   *
   * @param {class} modelClass
   *
   * @return {self}
   */
  as (modelClass) {
    this._model = modelClass

    return this
  }

  /**
   * Parse the JSON response
   *
   * @param {Promise<Response>} response
   */
  _parseJson (response) {
    return response.json()
  }

  /**
   * Collect data returned from the API into a Model
   *
   * @param {object} data
   *
   * @return {Model|Model[]}
   */
  _collect (data) {
    if (Array.isArray(data)) {
      return data.map((item) => this._collect(item))
    }

    const ModelClass = this._model
    const model = new ModelClass(data, this) // eslint-ignore-line new-cap
    model._stored = true

    return model
  }
}

/**
 * The proxy handler to handle missing methods
 */
export const consumerHandler = {
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
export const consume = (url, opts) => {
  const consumer = new Consumer(url, opts)
  return new Proxy(consumer, consumerHandler)
}

export default consume
