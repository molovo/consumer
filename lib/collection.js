import OverExtend from 'over-extend'
import Model from './model'

export default class Collection extends OverExtend(Array) {
  /**
   * Create a new collection from a list of models
   *
   * @param {Iterable} items
   * @param {*} args
   *
   * @return {Collection}
   */
  static from(items, ...args) {
    if (items.filter(item => !(item instanceof Model)).length !== 0) {
      throw new TypeError('A collection may only contain instances of Model')
    }

    return Array.from.call(this, items, ...args)
  }
}
