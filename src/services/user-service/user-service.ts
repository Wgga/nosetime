import { Platform } from "react-native";

import DeviceInfo from "react-native-device-info";

import wss from "../wss-service/wss-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import { ENV } from "../../configs/ENV";

class UserService {
	private factoryname: string = "UserService";
	public user: any = { uid: 0, token: null };
	public kfmsg: any = {};
	public gender: string = "";
	public mobile: string = "";
	private binit: boolean = false;

	public did: string = "";
	//public udidup={};
	// public lastshowtime=0;
	public saveddeviceinfo: any = {};
	public deviceinfo: any = {};//unsaveddeviceinfo
	public timer_savedeviceinfo: any;
	public timer_userlogin: any;

	public isandroid: boolean = false;
	public isios: boolean = false;
	public isnewinstall: boolean = false;

	constructor() {
		Platform.OS == "android" ? this.isandroid = true : this.isios = true;

		this.init();

		//TODO:if(this.isios)
		//TODO:	this.jpush.resetBadge();

		events.subscribe("nosetime_userlogin", () => {
			//console.log("this.events.subscribe("nosetime_userlogin");
			this.userlogin();
		});

		//退出时设置别名为空
		events.subscribe("nosetime_userlogout", () => {
			console.log("setAlias-00");
			//20181020 退出后清空推送消息
			//TODO:if(this.isandroid)
			//TODO:	this.jpush.clearAllNotification();

			if (this.saveddeviceinfo["uid"] == undefined || this.saveddeviceinfo["uid"] != 0) {
				this.deviceinfo["uid"] = 0;
				this.savedeviceinfo();
			}
		});
	}
	init() {
		//从缓存获取用户信息
		cache.getItem(this.factoryname + "user").then((cacheobj) => {
			this.binit = true;
			if (cacheobj) {
				this.user = cacheobj;
				this.userlogin();
			}
		}).catch(() => {
			this.binit = true;
			this.userlogin();
		})
		cache.getItem(this.factoryname + "did").then((cacheobj) => {
			if (cacheobj) {
				this.did = cacheobj;
			} else {
				this.did = this.getUID(8);
				cache.saveItem(this.factoryname + "did", this.did, 365 * 24 * 3600);
			}
		}).catch(() => {
			this.isnewinstall = true;
			this.did = this.getUID(8);
			cache.saveItem(this.factoryname + "did", this.did, 365 * 24 * 3600);
		});

		cache.getItem(this.factoryname + "gender").then((cacheobj) => {
			if (cacheobj) {
				this.gender = cacheobj;
			}
		}).catch(() => { });

		cache.getItem(this.factoryname + "mobile").then((cacheobj) => {
			if (cacheobj) {
				this.mobile = cacheobj;
			}
		}).catch(() => { });

		cache.getItem(this.factoryname + "sdinfo").then((cacheobj) => {
			if (cacheobj) {
				this.saveddeviceinfo = cacheobj;
			}
		}).catch(() => { });

		/*
		this.cache.getItem(this.factoryname+"dinfo")
		.catch(() => {
		})
		.then((cacheobj) => {
			if(cacheobj){
				this.deviceinfo=cacheobj;
			}
		});*/
		/*
		this.cache.getItem(this.factoryname+"lastshowtime")
		.catch(() => {
		})
		.then((cacheobj) => {
			if(cacheobj){
				this.lastshowtime=cacheobj;
			}
		});*/

		//this.cache.getItem("udidup")
		//.catch(() => {
		//})
		//.then((cacheobj) => {
		//	if(cacheobj){
		//		this.udidup=cacheobj;
		//	}
		//});
	}

	getdeviceinfo() {
		/* //did,uid,brand,jpushid,appver,osver,model
		// iPhone7,2--iOS--814C62BD-0174-4F6B-B20D-0BF4587B685A--11.4.1--Apple--false--unknown
		// Android SDK built for x86--Android--d34e960d740d7008--8.1.0--Google--true--unknown
		console.log("getdeviceinfo:===" + this.device.model + "--" + this.device.platform + "--" + this.device.version + "--" + this.device.manufacturer + "--" + this.device.isVirtual + "--" + this.device.serial);
		//alert("getdeviceinfo:==="+this.device.model+"--"+this.device.platform+"--"+this.device.uuid+"--"+this.device.version+"--"+this.device.manufacturer+"--"+this.device.isVirtual+"--"+this.device.serial);

		this.deviceinfo["did"] = this.did;
		//this.deviceinfo["uid"]
		this.deviceinfo["brand"] = this.device.manufacturer;
		//this.deviceinfo["setting"]
		this.deviceinfo["appver"] = ENV.AppNVersion + ENV.AppBuildVersion;
		this.deviceinfo["osver"] = this.device.version;
		this.deviceinfo["model"] = this.device.model; */
	}

