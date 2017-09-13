import Collection from './collection'
import {Model, modelHandler} from './model'

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
    return this._handle(fetch(`${this._url}`, {
      ...this._opts,
      method: 'GET'
    }))
  }

  /**
   * Retrieve an individual item from an endpoint
   *
   * @param {string|int} id
   *
   * @return {Promise<Model>}
   */
  find (id) {
    return this._handle(fetch(`${this._url}/${id}`, {
      ...this._opts,
      method: 'GET'
    }))
  }

  /**
   * Create a new item on the endpoint
   *
   * @param {object} data
   *
   * @return {Promise<Model>}
   */
  create (data) {
    return this._handle(fetch(`${this._url}`, {
      ...this._opts,
      method: 'POST',
      body: JSON.stringify(data)
    }))
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
    return this._handle(fetch(`${this._url}/${id}`, {
      ...this._opts,
      method: 'PUT',
      body: JSON.stringify(data)
    }))
  }

  /**
   * Delete an item on the endpoint
   *
   * @param {string|int} id
   *
   * @return {Promise<object>}
   */
  delete (id) {
    return new Promise((resolve, reject) => {
      return fetch(`${this._url}/${id}`, {
        ...this._opts,
        method: 'DELETE'
      })
        .then(response => resolve(response.ok))
        .catch(reject)
    })
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
   * Handle a promise which resolves with a fetch response
   *
   * @param {Promise<Model>|Promise<Response>} promise
   */
  _handle (promise) {
    return new Promise((resolve, reject) => {
      return promise.then((response) => {
        if (response.ok) {
          return response.json()
        }

        if (response.status === 404) {
          return resolve(null)
        }

        reject(response)
      }).then((data) => resolve(this._collect(data)))
        .catch(reject)
    })
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
      return Collection.from(data.map((item) => this._collect(item)))
    }

    const ModelClass = this._model
    const model = new ModelClass(data, this)
    model._stored = true

    return new Proxy(model, modelHandler)
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

    return consume(`${target._url}/${name.toString()}`, target._opts)
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
