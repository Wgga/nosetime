import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";
import HeaderView from "../../components/headerview";
import wss from "../../services/wss-service/wss-service";
import { FlashList } from "@shopify/flash-list";
import FastImage from "react-native-fast-image";

const { width, height } = Dimensions.get("window");

function MallKefu({ navigation, route }: any): React.JSX.Element {

	// 控件
	const classname: string = "MallKefuPage";
	let listref = React.useRef<any>(null);
	// 参数
	// 变量
	// 数据
	let items = React.useRef<any[]>([]);
	let lastmsg = React.useRef<number>(0); // 最近消息时间
	let lasttime = React.useRef<number>(0); // 计算显示时间时用的变量
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	React.useEffect(() => {
		init()
		subscribe();

		return () => {
			events.unsubscribe("nosetime_oldmsg");
			events.unsubscribe("nosetime_presence");
			events.unsubscribe("nosetime_newmsg");
			events.unsubscribe("nosetime_echo");
			events.unsubscribe("nosetime_revoke");
		}
	}, [])

	const subscribe = () => {
		events.subscribe("nosetime_oldmsg", (data: any) => {
			oldmsg(data);
		});

		events.subscribe("nosetime_presence", (data: any) => {
			if (!items || data.length == 0) {
				return;
			}
			items.current = data;
			cache.saveItem(classname + us.user.uid, items.current, 600);
			calc_sztime();
			scrollend()
		});

		events.subscribe("nosetime_newmsg", (data: any) => {
			items.current.push(data);
			//20230825 不保存，避免中间漏了数据，lastmsg不对
			//只在presence和oldmsg,newmsg后保存;revoke保存但是时间短
			//this.cache.saveItem(this.classname + this.us.user.uid, this.items, this.classname, 3600);
			calc_last_sztime();
			//20210427 stacie 提出不滚动到底部
			//setTimeout(()=>{try{this.content.scrollToBottom(0)}catch(e){}},100);

			//20230915 yy 有可能上面有一条或者多条没有收到，没触发这个消息，通过https获取一下
			http.post(ENV.kefu + "?uid=" + us.user.uid, { method: "newmsg", token: us.user.token, fromtm: lastmsg.current }).then((resp_data: any) => {
				if (resp_data.msg == "OK") {
					newmsg(resp_data.items);



					cache.getItem("userupdatedata").then((cacheobj) => {
						if (cacheobj && cacheobj.dbgkf1841) {
							let res: any = [];
							let start = items.current.length - 20;
							if (start < 0) start = 0;
							for (let i = start; i < items.current.length; ++i) {
								res.push(items.current[i].id);
							}
							http.post(ENV.usage, { method: "kf", uid: us.user.uid, data: res }).then((resp_data: any) => { });
						}
					})
				} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") { //20240229 shibo:处理token失效
					us.delUser();
					return navigation.navigate("Page", { screen: "Login", params: { src: "App客服页" } });
				}
			})
		})

		events.subscribe("nosetime_echo", (item) => {
			console.log("nosetime.echo", items.current, item);
			setoktag(item);
		});

		events.subscribe("nosetime_revoke", (item) => {
			//console.log("nosetime_revoke");
			let i: any = 0;
			for (i in items.current) {
				if (items.current[i].time == item.time) {
					//console.log("delete items.current");
					items.current.splice(i, 1);
					return;
				}
			}
			//20230825 撤回后，删除缓存数据，并尽快失效，好更新完整数据
			cache.saveItem(classname + us.user.uid, items.current, 1);
		});
	}

	const scrollend = () => {
		setTimeout(() => { try { listref.current.scrollToEnd({ animated: true }) } catch (e) { } }, 100);
	}

	const setoktag = (item: any) => {
		if (item.id == undefined) return;
		for (var i in items.current) {
			if (items.current[i].id == item.id) {
				//20230825 修改时间，以服务器返回时间为准，要不可能会差1s左右
				items.current[i].time = item.time;
				items.current[i].id = item.newid;
				if (items.current[i].loading == 1 || items.current[i].error == 1) {
					items.current[i].loading = 0;
					items.current[i].error = 0;
					//this.cache.saveItem(this.classname + this.us.user.uid, items.current, this.classname, 3600);
				}
				return;
			}
		}
		// items.current.push(item);
		//this.cache.saveItem(this.classname + this.us.user.uid, this.items, this.classname, 3600);
		scrollend()
	}

	const oldmsg = (items: any) => {
		/* this.content.getScrollElement().then((res) => {
			let scrollHeight = res.scrollHeight;
			if (items && items.length > 0) {
				//this.items = items.concat(this.items);
				items = items.concat(this.items);
				items.sort(this.sortByID);
				let lastid = 0;
				for (let i = items.length - 1; i >= 0; --i) {
					//20230915 时间，方向，内容完全一样才识别为一样，进行除重
					if (lastid == items[i].id) {
						items.splice(i, 1);
					}
					lastid = items[i].time;
				}
				this.items = items;
				this.cache.saveItem(this.classname + this.us.user.uid, this.items, this.classname, 600);
				this.calc_sztime();
			}
			if (this.refresher) {
				setTimeout(() => {
					this.content.getScrollElement().then((res) => {
						let scrollHeightDiff = res.scrollHeight - scrollHeight - 100;
						this.content.scrollToPoint(0, scrollHeightDiff, 0);
						this.refresher.target.complete();
						this.refresher = null;
					})

				}, 100);
			}
		}); */
	}

	const init = () => {
		cache.getItem(classname + us.user.uid).then((cacheobj) => {
			if (cacheobj && cacheobj.length > 0) {
				console.log("from cache", cacheobj);
				items.current = cacheobj;
				lastmsg.current = items.current[items.current.length - 1].time;
				calc_sztime();
				scrollend();
			}
			checkin();
		}).catch(() => {
			// fall here if item is expired or doesn't exist 
			//console.log("this.cache.getItem:NO RESULT",this.classname+"publish",this.id);
			checkin();
			return;
		});
	}

	const calc_last_sztime = () => {
		let i = items.current.length - 1;
		if (items.current[i].time - lasttime.current > 60) {
			items.current[i].sztime = us.formattime(items.current[i].time);
		} else {
			items.current[i].sztime = "";
		}
		lasttime.current = items.current[i].time;
	}

	const calc_sztime = () => {
		lasttime.current = 0;
		for (let i in items.current) {
			if (items.current[i].time - lasttime.current > 60) {
				items.current[i].sztime = us.formattime(items.current[i].time);
			} else {
				items.current[i].sztime = "";
			}
			lasttime.current = items.current[i].time;
		}
	}

	const checkin = () => {
		console.log("send checkin");
		//点开客服界面时，根据 最新获取时间 获取 客服回复，发送活跃消息，状态2活跃
		//从缓存中读取信息，并查看是否有更新
		//20230825 checkin失败后，部分消息可能获取不到
		wss.send({ method: "checkin", lastmsg: lastmsg.current, uid: us.user.uid, token: us.user.token, ver: ENV.AppNVersion }).then((T: any) => {
			console.log("is send1");
			//临时测试代码
			http.post(ENV.kefu + "?uid=" + us.user.uid, { method: "checkinok", token: us.user.token }).then((resp_data: any) => { });
			setIsRender(val => !val);
		}, (T: any) => {
			console.log("not send1");
			http.post(ENV.kefu + "?uid=" + us.user.uid, { method: "newmsg", token: us.user.token, fromtm: lastmsg.current }).then((resp_data: any) => {
				if (resp_data.msg == "OK") {
					newmsg(resp_data.items);
				} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {//20240229 shibo:处理token失效
					us.delUser();
					return navigation.navigate("Page", { screen: "Login", params: { src: "App客服页" } });
				}
			});
		});
	}

	const sortByID = (a: any, b: any) => {
		return a.id - b.id;
	}

	//20230825 数据与现有显示数据合并，去除重复，并缓存
	const newmsg = (data: any) => {
		if (data && data.length > 0) {
			data = data.concat(items.current);
			data.sort(sortByID);
			let lastid = 0;
			for (let i = data.length - 1; i >= 0; --i) {
				//20230915 时间，方向，内容完全一样才识别为一样，进行除重
				if (lastid == data[i].id) {
					data.splice(i, 1);
				}
				lastid = data[i].id;
			}
			items.current = data;
			//20230909 新消息不缓存，避免取不到以前的消息
			//cache.saveItem(classname + us.user.uid, items.current, 3600);
			calc_sztime();

			lastmsg.current = items.current[items.current.length - 1].time;
			setIsRender(val => !val);
		}
	}

	return (
		<View style={[Globalstyles.container, { backgroundColor: theme.bg }]}>
			<HeaderView data={{
				title: "在线客服",
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}}></HeaderView>
			<FlashList ref={listref} data={items.current}
				extraData={isrender}
				estimatedItemSize={100}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ backgroundColor: theme.bg }}
				keyExtractor={(item: any) => item.id}
				renderItem={({ item, index }: any) => {
					return (
						<View style={styles.list_item}>
							{(item.sztime != undefined && item.sztime != "") && <Text style={styles.item_sztime}>{item.sztime}</Text>}
							<View style={[styles.item_container, {
								flexDirection: item.dir == 1 ? "row" : "row-reverse",
							}]}>
								{item.dir == 1 && <FastImage style={styles.head_pic} source={{ uri: ENV.image + "/mobileicon.png" }} />}
								{item.dir == 2 && <FastImage style={styles.head_pic} source={{ uri: ENV.avatar + us.user.uid + ".jpg!l?" + us.user.uface }} />}
								<View style={styles.item_content}>
									<View style={styles.item_triangle}></View>
									{item.type == 1 && <Text style={styles.item_text}>{item.content}</Text>}
									{item.type == 2 && <Text style={styles.item_text}>{item.content}</Text>}
									{item.type == 3 && <Text style={styles.item_text}>{item.content}</Text>}
								</View>
							</View>
						</View>
					)
				}}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	list_item: {

	},
	item_sztime: {
		marginVertical: 10,
		marginHorizontal: 100,
		textAlign: "center",
		fontSize: 14,
		color: theme.placeholder2
	},
	item_container: {
		padding: 7,
	},
	head_pic: {
		height: 36,
		width: 36,
		borderRadius: 50,
	},
	item_triangle: {
		position: "absolute",
		left: -5,
		top: "17%",
		width: 0,
		height: 0,
		borderWidth: 8,
		borderTopColor: "transparent",
		borderBottomColor: "transparent",
		borderLeftColor: "transparent",
		borderRightColor: theme.toolbarbg,
	},
	item_content: {
		flexShrink: 1,
	},
	item_text: {
		backgroundColor: theme.toolbarbg,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 5,
		marginLeft: 11,
		overflow: "hidden"
	}
});

export default MallKefu;