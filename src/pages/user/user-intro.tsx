import React from "react";

import { View, Text, StyleSheet, Pressable, Image, ScrollView } from "react-native";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../utils/globalmethod";

import Icon from "../../assets/iconfont";
import HeaderView from "../../components/headerview";

function UserIntro({ navigation, route }: any): React.JSX.Element {

	// 控件
	// 参数
	// 变量
	let who = React.useRef<string>("");
	let uid = React.useRef<number>(0);
	let info = React.useRef<any>({});
	// 数据
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	React.useEffect(() => {
		if (route.params) {
			uid.current = route.params.uid ? route.params.uid : 0;
			who.current = us.user.uid == uid.current ? "我" : "TA";
		}
		init();
	}, []);

	// 初始化
	const init = () => {
		cache.getItem("UserDetailPage" + uid.current).then((cacheobj) => {
			if (cacheobj) {
				info.current = cacheobj;
				setIsRender(val => !val);
			}
		}).catch(() => {
			http.post(ENV.user, { method: "getsocialinfo", id: uid.current, uid: us.user.uid }).then((resp_data: any) => {
				cache.saveItem("UserDetailPage" + uid.current, resp_data, 10);
				info.current = resp_data;
				setIsRender(val => !val);
			})
		});
	}

	// 设置等级的左偏移量
	const handlelevelLeft = (level: number) => {
		if (level == 1 || level == 2 || level == 3 || level == 4 || level == 5) {
			return styles.lv_left_2;
		} else if (level == 6 || level == 7 || level == 8 || level == 9 || level == 10) {
			return styles.lv_left_27;
		} else if (level == 11 || level == 12 || level == 13 || level == 14 || level == 15) {
			return styles.lv_left_52;
		}
	}

	// 设置等级的上偏移量
	const handlelevelTop = (level: number) => {
		if (level == 1 || level == 6 || level == 11) {
			return styles.lv_top_5;
		} else if (level == 2 || level == 12) {
			return styles.lv_top_30;
		} else if (level == 3) {
			return styles.lv_top_55;
		} else if (level == 4) {
			return styles.lv_top_80;
		} else if (level == 5 || level == 10 || level == 15) {
			return styles.lv_top_105;
		} else if (level == 7) {
			return styles.lv_top_31;
		} else if (level == 8) {
			return styles.lv_top_56;
		} else if (level == 9) {
			return styles.lv_top_81;
		} else if (level == 13) {
			return styles.lv_top_54;
		} else if (level == 14) {
			return styles.lv_top_79;
		}
	}

	// 处理成就数据
	const handleUprize = (value: string) => {
		switch (value) {
			case "A1":
				return "香评达人";
			case "A2":
				return "香评高手";
			case "A3":
				return "香评大师";
			case "B1":
				return "意见领袖";
			case "B2":
				return "战略高手";
			case "B3":
				return "伟大领袖";
			case "C1":
				return "圈内人";
			case "C2":
				return "社交达人";
			case "C3":
				return "交际大师";
			case "G1":
				return "媒体评论员";
			case "G2":
				return "媒体评论家";
			case "G3":
				return "权威评论家";
			case "H1":
				return "转香达人";
			case "H2":
				return "转香高手";
			case "H3":
				return "转香大师";
			case "K1":
				return "明星潜质";
			case "K2":
				return "众人追捧";
			case "K3":
				return "万人瞩目";
			case "L1":
				return "一语惊人";
			case "L2":
				return "语惊四座";
			case "L3":
				return "才华横溢";
			case "M1":
				return "热心粉丝";
			case "M2":
				return "活跃粉丝";
			case "M3":
				return "狂热粉丝";
			case "N1":
				return "见多识广";
			case "N2":
				return "博学多识";
			case "N3":
				return "博古通今";
		}
	}

	return (
		<View style={Globalstyles.container}>
			<View style={Globalstyles.header_bg_con}>
				<Image style={Globalstyles.header_bg_img} blurRadius={40} source={{ uri: ENV.avatar + info.current.uid + ".jpg?" + info.current.uface }} />
				<View style={Globalstyles.header_bg_msk}></View>
			</View>
			<HeaderView data={{
				title: "",
				backicon: "close",
				backiconsize: 35,
				backiconcolor: theme.comment,
				isShowSearch: false,
				style: { backgroundColor: "transparent", paddingHorizontal: 10 },
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				},
			}} method={{
				back: () => { navigation.goBack() },
			}} />
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.intro_con}>
				<View style={styles.intro_msg}>
					<Text style={styles.user_name}>{info.current.uname}</Text>
					{uid.current > 0 && <Image style={styles.useravatar} source={{ uri: ENV.avatar + info.current.uid + ".jpg?" + info.current.uface }} />}
				</View>
				<View style={styles.item_con}>
					{info.current.ulevelstr && <Pressable style={styles.flex_row} onPress={() => {
						navigation.navigate("Page", { screen: "UserLevelIntro", params: { uid: uid.current, uface: info.current.uface } });
					}}>
						<Text style={styles.textstyle}>{"等级："}</Text>
						<View style={styles.level}>
							<Image style={[styles.level_icon, handlelevelLeft(info.current.ulevel), handlelevelTop(info.current.ulevel)]}
								defaultSource={require("../../assets/images/nopic.png")}
								source={require("../../assets/images/lv.png")}
							/>
						</View>
						<Text style={styles.textstyle}>{info.current.ulevelstr}</Text>
						<Icon name="advance" size={12} color={theme.toolbarbg} style={{ marginLeft: 5 }} />
					</Pressable>}
					{info.current.days && <Text style={[styles.textstyle, { marginTop: 10 }]}>{"香龄：" + info.current.days}</Text>}
					{info.current.ulocation && <Text style={[styles.textstyle, { marginTop: 10 }]}>{"地区：" + info.current.ulocation}</Text>}
					{info.current.uprize && <Text style={[styles.textstyle, { marginTop: 10 }]}>{"成就：" + handleUprize(info.current.uprize)}</Text>}
				</View>
				<View style={styles.item_con}>
					<Text style={styles.item_tit}>{who.current + "的记录"}</Text>
					<View style={styles.user_discuss}>
						<Pressable style={styles.discuss_con}>
							<Text style={[styles.item_tit, styles.discuss_num]}>{info.current.smelt}</Text>
							<Text style={styles.discuss_text}>{"闻过"}</Text>
						</Pressable>
						<Pressable style={styles.discuss_con}>
							<Text style={[styles.item_tit, styles.discuss_num]}>{info.current.wanted}</Text>
							<Text style={styles.discuss_text}>{"想要"}</Text>
						</Pressable>
						<Pressable style={styles.discuss_con}>
							<Text style={[styles.item_tit, styles.discuss_num]}>{info.current.have}</Text>
							<Text style={styles.discuss_text}>{"拥有"}</Text>
						</Pressable>
					</View>
				</View>
				<View style={styles.item_con}>
					<Text style={styles.item_tit}>{"简介"}</Text>
					{info.current.udesc && <Text style={[styles.textstyle, styles.user_desc]}>{info.current.udesc}</Text>}
					{!info.current.udesc && <Text style={[styles.textstyle, styles.user_desc]}>{"无"}</Text>}
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	intro_con: {
		paddingHorizontal: 25,
	},
	intro_msg: {
		paddingTop: 35,
		marginBottom: 15,
	},
	item_con: {
		marginBottom: 50,
	},
	user_name: {
		fontSize: 21,
		color: theme.toolbarbg,
	},
	useravatar: {
		position: "absolute",
		top: -10,
		right: 0,
		width: 65,
		height: 65,
		marginTop: 20,
		marginRight: 15,
		borderColor: theme.toolbarbg,
		borderWidth: 1,
		borderRadius: 50,
		overflow: "hidden",
	},
	textstyle: {
		fontSize: 13,
		color: theme.toolbarbg,
	},
	item_tit: {
		fontSize: 17,
		color: theme.toolbarbg,
	},
	flex_row: {
		flexDirection: "row",
		alignItems: "center",
	},
	level: {
		width: 26,
		height: 26,
		marginRight: 5,
		overflow: "hidden",
	},
	level_icon: {
		position: "absolute",
		width: 80,
		height: 136,
	},
	lv_left_2: {
		left: -2,
	},
	lv_left_27: {
		left: -27,
	},
	lv_left_52: {
		left: -52,
	},
	lv_top_5: {
		top: -5,
	},
	lv_top_30: {
		top: -30,
	},
	lv_top_31: {
		top: -31,
	},
	lv_top_55: {
		top: -55,
	},
	lv_top_54: {
		top: -54,
	},
	lv_top_56: {
		top: -56,
	},
	lv_top_79: {
		top: -79,
	},
	lv_top_80: {
		top: -80,
	},
	lv_top_81: {
		top: -81,
	},
	lv_top_105: {
		top: -105,
	},
	user_discuss: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: 15,
	},
	discuss_con: {
		paddingHorizontal: "10%",
		paddingVertical: "2%",
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.1)",
		borderRadius: 10,
	},
	discuss_num: {
		fontFamily: "PingFang SC",
		fontWeight: "bold",
	},
	discuss_text: {
		fontSize: 13,
		opacity: 0.5,
		marginTop: 3,
		color: theme.toolbarbg,
	},
	user_desc: {
		marginTop: 10,
		lineHeight: 30,
		opacity: 0.8
	}
});

export default UserIntro;