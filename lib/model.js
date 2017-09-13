/**
 * The model class used for storing data retrieved by the consumer
 *
 * @type {Model}
 */
export class Model {
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
   * Return the consumer instance for this class
   */
  static get _consumer () {
    if (typeof this.consumer === 'undefined') {
      throw new ReferenceError(`${this.name.toString()}.consumer must be defined as an instance of Consumer`)
    }

    return this.consumer.as(this)
  }

  /**
   * Retrieve all models from the consumer
   *
   * @param {string|int} id
   *
   * @return {Promise<Collecion>}
   */
  static all () {
    return this._consumer.all()
  }

  /**
   * Retrieve a model from the consumer
   *
   * @param {string|int} id
   *
   * @return {Promise<Model>}
   */
  static find (id) {
    return this._consumer.find(id)
  }

  /**
   * Update a model
   *
   * @param {string|int} id
   *
   * @return {Promise<Model>}
   */
  static update (id, data) {
    return this._consumer.update(id, data)
  }

  /**
   * Create a new model
   * @param {Promise<Model>} data
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
    this._consumer = consumer || this.constructor._consumer
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
   * Save the model, and send the data back to the API
   *
   * @return {Promise<Boolean>}
   */
  save () {
    return new Promise((resolve, reject) => {
      let p

      const data = {
        ...this._data,
        ...this._changed
      }

      if (!this._stored) {
        p = this._consumer.create(data)
      } else {
        p = this._consumer.update(this.primaryKey, data)
      }

      return p.then((response) => {
        this._data = {
          ...this._data,
          ...response._data
        }

        this._changed = {}
        this._stored = true

        resolve(true)
      }).catch(reject)
    })
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
}

export const modelHandler = {
  get: (target, name) => {
    if (name in target) {
      return target[name]
    }

    if (name in target._changed) {
      return target._changed[name]
    }

    return target._data[name]
  },
  set: (target, name, value) => {
    if (name in target) {
      target[name] = value
    } else {
      target._changed[name] = value
    }

    return true
  }
}

export default Model
