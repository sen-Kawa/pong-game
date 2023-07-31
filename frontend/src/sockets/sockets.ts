import { io, Socket } from 'socket.io-client'

class SockManager {
	socket: Socket;
	options: any;
	constructor() {
		this.socket = io('ws://localhost:3000', {
			withCredentials: true
		});
		this.socket.on("hello", () => console.log("Hello World"));
	}

	on(ev: string, cb: (args?: any[]) => void) {
		this.socket.on(ev, cb);
	}

	emit(ev: string, args?: any[]) {
		this.socket.emit(ev, args);
	}

	setCookies(cookies: string) {
		this.socket.io.opts.extraHeaders = {
			cookie: cookies
		}
	}
}

export const socket = new SockManager();