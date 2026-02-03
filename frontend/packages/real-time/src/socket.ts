import { io, Socket } from 'socket.io-client'

class SocketManager {
  private socket: Socket | null = null
  
  connect(url: string, token: string) {
    this.socket = io(url, {
      auth: { token },
      transports: ['websocket']
    })
    
    this.socket.on('connect', () => {
      console.log('Socket connected')
    })
    
    this.socket.on('disconnect', () => {
      console.log('Socket disconnected')
    })
    
    return this.socket
  }
  
  onOrderUpdate(callback: (order: any) => void) {
    this.socket?.on('order:updated', callback)
  }
  
  onMenuUpdate(callback: (menu: any) => void) {
    this.socket?.on('menu:updated', callback)
  }
  
  disconnect() {
    this.socket?.disconnect()
  }
}

export const socketManager = new SocketManager()
export { SocketManager }

