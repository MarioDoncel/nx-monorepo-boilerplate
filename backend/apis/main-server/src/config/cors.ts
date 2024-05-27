import { CorsOptions } from "cors"

const whitelist = [
  'http://localhost:4200',
  'd3aa1y0cejausn.cloudfront.net'
]

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    const isWhitelisted = whitelist.some((allowedOrigin) => origin?.includes(allowedOrigin))
    const noOrigin = !origin
    if (isWhitelisted || noOrigin) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  // allowedHeaders: 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  preflightContinue: false,
  optionsSuccessStatus: 204,
  credentials: true,
  exposedHeaders: ['x-access-token', 'x-refresh-token'],
}
