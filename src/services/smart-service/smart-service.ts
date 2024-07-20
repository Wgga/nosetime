import { Dimensions } from "react-native";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import { ENV } from "../../configs/ENV";
import { setContentFold } from "../../utils/globalmethod";

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
				// 设置展开收起文本
				resp_data.forEach((item: any) => {
					item["desc2"] = "";
					item["isopen"] = true;
					if (item.desc.length > 0) {
						if (item.type == "brand") {
							setContentFold({
								item, // 列表数据
								key: "desc", // 需要展开收起的字段
								src: "smart", // 来源
								width: Winwidth - 32, // 列表项的宽度
								fontSize: 14, // 列表项的字体大小
								lineInfoForLine: 6, // 收起时显示的行数
								moreTextLen: 10, // 展开收起按钮长度
							})
						} else if (item.type == "discuss") {
							setContentFold({
								item, // 列表数据
								key: "desc", // 需要展开收起的字段
								src: "smart", // 来源
								width: type == "discuss" ? Winwidth - 89 : Winwidth - 80, // 列表项的宽度
								fontSize: 14, // 列表项的字体大小
								lineInfoForLine: 9, // 收起时显示的行数
								moreTextLen: 10, // 展开收起按钮长度
							})
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