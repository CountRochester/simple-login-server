import { Config } from 'jest'

export default async (): Promise<Config> => ({
  displayName: 'unit',
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: [
    '<rootDir>/src'
  ],
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.unit.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  testRegex: '(/__tests__/*.unit.*|(\\.unit.|/)(test|spec))\\.tsx?$',
})
