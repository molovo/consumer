/**
 * The model class used for storing data retrieved by the consumer
 *
 * @type {Model}
 */
class BaseModel {
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
  static _consumer = null

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
  static get consumer () {
    if (typeof this._consumer === 'undefined') {
      throw new ReferenceError(`${this.name.toString()}.consumer must be defined as an instance of Consumer`)
    }

    return this._consumer.as(this)
  }

  /**
   * Retrieve all models from the consumer
   *
   * @return {Promise<Collecion>}
   */
  static all () {
    return this.consumer.all()
  }

  /**
   * Retrieve a model from the consumer
   *
   * @param {string|int} id
   *
   * @return {Promise<Model>}
   */
  static find (id) {
    return this.consumer.find(id)
  }

  /**
   * Update a model
   *
   * @param {string|int} id
   *
   * @return {Promise<Model>}
   */
  static update (id, data) {
    return this.consumer.update(id, data)
  }

  /**
   * Create a new model
   *
   * @param {object} data
   *
   * @return {Promise<Model>}
   */
  static create (data) {
    return this.consumer.create(data)
  }

  /**
   * Create the model instance
   *
   * @param {object} data
   * @param {Consumer} consumer
   */
  constructor (data, consumer, stored = false) {
    this._data = data || {}
    this._consumer = consumer
    this._stored = stored
  }

  /**
   * Get the consumer for this model instance
   *
   * @return {Consumer}
   */
  get consumer () {
    const consumer = this._consumer || this.constructor.consumer

    if (consumer === undefined) {
      throw new ReferenceError(`${this.name.toString()}.consumer must be defined as an instance of Consumer`)
    }

    return consumer
  }

  /**
   * Check if the model has been stored
   *
   * @return {boolean}
   */
  get stored () {
    return this._stored
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
        p = this.consumer.create(data)
      } else {
        p = this.consumer.update(this.primaryKey, data)
      }

      return p.then(response => {
        this._data = data
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
    return this.consumer.delete(this.primaryKey)
  }
}

// A primitive guard for private keys
const isPrivate = key => key[0] === '_'

/**
 * Aggregates the keys from the model's properties and data
 *
 * @param {Model} target
 *
 * @return {Array}
 */
const getKeys = target => {
  // Get keys from the model prototype
  const modelKeys = Reflect.ownKeys(Model.prototype).filter(key => !isPrivate(key))

  // Prevent leaking private properties
  const definedKeys = Reflect.ownKeys(target).filter(key => !isPrivate(key))

  // Include keys from the datasets
  const dataKeys = Reflect.ownKeys(target._data)
  const changedKeys = Reflect.ownKeys(target._changed)

  return Array.from(new Set([
    ...modelKeys,
    ...definedKeys,
    ...dataKeys,
    ...changedKeys
  ]))
}

/**
 * A proxy handler for Model instances
 *
 * @type {object}
 */
const instanceHandler = {
  enumerate (target) {
    return getKeys(target)[Symbol.iterator]()
  },

  ownKeys (target) {
    return getKeys(target)
  },

  getOwnPropertyDescriptor (target, key) {
    // Check for instance properties first, excluding private properties
    if (key in target && !isPrivate(key)) {
      return Reflect.getOwnPropertyDescriptor(target, key)
    }

    // Check for the key in the model's data
    if (key in target._changed || key in target._data) {
      return {
        enumerable: true,
        configurable: true
      }
    }

    if (key === 'length') {
      return {
        enumerable: false,
        configurable: true
      }
    }

    if (key in Model.prototype && !isPrivate(key)) {
      return Reflect.getOwnPropertyDescriptor(Model.prototype, key)
    }

    if (key in Object.prototype) {
      return Reflect.getOwnPropertyDescriptor(Object.prototype, key)
    }

    return undefined
  },

  has (target, key) {
    // Check for instance properties first, excluding private properties
    if (key in target && !isPrivate(key)) {
      return true
    }

    // Check for the key in the model's data
    return key in target._changed || key in target._data
  },

  get (target, key) {
    // Check for instance properties first, excluding private properties
    if (key in target && !isPrivate(key)) {
      return target[key]
    }

    // Check for the key in the model's data
    return target._changed[key] || target._data[key]
  },

  set (target, key, value) {
    if (key in target && !isPrivate(key)) {
      // If a non-private instance property exists, set it
      target[key] = value
    } else {
      // Update the changed data, ready to be saved
      target._changed[key] = value
    }

    return true
  },

  deleteProperty (target, key) {
    if (key in target && !isPrivate(key)) {
      // If a non-private instance property exists, delete it
      delete target[key]
      return true
    }

    if (!(key in target._changed || key in target._data)) {
      return false
    }

    if (key in target._changed) {
      delete target._changed[key]
    }

    if (key in target._data) {
      delete target._data[key]
    }

    return true
  }
}

/**
 * A proxy handler for the class definition
 *
 * @type {object}
 */
const constructHandler = {
  construct (target, args) {
    const model = new target(...args)

    return new Proxy(model, instanceHandler)
  }
}

/**
 * Create a new model class
 */
const createModel = function (name, consumer, obj = {}) {
  const base = class extends BaseModel {
    static _consumer = consumer

    static get name () {
      return name
    }
  }
  Object.keys(obj).forEach(key => {
    base.prototype[key] = obj[key]
  })

  return new Proxy(base, constructHandler)
}

const Model = new Proxy(BaseModel, constructHandler)

export { Model, createModel }

export default Model
