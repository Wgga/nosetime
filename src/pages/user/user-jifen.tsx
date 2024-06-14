import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, Image, FlatList, Animated } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";

import HeaderView from "../../components/headerview";
import ToastCtrl from "../../components/toastctrl";
import { ModalPortal } from "../../components/modals";
import ExchangePopover from "../../components/popover/jifen-popover";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function UserJifen({ navigation }: any): React.JSX.Element {
	// 控件
	const insets = useSafeAreaInsets();
	// 变量
	let headerHeight = React.useRef<number>(0); // 积分数容器高度
	let headerOpt = React.useRef<Animated.Value>(new Animated.Value(1)).current; // 头部透明度动画
	let headerOpt2 = React.useRef<Animated.Value>(new Animated.Value(0)).current; // 头部透明度动画
	// 数据
	let points = React.useRef<string>("0"); // 积分点数
	let list = React.useRef<any[]>([]); // 积分商品列表
	let lottery = React.useRef<any>({
		name: "占星机预言与抽奖",
		point: 40,
	}); // 抽奖商品
	// 参数
	// 状态
	const [showmenu, setShowMenu] = React.useState<boolean>(false); // 是否显示菜单
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据
	let isToggle = React.useRef<boolean>(false); // 是否显示头部

	React.useEffect(() => {
		init();
	}, [])

	// 初始化获取数据
	const init = () => {
		http.post(ENV.points + "?uid=" + us.user.uid, { method: "mypoints", token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App积分集市页" } });
			} else {
				//20220306 shibo:若积分点数为零或负数时前台统一显示为0
				points.current = resp_data.val >= 0 ? resp_data.val : "0";
				lottery.current = resp_data.items.filter((item: any) => { return item.type == 1; })[0];
				list.current = resp_data.items.filter((item: any) => { return item.type != 1; })
				setIsRender(val => !val);
			}
		});
	}

	// 切换顶部文本
	const toggleHeaderView = (e: any) => {
		if (e.nativeEvent.contentOffset.y > headerHeight.current) {
			if (isToggle.current) return;
			isToggle.current = true;
			Animated.timing(headerOpt, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start();
			Animated.timing(headerOpt2, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
		} else {
			if (!isToggle.current) return;
			isToggle.current = false;
			Animated.timing(headerOpt, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
			Animated.timing(headerOpt2, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start();
		}
	}

	// 兑换商品
	const exchange = (item: any) => {
		if (item.type == 1) {
			return navigation.navigate("Page", { screen: "Lottery", params: { point: item.point, points: points.current } });
		}
		if (points.current < item.point) {
			return ToastCtrl.show({ message: "积分不足", duration: 1000, viewstyle: "short_toast", key: "points_lack_toast" });
		}

		let params = {
			title: "确定要兑换该商品吗?",
			message: "兑换物仅支持国内仓发货，有效期90天",
			buttons: [{
				text: "取消",
				handler: () => {
					ModalPortal.dismiss("jifen_exchange_popover");
				}
			},
			{
				text: "确定",
				handler: () => {
					ModalPortal.dismiss("jifen_exchange_popover");
					setTimeout(() => { _exchange(item) }, 200);
				}
			}]
		}

		if (item.type == 2) {
			params.title = "确定要兑换优惠券吗？";
			params.message = "优惠券有效期30天";
		}

		ModalPortal.show((
			<ExchangePopover params={params} />
		), {
			key: "jifen_exchange_popover",
			width: width,
			rounded: false,
			useNativeDriver: true,
			onTouchOutside: () => {
				ModalPortal.dismiss("jifen_exchange_popover");
			},
			animationDuration: 300,
			modalStyle: { backgroundColor: "transparent" },
		})
	}

	// 请求兑换接口
	const _exchange = (item: any) => {
		http.post(ENV.points + "?uid=" + us.user.uid, { method: "exchangev2", data: item, token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				success_popover({ text: resp_data.detail });
				points.current = resp_data.val;
				setIsRender(val => !val);
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App积分集市页" } });
			} else {
				ToastCtrl.show({ message: resp_data.msg, duration: 2000, viewstyle: "medium_toast", key: "exchange_err_toast" });
			}
		});
	}

	// 兑换成功弹窗
	const success_popover = (item: any) => {
		ModalPortal.show((
			<View style={styles.exchange_success_container}>
				<Image style={styles.exchange_success_img}
					source={require("../../assets/images/duihuan.png")}
				/>
				<Text style={styles.exchange_success_text}>{item.text}</Text>
			</View>
		), {
			key: "exchange_success_popover",
			width: width,
			rounded: false,
			useNativeDriver: true,
			onTouchOutside: () => {
				ModalPortal.dismiss("exchange_success_popover");
			},
			animationDuration: 300,
			modalStyle: { backgroundColor: "transparent" },
		})
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: "",
				isShowSearch: false,
				showmenu,
				style: { zIndex: 0 },
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				}
			}} method={{
				back: () => { navigation.goBack() },
			}} MenuChildren={() => {
				return (
					<>
						<Pressable style={Globalstyles.menu_icon_con} onPress={() => {
							navigation.navigate("Page", { screen: "Protocol", params: { title: "积分规则", type: "jfrule" } })
							setShowMenu(val => !val);
						}}>
							<Icon style={Globalstyles.menu_icon} name="jfrule" size={17} color={theme.text1} />
							<Text style={Globalstyles.menu_text}>{"积分规则"}</Text>
						</Pressable>
						<Pressable style={[Globalstyles.menu_icon_con, Globalstyles.no_border_bottom]} onPress={() => {
							navigation.navigate("Page", { screen: "MallCoupon" });
							setShowMenu(val => !val);
						}}>
							<Icon style={Globalstyles.menu_icon} name="coupon" size={16} color={theme.text1} />
							<Text style={Globalstyles.menu_text}>{"我的优惠券"}</Text>
						</Pressable>
					</>
				)
			}}>
				<View style={[styles.header_bg, Globalstyles.header_bg, { height: 90 + insets.top }]}>
					<Image style={{ width: "100%", height: "100%" }}
						source={require("../../assets/images/headbgpage/jfmallbg.jpg")}
					/>
				</View>
				<View style={styles.header_title_con}>
					<Animated.Text style={[styles.header_title, { position: "absolute", opacity: headerOpt }]}>{"积分集市"}</Animated.Text>
					<Animated.View style={{ position: "absolute", opacity: headerOpt2, flexDirection: "row", alignItems: "center" }}>
						<Text style={styles.header_title}>{"可用积分" + points.current}</Text>
						<Icon name="diamond" size={16} color={theme.toolbarbg} style={{ marginLeft: 5 }} />
					</Animated.View>
				</View>
				<Pressable style={{ zIndex: 1 }} onPress={() => { setShowMenu(val => !val) }}>
					<Icon name="sandian" size={20} color={theme.toolbarbg} style={styles.title_icon} />
				</Pressable>
			</HeaderView>
			<View style={[Globalstyles.list_content, Globalstyles.container]}>
				<FlatList data={list.current}
					initialNumToRender={10}
					numColumns={2}
					showsHorizontalScrollIndicator={false}
					keyExtractor={(item: any) => item.name}
					contentContainerStyle={styles.points_list}
					onScroll={toggleHeaderView}
					ListHeaderComponent={<>
						<View style={styles.points_header}>
							<View style={styles.points_num_con} onLayout={(e: any) => {
								headerHeight.current = e.nativeEvent.layout.height;
							}}>
								<Text style={styles.points_num}>{points.current}</Text>
								<Icon name="diamond" size={14} color={theme.primary} />
								<Text style={styles.points_num_text}>{"可用积分"}</Text>
							</View>
							<Pressable onPress={() => { exchange(lottery.current) }} style={styles.lottery_con}>
								<Image style={styles.lottery_img}
									source={require("../../assets/images/jifen/lotterybg.png")}
								/>
								<View style={styles.lottery_btn_con}>
									<Text style={styles.lottery_name}>{lottery.current.name}</Text>
									<View style={[styles.lottery_btn, points.current < lottery.current.point && styles.point_lack]}>
										<Text style={[styles.lottery_btn_text, points.current < lottery.current.point && styles.point_lack_color]}>{lottery.current.point}</Text>
										<Icon name="diamond" size={14} color={points.current < lottery.current.point ? "#BCBCBC" : "#7980B1"} />
									</View>
								</View>
							</Pressable>
						</View>
						<Text style={styles.list_title}>{"今日好物"}</Text>
					</>}
					columnWrapperStyle={{ backgroundColor: theme.toolbarbg }}
					renderItem={({ item, index }: any) => {
						return (
							<View style={[styles.list_item, (index + 1) % 2 == 0 && Globalstyles.no_border_right]}>
								{item.type == 2 && <View>
									<Image style={styles.coupon_img}
										source={require("../../assets/images/coupon/jfcoupon.png")}
									/>
									<View style={styles.coupon_val_con}>
										<Text style={{ color: "#9D6C25", transform: [{ translateX: -6 }] }}>
											<Text style={styles.val_icon}>{"￥"}</Text>
											<Text style={{ fontSize: 27 }}>{item.val}</Text>
										</Text>
										{item.min > 0 && <Text style={styles.condition}>{"— 满" + item.min + "使用 —"}</Text>}
										{item.min <= 0 && <Text style={styles.condition}>{"— " + item.mintext + " —"}</Text>}
									</View>
								</View>}
								{item.type == 3 && <Image style={styles.item_img}
									source={{ uri: ENV.image + "/perfume/" + item.iid + ".jpg!l" }}
									resizeMode="contain"
								/>}
								<Text style={styles.item_name}>
									{item.name}
									{item.type == 3 && <Text>{" " + item.ml + "ml"}</Text>}
								</Text>
								<Pressable onPress={() => { exchange(item) }}>
									<LinearGradient style={styles.item_btn}
										colors={points.current < item.point ? ["#EFEFEF", "#EFEFEF"] : ["#81B4EC", "#9BA6F5"]}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 0 }}>
										<Text style={[styles.item_btn_text, points.current < lottery.current.point && styles.point_lack_color]}>{item.point}</Text>
										<Icon name="diamond" size={14} color={points.current < lottery.current.point ? "#BCBCBC" : theme.toolbarbg} />
									</LinearGradient>
								</Pressable>
							</View>
						)
					}}
					ListFooterComponent={() => {
						return (
							<Text style={styles.list_tip}>{"香水列表每日更新 ~"}</Text>
						)
					}}
				/>
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	header_title_con: {
		flex: 1,
		height: 44,
		alignItems: "center",
		justifyContent: "center",
	},
	header_title: {
		height: 44,
		lineHeight: 44,
		fontSize: 18,
		fontWeight: "500",
		fontFamily: "PingFang SC",
		color: theme.toolbarbg,
	},
	header_bg: {
		height: 90,
		zIndex: 0,
	},
	title_icon: {
		width: 44,
		height: 44,
		textAlign: "center",
		lineHeight: 44,
	},
	points_con: {
		flex: 1,
	},
	emptyimg: {
		width: "100%",
		height: 500,
	},
	points_list: {
		backgroundColor: theme.bg,
		paddingBottom: 48,
	},
	points_header: {
		paddingTop: 19,
		marginBottom: 12,
		backgroundColor: theme.toolbarbg,
	},
	points_num_con: {
		paddingHorizontal: 21,
		flexDirection: "row",
		alignItems: "baseline",
	},
	points_num: {
		fontSize: 29,
		color: theme.primary,
		fontWeight: "500",
		fontFamily: "PingFang SC",
		marginRight: 7,
	},
	points_num_text: {
		fontSize: 12,
		marginLeft: 4,
		color: theme.primary,
	},
	lottery_con: {
		marginTop: 30,
		marginBottom: 21,
		marginHorizontal: 21,
		justifyContent: "center",
		alignItems: "center",
	},
	lottery_img: {
		width: width - 42,
		height: (width - 42) / 1004 * 278,
	},
	lottery_btn_con: {
		position: "absolute",
		paddingTop: 10,
		paddingLeft: 30,
	},
	lottery_name: {
		color: "#E4E6F8",
		fontSize: 14,
		marginBottom: 8,
	},
	lottery_btn: {
		flexDirection: "row",
		padding: 6,
		marginHorizontal: 8,
		borderRadius: 30,
		backgroundColor: "rgba(255,255,255,0.6)",
		alignItems: "center",
		justifyContent: "center",
	},
	point_lack: {
		backgroundColor: "#EFEFEF",
	},
	point_lack_color: {
		color: "#BCBCBC"
	},
	lottery_btn_text: {
		marginRight: 6,
		color: "#7980B1"
	},
	list_title: {
		paddingVertical: 23,
		paddingHorizontal: 19,
		fontSize: 16,
		color: theme.text1,
		fontWeight: "500",
		borderBottomWidth: 1,
		borderBottomColor: "#F2F2F2",
		backgroundColor: theme.toolbarbg,
	},
	list_item: {
		width: width / 2,
		paddingVertical: 17,
		paddingHorizontal: 10,
		borderBottomColor: "#F2F2F2",
		borderBottomWidth: 1,
		borderRightColor: "#F2F2F2",
		borderRightWidth: 1,
		alignItems: "center",
	},
	coupon_img: {
		width: (width / 2 - 53),
		height: (width / 2 - 53) / 143 * 75,
		marginLeft: 13,
	},
	coupon_val_con: {
		...StyleSheet.absoluteFillObject,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 5,
		marginBottom: 5,
	},
	val_icon: {
		fontSize: 12,
		marginRight: 1,
	},
	condition: {
		fontSize: 12,
		color: "#9D6C25"
	},
	item_img: {
		width: "100%",
		height: 90,
	},
	item_name: {
		fontSize: 12,
		color: theme.text1,
		marginTop: 12,
		fontWeight: "500",
		fontFamily: "PingFang SC",
	},
	item_btn: {
		marginVertical: 11,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 27,
		paddingVertical: 6,
		borderRadius: 30,
	},
	item_btn_text: {
		fontSize: 14,
		color: theme.toolbarbg,
		marginRight: 5,
	},
	list_tip: {
		marginVertical: 21,
		textAlign: "center",
		fontSize: 14,
		color: theme.placeholder2
	},
	exchange_success_container: {
		marginHorizontal: 40,
		backgroundColor: theme.toolbarbg,
		alignItems: "center",
		borderRadius: 4,
		overflow: "hidden",
	},
	exchange_success_img: {
		width: 40,
		height: 40,
		marginHorizontal: 27,
		marginVertical: 22,
	},
	exchange_success_text: {
		marginBottom: 17,
		fontSize: 17,
		color: theme.text2,
	}
});
export default UserJifen;