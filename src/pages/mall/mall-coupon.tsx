import React from "react";
import { View, Text, Image, StyleSheet, Pressable, Dimensions, ScrollView } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderView from "../../components/headerview";
import us from "../../services/user-service/user-service";
import ToastCtrl from "../../components/toastctrl";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function MallCoupon({ navigation, route }: any): React.JSX.Element {
	// 控件
	const insets = useSafeAreaInsets();
	// 参数
	// 变量
	let coupons = React.useRef<any>({
		valid: [], expire: [], used: []
	});
	let actualfee = React.useRef<any>(null);
	// 数据
	// 状态
	let isempty = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (route.params) {
			coupons.current.valid = route.params.coupons;
			actualfee.current = route.params.actualfee;
		} else {
			init();
		}

		return () => {
			coupons.current = { valid: [], expire: [], used: [] };
			actualfee.current = null;
		}
	}, [])

	const init = () => {
		http.post(ENV.mall + "?uid=" + us.user.uid, { method: "getcoupon", token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App优惠券页" } });
			}
			coupons.current = resp_data;
			//20220812 shibo:增加无优惠券时显示缺省图
			if (resp_data.valid.length == 0 && resp_data.expire.length == 0 && resp_data.used.length == 0) {
				isempty.current = true;
			}
			setIsRender(val => !val);
		});
	}

	const selectcoupon = (x: any) => {
		if (!route.params) return;
		let msg = "";

		let t = new Date();
		let sznow = t.getFullYear() + "-" + (t.getMonth() + 1) + "-" + t.getDate();
		let now = new Date(sznow).getTime();
		let from = new Date(x.mcfrom).getTime();
		let to = new Date(x.mcto).getTime();

		if (now < from)
			msg += "未到使用期限 " + x.mcfrom + "\n";
		if (now > to)
			msg += "使用期限 " + x.mcto + " 已过\n";
		if (actualfee.current < x.mcmin)
			msg += "订单金额需大于 " + x.mcmin + " 元\n";
		if (msg != "") {
			ToastCtrl.show({ message: msg, duration: 2000, viewstyle: "short_toast", key: "coupon_toast" });
			return;
		}
		events.publish("nosetime_reload_orderconfirmpage_coupon", x);
		navigation.goBack();
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: "优惠券",
				isShowSearch: false,
				style: { zIndex: 0 },
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				}
			}} method={{
				back: () => { navigation.goBack() },
			}}>
				<View style={[Globalstyles.header_bg, { height: 90 + insets.top }]}>
					<Image style={{ width: "100%", height: "100%" }}
						source={require("../../assets/images/headbgpage/couponbg.jpg")}
					/>
				</View>
			</HeaderView>
			<View style={[styles.coupon_con, Globalstyles.list_content]}>
				{isempty.current && <Image style={Globalstyles.emptyimg}
					resizeMode="contain"
					source={require("../../assets/images/empty/coupon_blank.png")} />}
				{!isempty.current && <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.coupon_list}>
					{(coupons.current.valid.length > 0) && coupons.current.valid.map((item: any, index: number) => {
						return (
							<Pressable onPress={() => { selectcoupon(item) }} key={item.mcid} style={styles.coupon_item_con}>
								<Image style={styles.coupon_img}
									source={require("../../assets/images/coupon/usercoupon.png")}
								/>
								<View style={styles.coupon_value}>
									<Text style={[styles.value_icon, { color: "#9D6C25" }]}>{"￥"}</Text>
									<Text style={[styles.value_text, { color: "#9D6C25" }]}>{item.mcvalue}</Text>
								</View>
								<View style={styles.coupon_msg}>
									<Text style={[styles.msg_title, { color: theme.text1 }]}>{item.title}</Text>
									<Text style={[styles.msg_info, { color: theme.comment }]}>{item.info}</Text>
								</View>
							</Pressable>
						)
					})}
					{(coupons.current.expire.length > 0) && coupons.current.expire.map((item: any, index: number) => {
						return (
							<View key={item.mcid} style={styles.coupon_item_con}>
								<Image style={styles.coupon_img}
									source={require("../../assets/images/coupon/coupon_expire.png")}
								/>
								<View style={styles.coupon_value}>
									<Text style={styles.value_icon}>{"￥"}</Text>
									<Text style={styles.value_text}>{item.mcvalue}</Text>
								</View>
								<View style={styles.coupon_msg}>
									<Text style={styles.msg_title}>{item.title}</Text>
									<Text style={styles.msg_info}>{item.info}</Text>
								</View>
							</View>
						)
					})}
				</ScrollView>}
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	coupon_con: {
		flex: 1,
		backgroundColor: theme.bg,
	},
	coupon_list: {
		paddingTop: 11,
		paddingLeft: 12,
		paddingRight: 6,
		paddingBottom: 48,
	},
	coupon_item_con: {
		marginTop: 15,
		width: width - 18,
		height: (width - 18) / 900 * 260,
		flexDirection: "row",
		alignItems: "center",
	},
	coupon_img: {
		position: "absolute",
		width: "100%",
		height: "100%",
	},
	coupon_value: {
		width: (width - 18) * 0.303,
		flexDirection: "row",
		alignItems: "baseline",
		justifyContent: "center",
		marginBottom: 10
	},
	value_icon: {
		fontSize: 16,
		color: "#939393"
	},
	value_text: {
		fontSize: 43,
		color: "#939393"
	},
	coupon_msg: {
		width: (width - 18) * 0.658,
		paddingLeft: 14,
		marginBottom: 10
	},
	msg_title: {
		fontSize: 15,
		fontWeight: "500",
		color: "#939393"
	},
	msg_info: {
		fontSize: 10,
		color: "#939393",
		marginTop: 6,
	}
});
export default MallCoupon;