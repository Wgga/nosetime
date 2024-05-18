import { Dimensions, NativeEventEmitter } from "react-native";

import cache from "../../hooks/storage/storage";
import http from "../../utils/api/http";
import { ENV } from "../../configs/ENV";

const Winwidth = Dimensions.get("window").width;
const events = new NativeEventEmitter();

class SmartService {

	private factoryname: string = "smartService";
	private smartlist: any = { discuss: [], odor: [], brand: [], fragrance: [], perfumer: [] };
	private page: any = { discuss: 1, odor: 1, brand: 1, fragrance: 1, perfumer: 1 };
	private moredata: any = { discuss: true, odor: true, brand: true, fragrance: true, perfumer: true };

	getItems(type: string) {
		return this.smartlist[type];
	}

	moreDataCanBeLoaded(type: string) {
		return this.moredata[type];
	}

	fetch(type: string, uid: number, src: string) {
		if (this.smartlist[type] === undefined) {
			cache.getItem(this.factoryname + type + uid).then((cacheobj) => {
				this.smartlist[type] = cacheobj;
				events.emit("nosetime_smartlistUpdated", type);
			}).catch(() => {
				this.fetchWeb(type, uid, src);
				return;
			});
		} else {
			this.fetchWeb(type, uid, src);
		}
	}

	fetchWeb(type: string, uid: number, src: string) {
		if (src == "loadMore") this.page[type]++;
		var url = ENV.smart + "?type=" + type + "&page=" + this.page[type];
		http.post(url, { uid: uid }).then((resp_data: any) => {
			if (resp_data == null) resp_data = [];
			if (this.page[type] == 1) {
				this.smartlist[type] = resp_data;
				cache.saveItem(this.factoryname + type + uid, this.smartlist[type], 600);
			} else {
				this.smartlist[type] = this.smartlist[type].concat(resp_data);
			}
			if (resp_data.length < 15) {
				this.moredata[type] = false;
			}
			if (resp_data.length > 0) {
				events.emit("nosetime_smartlistUpdated", type);
			} else {
				events.emit("nosetime_smartlistUpdatedError", type);
				return "NOMOREDATA";
			}
		}, (error) => {
			events.emit("nosetime_smartlistUpdatedError", type);
			return "ERROR";
		});
	}
}
const smartService = new SmartService();
export default smartService;