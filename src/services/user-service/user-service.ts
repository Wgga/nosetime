import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";

import cache from "../../hooks/storage/storage";
import http from "../../utils/api/http";
import { ENV } from "../../configs/ENV";

class UserService {
	private factoryname: string = "UserService";
	public user: any = { uid: 0, token: null };
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

	constructor(
	) {
		// console.log("user-service constructor");

		Platform.OS == "android" ? this.isandroid = true : this.isios = true;

		this.init();

		//TODO:if(this.isios)
		//TODO:	this.jpush.resetBadge();

		// this.events.subscribe("nosetime_userlogin", () => {
		// 	//console.log("this.events.subscribe("nosetime_userlogin");
		// 	this.userlogin();
		// });
		// //退出时设置别名为空
		// this.events.subscribe("nosetime_userlogout", () => {
		// 	console.log("setAlias-00");
		// 	//20181020 退出后清空推送消息
		// 	//TODO:if(this.isandroid)
		// 	//TODO:	this.jpush.clearAllNotification();

		// 	if (this.saveddeviceinfo["uid"] == undefined || this.saveddeviceinfo["uid"] != 0) {
		// 		this.deviceinfo["uid"] = 0;
		// 		this.savedeviceinfo();
		// 	}
		// });
	}
	init() {
		//从缓存获取用户信息
		cache.getItem(this.factoryname + "user").then((cacheobj) => {
			this.binit = true;
			if (cacheobj) {
				this.user = cacheobj;
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

			// this.wss.userlogin(this.user.uid, this.user.token, p + AppVersion);
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
			cache.getItem(this.factoryname + "showreq").then((cacheobj) => {
			}).catch(() => {
				http.post(ENV.user, { method: "showreq", uid: this.user.uid, token: this.user.token, brand: this.deviceinfo.brand, did: this.did })
					.then((resp_data: any) => {
						if (resp_data.msg == "O") {
							this._showreq();
						}
					})
			});
		}
	}

	_showreq() {
		//console.log("SAVE saveItem deviceinfo==="+JSON.stringify(this.deviceinfo));
		cache.saveItem(this.factoryname + "showreq", 1, 7 * 24 * 3600 * 1000);
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
			this.user = user;//20180108这样复制有问题
			cache.saveItem(this.factoryname + "user", this.user, 30 * 24 * 3600 * 1000);
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
		cache.saveItem(this.factoryname + "gender", this.gender, 30 * 24 * 3600 * 1000);
	}

	setMobile(mobile: string) {
		this.mobile = mobile;
		cache.saveItem(this.factoryname + "mobile", this.mobile, 30 * 24 * 3600 * 1000);
	}

	getUID(len: number) {
		var chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
			out = "_";
		for (var i = 0, clen = chars.length; i < len; i++) {
			out += chars.substr(0 | Math.random() * clen, 1);
		}
		return out;
	}

	// setLastshowtime(lastshowtime){
	// 	this.lastshowtime=lastshowtime;
	// 	this.cache.saveItem(this.factoryname+"lastshowtime",this.lastshowtime,this.factoryname,30*24*3600);
	// }
}
const us = new UserService();
export default us;