	userlogin() {
		//console.log("===userlogin1 "+this.user.uid);
		if (this.timer_userlogin) {
			clearTimeout(this.timer_userlogin);
		}
		this.timer_userlogin = setTimeout(() => { this._userlogin() }, 1000);
	}
	_userlogin() {
		//console.log("===_userlogin2 "+this.user.uid);

		if (this.user.uid && this.user.token) {
			this.deviceinfo["uid"] = this.user.uid;
			//console.log("===_userlogin2"+this.user.uid);


			var AppVersion = ENV.AppMainVersion + "." + ENV.AppMiniVersion + "." + ENV.AppBuildVersion;
			var p = "APP ";
			if (this.isandroid) p = "ANDROID ";
			else if (this.isios) p = "IOS ";

			wss.userlogin(this.user.uid, this.user.token, p + AppVersion);
		}
		if (this.timer_savedeviceinfo) {
			clearTimeout(this.timer_savedeviceinfo);
		}
		this.timer_savedeviceinfo = setTimeout(() => { this.ifsavedeviceinfo() }, 5000);

	}

	ifsavedeviceinfo() {
		this.getdeviceinfo();
		//获取deviceinfo不成功
		if (!this.deviceinfo["did"]) return;
		let diff = false;
		let keys = ["did", "uid", "brand", "hwpushid", "mipushid", "oppopushid", "vivopushid", "applepushid", "hwpushid_method", "appver", "osver", "model"];
		let k = "";
		for (let i in keys) {
			k = keys[i];
			if ((this.saveddeviceinfo[k] == undefined && this.deviceinfo[k] != undefined && this.deviceinfo[k] != "") ||
				(this.saveddeviceinfo[k] != undefined && this.deviceinfo[k] != undefined && this.deviceinfo[k] != "" && this.saveddeviceinfo[k] != this.deviceinfo[k])) {
				diff = true;
				break;
			}
		}
		if (diff)
			this.savedeviceinfo();
	}

	savedeviceinfo() {
		//console.log("savedeviceinfo saveddeviceinfo==="+JSON.stringify(this.saveddeviceinfo));
		//console.log("savedeviceinfo deviceinfo==="+JSON.stringify(this.deviceinfo));
		http.post(ENV.user, { method: "dinfo", dinfo: this.deviceinfo }, "text").then((resp_data: any) => {
			if (resp_data == "O") {
				//console.log("SAVE saveItem deviceinfo==="+JSON.stringify(this.deviceinfo));
				cache.saveItem(this.factoryname + "sdinfo", this.deviceinfo, 7 * 24 * 3600);
			}
		})

		if (this.deviceinfo.brand == "Apple" && this.user.uid > 0) {
			/* this.push.apple_getsetting((res) => {
				//console.log("===apple_getsetting0",res);
			}, (res) => {
				//console.log("===apple_getsetting1",res);
				if (res == "NotDetermined")
					this.showreq();
			},(e) => {
					//console.log("===apple_getsetting2",e);
			}); */
		}
		if (this.deviceinfo.brand == "OPPO" && this.user.uid > 0) {
			this.showreq();
		}
	}

	showreq() {
		if (this.isnewinstall) {
			//新安装app，登录状态下直接提问
			this._showreq();
		} else {
			cache.getItem(this.factoryname + "showreq").then((cacheobj: any) => {
			}).catch(() => {
				http.post(ENV.user, {
					method: "showreq", uid: this.user.uid, token: this.user.token, brand: this.deviceinfo.brand, did: this.did
				}).then((resp_data: any) => {
					if (resp_data.msg == "O") {
						this._showreq();
					}
				})
			});
		}
	}

	_showreq() {
		//console.log("SAVE saveItem deviceinfo==="+JSON.stringify(this.deviceinfo));
		cache.saveItem(this.factoryname + "showreq", 1, 7 * 24 * 3600);
		/* this.alertCtrl.create({
			header: "开通通知权限",
			cssClass: "cart_tip protocol_tip",
			backdropDismiss: false,
			message: "为了香友给您发消息时，或者有其他重要信息需要提醒时，及时给您发送提醒，需要开通手机通知权限。",
			buttons: [
				{
					text: "下次一定"
				},
				{
					text: "现在开通",
					handler: () => {
						if (this.deviceinfo.brand == "OPPO")
							this.push.oppo_requestNotificationPermission();
						else if (this.deviceinfo.brand == "Apple")
							this.push.apple_requestAuthorizationWithOptions();
						this.http.post(ENV.api + ENV.user,
							{ method: "setreq", uid: this.user.uid, token: this.user.token, brand: this.deviceinfo.brand, did: this.did })
							.subscribe((resp_data: any) => {
							});
					}
				}
			]
		}).then((alert) => { alert.present() }); */
	}

	getUser() {
		if (this.binit)
			return;
		return cache.getItem(this.factoryname + "user");
	}

