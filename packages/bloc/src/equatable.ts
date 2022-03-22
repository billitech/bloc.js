import { deepEqual } from 'fast-equals'

export abstract class Equatable {
  abstract get props(): unknown[]
}

export function isEqual(obj1: Equatable, obj2: Equatable): boolean {
  for (const key in obj1.props) {
    const prop1 = obj1.props[key]
    const prop2 = obj2.props[key]
    if (prop1 instanceof Equatable && prop2 instanceof Equatable) {
      if (!isEqual(prop1, prop2)) {
        return false
      }
    } else {
      if (!deepEqual(prop1, prop2)) {
        return false
      }
    }
  }

  return true
}
