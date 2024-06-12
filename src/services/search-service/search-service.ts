import { Dimensions } from "react-native";

import reactNativeTextSize from "react-native-text-size";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";
import events from "../../hooks/events/events";

import { ENV } from "../../configs/ENV";

const Winwidth = Dimensions.get("window").width;

class SearchService {
	//private factoryname : string = "SearchService";
	private searchlist: any = {};//2020-3-11用于存储数据数据类型示例{"迷人":{"item":[],"brand":[],"odor":[]}}
	private buydata: any = {};
	private moredata: any = {};
	private page: any = {};//2020-3-11yak用于存储当前数据的页码{"迷人":{"item":1,"brand":2,"odor":3}}
	private search_history: any[] = [];

	constructor(
	) {
		// console.log("Hello SearchService Provider", this.searchlist);

		this.search_history = [];

		cache.getItem("SearchHistory").then((cacheobj) => {
			if (cacheobj) {
				this.search_history = cacheobj;
			}
		}).catch(() => { });
	}

	addHistory(x: any) {
		let idx = this.search_history.indexOf(x);
		if (idx >= 0)
			this.search_history.splice(idx, 1);
		this.search_history.unshift(x);
		cache.saveItem("SearchHistory", this.search_history, 30 * 24 * 3600);
	}

	clearHistory() {
		this.search_history = [];
		cache.removeItem("SearchHistory");
	}

	getItems(type: string, word: string) {
		if (this.searchlist[word] == undefined) this.searchlist[word] = {};
		return this.searchlist[word][type];
	}

	getbuyItems(type: string) {
		if (this.buydata[type] == undefined) this.searchlist[type] = {};
		return this.buydata[type];
	}

	moreDataCanBeLoaded(type: string, word: string) {
		if (type == "mall") word = type + word;

		if (this.moredata[word] == undefined) this.moredata[word] = {};
		if (this.moredata[word][type] == undefined) this.moredata[word][type] = true;
		return this.moredata[word][type];
	}

	fetchbuys(resp: any, type: string, uid: number) {
		let ids: any[] = [];
		this.buydata[type] = {
			isbuy: {},
			canbuy: {}
		};
		if (resp) {
			if (type == "mall") {
				for (let i in resp) {
					if (resp[i].name != "购物清单" && resp[i].name != "合辑") {
						ids = resp[i].items.map((item: any) => item.id);
					}
				}
			} else {
				ids = resp.map((item: any) => item.id);
			}
		}

		http.post(ENV.item, { "method": "isbuyv2", uid: uid, ids: ids }).then((resp_data: any) => {
			for (let i in resp_data) {
				if (resp_data[i]) this.buydata[type]["isbuy"][resp_data[i]] = 1;
			}
			if (type != "mall") {
				http.post(ENV.mall, { "method": "canbuy", uid: uid, ids: ids }).then((resp_data2: any) => {
					for (let i in resp_data2) {
						if (resp_data2[i]) this.buydata[type]["canbuy"][resp_data2[i]] = 1;
					}
					events.publish("nosetime_buydataUpdated", type);
				});
			} else {
				events.publish("nosetime_buydataUpdated", type);
			}
		});
	}