	saveUser(user: any) {
		if (user.uid > 0) {
			this.user = user;
			cache.saveItem(this.factoryname + "user", this.user, 30 * 24 * 3600);
		}
	}

	delUser() {
		this.user = { uid: 0, token: null };
		cache.removeItem(this.factoryname + "user");
	}

	setGender(gender: string) {
		this.gender = gender;
		//20220811 shibo:修复修改性别不生效
		this.user.ugender = gender;
		cache.saveItem(this.factoryname + "gender", this.gender, 30 * 24 * 3600);
	}

	setMobile(mobile: string) {
		this.mobile = mobile;
		cache.saveItem(this.factoryname + "mobile", this.mobile, 30 * 24 * 3600);
	}

	getUID(len: number) {
		var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
			out = "_";
		for (var i = 0, clen = chars.length; i < len; i++) {
			out += chars.substr(0 | Math.random() * clen, 1);
		}
		return out;
	}

	// 判断是否为Email
	isemail(email: string) {
		if (!email || email.length < 7) return false;
		var regex = /^[a-z0-9]+([\+_\-\.]?[a-z0-9]+)*@([a-z0-9]+[\-]?[a-z0-9]*\.)+[a-z]{2,6}$/i;
		return regex.test(email);
	}

	// 判断是否为手机号
	ismobile(mobile: string) {
		if (!mobile || mobile.length != 11) return false;
		var regex = /^1[3-9]\d{9}$/;
		return regex.test(mobile);
	}

	// 获取客服信息
	async getkfmsg() {
		try {
			let cacheobj = await cache.getItem("messagedata");
			cacheobj.sztime = this.formattime(cacheobj.time);
			if (cacheobj.content.indexOf('"page"') > 0) {
				cacheobj.content = "发来链接";
			} else if (cacheobj.content.indexOf('"url"') > 0) {
				cacheobj.content = "发来图片";
			}
			return cacheobj;
		} catch {
			return null;
		}
	}

	async getmessagedata() {
		let tixingdata: any = {};
		let sixindata: any = {};
		let kefudata: any = {};
		try {
			tixingdata = await http.post(ENV.tixing + "?uid=" + this.user.uid, { method: "newtixing", token: this.user.token })
			sixindata = await http.post(ENV.sixin + "?uid=" + this.user.uid, { method: "newsixin", token: this.user.token })
			kefudata = await this.getkfmsg();
			return tixingdata.newtixing + sixindata.newsixin + ((kefudata && kefudata.new) ? kefudata.new : 0);
		} catch {
			return 0;
		}
	}

	// 处理时间
	formattime(tm: number) {
		//7天以前显示；？年？月？日 上午？：？
		//7天内显示：星期几 上午？：？
		//当天显示：上午？：？
		//昨天显示：昨天 上午？：？
		let now = new Date().getTime() / 1000;
		let today = Math.floor((now + 8 * 3600) / 86400) * 86400 - 8 * 3600; //今天开始的时间
		let yesterday = today - 86400; //昨天开始的时间
		let day6before = today - 6 * 86400; //6天前开始的时间
		let t = new Date(tm * 1000);
		let am = "";
		let szm = "";
		let h = t.getHours();
		let m = t.getMinutes();
		if (m < 10) szm = "0" + m; else szm = "" + m;
		if (h < 6) am = "凌晨"; //凌晨5:59
		else if (h < 12) am = "上午";
		else if (h == 12) am = "下午";
		else if (h < 23) { am = "下午"; h -= 12; }
		else return "";
		if (tm > today)
			return am + h + ":" + szm;
		else if (tm > yesterday)
			return "昨天 " + am + h + ":" + szm;
		else if (tm > day6before)
			return "周" + ["日", "一", "二", "三", "四", "五", "六"][t.getDay()] + " " + am + h + ":" + szm;
		else
			return t.getFullYear() + "年" + (t.getMonth() + 1) + "月" + t.getDate() + "日 " + am + h + ":" + szm;
	}

	calc_sztime(items: any, lasttime: number) {
		lasttime = 0;
		let items2 = [...items].reverse();
		for (let i in items2) {
			if (items2[i].time - lasttime > 60) {
				items2[i].sztime = this.formattime(items2[i].time);
			} else {
				items2[i].sztime = "";
			}
			lasttime = items2[i].time;
		}
	}

	calc_last_sztime(items: any, lasttime: number) {
		let items2 = [...items].reverse();
		let i = items2.length - 1;
		if (items2[i].time - lasttime > 60) {
			items2[i].sztime = this.formattime(items2[i].time);
		} else {
			items2[i].sztime = "";
		}
		lasttime = items2[i].time;
	}

	// setLastshowtime(lastshowtime){
	// 	this.lastshowtime=lastshowtime;
	// 	this.cache.saveItem(this.factoryname+"lastshowtime",this.lastshowtime,this.factoryname,30*24*3600);
	// }
}
const us = new UserService();
export default us;