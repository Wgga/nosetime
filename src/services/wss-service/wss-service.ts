import http from "../../utils/api/http";

import events from "../../hooks/events";
import cache from "../../hooks/storage";
import { $WebSocket, WebSocketSendMode } from "../../hooks/websocket";

import { ENV } from "../../configs/ENV";

class WssService {
	public wss: any = null;
	public wssserver: any = null;
	public uid: number = 0;
	public token: any = null;
	public ver: any = null;
	public notify: boolean = true;
	public reconnectAttempts: number = 0;

	constructor() {
		events.subscribe("nosetime_kfnotify", (v) => {
			//console.log('===wss nosetime_kfnotify');
			this.notify = v;
		});
		events.subscribe("nosetime_userlogout", () => {
			//console.log('===wss nosetime_userlogout');
			this.uid = 0;
			this.wss.close();
		});
	}

	userlogin(uid: number, token: string, ver: any) {
		if (this.uid != uid) {
			this.uid = uid;
			this.token = token;
			this.ver = ver;
			this.init();
		}
	}

	init() {
		if (this.uid == 0) {
			//console.log('STOP Reconnecting');
			return;
		}
		if (this.wss) this.wss.close();

		http.post(ENV.user, {
			method: 'getwssserver', uid: this.uid, ver: this.ver
		}).then((resp_data: any) => {
			if (resp_data.msg == 'OK' && resp_data.server != '') {
				this.wssserver = resp_data.server;
				// console.log('this.wssserver=',this.wssserver);
				//this.wss.userlogin(resp_data.server,this.user.uid,this.user.token,p+AppVersion);
				this.connect();
			}
		});
	}

	connect() {
		this.wss = new $WebSocket(this.wssserver, null, { reconnectIfNotNormalClose: false });
		//console.log("===WssService connect");
		this.wss.onOpen(() => {
			this.reconnectAttempts = 0;
			//if(this.inited)return;
			//this.inited=true;
			//console.log('===wss.onOpen');
			//this.events.publish('nosetime_userlogin');

			this.send({ method: 'userlogin', uid: this.uid, token: this.token }).then((T: any) => {
				console.log("is send6", T);
			}, (err: any) => {
				console.log("not send6", err);
			});
		});
		this.wss.onClose(() => {
			//if(this.inited)return;
			//this.inited=true;
			//console.log('===wss.onClose');
			//this.events.publish('nosetime_userlogin');

			let backoffDelay = this.wss.getBackoffDelay(++this.reconnectAttempts);
			let backoffDelaySeconds = backoffDelay / 1000;
			console.log('===Reconnecting in ' + backoffDelaySeconds + ' seconds');
			setTimeout(() => {
				this.init()
			}, backoffDelay);
		});
		// set received message callback
		this.wss.onMessage((msg: any) => {
			let data = JSON.parse(msg.data)
			// console.log("===wss.onMessage ", typeof data, data);
			//if(data.method=='userlogin'){
			//	this.events.publish('nosetime_userlogin');
			//}else
			if (data.type == 'oldmsg') {
				events.publish('nosetime_oldmsg', data.items);
			} else if (data.type == 'TOKEN_ERR') {
				this.uid = 0;
				//不直接登录，使用户登录失效，如果用户点checkin的时候才弹出登录框
				events.publish('nosetime_tokenerr');
				this.wss.close();
				//console.log('TOKEN_ERR');
			} else if (data.type == 'presence') {
				events.publish('nosetime_presence', data.items);
			} else if (data.method == 'echo') {
				events.publish('nosetime_echo', data);
			} else if (data.method == 'revoke') {
				events.publish('nosetime_revoke', data);
				//TODO:this.jpush.clearLocalNotifications();
			} else if (data.dir == 1) {
				this.setnewmsg(data);
				setTimeout(() => { this.send({ method: 'ack2', id: data.id }) }, 100);

				//shibo 私信提醒要添加客服的私信，
				// 2592:每天的自动回复不需要传递，实时传递客服信息以免个人页面提醒出错显示0
				//20220812 shibo:因个人页面更换样式，重写了私信提醒红点，所以此代码可删除
				//if (data.type != 2) {
				// this.events.publish('user_newsixin', data);
				//}

				// Schedule a single notification
				if (this.notify) {
					let content = '';
					if (data.type == 1)
						content = '客服：' + data.content;
					else if (data.type == 2)
						content = '客服：' + data.content.replace(/<[^>]+>/g, '');
					else if (data.type == 3)
						content = '客服发来链接';
					else if (data.type == 4)
						content = '客服发来图片';
				}
			}
		}, { autoApply: false });
		//this.wss.connect(true);
	}

	public setnewmsg(data: any) {
		data.new = 0;
		if (data.content.indexOf('自动回复') == -1) data.new = 1;
		cache.getItem('messagedata').then(() => {
			cache.saveItem('messagedata', data, 24 * 3600);
			events.publish('nosetime_newmsg', data);
		}).catch(() => {
			cache.saveItem('messagedata', data, 24 * 3600);
			events.publish('nosetime_newmsg', data);
		})
	}

	public send(msg: any) {
		if (this.wss)
			return this.wss.send(msg, WebSocketSendMode.Promise);

		//20230217 默认返回错误
		return new Promise((resolve, reject) => {
			reject([]);
		})
	}
}
const wss = new WssService();
export default wss;