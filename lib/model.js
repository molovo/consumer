/**
 * The model class used for storing data retrieved by the consumer
 *
 * @type {Model}
 */
export default class Model {
  /**
   * The default primary key field used by this model
   *
   * @type {string}
   */
  static primaryKeyField = 'id'

  /**
   * The consumer instance which generated this model
   *
   * @type {Consumer}
   */
  _consumer = null

  /**
   * The model's data
   *
   * @type {object}
   */
  _data = {}

  /**
   * The model's data which has been changed
   *
   * @type {object}
   */
  _changed = {}

  /**
   * Whether the object has been stored yet
   *
   * @type {boolean}
   */
  _stored = false

  /**
   * Return the
   */
  static get _consumer () {
    if (typeof this.consumer === 'undefined') {
      throw new ReferenceError(`${this.toString()}.consumer must be defined as an instance of Consumer`)
    }

    return this.consumer.as(this)
  }

  /**
   * Retrieve all models from the consumer
   *
   * @param {string|int} id
   *
   * @return {self}
   */
  static all () {
    return this._consumer.all()
  }
  
  /**
   * Retrieve a model from the consumer
   *
   * @param {string|int} id
   *
   * @return {self}
   */
  static find (id) {
    return this._consumer.find(id)
  }
  
  /**
   * Update a model
   *
   * @param {string|int} id
   *
   * @return {self}
   */
  static update (id, data) {
    return this._consumer.update(id, data)
  }

  /**
   * Create a new model
   * @param {self} data
   */
  static create (data) {
    return this._consumer.create(data)
  }

  /**
   * Create the model instance
   *
   * @param {object} data
   * @param {Consumer} consumer
   */
  constructor (data, consumer) {
    this._data = data || {}
    this._consumer = consumer.as(this.constructor) || this.constructor._consumer

    this.defineProperties(Object.keys(data))
  }

  /**
   * Get the primary key for this model
   *
   * @return {string}
   */
  get primaryKey () {
    return this._data[this.constructor.primaryKeyField]
  }

  /**
   * Retrieves the value from the model. Checks defined parameters first,
   * then the changed data, then the original data.
   *
   * @return {any}
   */
  getAttribute (name) {
    if (name in this._changed) {
      return this._changed[name]
    }

    if (name in this._data) {
      return this._data[name]
    }

    throw new ReferenceError(`Unknown field ${name}`)
  }

  /**
   * Sets the value against the model's changed data
   */
  setAttribute (name, value) {
    this._changed[name] = value
  }

  /**
   * Save the model, and send the data back to the API
   *
   * @return {Promise<Response>}
   */
  save () {
    const data = {
      ...this._data,
      ...this._changed
    }

    if (!this._stored) {
      return this._consumer.create(data)
    }

    return this._consumer.update(this.primaryKey, data)
  }

  /**
   * Update the model with the passed data
   *
   * @return {Promise<Response>}
   */
  update (data) {
    // Merge the new and existing data
    this._changed = {
      ...this._changed,
      ...data
    }

    return this.save()
  }

  /**
   * Delete the model
   *
   * @return {Promise<Response>}
   */
  delete () {
    return this._consumer.delete(this.primaryKey)
  }

  /**
   * Define properties for this model's data
   *
   * @param {string[]} names
   */
  defineProperties (names) {
    names.forEach((name) => {
      const p = Object.getOwnPropertyDescriptor(this, name) || {}

      Object.defineProperty(this, name, {
        get: () => p.get ? p.get() : this.getAttribute(name),
        set: (value) => p.set ? p.set(value) : this.setAttribute(name, value)
      })
    })
  }
}
