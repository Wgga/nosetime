import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, Image } from "react-native";

import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Brightness } from "react-native-color-matrix-image-filters";
import { useFocusEffect } from "@react-navigation/native";
import { ShadowedView } from "react-native-fast-shadow";

import ToastCtrl from "../../components/controller/toastctrl";
import { ModalPortal } from "../../components/modals";
import AlertInputPopover from "../../components/popover/alertinput-popover";
import GiftcodePopover from "../../components/popover/giftcode-popover";

import us from "../../services/user-service/user-service";
import upService from "../../services/upload-photo-service/upload-photo-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";
import Waitpay from "../../assets/svg/user/waitpay.svg";
import Transport from "../../assets/svg/user/transport.svg";
import Completed from "../../assets/svg/user/completed.svg";
import Order from "../../assets/svg/user/order.svg";
import Message from "../../assets/svg/user/message.svg";
import Wishlist from "../../assets/svg/user/wishlist.svg";
import Usercart from "../../assets/svg/user/usercart.svg";
import Giftcode from "../../assets/svg/user/giftcode.svg";
import Setting from "../../assets/svg/user/setting.svg";

const { width, height } = Dimensions.get("window");

function User({ navigation }: any): React.JSX.Element {
	// 控件
	const insets = useSafeAreaInsets();
	const classname = "UserPage";
	// 参数
	// 变量
	let pointval = React.useRef<number>(0); // 积分
	let giftcode = React.useRef<string>("");
	// 数据
	let userinfo = React.useRef<any>({
		uname: "",
		all: 0,
		days: 0,
	}); // 用户信息
	let ordercnt = React.useRef<any[]>([])
	// 状态
	let showgiftcode = React.useRef<boolean>(false); // 是否显示兑换码
	const [isrender, setIsRender] = React.useState(false); // 是否渲染
	const [isShowBadge, setIsShowBadge] = React.useState(false); // 是否显示消息

	useFocusEffect(
		React.useCallback(() => {
			init();
		}, [])
	);

	React.useEffect(() => {
		events.subscribe("userupdatedata", (result: any) => {
			showgiftcode.current = result && result.showgiftcode == 1 ? true : false;
		})
		events.subscribe(classname + "change_avatar", () => {
			setIsRender(val => !val);
		})
		return () => {
			events.unsubscribe("userupdatedata");
			events.unsubscribe(classname + "change_avatar");
		}
	}, []);

	const init = () => {
		cache.getItem(classname + us.user.uid).then((cacheobj: any) => {
			if (cacheobj) {
				userinfo.current = cacheobj;
				getmoredata("init");
			}
		}).catch(() => {
			http.post(ENV.user, { method: "getsocialinfo", id: us.user.uid }).then((resp_data: any) => {
				cache.saveItem(classname + us.user.uid, resp_data, 10);
				if (resp_data) {
					userinfo.current = resp_data;
				}
				getmoredata("init");
			})
		});
	};

	const getmoredata = (type: string) => {
		cache.getItem("userupdatedata").then((cacheobj) => {
			showgiftcode.current = cacheobj && cacheobj.showgiftcode == 1 ? true : false;
		}).catch(() => { });
		// 获取用户积分
		http.post(ENV.points + "?uid=" + us.user.uid, { method: "mypoints", token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App我的页面" } });
			}
			pointval.current = resp_data.val > 0 ? resp_data.val : 0;
			setIsRender(val => !val);
		})
		// 获取订单数量
		http.post(ENV.mall + "?uid=" + us.user.uid, { method: "getordercnt", token: us.user.token }).then((resp_data: any) => {
			ordercnt.current = resp_data;
		})
		us.getmessagedata().then((cnt: number) => {
			let bol = cnt > 0 ? true : false;
			setIsShowBadge(bol);
			events.publish("isshowbadge", bol);
		}).catch(() => {
			setIsShowBadge(false);
			events.publish("isshowbadge", false);
		})
	}

	const gotodetail = (page: string) => {
		if (!page) {
			ToastCtrl.show({ message: "该功能暂未开放，敬请期待", duration: 1000, viewstyle: "superior_toast", key: "user_btn_toast" });
			return;
		}
		if (page == "mall-order") {
		} else {
			navigation.navigate("Page", { screen: page })
		}
	}

	// 打开礼品码兑换输入框
	const opengiftcode = () => {
		ModalPortal.show((
			<AlertInputPopover data={{
				header: "礼品码兑换",
				message: "",
				inputs: [{
					type: "text",
					value: giftcode.current,
					onChangeText: (value: any) => {
						giftcode.current = value;
					},
					placeholder: "请输入要兑换的礼品码",
				}],
				buttons: [{
					text: "取消",
					handler: () => {
						ModalPortal.dismiss("giftcode_inputAlert");
						giftcode.current = "";
					}
				}, {
					text: "确认",
					handler: () => {
						if (giftcode.current == "") {
							ToastCtrl.show({ message: "礼品码不能为空", duration: 1000, viewstyle: "medium_toast", key: "gifcode_empty_toast" });
						} else {
							exchange();
						}
					}
				}],
			}}
			/>
		), {
			key: "giftcode_inputAlert",
			width: width,
			rounded: false,
			useNativeDriver: true,
			onTouchOutside: () => {
				ModalPortal.dismiss("giftcode_inputAlert");
				giftcode.current = "";
			},
			onHardwareBackPress: () => {
				ModalPortal.dismiss("giftcode_inputAlert");
				return true;
			},
			animationDuration: 300,
			modalStyle: { backgroundColor: "transparent" },
		})
	}

	// 兑换礼品
	const exchange = () => {
		let params = { giftcode: giftcode.current };
		http.post(ENV.giftcode + "?uid=" + us.user.uid, { method: "exchange", token: us.user.token, data: params }).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				showgiftcodepopover(resp_data);
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App设置页" } });
			} else {
				ToastCtrl.show({ message: resp_data.msg, duration: 1000, viewstyle: "medium_toast", key: "gifcode_exchange_toast" });
			}
		})
	}

	// 兑换结果弹窗
	const showgiftcodepopover = (data: any) => {
		ModalPortal.show((
			<GiftcodePopover data={data} />
		), {
			key: "giftcode_popover",
			width: width,
			rounded: false,
			useNativeDriver: true,
			onTouchOutside: () => {
				ModalPortal.dismiss("giftcode_popover");
			},
			onHardwareBackPress: () => {
				ModalPortal.dismiss("giftcode_popover");
				return true;
			},
			animationDuration: 300,
			modalStyle: { backgroundColor: "transparent", justifyContent: "center" },
		})
	}

	return (
		<ScrollView contentContainerStyle={styles.user_con} showsVerticalScrollIndicator={false}>
			<Brightness amount={0.85} style={styles.header_bg_con}>
				<LinearGradient
					colors={["transparent", theme.bg]}
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 1 }}
					locations={[0.5, 1]}
					style={styles.linear_bg}
				/>
				<Image style={styles.header_bg} blurRadius={40} source={{ uri: ENV.avatar + us.user.uid + ".jpg?" + us.user.uface }} />
			</Brightness>
			<View style={styles.user_info_con}>
				<View style={[styles.user_avatar_con, { marginTop: insets.top ? insets.top + 60 : 84 }]}>
					<Pressable onPress={() => { upService.changeAvatar({ classname, marginTop: insets.top }) }}>
						<Image style={Globalstyles.user_avatar}
							defaultSource={require("../../assets/images/default_avatar.png")}
							source={{ uri: ENV.avatar + us.user.uid + ".jpg?" + us.user.uface }}
						/>
					</Pressable>
					<View style={{ marginLeft: 20 }}>
						<Text style={styles.user_name}>{userinfo.current.uname ? userinfo.current.uname : "未设置"}</Text>
						<Text style={styles.user_days}>{"已入住 " + (userinfo.current.days ? userinfo.current.days : "0 天") + "，记录了 " + (userinfo.current.all ? userinfo.current.all : "0") + " 款香水"}</Text>
					</View>
				</View>
				<Brightness amount={0.85} style={styles.user_page_con}>
					<Pressable onPress={() => {
						navigation.navigate("Page", { screen: "UserDetail", params: { uid: us.user.uid } })
					}}>
						<Image style={styles.header_bg} blurRadius={40} source={{ uri: ENV.avatar + us.user.uid + ".jpg?" + us.user.uface }} />
						<Image style={styles.user_page_msk}
							source={require("../../assets/images/user/userpage.png")}
						/>
						<View style={styles.page_text_con}>
							<Text style={styles.page_main_text}>{"个人主页"}</Text>
							<View style={styles.page_sub_text_con}>
								<Text style={styles.sub_text}>{"我的香路历程"}</Text>
								<Icon name="r-return" size={14} color={theme.toolbarbg} />
							</View>
						</View>
					</Pressable>
				</Brightness>
				<View style={styles.user_page_btn}>
					<Pressable onPress={() => { gotodetail("UserJifen") }} style={styles.page_btn_item}>
						<Text style={styles.item_main_tit}>{"积分集市"}</Text>
						<View style={styles.item_sub_tit_con}>
							<Text style={styles.item_sub_tit}>{"我的积分 " + pointval.current}</Text>
							<Icon name="r-return" size={12} color={theme.comment} />
						</View>
						<Image style={styles.page_bg} source={require("../../assets/images/user/jifen.png")} resizeMode="contain" />
					</Pressable>
					{/* <View style={[styles.page_btn_item, { marginLeft: 7.5 }]}>
							<Text style={styles.item_main_tit}>{"香水学院"}</Text>
							<View style={styles.item_sub_tit_con}>
								<Text style={styles.item_sub_tit}>{"香水研习"}</Text>
								<Icon name="r-return" size={12} color={theme.comment} />
							</View>
						</View> */}
				</View>
				<View>
					<View style={styles.btns_item_con}>
						<Pressable onPress={() => { }} style={styles.btn_item}>
							<View>
								<Waitpay width={24} height={24} style={styles.btn_item_icon} />
								{ordercnt.current[0] > 0 && <Text style={[Globalstyles.redbadge, styles.order_badge]}>{ordercnt.current[0]}</Text>}
							</View>
							<Text style={styles.btn_item_text}>{"待付款"}</Text>
						</Pressable>
						<Pressable onPress={() => { }} style={styles.btn_item}>
							<View>
								<Transport width={24} height={24} style={styles.btn_item_icon} />
								{ordercnt.current[1] > 0 && <Text style={[Globalstyles.redbadge, styles.order_badge]}>{ordercnt.current[1]}</Text>}
							</View>
							<Text style={styles.btn_item_text}>{"进行中"}</Text>
						</Pressable>
						<Pressable onPress={() => { }} style={styles.btn_item}>
							<Completed width={24} height={24} style={styles.btn_item_icon} />
							<Text style={styles.btn_item_text}>{"已完成"}</Text>
						</Pressable>
						<Pressable onPress={() => { }}>
							<ShadowedView style={[styles.btn_item, styles.order_btn_item]}>
								<Order width={24} height={24} style={styles.btn_item_icon} />
								<Text style={styles.btn_item_text}>{"全部订单"}</Text>
							</ShadowedView>
						</Pressable>
					</View>
					<View style={styles.btns_item_con}>
						<Pressable onPress={() => { gotodetail("SocialXiaoxi") }} style={styles.btn_item}>
							<View>
								<Message width={24} height={24} style={styles.btn_item_icon} />
								{isShowBadge && <Text style={[Globalstyles.redbadge, styles.btn_badge]}></Text>}
							</View>
							<Text style={styles.btn_item_text}>{"消息"}</Text>
						</Pressable>
						<Pressable onPress={() => { gotodetail("MallWishList") }} style={styles.btn_item}>
							<Wishlist width={24} height={24} style={styles.btn_item_icon} />
							<Text style={styles.btn_item_text}>{"愿望单"}</Text>
						</Pressable>
						<Pressable onPress={() => { gotodetail("UserCart") }} style={styles.btn_item}>
							<Usercart width={24} height={24} style={styles.btn_item_icon} />
							<Text style={styles.btn_item_text}>{"购物车"}</Text>
						</Pressable>
						{showgiftcode.current && <Pressable onPress={opengiftcode} style={styles.btn_item}>
							<Giftcode width={24} height={24} style={styles.btn_item_icon} />
							<Text style={styles.btn_item_text}>{"礼品码兑换"}</Text>
						</Pressable>}
						<Pressable onPress={() => { gotodetail("UserSetting") }} style={styles.btn_item}>
							<Setting width={24} height={24} style={styles.btn_item_icon} />
							<Text style={styles.btn_item_text}>{"设置"}</Text>
						</Pressable>
					</View>
				</View>
			</View>
		</ScrollView>
	);
}
const styles = StyleSheet.create({
	user_con: {
		backgroundColor: theme.bg
	},
	linear_bg: {
		...StyleSheet.absoluteFillObject,
		zIndex: 1,
	},
	header_bg_con: {
		position: "absolute",
		top: 0,
		bottom: 0,
		width: width,
		height: height * 0.6,
		overflow: "hidden",
	},
	header_bg: {
		...StyleSheet.absoluteFillObject,
		margin: -30,
	},
	user_avatar_con: {
		flexDirection: "row",
		marginBottom: 30,
	},
	user_info_con: {
		marginHorizontal: 20,
		marginBottom: 50,
	},
	user_name: {
		fontSize: 18,
		color: theme.toolbarbg,
		fontWeight: "500"
	},
	user_days: {
		fontSize: 12,
		color: theme.toolbarbg,
		marginTop: 14,
	},
	user_page_con: {
		marginTop: 15,
		borderRadius: 10,
		overflow: "hidden",
	},
	user_page_bg: {
		...StyleSheet.absoluteFillObject,
		margin: -63,
	},
	user_page_msk: {
		position: "absolute",
		width: "100%",
		height: "100%",
		zIndex: 2,
	},
	page_text_con: {
		padding: 23,
	},
	page_main_text: {
		fontSize: 17,
		color: theme.toolbarbg,
	},
	page_sub_text_con: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 15,
	},
	sub_text: {
		fontSize: 15,
		color: theme.toolbarbg,
		marginRight: 5,
	},
	user_page_btn: {
		marginTop: 18,
		flexDirection: "row",
		alignItems: "center",
	},
	page_btn_item: {
		flex: 1,
		padding: 22.5,
		backgroundColor: theme.toolbarbg,
		borderRadius: 10,
		overflow: "hidden",
	},
	item_main_tit: {
		fontSize: 17,
		color: theme.text2,
		fontWeight: "500",
	},
	item_sub_tit_con: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 15,
	},
	item_sub_tit: {
		fontSize: 12,
		color: theme.comment,
		marginRight: 5,
	},
	page_bg: {
		width: 55,
		height: 55,
		position: "absolute",
		right: 10,
		bottom: 20,
	},
	btns_item_con: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		// justifyContent: "space-around",
		marginTop: 18,
		backgroundColor: theme.toolbarbg,
		borderRadius: 10,
		overflow: "hidden",
	},
	btn_item: {
		width: (width - 40) / 4,
		paddingVertical: 18,
		alignItems: "center",
		backgroundColor: theme.toolbarbg,
	},
	order_btn_item: {
		shadowColor: "rgba(142,152,230,0.1)",
		shadowOpacity: 1,
		shadowRadius: 10,
		shadowOffset: {
			width: -2,
			height: 0,
		},
	},
	btn_item_icon: {
		marginBottom: 15,
	},
	order_badge: {
		right: -8,
		top: -2,
	},
	btn_badge: {
		width: 12,
		height: 12,
		right: -6,
		top: -2,
	},
	btn_item_text: {
		fontSize: 12,
		color: theme.tit2,
	},
});
export default User;