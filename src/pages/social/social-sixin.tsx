import React from "react";

import { View, Text, StyleSheet, Pressable, Image } from "react-native";

import { FlashList } from "@shopify/flash-list";

import ActionSheetCtrl from "../../components/actionsheetctrl";
import ListBottomTip from "../../components/listbottomtip";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";

const SocialSixin = React.memo(({ navigation, setSixin }: any) => {

	// 控件
	// 参数
	// 变量
	let page = React.useRef<number>(1);
	// 数据
	let kfmsg = React.useRef<any>({ content: "", sztime: "", new: 0 });
	let items = React.useRef<any[]>([]);
	// 状态
	let noMore = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	React.useEffect(() => {
		init()
		getkfmsg();

		events.subscribe("nosetime_newmsg", (data) => {
			getkfmsg();
		})

		events.subscribe("EnterSocialSixinDetailPage", (data: any) => {
			let index = items.current.findIndex((item: any) => item.uid == data.uid);
			if (index > -1 && items.current[index].new){
				delete items.current[index].new;
				getSixincnt();
				setIsRender(val => !val);
			}
		})

		return () => {
			events.unsubscribe("nosetime_newmsg");
			events.unsubscribe("EnterSocialSixinDetailPage");
		}
	}, [])

	const getkfmsg = () => {
		us.getkfmsg().then((msg: any) => {
			if (msg) {
				kfmsg.current = msg;
				getSixincnt();
				setIsRender(val => !val);
			}
		}).catch(() => { })
	}

	const getSixincnt = () => {
		let newsixin = 0;
		for (let i in items.current) {
			if (items.current[i].new) {
				newsixin += items.current[i].new;
			}
		}
		setSixin(newsixin + kfmsg.current.new);
	}

	const init = () => {
		page.current = 1;
		http.post(ENV.sixin + "?uid=" + us.user.uid, { token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_EXPIRE" || resp_data.msg == "TOKEN_ERR") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App私信列表页" } });
			}
			items.current = resp_data;
			if (resp_data.length < 20) noMore.current = true;
			getSixincnt();
			setIsRender(val => !val);
		});
	}

	const loadMore = () => {
		if (noMore.current) return;
		page.current++;
		http.post(ENV.sixin + "?page=" + page.current + "&uid=" + us.user.uid, { token: us.user.token }).then((resp_data: any) => {
			items.current = items.current.concat(resp_data);
			if (resp_data.length < 20) noMore.current = true;
			setIsRender(val => !val);
		});
	}

	// 设置消息置顶
	const setmsgtop = (item: any) => {
		let val = item.top == 0 ? 1 : 0;
		http.post(ENV.sixin + "?uid=" + us.user.uid,
			{ method: "settop", fromuid: item.uid, token: us.user.token, val }
		).then((resp_data: any) => {
			init()
		})
	}

	// 删除消息
	const delmsg = (item: any) => {
		http.post(ENV.sixin + "?uid=" + us.user.uid,
			{ method: "deluid", touid: item.uid, token: us.user.token }
		).then((resp_data: any) => {
			init()
		})
	}

	// 打开功能菜单
	const openmenudlg = (item: any) => {
		ActionSheetCtrl.show({
			key: "menudlg_action_sheet",
			buttons: [{
				text: item.top ? "取消置顶" : "置顶",
				style: { color: theme.tit2 },
				handler: () => {
					ActionSheetCtrl.close("menudlg_action_sheet");
					setmsgtop(item);
				}
			}, {
				text: "删除",
				style: { color: theme.tit2 },
				handler: () => {
					ActionSheetCtrl.close("menudlg_action_sheet");
					delmsg(item)
				}
			}, {
				text: "取消",
				style: { color: theme.tit },
				handler: () => {
					ActionSheetCtrl.close("menudlg_action_sheet");
				}
			}],
		})
	}

	return (
		<FlashList data={items.current}
			extraData={isrender}
			ListHeaderComponent={
				<Pressable style={[styles.msg_item, styles.msg_top]} onPress={() => {
					navigation.navigate("Page", { screen: "MallKefu" });
				}}>
					<View style={styles.kefu_avatar}>
						<Image style={{ width: "100%", height: "100%", borderRadius: 50 }}
							source={{ uri: ENV.image + "/mobileicon.png" }}
						/>
						<Text style={[styles.msg_badge, Globalstyles.redbadge, { opacity: kfmsg.current.new > 0 ? 1 : 0 }]}>{kfmsg.current.new}</Text>
					</View>
					<View style={styles.msg_con}>
						<View style={styles.msg_tit_con}>
							<Text numberOfLines={1} style={styles.tit_text}>商城客服</Text>
							<Text style={styles.tit_time}>{kfmsg.current.sztime}</Text>
						</View>
						<Text numberOfLines={1} style={styles.msg_con_text}>{kfmsg.current.content}</Text>
					</View>
				</Pressable>
			}
			renderItem={({ item }: any) => {
				return (
					<Pressable style={[styles.msg_item, item.top && styles.msg_top]} onPress={() => {
						navigation.navigate("Page", { screen: "SocialSixinDetail", params: { fromuser: { uid: item.uid, uname: item.uname, uface: item.uface } } });
					}}>
						<View style={styles.kefu_avatar}>
							<Image style={{ width: "100%", height: "100%", borderRadius: 50 }}
								defaultSource={require("../../assets/images/default_avatar.png")}
								source={{ uri: ENV.avatar + item.uid + ".jpg!l?" + item.uface }}
							/>
							<Text style={[styles.msg_badge, Globalstyles.redbadge, { opacity: item.new > 0 ? 1 : 0 }]}>{item.new}</Text>
						</View>
						<View style={styles.msg_con}>
							<View style={styles.msg_tit_con}>
								<Text numberOfLines={1} style={styles.tit_text}>{item.uname}</Text>
								<View style={styles.tit_btn_con}>
									<Text style={styles.tit_time}>{item.time}</Text>
									<Pressable onPress={() => { openmenudlg(item) }} style={{ marginLeft: 10 }}>
										<Icon name="shequsandian" size={16} color="#808080" />
									</Pressable>
								</View>
							</View>
							<Text numberOfLines={1} style={styles.msg_con_text}>{item.desc}</Text>
						</View>
					</Pressable>
				)
			}}
			contentContainerStyle={{ backgroundColor: theme.toolbarbg }}
			estimatedItemSize={100}
			onEndReachedThreshold={0.1}
			onEndReached={loadMore}
			keyExtractor={(item: any) => item.id}
			ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={items.current.length > 0} />}
		/>
	);
})

const styles = StyleSheet.create({
	msg_item: {
		padding: 20,
		flexDirection: "row",
	},
	msg_top: {
		backgroundColor: "#F2F2F2"
	},
	kefu_avatar: {
		width: 40,
		height: 40,
	},
	msg_badge: {
		right: -4,
		bottom: -3,
	},
	msg_con: {
		flex: 1,
		marginLeft: 15,
	},
	msg_tit_con: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	tit_text: {
		color: theme.text1,
		fontSize: 14,
	},
	tit_btn_con: {
		flexDirection: "row",
		alignItems: "center",
	},
	tit_time: {
		color: theme.placeholder,
		fontSize: 10,
	},
	msg_con_text: {
		marginTop: 5,
	}
});

export default SocialSixin;