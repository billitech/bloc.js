import { Rule } from '../rule'

const regExp =
  // eslint-disable-next-line no-useless-escape
  /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

export const IsEmail = new Rule<string, string>({
  errorMessage: 'Email is invalid',
  validator: (value: string) => {
    return regExp.test(value)
  },
})