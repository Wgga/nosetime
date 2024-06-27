import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, useWindowDimensions, Image } from "react-native";

import { useFocusEffect } from "@react-navigation/native";
import FastImage from "react-native-fast-image";
import { FlashList } from "@shopify/flash-list";

import ListBottomTip from "../../components/listbottomtip";
import RnImage from "../../components/RnImage";

import us from "../../services/user-service/user-service";
import wss from "../../services/wss-service/wss-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, toCamelCase } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";
import HeaderView from "../../components/headerview";

const { width, height } = Dimensions.get("window");

function MallKefu({ navigation, route }: any): React.JSX.Element {

	// 控件
	const classname: string = "MallKefuPage";
	let listref = React.useRef<any>(null);
	const windowD = useWindowDimensions();
	// 参数
	// 变量
	// 数据
	let items = React.useRef<any[]>([]);
	let lastmsg = React.useRef<number>(0); // 最近消息时间
	let lasttime = React.useRef<number>(0); // 计算显示时间时用的变量
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	React.useEffect(() => {
		init();
		subscribe();

		events.publish("nosetime_kfnotify", false);

		return () => {
			events.unsubscribe("nosetime_oldmsg");
			events.unsubscribe("nosetime_presence");
			events.unsubscribe("nosetime_newmsg");
			events.unsubscribe("nosetime_echo");
			events.unsubscribe("nosetime_revoke");
		}
	}, [])

	useFocusEffect(
		React.useCallback(() => {
			events.publish("nosetime_kfnotify", false);
			// 进入/离开客服页面改变缓存中消息到new参数, 代表客服消息已读
			cache.getItem("messagedata").then((cacheobj) => {
				cacheobj.new = 0;
				cache.saveItem("messagedata", cacheobj, 24 * 3600);
				events.publish("nosetime_newmsg");
			}).catch(() => { });
		}, [])
	)

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
		});

		events.subscribe("nosetime_newmsg", (data: any) => {
			if (!data) return;
			items.current.push(data);
			//20230825 不保存，避免中间漏了数据，lastmsg不对
			//只在presence和oldmsg,newmsg后保存;revoke保存但是时间短
			//this.cache.saveItem(this.classname + this.us.user.uid, this.items, this.classname, 3600);
			us.calc_last_sztime(items.current, lasttime.current);
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
		// setTimeout(() => { try { listref.current?.scrollToEnd({ animated: false }) } catch (e) { } }, 100);
		let timeout = setTimeout(() => {
			try {
				// listref.current?.scrollToEnd({ animated: true });
				clearTimeout(timeout);
			} catch { }
		}, 100);
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
		scrollend();
	}

	const oldmsg = (items: any) => {
		if (items && items.length > 0) {
			items = items.concat(items.current);
			items.sort(sortByID);
			let lastid = 0;
			for (let i = items.length - 1; i >= 0; --i) {
				//20230915 时间，方向，内容完全一样才识别为一样，进行除重
				if (lastid == items[i].id) {
					items.splice(i, 1);
				}
				lastid = items[i].time;
			}
			items.current = items;
			cache.saveItem(classname + us.user.uid, items.current, 600);
			calc_sztime();
		}
		/* this.content.getScrollElement().then((res) => {
			let scrollHeight = res.scrollHeight;
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
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App客服页" } });
		}
		cache.getItem(classname + us.user.uid).then((cacheobj) => {
			if (cacheobj && cacheobj.length > 0) {
				items.current = cacheobj;
				lastmsg.current = items.current[items.current.length - 1].time;
				calc_sztime();
			}
			checkin();
		}).catch(() => {
			// fall here if item is expired or doesn't exist 
			//console.log("this.cache.getItem:NO RESULT",this.classname+"publish",this.id);
			checkin();
			return;
		});
	}

	const calc_sztime = () => {
		lasttime.current = 0;
		us.calc_sztime(items.current, lasttime.current);
		items.current = items.current.reverse();
		setIsRender(val => !val);
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
			lastmsg.current = items.current[items.current.length - 1].time;
			calc_sztime();
		}
	}

	// 处理内容中的【&nbsp;】字符
	const handleblank = (sz: string) => {
		sz = sz.replace(/&nbsp;/g, " ");
		return sz;
	}

	const handleAutomsg = (sz: string) => {
		sz = sz.replace(/<(?!br).*?>/gi, "").replace(/\n<br>|<br>/g, "\n");
		return <Text style={styles.item_automsg_text}>{sz}</Text>
	}

	// 跳转链接
	const gotolink = (item: any) => {
		if (item.link_href && item.page == "media-list-detail") {
			navigation.navigate("Page", { screen: "MediaListDetail", params: { mid: item.mid, id: item.viid, src: "APP客服页" } });
			return;
		}
		if (item.link_href && item.page == "social-shequ-detail") {
			navigation.navigate("Page", { screen: "SocialShequDetail", params: { ctdlgid: item.id, src: "APP客服页" } });
			return;
		}
		let screen = toCamelCase(item.page);
		navigation.navigate("Page", { screen: screen, params: { id: item.id, src: "APP客服页" } });
	}

	const handlelink = (sz: string) => {
		let link = JSON.parse(sz);
		let msg = (
			<Pressable onPress={() => { gotolink(link) }}>
				{link.link_href && <Text style={styles.link_msg}>{"给您发了一篇" + link.type}</Text>}
				<View style={styles.link_msg_con}>
					{link.img && <RnImage style={styles.link_msg_img}
						source={{ uri: ENV.image + link.img }}
						errsrc={require("../../assets/images/noxx.png")}
						resizeMode={"contain"}
					/>}
					{link.pic_src && <RnImage style={[styles.link_msg_img, !(link.link_href.match(/topic|pinpai|qiwei/g)) && { width: 105 }]}
						source={{ uri: link.pic_src.indexOf("https:") < 0 ? "https:" + link.pic_src : link.pic_src }}
						errsrc={require("../../assets/images/noxx.png")}
						resizeMode={"contain"}
					/>}
					<View style={styles.link_info}>
						<Text numberOfLines={2} style={styles.link_info_tit}>{handleblank(link.title)}</Text>
						{link.link_href && <Text style={styles.link_info_tit}>{link.page == "article-detail" ? "点击查看全文>>" : `点击查看${link.type}>>`}</Text>}
						{!link.link_href && <Text style={styles.link_info_price}>{handleblank(link.price)}</Text>}
					</View>
				</View>
			</Pressable>
		)
		return msg;
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
				inverted
				onContentSizeChange={scrollend}
				estimatedItemSize={100}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ backgroundColor: theme.bg }}
				keyExtractor={(item: any) => item.id}
				renderItem={({ item, index }: any) => {
					return (
						<View style={styles.list_item}>
							{(item.sztime != undefined && item.sztime != "") && <Text style={styles.item_sztime}>{item.sztime}</Text>}
							{item.type == 2 && <View style={styles.item_automsg}>{handleAutomsg(item.content)}</View>}
							{item.type != 2 && <View style={[styles.item_container, {
								flexDirection: item.dir == 1 ? "row" : "row-reverse",
							}]}>
								<View style={styles.item_avatar_con}>
									{item.dir == 1 && <FastImage style={styles.item_avatar} source={{ uri: ENV.image + "/mobileicon.png" }} />}
									{item.dir == 2 && <FastImage style={styles.item_avatar} source={{ uri: ENV.avatar + us.user.uid + ".jpg!l?" + us.user.uface }} />}
									<View style={[styles.item_triangle, item.dir == 2 && styles.item_triangle_right]}></View>
								</View>
								<View style={[
									styles.item_content,
									item.dir == 2 && styles.item_content_right,
									(item.type == 3 && item.dir == 1) && { flexShrink: 0, width: windowD.width * 0.85 },
									(item.type == 3 && item.dir == 2) && { flexShrink: 0, width: windowD.width * 0.70 }
								]}>
									{item.type == 1 && <Text style={[styles.item_msg, item.dir == 2 && styles.item_msg_right]}>{handleblank(item.content)}</Text>}
									{item.type == 2 && <Text style={[styles.item_msg, item.dir == 2 && styles.item_msg_right]}>{item.content}</Text>}
									{item.type == 3 && <View style={[styles.item_msg, item.dir == 2 && { ...styles.item_msg_right, paddingVertical: 0 }]}>{handlelink(item.content)}</View>}
								</View>
							</View>}
						</View>
					)
				}}
				ListHeaderComponent={< ListBottomTip noMore={null} isShowTip={items.current.length > 0} />}
			/>
		</View >
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
	item_automsg: {
		width: width * 0.9,
		padding: 14,
		marginVertical: 15,
		marginHorizontal: "auto",
		backgroundColor: theme.toolbarbg,
		borderRadius: 5,
		overflow: "hidden",
	},
	item_automsg_text: {
		fontSize: 14,
		color: theme.tit2,
		lineHeight: 21,
	},
	item_container: {
		padding: 7,
		alignItems: "flex-start",
	},
	item_avatar_con: {
		justifyContent: "center",
	},
	item_avatar: {
		height: 36,
		width: 36,
		borderRadius: 50,
	},
	item_triangle_right: {
		left: -16,
		right: 0,
		borderRightColor: "transparent",
		borderLeftColor: theme.dialogbox,
	},
	item_triangle: {
		position: "absolute",
		right: -16,
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
		marginRight: 10,
	},
	item_content_right: {
		marginRight: 0,
		marginLeft: 10
	},
	item_msg: {
		backgroundColor: theme.toolbarbg,
		paddingHorizontal: 12,
		paddingVertical: 6,
		borderRadius: 5,
		marginLeft: 16,
		lineHeight: 26,
		overflow: "hidden",
	},
	item_msg_right: {
		marginLeft: 0,
		marginRight: 16,
		backgroundColor: theme.dialogbox,
	},
	link_msg: {
		fontSize: 15,
		fontWeight: "500",
		fontFamily: "PingFang SC",
		color: theme.text1,
	},
	link_msg_con: {
		marginVertical: 10,
		flexDirection: "row",
	},
	link_msg_img: {
		width: 66,
		height: 66,
		borderRadius: 8,
		backgroundColor: theme.toolbarbg,
		overflow: "hidden",
	},
	link_info: {
		marginLeft: 10,
		flex: 1
	},
	link_info_tit: {
		fontSize: 13,
		color: theme.tit2,
		lineHeight: 20
	},
	link_info_price: {
		fontSize: 14,
		lineHeight: 26,
		color: theme.color
	}
});

export default MallKefu;