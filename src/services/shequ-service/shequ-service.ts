import us from "../user-service/user-service";

import http from "../../utils/api/http";

import events from "../../hooks/events/events";

import { ENV } from "../../configs/ENV";

class ShequService {

	private topics: any = { "最新": [], "精选": [], "香水闲谈": [], "荐香求助": [], "有关气味": [], "小众沙龙": [] };
	private moredata: any = { "最新": true, "精选": true, "香水闲谈": true, "荐香求助": true, "有关气味": true, "小众沙龙": true };
	private page: any = { "最新": 1, "精选": 1, "香水闲谈": 1, "荐香求助": 1, "有关气味": 1, "小众沙龙": 1 };
	private loading: any = { "最新": false, "精选": false, "香水闲谈": false, "荐香求助": false, "有关气味": false, "小众沙龙": false };
	private fidd: any = { "最新": 0, "香水闲谈": 1, "荐香求助": 2, "有关气味": 3, "小众沙龙": 4 };

	getItems(word: string) {
		return this.topics[word];
	}

	moreDataCanBeLoaded(word: string) {
		if (this.loading[word]) return false;
		return this.moredata[word];
	}

	fetch(word: string, newer: number) {
		this.fetchWeb(word, newer);
	}

	fetchWeb(word: string, newer: number) {
		if (newer) {
			this.page[word] = 1;
			if (this.loading[word]) return; else this.loading[word] = true;
			var url = ENV.api + ENV.shequ + "?method=listweb&page=1&fid=" + this.fidd[word] + "&fids=" + us.user.fids;
			http.get(url).then((resp_data: any) => {
				this.loading[word] = false;
				this.topics[word] = resp_data.items;
				if (resp_data.items.length < 20)
					this.moredata[word] = false;
				this.page[word]++;
				if (resp_data.cnt > 0) {
					events.publish("nosetime_topicsUpdated", word);
				} else {
					events.publish("nosetime_topicsUpdatedError", word);
					return "NOMOREDATA";
				}
			}, (error) => {
				setTimeout(() => { this.loading[word] = false }, 5000);
				events.publish("nosetime_topicsUpdatedError", word);
				return "ERROR";
			}
			)
		} else {
			if (this.loading[word]) return; else this.loading[word] = true;
			console.log("SHEQU SERVICE SEND HTTP GET");
			console.log(ENV.api + ENV.shequ, word, this.page[word]);
			http.get(ENV.shequ + "?method=listweb&page=" + this.page[word] + "&fid=" + this.fidd[word] + "&fids=" + us.user.fids).then((resp_data: any) => {
				this.loading[word] = false;
				if (this.page[word] == 1) {
					this.topics[word] = resp_data.items;
				} else {
					this.topics[word] = this.topics[word].concat(resp_data.items);
				}
				if (resp_data.items.length < 40)
					this.moredata[word] = false;
				this.page[word]++;
				if (resp_data.items.length > 0) {
					events.publish("nosetime_topicsUpdated", word);
				} else {
					events.publish("nosetime_topicsUpdatedError", word);
					return "NOMOREDATA";
				}
			}, (error) => {
				setTimeout(() => { this.loading[word] = false }, 5000);
				events.publish("nosetime_topicsUpdatedError", word);
				return "ERROR";
			});
		}
	}
}
const shequService = new ShequService();
export default shequService;