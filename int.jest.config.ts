import { Config } from 'jest'

export default async (): Promise<Config> => ({
  displayName: 'int',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/src'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.int.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testRegex: '(/__tests__/*.int.*|(\\.int.|/)(test|spec))\\.tsx?$',
})