	fetch(type: string, word: string, src: string) {
		if (type == "all") {
			this.moredata[word] = {};
			this.page[word] = {};
		}
		if (this.page[word] == undefined) this.page[word] = {};
		if (this.page[word][type] == undefined || this.page[word][type] < 1) {
			if (type == "topicv2")
				this.page[word][type] = 1;
			else
				this.page[word][type] = 2;
		}

		if (this.moredata[word] == undefined) this.moredata[word] = {};
		if (this.moredata[word][type] == undefined) this.moredata[word][type] = true;
		if (!this.moredata[word][type]) {
			events.publish("nosetime_searchlistUpdated", { type, word });
			return;
		}
		if (src == "loadMore") this.page[word][type]++;
		var url = "";
		if (type == "item")
			url = ENV.api + ENV.search + "?type=item&page=" + this.page[word][type] + "&word=" + word;//&in=tag 20180420
		else if (type == "tag")
			url = ENV.api + ENV.search + "?type=item&in=tag&page=" + this.page[word][type] + "&word=" + word;
		else if (type == "all")
			url = ENV.api + ENV.search + "?type=allv2&page=1&word=" + word;
		else if (type == "mall")
			url = ENV.api + ENV.searchmall + "?ver=3&word=" + word;
		else if (type == "brand")
			url = ENV.api + ENV.search + "?type=brand&page=" + this.page[word][type] + "&word=" + word;
		else if (type == "odor")
			url = ENV.api + ENV.search + "?type=odor&page=" + this.page[word][type] + "&word=" + word;
		else if (type == "perfumer")
			url = ENV.api + ENV.search + "?type=perfumer&page=" + this.page[word][type] + "&word=" + word;
		else if (type == "user")
			url = ENV.api + ENV.search + "?type=user&page=" + this.page[word][type] + "&word=" + word;
		else if (type == "article")
			url = ENV.api + ENV.search + "?type=article&page=" + this.page[word][type] + "&word=" + word;
		else if (type == "topic")
			url = ENV.api + ENV.search + "?type=topic&page=" + this.page[word][type] + "&word=" + word;
		else if (type == "topicv2")
			url = ENV.api + ENV.search + "?type=topicv2&start=10&page=" + this.page[word][type] + "&word=" + word;
		else if (type == "vod")
			url = ENV.api + ENV.search + "?type=vodv2&page=" + this.page[word][type] + "&word=" + word;
		else return;
		http.get(url).then((resp_data: any) => {
			if (this.searchlist[word] == undefined) this.searchlist[word] = {};
			if (type == "all") {
				this.searchlist[word].brand = resp_data.brand.data;
				this.searchlist[word].odor = resp_data.odor.data;
				this.searchlist[word].perfumer = resp_data.perfumer.data;
				this.searchlist[word].user = resp_data.user.data;
				this.searchlist[word].article = resp_data.article.data;
				this.searchlist[word].topic = resp_data.topic.data;
				this.searchlist[word].item = resp_data.item.data;
				this.searchlist[word].vod = resp_data.vod.data;

				if (!this.searchlist[word].brand || resp_data.brand.cnt <= this.searchlist[word].brand.length)
					this.moredata[word]["brand"] = false;
				if (!this.searchlist[word].odor || resp_data.odor.cnt <= this.searchlist[word].odor.length)
					this.moredata[word]["odor"] = false;
				if (!this.searchlist[word].perfumer || resp_data.perfumer.cnt <= this.searchlist[word].perfumer.length)
					this.moredata[word]["perfumer"] = false;
				if (!this.searchlist[word].user || resp_data.user.cnt <= this.searchlist[word].user.length)
					this.moredata[word]["user"] = false;
				if (!this.searchlist[word].article || resp_data.article.cnt <= this.searchlist[word].article.length)
					this.moredata[word]["article"] = false;
				if (!this.searchlist[word].topic || resp_data.topic.cnt <= this.searchlist[word].topic.length)
					this.moredata[word]["topic"] = false;
				if (!this.searchlist[word].item || resp_data.item.cnt <= this.searchlist[word].item.length)
					this.moredata[word]["item"] = false;
				if (!this.searchlist[word].vod || resp_data.vod.cnt <= this.searchlist[word].vod.length)
					this.moredata[word]["vod"] = false;

				events.publish("nosetime_searchlistUpdated", { type, word });
			} else if (type == "item") {
				if (resp_data.item.cnt == 0) {
					this.moredata[word][type] = false;
					events.publish("nosetime_searchlistUpdatedError", { type, word });
					return "NOMOREDATA";
				}

				if (this.searchlist[word].item == undefined) this.searchlist[word].item = [];
				this.searchlist[word].item = this.searchlist[word].item.concat(resp_data.item.data);

				if (resp_data.item.cnt <= this.searchlist[word].item.length)
					this.moredata[word][type] = false;
				events.publish("nosetime_searchlistUpdated", { type, word });
			} else if (type == "tag") {
				if (resp_data.item.cnt == 0) {
					this.moredata[word][type] = false;
					events.publish("nosetime_searchlistUpdatedError", { type, word });
					return "NOMOREDATA";
				}

				if (this.searchlist[word].item == undefined) this.searchlist[word].item = [];
				resp_data.item.data.map((item: any) => {
					item["discuss2"] = "";
					item["isopen"] = true;
					if (item.discuss.length > 0) {
						reactNativeTextSize.measure({
							width: Winwidth - 30,
							fontSize: 13,
							fontFamily: "monospace",
							fontWeight: "normal",
							text: item.discuss,
							lineInfoForLine: 7
						}).then((data: any) => {
							if (data.lineCount < 7) {
								item["discuss2"] = "";
								item["isopen"] = true;
							} else {
								item["discuss2"] = item.discuss.slice(0, data.lineInfo.start - 14);
								item["isopen"] = false;
							}
						}).catch((error) => {
							item["discuss2"] = "";
							item["isopen"] = true;
						});
					}
				});
				if (this.page[word][type] > 2) {
					this.searchlist[word].item = this.searchlist[word].item.concat(resp_data.item.data);
				} else {
					this.searchlist[word].item = resp_data.item.data;
				}

				if (resp_data.item.cnt <= this.searchlist[word].item.length)
					this.moredata[word][type] = false;
				events.publish("nosetime_searchlistUpdated", { type, word });
			} else if (type == "vod") {
				if (resp_data.vod.cnt == 0) {
					this.moredata[word][type] = false;
					events.publish("nosetime_searchlistUpdatedError", { type, word });
					return "NOMOREDATA";
				}

				if (this.searchlist[word].vod == undefined) this.searchlist[word].vod = [];
				this.searchlist[word].vod = this.searchlist[word].vod.concat(resp_data.vod.data);

				if (resp_data.vod.cnt <= this.searchlist[word].vod.length)
					this.moredata[word][type] = false;
				events.publish("nosetime_searchlistUpdated", { type, word });
			} else if (type == "brand") {
				if (resp_data.brand.cnt == 0) {
					this.moredata[word][type] = false;
					events.publish("nosetime_searchlistUpdatedError", { type, word });
					return "NOMOREDATA";
				}

				if (this.searchlist[word].brand == undefined) this.searchlist[word].brand = [];
				this.searchlist[word].brand = this.searchlist[word].brand.concat(resp_data.brand.data);

				if (resp_data.brand.cnt <= this.searchlist[word].brand.length)
					this.moredata[word][type] = false;
				events.publish("nosetime_searchlistUpdated", { type, word });
			} else if (type == "odor") {
				if (resp_data.odor.cnt == 0) {
					this.moredata[word][type] = false;
					events.publish("nosetime_searchlistUpdatedError", { type, word });
					return "NOMOREDATA";
				}

				if (this.searchlist[word].odor == undefined) this.searchlist[word].odor = [];
				this.searchlist[word].odor = this.searchlist[word].odor.concat(resp_data.odor.data);

				if (resp_data.odor.cnt <= this.searchlist[word].odor.length)
					this.moredata[word][type] = false;
				events.publish("nosetime_searchlistUpdated", { type, word });
			} else if (type == "perfumer") {
				if (resp_data.perfumer.cnt == 0) {
					this.moredata[word][type] = false;
					events.publish("nosetime_searchlistUpdatedError", { type, word });
					return "NOMOREDATA";
				}

				if (this.searchlist[word].perfumer == undefined) this.searchlist[word].perfumer = [];
				this.searchlist[word].perfumer = this.searchlist[word].perfumer.concat(resp_data.perfumer.data);

				if (resp_data.perfumer.cnt <= this.searchlist[word].perfumer.length)
					this.moredata[word][type] = false;
				events.publish("nosetime_searchlistUpdated", { type, word });
			} else if (type == "article") {
				if (resp_data.article.cnt == 0) {
					this.moredata[word][type] = false;
					events.publish("nosetime_searchlistUpdatedError", { type, word });
					return "NOMOREDATA";
				}

				if (this.searchlist[word].article == undefined) this.searchlist[word].article = [];
				this.searchlist[word].article = this.searchlist[word].article.concat(resp_data.article.data);

				if (resp_data.article.cnt <= this.searchlist[word].article.length)
					this.moredata[word][type] = false;
				events.publish("nosetime_searchlistUpdated", { type, word });
			} else if (type == "topic") {
				if (resp_data.topic.cnt == 0) {
					this.moredata[word][type] = false;
					events.publish("nosetime_searchlistUpdatedError", { type, word });
					return "NOMOREDATA";
				}

				if (this.searchlist[word].topic == undefined) this.searchlist[word].topic = [];
				this.searchlist[word].topic = this.searchlist[word].topic.concat(resp_data.topic.data);

				if (resp_data.topic.cnt <= this.searchlist[word].topic.length)
					this.moredata[word][type] = false;
				events.publish("nosetime_searchlistUpdated", { type, word });
			} else if (type == "topicv2") {
				if (resp_data.topic.cnt == 0) {
					this.moredata[word][type] = false;
					events.publish("nosetime_searchlistUpdatedError", { type, word });
					return "NOMOREDATA";
				}

				if (this.searchlist[word].topicv2 == undefined) this.searchlist[word].topicv2 = [];
				this.searchlist[word].topicv2 = this.searchlist[word].topicv2.concat(resp_data.topic.data);

				if (resp_data.topic.cnt <= this.searchlist[word].topicv2.length)
					this.moredata[word][type] = false;
				events.publish("nosetime_searchlistUpdated", { type, word });
			} else if (type == "user") {
				if (resp_data.user.cnt == 0) {
					this.moredata[word][type] = false;
					events.publish("nosetime_searchlistUpdatedError", { type, word });
					return "NOMOREDATA";
				}

				if (this.searchlist[word].user == undefined) this.searchlist[word].user = [];
				this.searchlist[word].user = this.searchlist[word].user.concat(resp_data.user.data);

				if (resp_data.user.cnt <= this.searchlist[word].user.length)
					this.moredata[word][type] = false;
				events.publish("nosetime_searchlistUpdated", { type, word });
			} else if (type == "mall") {
				if (resp_data.length == 0) {
					this.moredata[word][type] = false;
					events.publish("nosetime_searchlistUpdatedError", { type, word });
					return "NOMOREDATA";
				}
				//20220811 shibo:处理搜索结果商品中单品价格
				for (let i in resp_data) {
					if (resp_data[i].name == "单品") {
						for (let j in resp_data[i].items) {
							resp_data[i].items[j].maxprice = Math.round((resp_data[i].items[j].maxprice * 100) / 100)
						}
					}
				}
				this.searchlist[word].mall = resp_data;
				//this.cache.saveItem(this.factoryname+word,this.searchlist[word],this.factoryname,60);
				this.moredata[word][type] = false;
				events.publish("nosetime_searchlistUpdated", { type, word });
			}
		}, msg => console.error(`Error: ${msg.status} ${msg.statusText}`)
		);
	}
}

const searchService = new SearchService();

export default searchService;