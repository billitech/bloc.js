import { Rule } from './rule'

export const validate = <T, E>(
  value: T,
  name: string,
  rules: Rule<T, E>[],
  signal?: AbortSignal,
): E | undefined | Promise<E | undefined> => {
  for (let i = 0; i < rules.length; i++) {
    if (signal?.aborted) {
      return undefined
    }

    const error = rules[i].validate(value, name, signal)

    if (error instanceof Promise) {
      return error.then(async (err) => {
        if (signal?.aborted) return undefined

        if (err) return err

        for (let j = i + 1; j < rules.length; j++) {
          if (signal?.aborted) return undefined

          const nextError = rules[j].validate(value, name, signal)

          if (nextError instanceof Promise) {
            const awaited = await nextError
            if (awaited) return awaited
          } else if (nextError) {
            return nextError
          }
        }

        return undefined
      })
    }

    if (error) {
      return error
    }
  }

  return undefined
}
