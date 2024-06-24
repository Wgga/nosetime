import { NativeEventEmitter } from "react-native";

const nativeEvents = new NativeEventEmitter();

const events = {

	publish: (key: string, data?: any) => {
		nativeEvents.emit(key, data);
	},

	subscribe: (key: string, callback: (data: any) => void) => {
		nativeEvents.addListener(key, callback);
	},

	unsubscribe: (key: string) => {
		nativeEvents.removeAllListeners(key);
	}
}

export default events;