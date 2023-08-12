import { setupServer, type SetupServer } from 'msw/node'
import { handlers } from './handlers'

// This configures a Service Worker with the given request handlers.
export const server: SetupServer = setupServer(...handlers)
