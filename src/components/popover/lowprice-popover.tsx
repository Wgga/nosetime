import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions, Image } from "react-native";

import LinearGradient from "react-native-linear-gradient";

import { ModalPortal } from "../../components/modals";

import http from "../../utils/api/http";

import us from "../../services/user-service/user-service";

import theme from "../../configs/theme";

import { ENV } from "../../configs/ENV";
import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function lowPricePopover({ modalparams, navigation }: any): React.JSX.Element {
	// 控件
	// 变量
	const [data, setData] = React.useState<any>({});
	// 数据
	// 参数
	// 状态

	React.useEffect(() => {
		setData(modalparams.modaldata);
	}, []);

	const closepopover = () => {
		ModalPortal.dismiss(modalparams.modalkey);
	}

	const gotodetail = () => {
		closepopover();
		let screen = "", word = 1;
		switch (data.page) {
			case "mall-item":
				screen = "MallItem";
				break;
			case "article-detail":
				screen = "ArticleDetail";
				break;
			case "mall-heji":
				screen = "MallHeji";
				break;
			case "mall-group":
				screen = "MallGroup";
				break;
			default:
				screen = "";
				break;
		}
		if (!data.val) {
			word = (data.newprice && data.newprice.indexOf("分装") > -1) ? 2 : 1
		}
		if (screen) {
			navigation.navigate("Page", { screen, params: { src: "App特价弹窗", word } });
			// 统计商城UV，不要删
			http.post(ENV.mall + "?uid=" + us.user.uid, {
				token: us.user.token, method: "clickpopup", did: us.did, page: data.page, code: data.code
			}).then(() => { }).catch(() => { });
		}
	}

	return (
		<>
			{data && <View style={styles.lowprice_con}>
				{(data.isdiy && data.isdiy == 1 && !data.val) && <Pressable onPress={() => { gotodetail(); }}>
					<Image style={styles.diypopup}
						source={{ uri: ENV.image + data.img }}
						resizeMode="contain"
					/>
				</Pressable>}
				{(data.isdiy == 0 || !data.isdiy) && <View style={styles.popup_con}>
					{!data.val && <Pressable onPress={() => { gotodetail(); }}>
						<Image style={styles.popup_img}
							source={{ uri: ENV.image + data.img }}
						/>
						<View style={styles.whitebg}></View>
						<View style={styles.popup_info}>
							{data.title && <Text style={styles.main_title}>{data.title}</Text>}
							{data.subtitle && <Text style={styles.sub_title}>{data.subtitle}</Text>}
							{data.newprice && <Text style={styles.newprice}>{data.newprice}</Text>}
							{data.oriprice && <Text style={styles.oriprice}>{data.oriprice}</Text>}
							<LinearGradient
								colors={["#81B4EC", "#9BA6F5"]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}
								style={styles.purchase}
							>
								<Text style={styles.btn_text}>{data.btntext}</Text>
							</LinearGradient>
						</View>
					</Pressable>}
					{data.val && <>
						<Image style={styles.popup_img}
							source={{ uri: ENV.image + "/banner/popupbg.jpg" }}
						/>
						<View style={styles.whitebg}></View>
						<View style={styles.popup_info}>
							<View style={styles.points_title_con}>
								<Text style={styles.points_title}>{"您现有积分"}</Text>
								<View style={styles.points_con}>
									<Text style={styles.points_val}>{data.val}</Text>
									<Icon name="diamond" size={16} color={theme.tit} />
								</View>
							</View>
							<Text style={styles.points_tip}>{"可前往积分集市抽奖或兑换香水"}</Text>
							<View style={styles.points_btn_con}>
								<LinearGradient
									colors={["#81B4EC", "#9BA6F5"]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									style={styles.points_left_btn}
								>
									<Pressable style={styles.left_btn_con} onPress={closepopover}>
										<Text style={styles.points_btn_text}>{"暂不兑换"}</Text>
									</Pressable>
								</LinearGradient>
								<LinearGradient
									colors={["#81B4EC", "#9BA6F5"]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									style={[styles.points_right_btn]}
								>
									<Pressable onPress={() => {
										closepopover();
										navigation.navigate("Page", { screen: "UserJifen", params: { src: "App积分弹窗" } });
									}}>
										<Text style={styles.btn_text}>{"去积分集市"}</Text>
									</Pressable>
								</LinearGradient>
							</View>
						</View>
					</>}
				</View>}
				<Pressable style={styles.close_btn} onPress={closepopover}>
					<Icon name="close" size={25} color={theme.toolbarbg} />
				</Pressable>
			</View >}
		</>
	);
}
const styles = StyleSheet.create({
	lowprice_con: {
		width: "100%",
		alignItems: "center",
		justifyContent: "center",
	},
	diypopup: {
		width: width - 82,
		height: (width - 82) * 1.5,
	},
	popup_con: {
		width: width - 102,
		backgroundColor: theme.toolbarbg,
		borderRadius: 20,
		overflow: "hidden"
	},
	popup_img: {
		width: "100%",
		height: 245,
		backgroundColor: theme.placeholder
	},
	whitebg: {
		position: "absolute",
		left: 0,
		right: 0,
		height: 25,
		top: 220,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		backgroundColor: theme.toolbarbg
	},
	popup_info: {
		width: "100%",
		paddingHorizontal: 20,
		backgroundColor: theme.toolbarbg,
		alignItems: "center",
	},
	main_title: {
		fontSize: 19,
		marginVertical: 5,
		color: theme.text1,
	},
	sub_title: {
		height: 30,
		marginTop: 0,
		fontSize: 13,
		color: theme.text2,
	},
	newprice: {
		marginTop: 10,
		color: "#D25852",
		fontSize: 20,
	},
	oriprice: {
		marginTop: 8,
		color: theme.placeholder,
		fontSize: 13,
		textDecorationLine: "line-through",
	},
	purchase: {
		marginTop: 15,
		marginBottom: 24,
		borderRadius: 45,
		overflow: "hidden",
		paddingHorizontal: 30,
		paddingVertical: 11,
	},
	btn_text: {
		color: theme.toolbarbg,
		fontSize: 17,
		fontFamily: "PingFang SC",
		fontWeight: "500",
	},
	close_btn: {
		width: 43,
		height: 43,
		backgroundColor: "rgba(0,0,0,0.5)",
		marginTop: 34,
		borderRadius: 50,
		alignItems: "center",
		justifyContent: "center",
	},
	points_title_con: {
		marginVertical: 5,
		flexDirection: "row",
		alignItems: "baseline",
	},
	points_title: {
		fontSize: 19,
		color: theme.text1,
	},
	points_con: {
		flexDirection: "row",
		alignItems: "baseline",
	},
	points_val: {
		fontSize: 30,
		color: theme.tit,
		marginHorizontal: 5,
	},
	points_tip: {
		fontSize: 15,
		color: theme.text1,
		marginTop: 5,
		height: 30,
	},
	points_btn_con: {
		marginTop: 22,
		marginBottom: 40,
		flexDirection: "row",
	},
	points_left_btn: {
		marginRight: 6,
		paddingVertical: 1.5,
		paddingHorizontal: 1.5,
		borderRadius: 30,
	},
	left_btn_con: {
		backgroundColor: "#fff",
		paddingVertical: 7,
		paddingHorizontal: 19,
		borderRadius: 30
	},
	points_right_btn: {
		marginLeft: 6,
		paddingVertical: 8.5,
		paddingHorizontal: 12,
		borderRadius: 30,
	},
	points_btn_text: {
		color: "#6386D6",
		fontSize: 17,
		fontFamily: "PingFang SC",
		fontWeight: "500",
	},
});
export default lowPricePopover;