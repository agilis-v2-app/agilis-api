declare namespace NodeJS {
  interface ProcessEnv {
    APP_PORT: number

    JWT_SECRET: string
    JWT_EXPIRES_IN: `${number}${'d' | 'h' | 'm' | 's'}`

    MONGO_URI: string
  }
}
