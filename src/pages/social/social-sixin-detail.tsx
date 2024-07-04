import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image, useWindowDimensions, ActivityIndicator, TextInput, FlatList, Keyboard } from "react-native";

import { AvoidSoftInputView, useSoftInputAppliedOffsetChanged, useSoftInputHeightChanged, useSoftInputState } from "react-native-avoid-softinput";
import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderView from "../../components/headerview";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";
import ToastCtrl from "../../components/toastctrl";

const SocialSixinDetail = React.memo(({ navigation, route }: any) => {

	// 控件
	const classname = "SocialSixinDetailPage";
	const insets = useSafeAreaInsets();
	// 参数
	// 变量
	let send_content = React.useRef<string>("");
	let fromuser = React.useRef<any>({ uid: 0, uface: 0, uname: "" });
	// 数据
	let items = React.useRef<any[]>([]);
	let firstmsg = React.useRef<number>(0); // 最早消息时间
	let lastmsg = React.useRef<number>(0); // 最近消息时间
	let lasttime = React.useRef<number>(0); // 计算显示时间时用的变量
	// 状态
	const [isblist, setIsBlList] = React.useState<boolean>(false); // 是否在黑名单中
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	React.useEffect(() => {
		if (route.params && route.params.fromuser) {
			fromuser.current = route.params.fromuser;
		}
		init()
		if (us.user && us.user.ublock && us.user.ublock.indexOf(fromuser.current.uid) >= 0) {
			setIsBlList(true);
		} else {
			setIsBlList(false);
		}
		if (fromuser.current.uface == 0 && fromuser.current.uname == "") {
			http.post(ENV.user, { method: "getuname", uid: fromuser.current.uid }).then((resp_data: any) => {
				fromuser.current.uface = resp_data.uface;
				fromuser.current.uname = resp_data.uname;
				setIsRender(val => !val)
			});
		}
		events.publish("EnterSocialSixinDetailPage", fromuser.current);
	}, []);

	const init = () => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App私信详情页" } });
		}

		cache.getItem(classname + us.user.uid + "-" + fromuser.current.uid).then((cacheobj) => {
			if (!cacheobj || cacheobj.length == 0) return;
			setmsg(cacheobj, "init");
			checkin();
		}).catch(() => {
			// fall here if item is expired or doesn't exist 
			//console.log('this.cache.getItem:NO RESULT',this.classname+'publish',this.id);
			checkin();
		});
	}

	// 去重
	const uniqueitems = (items: any, key: string) => {
		const map = new Map();
		return items.reduce((acc: any, obj: any) => {
			if (!map.has(obj[key])) {
				map.set(obj[key], true);
				acc.push(obj);
			}
			return acc;
		}, []);
	}

	// 设置新/旧信息，并更新缓存，type: new/old
	const setmsg = (data: any, type: string) => {
		let types = ["new", "old", "events_new"];
		let redata = [...data].reverse();
		if (type == "events_new") {
			items.current = uniqueitems(redata.concat(items.current), "time");
		} else {
			items.current = uniqueitems(items.current.concat(redata), "time");
		}
		if (type == "new" || type == "init") {
			// 由于使用列表翻转，所以此处取lastmsg也需要翻转
			lastmsg.current = items.current[0].time;
		}
		if (types.includes(type)) {
			cache.saveItem(classname + us.user.uid + "-" + fromuser.current.uid, [...items.current].reverse(), 24 * 3600);
		}
		calc_sztime();
	}

	const checkin = () => {
		http.post(ENV.sixin + "?uid=" + us.user.uid, { method: "checkin", token: us.user.token, fromid: fromuser.current.uid }).then((resp_data: any) => {
			if (resp_data.firstmsg == undefined || resp_data.items == undefined) return;
			firstmsg.current = resp_data.firstmsg;
			if (!resp_data.items || resp_data.items.length == 0) return;

			setmsg(resp_data.items, "new");
		});
	}

	const calc_sztime = () => {
		lasttime.current = 0;
		us.calc_sztime(items.current, lasttime.current);
		setIsRender(val => !val);
	}

	// 加载上一页
	const fetch = () => {
		http.post(ENV.sixin + "?uid=" + us.user.uid, { method: "oldmsg", firstmsg: firstmsg.current, token: us.user.token, fromid: fromuser.current.uid }).then((resp_data: any) => {
			if (resp_data.firstmsg == undefined || resp_data.items == undefined) return;
			firstmsg.current = resp_data.firstmsg;
			if (!resp_data.items || resp_data.items.length == 0) return;
			setmsg(resp_data.items, "old");
		});
	}

	//20230308 shibo:点击图标重新发送
	const clickerr = (item: any) => {
		item.error = 0;
		item.loading = 1;
		publish(item.content);
	}

	const show_send_con = (replytext: string) => {
		let time = Math.floor((new Date().getTime()) / 1000),
			item = { content: replytext, dir: 2, time, loading: 1, error: 0 };
		setmsg([item], "events_new");
		send_content.current = "";
	}

	const publish = (content?: string) => {
		var replytext = content ? content.trim() : send_content.current.trim();
		if (replytext == "") return;
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App私信详情页" } });
		}
		if (!content) show_send_con(replytext);
		Keyboard.dismiss();
		http.post(ENV.sixin + "?method=send&uid=" + us.user.uid, { toid: fromuser.current.uid, token: us.user.token, content: replytext }).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				items.current[0].loading = 0;
				setIsRender(val => !val);
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				//登录失效，转到登录界面，登录后直接进行发布并转到打分页面
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App私信详情页" } });
			} else {
				let item = { dir: 2, content: replytext, loading: 1, error: 0 };
				setmsg([item], "events_new");
				us.calc_last_sztime(items.current, lasttime.current);
			}
		}, (error) => {//20230308 shibo:接口错误返回设置错误弹窗
			if (error && !error.ok) {
				setTimeout(() => {
					items.current[0].loading = 0;
					items.current[0].error = 1;
					ToastCtrl.show({ message: "信息发送超时", duration: 1000, viewstyle: "short_toast", key: "msg_error_toast" });
				}, 2000);
			}
		});
	};

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: fromuser.current.uname,
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}}></HeaderView>
			<AvoidSoftInputView avoidOffset={10} showAnimationDuration={50} hideAnimationDuration={50} showAnimationDelay={0} hideAnimationDelay={0}
				style={{ flex: 1 }}>
				<FlatList data={items.current}
					extraData={isrender}
					inverted
					// estimatedItemSize={100}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ backgroundColor: theme.bg, minHeight: "100%", justifyContent: "flex-end" }}
					onEndReachedThreshold={0.1}
					onEndReached={() => {
						items.current.length > 0 && fetch();
					}}
					keyboardDismissMode="on-drag"
					keyExtractor={(item: any, index: number) => item.time}
					renderItem={({ item, index }: any) => (<>
						{item.type != 2 && <View style={[styles.item_container, {
							flexDirection: item.dir == 1 ? "row" : "row-reverse",
						}]}>
							<View style={styles.item_avatar_con}>
								{item.dir == 1 && <Image style={styles.item_avatar} source={{ uri: ENV.avatar + fromuser.current.uid + ".jpg!l?" + fromuser.current.uface }} />}
								{item.dir == 2 && <Image style={styles.item_avatar} source={{ uri: ENV.avatar + us.user.uid + ".jpg!l?" + us.user.uface }} />}
								<View style={[styles.item_triangle, item.dir == 2 && styles.item_triangle_right]}></View>
							</View>
							<View style={[
								styles.item_content,
								item.dir == 2 && styles.item_content_right,
							]}>
								<Text style={[styles.item_msg, item.dir == 2 && styles.item_msg_right]}>{item.content}</Text>
							</View>
							{item.loading == 1 && <ActivityIndicator color={"gray"} />}
							{item.error == 1 && <Icon name="warn" size={19} color={"#FC6274"} onPress={() => { clickerr(item) }} />}
						</View>}
						{(item.sztime != undefined && item.sztime != "") && <Text style={styles.item_sztime}>{item.sztime}</Text>}
					</>)}
					ListHeaderComponent={<View style={{ marginBottom: 100 + insets.bottom }}></View>}
				/>
				<View style={[styles.footer_con, { paddingBottom: insets.bottom + 10 }]}>
					<View style={styles.footer_input_con}>
						<TextInput style={styles.footer_input}
							onChangeText={(val: string) => {
								send_content.current = val;
								setIsRender(val => !val);
							}}
							value={send_content.current}
							multiline={true}
						/>
					</View>
					<Text style={styles.send_text} onPress={() => { publish() }}>{"发送"}</Text>
				</View>
			</AvoidSoftInputView>
		</View>
	);
})

const styles = StyleSheet.create({
	item_sztime: {
		marginVertical: 10,
		marginHorizontal: 100,
		textAlign: "center",
		fontSize: 14,
		color: theme.placeholder2
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
	footer_con: {
		borderTopColor: theme.border,
		borderTopWidth: 1,
		backgroundColor: theme.toolbarbg,
		flexDirection: "row",
		alignItems: "center",
		paddingBottom: 10,
		paddingTop: 10,
	},
	footer_icon: {
		width: 48,
		alignItems: "center",
		justifyContent: "center",
	},
	footer_input_con: {
		flex: 1,
		paddingLeft: 10,
	},
	footer_input: {
		padding: 0,
		fontSize: 13,
		maxHeight: 76,
		lineHeight: 18,
		color: theme.text1,
		borderBottomColor: theme.border,
		borderBottomWidth: 1,
	},
	send_text: {
		width: 48,
		textAlign: "center",
		fontSize: 13,
		color: theme.tit2
	},
});

export default SocialSixinDetail;