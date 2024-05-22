import Storage from "react-native-storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

const storage = new Storage({
	// 最大容量，默认值1000条数据循环存储
	size: 1000,

	// 存储引擎：对于RN使用AsyncStorage，对于web使用window.localStorage
	// 如果不指定则数据只会保存在内存中，重启后即丢失
	storageBackend: AsyncStorage,

	// 数据过期时间，默认一整天（1000 * 3600 * 24 毫秒），可以为null，这意味着永远不会过期。
	defaultExpires: 1000 * 3600 * 24,

	// 读写时在内存中缓存数据。默认启用。
	enableCache: true,

	// 如果在存储器中没有找到数据或者找到过期的数据，将调用相应的同步方法，返回最新数据。
	sync: {
	}
});

const cache = {
	saveItem: (key: string, data: any, expires?: number) => {
		return storage.save({
			key,
			data,
			expires: expires ? 1000 * expires : null, //没有传递就是null永不过期
		})
	},

	getItem: (key: string) => {
		return storage.load({
			key,
			autoSync: true, // 设置为false的话，则等待sync方法提供的最新数据(当然会需要更多时间)。
			// syncInBackground(默认为true)意味着如果数据过期，在调用sync方法的同时先返回已经过期的数据。
			syncInBackground: true,
			// 你还可以给sync方法传递额外的参数
			syncParams: {},
		})
	},

	removeItem: (key: string) => {
		return storage.remove({
			key,
		});
	},

	clear: () => {
		return AsyncStorage.clear();
	},
}

export default cache;