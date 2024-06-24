import React from "react";

import { View, Text, StyleSheet, Pressable, Image } from "react-native";

import { FlashList } from "@shopify/flash-list";

import ListBottomTip from "../../components/listbottomtip";
import AlertCtrl from "../../components/alertctrl";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const SocialTixing = React.memo(({ navigation, route }: any) => {

	// 控件
	// 参数
	// 变量
	let page = React.useRef<number>(1); // 当前页数
	let newtixing = React.useRef<number>(0);
	// 数据
	let items = React.useRef<any[]>([])
	// 状态
	let noMore = React.useRef<boolean>(false);
	let isempty = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	React.useEffect(() => {
		init()
	}, [])

	const gettixing = (type: string) => {
		let newtixing = 0, items2: any = {};
		for (let i in items.current) {
			items2 = items.current[i];
			if (items2.new) {
				newtixing += items2.new
			}
		}
		if (type == "init") {
			cache.saveItem("tixingcnt", newtixing);
		} else {
			cache.saveItem("tixingcnt", newtixing -= 1);
		}
		setIsRender(val => !val);
	}

	const init = () => {
		if (!us.user.uid) return;
		page.current = 1;
		http.post(ENV.tixing + "?uid=" + us.user.uid, { token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_EXPIRE" || resp_data.msg == "TOKEN_ERR") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App提醒列表页" } });
			}
			items.current = resp_data;
			if (items.current && items.current.length == 0)
				isempty.current = true;
			else
				newtixing.current = items.current[0].new != undefined ? 1 : 0;
			//未读提醒会排在前面，所以只要第一条未读就包含未读，第一条不是未读，就没有未读

			if (resp_data.length < 20) noMore.current = true;
			gettixing("init");
		});
	}

	const loadMore = () => {
		if (noMore.current) return;
		page.current++;
		http.post(ENV.tixing + "?page=" + page.current + "&uid=" + us.user.uid, { token: us.user.token }).then((resp_data: any) => {
			items.current = items.current.concat(resp_data);
			if (items.current.length == 0) {
				isempty.current = true;
			}
			if (resp_data.length < 20) noMore.current = true;
			setIsRender(val => !val);
		});
	}

	const care = (type: string, item: any, index: number) => {
		if (type == "del") {
			AlertCtrl.show({
				header: "确定要取消关注吗？",
				key: "del_care_alert",
				message: "",
				buttons: [{
					text: "取消",
					handler: () => {
						AlertCtrl.close("del_care_alert");
					}
				}, {
					text: "确定",
					handler: () => {
						AlertCtrl.close("del_care_alert");
						_care(type, item.uida, index);
					}
				}],
				onTouchOutside: () => {
					AlertCtrl.close("del_img_alert");
				}
			})

		} else {
			_care(type, item.uida, index);
		}
	}

	const _care = (type: string, id: string, index: number) => {
		http.post(ENV.user, { token: us.user.token, method: "care" + type, ida: us.user.uid, idb: id }).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				items.current[index]["desc"] += "你也关注了TA";
				items.current[index]["guanzhu"] = 1;
			} else if (resp_data.msg == "NOEFFECT") {
				console.log("发布失败：" + resp_data.msg);
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App提醒列表页" } });
			} else {
				AlertCtrl.show({
					header: "关注失败",
					key: "care_error_alert",
					message: resp_data.msg,
					buttons: [{
						text: "确定",
						handler: () => {
							AlertCtrl.close("care_error_alert")
						}
					}]
				});
			}
			setIsRender(val => !val);
		});
	}

	const gotodetail = (item: any) => {
		let type = item.type, id = item.id;
		//非2和9的新提醒才需要发送已读信息
		if (item.rid > 0 && item["new"] && type != 2 && type != 9) {
			http.post(ENV.tixing + "?method=read&id=" + item.rid + "&uid=" + us.user.uid, { token: us.user.token }).then((resp_data: any) => {
				item["new"] = false;
			});
		}

		if (type == 1 || type == 2) {
			// this.router.navigate(['/discuss-reply'], { queryParams: { id, uid: us.user.uid, title: item.title } })
			setTimeout(() => { gettixing("click"); }, 100);
		} else if (type == 3) {
			// this.router.navigate(['/discuss-reply'], { queryParams: { id, uid: us.user.uid, titile: item.title, urtype: 3, uid2: item.uida } })
		} else if (type == 4 || type == 5) {
			navigation.navigate("Page", { screen: "SocialShequDetail", params: { id: item.ctid, ctdlgid: id } });
			setTimeout(() => { gettixing("click"); }, 100);
		} else if (type == 6) {//20230510 shibo:消息列表增加类型6的跳转
			// this.router.navigate(['/media-list-detail/' + id], { queryParams: { id: item.miid } })
		} else if (type == 8 || type == 9) {
			navigation.navigate("Page", { screen: "ArticleDetail", params: { id } })
		} else if (type == 10) {
			//问题有了新答案不显示
		} else if (type == 11) {
			//关注的问题有了新答案不显示
		} else if (type == "user") {
			// this.router.navigate(['/user-detail/' + id]);
		}
	}

	return (
		<FlashList data={items.current}
			renderItem={({ item, index }: any) => {
				return (
					<View style={styles.notice_item}>
						<Image style={styles.item_avatar}
							defaultSource={require("../../assets/images/default_avatar.png")}
							source={{ uri: ENV.avatar + item.uida + ".jpg!l?" + item.uface }}
						/>
						<View style={styles.item_con}>
							<View style={styles.uname_con}>
								<Text numberOfLines={1} style={styles.uname}>{item.unamea}</Text>
								<Text style={[styles.item_badge, { opacity: item.new > 0 ? 1 : 0 }]}>New</Text>
							</View>
							{(item.type == 9 && !item.guanzhu) && <Text numberOfLines={1} style={styles.item_desc}>{item.desc}</Text>}
							{(item.type == 9 && item.guanzhu) && <Text numberOfLines={1} style={styles.item_desc}>{item.desc}</Text>}
							{item.type != 9 && <Text numberOfLines={1} style={styles.item_desc}>{item.desc}</Text>}
						</View>
						<View style={styles.item_btn}>
							{(item.type == 9 && !item.guanzhu) && <Pressable onPress={() => { care("add", item, index) }}>
								<Icon name="plus2" size={20} color={theme.comment} />
							</Pressable>}
							{(item.type == 9 && item.guanzhu) && <Pressable>
								<Icon name="txcheckmark" size={20} color={theme.comment} />
							</Pressable>}
							{(item.type != 9 && item.type != 7) && <Pressable onPress={() => { gotodetail(item) }}>
								<Icon name="advance" size={23} color={theme.comment} />
							</Pressable>}
						</View>
					</View>
				)
			}}
			contentContainerStyle={{ backgroundColor: theme.toolbarbg }}
			estimatedItemSize={100}
			onEndReachedThreshold={0.1}
			onEndReached={loadMore}
			keyExtractor={(item: any) => item.rid}
			ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={items.current.length > 0} />}
		/>
	);
})

const styles = StyleSheet.create({
	notice_item: {
		padding: 20,
		flexDirection: "row"
	},
	item_avatar: {
		width: 40,
		height: 40,
		borderRadius: 50,
	},
	item_con: {
		flex: 1,
		marginLeft: 12,
	},
	uname_con: {
		flexDirection: "row",
		alignItems: "center",
	},
	item_badge: {
		color: "red",
		marginLeft: 15,
		fontSize: 14,
	},
	uname: {
		color: theme.tit2,
		fontSize: 14,
	},
	item_desc: {
		marginTop: 5,
		color: theme.comment,
		fontSize: 13,
	},
	item_btn: {
		marginLeft: 20,
		justifyContent: "center",
	}
});

export default SocialTixing;