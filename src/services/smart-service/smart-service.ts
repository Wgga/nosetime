import { Dimensions } from "react-native";

import reactNativeTextSize from "react-native-text-size";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";
import events from "../../hooks/events/events";

import { ENV } from "../../configs/ENV";

const Winwidth = Dimensions.get("window").width;

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
				events.publish("nosetime_smartlistUpdated", type);
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
			if (resp_data.length > 0) {
				resp_data.map((item: any) => {
					item["desc2"] = "";
					item["isopen"] = true;
					if (item.desc.length > 0) {
						if (item.type == "brand") {
							reactNativeTextSize.measure({
								width: Winwidth - 32,
								fontSize: 14,
								fontFamily: "monospace",
								fontWeight: "normal",
								text: item.desc,
								lineInfoForLine: 6
							}).then((data: any) => {
								if (data.lineCount < 6) {
									item["desc2"] = "";
									item["isopen"] = true;
								} else {
									item["desc2"] = item.desc.slice(0, data.lineInfo.start - 10);
									item["isopen"] = false;
								}
							}).catch((error) => {
								item["desc2"] = "";
								item["isopen"] = true;
							});
						} else if (item.type == "discuss") {
							reactNativeTextSize.measure({
								width: type == "discuss" ? Winwidth - 89 : Winwidth - 80,
								fontSize: 14,
								fontFamily: "monospace",
								fontWeight: "normal",
								text: item.desc,
								lineInfoForLine: 9
							}).then((data: any) => {
								if (data.lineCount < 9) {
									item["desc2"] = "";
									item["isopen"] = true;
								} else {
									item["desc2"] = item.desc.slice(0, data.lineInfo.start - 10);
									item["isopen"] = false;
								}
							}).catch((error) => {
								item["desc2"] = "";
								item["isopen"] = true;
							});
						}
					}
				});
			}

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
				events.publish("nosetime_smartlistUpdated", type);
			} else {
				events.publish("nosetime_smartlistUpdatedError", type);
				return "NOMOREDATA";
			}
		}, (error) => {
			events.publish("nosetime_smartlistUpdatedError", type);
			return "ERROR";
		});
	}
}
const smartService = new SmartService();
export default smartService;