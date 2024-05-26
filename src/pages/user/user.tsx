import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, ScrollView, Image } from "react-native";

import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Brightness } from "react-native-color-matrix-image-filters";
import { Blurhash } from "react-native-blurhash";
import { useFocusEffect } from "@react-navigation/native";
import { ShadowedView } from "react-native-fast-shadow";

import ToastCtrl from "../../components/toastctrl";

import http from "../../utils/api/http";

import us from "../../services/user-service/user-service";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

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
const events = new NativeEventEmitter();
const classname = "UserPage";

function User({ navigation }: any): React.JSX.Element {
	// 控件
	const insets = useSafeAreaInsets();
	// 参数
	// 变量
	let pointval = React.useRef<number>(0); // 积分
	// 数据
	let userinfo = React.useRef<any>({}); // 用户信息
	// 状态
	let showgiftcode = React.useRef<boolean>(false); // 是否显示兑换码
	const [isrender, setIsRender] = React.useState(false); // 是否渲染

	useFocusEffect(
		React.useCallback(() => {
			init();
		}, [])
	);

	React.useEffect(() => {
	}, []);

	const init = () => {
		cache.getItem(classname + us.user.uid).then((cacheobj: any) => {
			if (cacheobj) {
				userinfo.current = cacheobj;
				getmoredata("init");
			}
		}).catch(() => {
			http.post(ENV.api + ENV.user, { method: "getsocialinfo", id: us.user.uid }).then((resp_data: any) => {
				cache.saveItem(classname + us.user.uid, resp_data, 10);
				userinfo.current = resp_data;
				getmoredata("init");
			})
		});
	};

	// 获取用户积分
	const getjifenval = () => {
		return new Promise((resolve, reject) => {
			http.post(ENV.points + "?uid=" + us.user.uid, { method: "mypoints", token: us.user.token }).then((resp_data: any) => {
				if (resp_data.msg == 'TOKEN_ERR' || resp_data.msg == 'TOKEN_EXPIRE') {
					us.delUser();
					resolve(0);
				}
				pointval.current = resp_data.val > 0 ? resp_data.val : 0;
				resolve(1);
			})
		});
	}

	const getmoredata = (type: string) => {
		events.addListener("usershowgiftcode", (result) => {
			showgiftcode.current = result && result.showgiftcode == 1 ? true : false;
		})
		cache.getItem("usershowgiftcode").then((cacheobj) => {
			showgiftcode.current = cacheobj && cacheobj.showgiftcode == 1 ? true : false;
		}).catch(() => { });

		Promise.all([getjifenval()]).then((data: any) => {
			if (data.length == 1) {
				setIsRender((val) => !val);
			}
		})
	}

	const gotodetail = (page: string) => {
		if (!page) {
			ToastCtrl.show({ message: "该功能暂未开放，敬请期待", duration: 1000, viewstyle: "superior_toast", key: "user_btn_toast" });
			return;
		}
		if (page == "user-setting") {
			navigation.navigate("Page", { screen: "UserSetting", params: { src: "我的页面" } })
		} else if (page == "mall-cart") {
		} else if (page == "mall-order") {
		} else if (page == "social-xiaoxi") {
		} else {
		}
	}

	return (
		<ScrollView contentContainerStyle={styles.user_con} showsVerticalScrollIndicator={false}>
			{userinfo.current && <>
				<Brightness amount={0.85} style={styles.header_bg_con}>
					<LinearGradient
						colors={["transparent", theme.bg]}
						start={{ x: 0, y: 0 }}
						end={{ x: 0, y: 1 }}
						locations={[0.5, 1]}
						style={styles.linear_bg}
					></LinearGradient>
					<Blurhash style={styles.header_bg}
						blurhash={us.user.blurhash}
						decodeWidth={32}
						decodeHeight={32}
						decodePunch={1}
						resizeMode="cover"
						decodeAsync={true}
					/>
				</Brightness>
				<View style={styles.user_info_con}>
					<View style={[styles.user_avatar_con, { marginTop: insets.top ? insets.top + 60 : 84 }]}>
						<Image style={styles.user_avatar}
							source={{ uri: ENV.avatar + userinfo.current.uid + ".jpg?" + userinfo.current.uface }}
						/>
						<View>
							<Text style={styles.user_name}>{userinfo.current.uname}</Text>
							<Text style={styles.user_days}>{"已入住 " + userinfo.current.days + "，记录了 " + userinfo.current.all + " 款香水"}</Text>
						</View>
					</View>
					<Brightness amount={0.85} style={styles.user_page_con}>
						<Blurhash style={styles.user_page_bg}
							blurhash={us.user.blurhash}
							decodeWidth={32}
							decodeHeight={32}
							decodePunch={1}
							resizeMode="cover"
							decodeAsync={true}
						/>
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
					</Brightness>
					<View style={styles.user_page_btn}>
						<Pressable onPress={() => { cache.clear() }} style={[styles.page_btn_item, { marginRight: 7.5 }]}>
							<Text style={styles.item_main_tit}>{"积分集市"}</Text>
							<View style={styles.item_sub_tit_con}>
								<Text style={styles.item_sub_tit}>{"我的积分 " + pointval.current}</Text>
								<Icon name="r-return" size={12} color={theme.comment} />
							</View>
						</Pressable>
						<View style={[styles.page_btn_item, { marginLeft: 7.5 }]}>
							<Text style={styles.item_main_tit}>{"香水学院"}</Text>
							<View style={styles.item_sub_tit_con}>
								<Text style={styles.item_sub_tit}>{"香水研习"}</Text>
								<Icon name="r-return" size={12} color={theme.comment} />
							</View>
						</View>
					</View>
					<View>
						<View style={styles.btns_item_con}>
							<Pressable onPress={() => { }} style={styles.btn_item}>
								<Waitpay width={24} height={24} style={styles.btn_item_icon} />
								<Text style={styles.btn_item_text}>{"待付款"}</Text>
							</Pressable>
							<Pressable onPress={() => { }} style={styles.btn_item}>
								<Transport width={24} height={24} style={styles.btn_item_icon} />
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
							<Pressable onPress={() => { }} style={styles.btn_item}>
								<Message width={24} height={24} style={styles.btn_item_icon} />
								<Text style={styles.btn_item_text}>{"消息"}</Text>
							</Pressable>
							<Pressable onPress={() => { }} style={styles.btn_item}>
								<Wishlist width={24} height={24} style={styles.btn_item_icon} />
								<Text style={styles.btn_item_text}>{"愿望单"}</Text>
							</Pressable>
							<Pressable onPress={() => { }} style={styles.btn_item}>
								<Usercart width={24} height={24} style={styles.btn_item_icon} />
								<Text style={styles.btn_item_text}>{"购物车"}</Text>
							</Pressable>
							{showgiftcode.current && <Pressable onPress={() => { }} style={styles.btn_item}>
								<Giftcode width={24} height={24} style={styles.btn_item_icon} />
								<Text style={styles.btn_item_text}>{"礼品码兑换"}</Text>
							</Pressable>}
							<Pressable onPress={() => { gotodetail("user-setting") }} style={styles.btn_item}>
								<Setting width={24} height={24} style={styles.btn_item_icon} />
								<Text style={styles.btn_item_text}>{"设置"}</Text>
							</Pressable>
						</View>
					</View>
				</View>
			</>}
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
	user_avatar: {
		width: 60,
		height: 60,
		borderWidth: 1,
		borderColor: theme.toolbarbg,
		borderRadius: 30,
		marginRight: 20,
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
	waitpay: {

	},
	btn_item_text: {
		fontSize: 12,
		color: theme.tit2,
	},
});
export default User;