import * as AbsintheSocket from '@absinthe/socket'
import { Socket as PhoenixSocket } from 'phoenix'

const absintheSocket = AbsintheSocket.create(
  new PhoenixSocket(process.env.REACT_APP_ABSINTHE_SOCKET_URI)
)

export default absintheSocket
