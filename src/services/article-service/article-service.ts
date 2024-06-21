import { Dimensions } from "react-native";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";
import events from "../../hooks/events/events";

import { ENV } from "../../configs/ENV";
import us from "../user-service/user-service";

const Winwidth = Dimensions.get("window").width;

class ArticleService {

	private classname: string = "";
	private articledata: any = {};
	private factoryname: string = "articleService";
	private id: number = 0;
	private articles: any = {
		"最新": { data: [], ids: {} },
		"专题": { data: [], ids: {} },
		"寻味": { data: [], ids: {} },
		"知识": { data: [], ids: {} }
	};


	// 根据a标签href替换html中的a标签跳转内容
	changehref = (match: any, url: string, title: string) => {
		//console.log("changehref=", match, url, title);

		//20230418 shibo:若a标签内存在style属性则保留该属性
		let urls = /style="(.*?)"/.exec(match), style = "";
		if (urls && urls.length > 0) style = urls[0];

		//<a href=" /xiangshui/168678-diao-duyao-zidu-dior-poison.html">迪奥紫Dior Poison
		var id = 0;
		var pos = url.indexOf("/xiangshui/");
		if (pos > 0) {
			id = parseInt(url.substr(pos + 11, 6));
			//console.log(typeof id);
			if (typeof id == "number")
				return '<a href=\'#/?{"page":"item-detail","id":' + id + '}\'' + style + '>' + title + '</a>';
			//return "<a href='#/tab/itemdetail?type=item&id="+id+"&title="+title+"'>"+title+"</a>";
		}
		pos = url.indexOf("/xiangdiao/");
		if (pos > 0) {
			id = parseInt(url.substr(pos + 11, 8));
			//console.log(typeof id);
			if (typeof id == "number")
				return '<a href=\'#/?{"page":"wiki-detail","id":' + id + '}\'' + style + '>' + title + '</a>';
			//return "<a href='#/tab/wikidetail?type=fragrance&id="+id+"&name="+title+"'>"+title+"</a>";
		}
		pos = url.indexOf("/tiaoxiangshi/");
		if (pos > 0) {
			id = parseInt(url.substr(pos + 14, 8));
			//console.log(typeof id);
			if (typeof id == "number")
				return '<a href=\'#/?{"page":"wiki-detail","id":' + id + '}\'' + style + '>' + title + '</a>';
			//return "<a href='#/tab/wikidetail?type=perfumer&id="+id+"&name="+title+"'>"+title+"</a>";
		}
		pos = url.indexOf("/wenzhang/");
		if (pos > 0) {
			id = parseInt(url.substr(pos + 10, 6));
			//var pos2=id.indexOf(".");
			//id=parseInt(id.substr(0,pos2));
			//console.log(typeof id);
			if (typeof id == "number")
				return '<a href=\'#/?{"page":"article-detail","id":' + id + '}\'' + style + '>' + title + '</a>';
			//return "<a href='#/tab/articledetail?type=article&id="+id+"'>"+title+"</a>";
		}
		pos = url.indexOf("/brand.php?id=");
		if (pos > 0) {
			id = parseInt(url.substr(pos + 14, 8));
			//console.log(typeof id);
			if (typeof id == "number")
				return '<a href=\'#/?{"page":"wiki-detail","id":' + id + '}\'' + style + '>' + title + '</a>';
			//return "<a href='#/tab/wikidetail?type=brand&id="+id+"'>"+title+"</a>";
		}
		pos = url.indexOf("/pinpai/");
		if (pos > 0) {
			id = parseInt(url.substr(pos + 8, 8));
			//console.log(typeof id);
			if (typeof id == "number")
				return '<a href=\'#/?{"page":"wiki-detail","id":' + id + '}\'' + style + '>' + title + '</a>';
			//return "<a href='#/tab/wikidetail?type=brand&id="+id+"'>"+title+"</a>";
		}
		pos = url.indexOf("/qiwei/");
		if (pos > 0) {
			id = parseInt(url.substr(pos + 7, 8));
			//console.log(typeof id);
			if (typeof id == "number")
				return '<a href=\'#/?{"page":"wiki-detail","id":' + id + '}\'' + style + '>' + title + '</a>';
			//return "<a href='#/tab/wikidetail?type=odor&id="+id+"&name="+title+"'>"+title+"</a>";
		}
		/*
		pos=url.indexOf("/perfumer.php?id=");
		if(pos>0){
			id=parseInt(url.substr(pos+17,8));
			//console.log(typeof id);
			if(typeof id=="number")
				return "<a href='#/tab/wikidetail?type=perfumer&id="+id+"'>"+title+"</a>";
		}*/
		let iidstr = "";
		let iid = 0;
		let posiid = match.indexOf("iid=");
		if (posiid > 0) {
			iidstr = match.substr(posiid + 4);
			// console.log("iidstr", iidstr, iidstr.length);
			iid = parseInt(iidstr.replace(/['"]/g, ""));
			// console.log("iid", iid);
		}

		if ((url.indexOf("taobao.com") > 0 || url.indexOf("weidian.com") > 0 || url.indexOf("/mall/") > 0) && iid) {
			if (iid >= 100000 && iid <= 999999)
				return '<a href=\'#/?{"page":"mall-item","id":' + iid + '}\'' + style + '>' + title + '</a>';
			else if (iid >= 10000 && iid <= 99999)
				return '<a href=\'#/?{"page":"mall-heji","id":' + iid + '}\'' + style + '>' + title + '</a>';
			else if (iid >= 1000 && iid <= 9999)
				return '<a href=\'#/?{"page":"mall-group","id":' + iid + '}\'' + style + '>' + title + '</a>';
			else
				return "<a href='" + url + "'>" + title + "</a>";
		}
		//20220119:文章里链接跳转改为任何都可以跳转
		return `<a target="_blank" href=${url}>${title}</a>`;
	}

	changevote = (match: any, voteid: string) => {
		let id = voteid.replace("vote_", "");
		let index = this.getVoteData(this.classname, this.id).findIndex((item: any) => item.id == id);
		let votedata = this.getVoteData(this.classname, this.id)[index];
		let sz = `
			<div class="vote_list">
				<div class="vote_title">${votedata.title}（${votedata.choose_classify}）</div>
				<span class="vote_desc">${votedata.introduction}</span>
				<div class="vote_item_con">
					${(function () {
						let votesz = "";
						votedata.list.forEach((item: any) => {
							votesz += `<div id="${id}_${item.id}_${item.info}"><div class="vote_item">`;
							if (votedata.checked || votedata.isclose) {
								votesz += `<span class="vote_bg ${(votedata.checked && item.checked) ? "checkedbg" : ""}" style="width:${item.accounted}"></span>`;
							}
							votesz += `<div class="vote_item_msg ${(votedata.vote_classify == "2") ? "textleft" : ""}">`;
							if (item.info && votedata.vote_classify == "1") {
								votesz += `<img onerror="javascript:this.src='assets/img/noxx.png'" class="voteitemimg"
												src="${ENV.image + "/perfume/" + item.info}.jpg" />`;
							}
							if (votedata.vote_classify == "1") {
								votesz += `<span class="name_con"><span class="item_cname">${item.cnname}</span><span class="item_ename">${item.enname}</span></span>`;
							}
							if (votedata.vote_classify == "2") {
								votesz += `<span class="vote_item_info">${item.info}</span>`;
							}
							if (votedata.checked) {
								votesz += `<div class="vote_num_con ${item.checked ? "ischecked" : ""}">`;
								if (item.checked) {
									votesz += `<span class="iconseled">
									<svg t="1718963693471" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10550" width="12" height="12">
									<path d="M58.514286 632.685714s138.971429 47.542857 219.428571 142.628572 157.257143 171.885714 157.257143 171.885714 62.171429-135.314286 226.742857-314.514286 274.285714-226.742857 274.285714-226.742857-14.628571-73.142857-14.628571-138.971428c-3.657143-98.742857 0-186.514286 0-186.514286s-128 21.942857-299.885714 274.285714-201.142857 358.4-201.142857 358.4l-120.685715-245.028571c0-3.657143-241.371429 164.571429-241.371428 164.571428z" fill="#6979BF" p-id="10551"></path>
									</svg></span>`;
								}
								votesz += `<span>${item.select_num}票</span></div>`;
							}
							votesz += `</div></div>`;
							if (!votedata.isclose && !votedata.checked) {
								votesz += `<div class="sel_btn">`;
								if (votedata.choose_classify == "单选") {
									votesz += `<span class="radio ${item.ischecked ? "radio_checked" : ""}"></span>`;
								} else if (votedata.choose_classify == "多选") {
									votesz += `<span class="checkbox">`;
									if (item.ischecked) {
										votesz += `<span class="iconseled">
										<svg t="1718963693471" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="10550" width="11" height="11">
										<path d="M58.514286 632.685714s138.971429 47.542857 219.428571 142.628572 157.257143 171.885714 157.257143 171.885714 62.171429-135.314286 226.742857-314.514286 274.285714-226.742857 274.285714-226.742857-14.628571-73.142857-14.628571-138.971428c-3.657143-98.742857 0-186.514286 0-186.514286s-128 21.942857-299.885714 274.285714-201.142857 358.4-201.142857 358.4l-120.685715-245.028571c0-3.657143-241.371429 164.571429-241.371428 164.571428z" fill="#6979BF" p-id="10551"></path>
										</svg></span>`;
									}
									votesz += `</span>`;
								}
								votesz += `</div>`;
							}
							votesz += `</div>`;
						});
						return votesz;
					})()}
				</div>
				<div class="vote_message">
					<span class="vote_num">${votedata.user_num}人已参与</span>
					${(function () {
						if (votedata.toend) {
							return `<span class="vote_days">，${votedata.toend}</span>`;
						} else {
							return "";
						}
					})()}
				</div>
				${(function (that) {
					if (votedata.checked) {
						return `<div class="vote_btn gary">你已投票</div>`;
					} else if (votedata.isclose && !votedata.checked) {
						return `<div class="vote_btn gary">投票已结束</div>`;
					} else if (!votedata.checked && !votedata.isclose) {
						return `<div class="vote_btn" id="${voteid}">投票</div>`;
					}
				})(this)}
			</div>
		`;
		return sz;
	}

	// 处理html中的a标签返回整个html
	changeurl = (data: any) => {
		var cover = data.html.match(/<img [^>]+>/g);
		if (cover && cover[0] != undefined && cover[0] != "" && cover[0].indexOf(data.coverimg) >= 0)
			data.html = data.html.replace(cover[0], "");
		//data.html=data.html.replace(/src=\"\/images\//g,'src="assets/img/nopic.png" [customObservable]="container.ionScroll" [lazyLoad]="https://img.xssdcdn.com/');
		data.html = data.html.replace(/src=\"\/images\//g, `src="https://img.xssdcdn.com/`);
		//data.html=data.html.replace(/<a[^>]*href=["'](.*)['"].*>(.*)<\/a>/g,$scope.changehref);
		//data.html=data.html.replace(/<a\s(?:\w*?=".*?"\s)*(?:href=")(.*?)(?:")(?:\s\w*?=".*?")*>(.+?)<\/a>/g,$scope.changehref);
		data.html = data.html.replace(/<a[^>]*href=([^>]*)>([^<]*)<\/a>/g, this.changehref);
		data.html = data.html.replace(/<a[^>]*href=([^>]*)>(<img[^<]*)<\/a>/g, this.changehref);
		data.html = data.html.replace(/<vote id="([^"]+)"><\/vote>/g, this.changevote);

		return data.html;
	}

	getArticleData = (classname: string, id: number) => {
		return this.articledata[classname + id]["articledata"];
	}

	getVoteData = (classname: string, id: number) => {
		return this.articledata[classname + id]["votedata"];
	}

	// 获取文章列表
	fetchArticleData = (classname: string, id: number) => {
		this.classname = classname;
		this.id = id;
		// cache.getItem(classname + id).then((cacheobj: any) => {
		// 	if (cacheobj) {
		// 		this.articledata[classname + id] = { "articledata": cacheobj };
		// 		this.getvotedata("cache");
		// 		events.publish(classname + id + "ArticleData", { classname, id });
		// 	}
		// }).catch(() => {
		http.get(ENV.article + "?id=" + id).then((resp_data: any) => {
			this.getvotedata("request", { classname, id });
			let covers = resp_data.coverimg.split("/"),
				coverimgname = covers[covers.length - 1], imgWH = [];
			if (coverimgname.match(/S(\d+)x(\d+)/g)) {
				imgWH = covers[covers.length - 1].split(/S(\d+)x(\d+)/g);
				resp_data.tempH = imgWH[2] * Winwidth / imgWH[1];
			} else {
				resp_data.tempH = 527 * Winwidth / 900;
			}
			cache.saveItem(classname + id, resp_data, 60);
			this.articledata[classname + id] = { "articledata": resp_data };
		}).catch((error: any) => { });
		// })
	}

	getvotedata = (type: string, data: any) => {
		http.post(ENV.api + ENV.vote, { method: "getvote_uid", uid: us.user.uid, aid: data.id }).then((resp_data: any) => {
			this.articledata[data.classname + data.id]["votedata"] = resp_data.data
			if (type == "request") {
				resp_data.html = this.changeurl(this.articledata[data.classname + data.id]["articledata"]);
				events.publish(this.classname + this.id + "ArticleData", data);
			}
		})
	}

	// 获取热门文章
	fetchHotArticle = (tag: string) => {
		if (!tag || tag == "") return;
		cache.getItem(this.classname + tag).then((cacheobj: any) => {
			if (cacheobj) {
				events.publish(this.classname + this.id + "HotArticle", cacheobj);
			}
		}).catch(() => {
			http.get(ENV.article + "?method=gethotarticles&tag=" + tag + "&id=" + this.id).then((resp_data: any) => {
				cache.saveItem(this.classname + tag, resp_data, 60);
				events.publish(this.classname + this.id + "HotArticle", resp_data);
			})
		})
	}


	sortByWeightId(a: any, b: any) {
		if (a.weight != b.weight)
			return b.weight - a.weight;
		else
			return Math.random() - 0.5;
	}

	sortById(a: any, b: any) {
		return b.id - a.id;
	}

	getMaxId() {
		return this.articles["最新"].maxid;
	}

	getItems(type: string) {
		return this.articles[type].data;
	}

	moreDataCanBeLoaded(type: string) {
		if (this.articles[type].minid == undefined) return true;
		return this.articles[type].minid > 0;
	}

	//从缓存或者服务器获取数据，type为4个分类，newer表示获取新信息
	fetch(type: string, newer: number) {
		//获取旧数据，最小值存在且为0时，没有旧数据可获取，返回空
		if (!newer && this.articles[type].minid != undefined && this.articles[type].minid == 0) {
			events.publish("nosetime_articlesUpdateError", type);
			return "NOMOREDATA";
		}
		//如果没有数据，先从缓存读取数据，适用于App刚启动
		if (this.articles[type].data.length == 0) {
			cache.getItem(this.factoryname + type).then((cacheobj) => {
				if (cacheobj) {
					//缓存读数据后进行一下排序 | orderBy:["-weight","-id"]
					//在从网络读取数据后，不进行排序，以免造成显示混乱
					var data = cacheobj.data;
					var data2 = [];
					cacheobj.ids = {};
					for (var i in data) {
						var obj = data[i];
						if (obj.id > 0 && cacheobj.ids[obj.id] == undefined) {
							data2.push(obj);
							cacheobj.ids[obj.id] = 1;
						}
					}
					if (type == "最新" || type == "专题")
						data2.sort(this.sortById);
					else
						data2.sort(this.sortByWeightId);
					cacheobj.data = data2;
					this.articles[type] = cacheobj;
					//如果有数据，且没有过期，直接返回数据
					events.publish("nosetime_articlesUpdated", type);
				}
			}).catch(() => {
				this.fetchWeb(type, newer);
				return;
			})
		} else {
			this.fetchWeb(type, newer);
		}
	}

	fetchWeb(type: string, newer: number) {
		//计算范围
		var id = 0;
		if (newer && this.articles[type].maxid) id = this.articles[type].maxid;
		if (!newer && this.articles[type].minid) id = this.articles[type].minid;

		http.get(ENV.article + "?method=" + type + "&newer=" + newer + "&id=" + id).then((resp_data: any) => {
			if (resp_data.cnt > 0) {
				for (let i in resp_data.data) {
					let obj = resp_data.data[i];
					if (obj.id > 0 && this.articles[type].ids[obj.id] == undefined) {
						this.articles[type].data.push(obj);
						this.articles[type].ids[obj.id] = 1;
					}
				}
				if (newer && resp_data.maxid)
					this.articles[type].maxid = resp_data.maxid;
				else if (!newer && resp_data.minid)
					this.articles[type].minid = resp_data.minid;

				//没有值的时候给随便赋一个
				if (!this.articles[type].maxid && resp_data.maxid) this.articles[type].maxid = resp_data.maxid;
				if (!this.articles[type].minid && resp_data.minid) this.articles[type].minid = resp_data.minid;

				//取旧数据且数据不足时，表明没有更多数据了
				if (resp_data.cnt < 10 && !newer)
					this.articles[type].minid = 0;

				this.articles[type].expire = false;

				cache.saveItem(this.factoryname + type, this.articles[type], 60);//30*24*3600
				//最新的结果添加到其他各项中，并去重
				if (type == "最新") {
					for (let i in resp_data.data) {
						let obj = resp_data.data[i];
						if (obj.apptag != "" && obj.id > 0 && obj.id < this.getMaxId() - 10 && this.articles[obj.apptag].ids[obj.id] == undefined) {
							this.articles[obj.apptag].data.push(obj);
							this.articles[obj.apptag].ids[obj.id] = 1;
						}
					}
				}
				events.publish("nosetime_articlesUpdated", type);

				return;
			} else if (!newer && resp_data.minid == 0) {
				this.articles[type].minid = 0;
			}

			events.publish("nosetime_articlesUpdateError", type);
			return "NOMOREDATA";
		})
		return "ok";
	}

	unitNumber(number: number, decimal: number) {
		let ponit = Math.pow(10, decimal);
		return number >= 1e3 && number < 1e4 ? (Math.floor(number / 1e3 * ponit) / ponit) + 'k' : number >= 1e4 ? (Math.floor(number / 1e4 * ponit) / ponit) + 'w' : number
	}
}
const articleService = new ArticleService();
export default articleService;