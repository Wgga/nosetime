import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image, ScrollView } from "react-native";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlelevelLeft, handlelevelTop } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";
import HeaderView from "../../components/headerview";

const { width, height } = Dimensions.get("window");

function UserLevelIntro({ navigation, route }: any): React.JSX.Element {

	// 控件
	// 参数
	// 变量
	let uid = React.useRef<number>(0);
	let uface = React.useRef<string>("");
	// 数据
	const levelitems: any = [
		"one", "two", "three", "four", "five",
		"six", "seven", "eight", "nine", "ten",
		"eleven", "twelve", "thirteen", "fourteen", "fifteen"
	];
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	React.useEffect(() => {
		if (route.params) {
			uid.current = route.params.uid ? route.params.uid : 0;
			uface.current = route.params.uface ? route.params.uface : "";
			setIsRender(val => !val);
		}
	}, []);

	// 设置等级的左偏移量
	const handlelevelLeft = (level: number) => {
		if (level == 2 || level == 5 || level == 8 || level == 11 || level == 14) {
			return styles.level_left_28;
		} else if (level == 3 || level == 6 || level == 9 || level == 12 || level == 15) {
			return styles.level_left_54;
		}
	}

	// 设置等级的上偏移量
	const handlelevelTop = (level: number) => {
		if (level == 4 || level == 5 || level == 6) {
			return styles.level_top_25;
		} else if (level == 7 || level == 8 || level == 9) {
			return styles.level_top_51;
		} else if (level == 10 || level == 11 || level == 12) {
			return styles.level_top_78;
		} else if (level == 13 || level == 14 || level == 15) {
			return styles.level_top_105;
		}
	}

	// 处理等级数据
	const handleLevel = (value: string) => {
		switch (value) {
			case "one":
				return "青涩之香";
			case "two":
				return "清香袅袅";
			case "three":
				return "淡香清雅";
			case "four":
				return "幽香徐来";
			case "five":
				return "暗香疏影";
			case "six":
				return "馨香雅致";
			case "seven":
				return "桂馥兰香";
			case "eight":
				return "浓香四溢";
			case "nine":
				return "染香轻醉";
			case "ten":
				return "十面涵香";
			case "eleven":
				return "香鼎群芳";
			case "twelve":
				return "天香国色";
			case "thirteen":
				return "王者之香";
			case "fourteen":
				return "独领香华";
			case "fifteen":
				return "香界传奇";
		}
	}

	return (
		<View style={Globalstyles.container}>
			<Image style={styles.header_bg} blurRadius={40} source={{ uri: ENV.avatar + uid.current + ".jpg?" + uface.current }} />
			<HeaderView data={{
				title: "等级介绍",
				isShowSearch: false,
				style: { backgroundColor: "transparent" },
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				}
			}} method={{
				back: () => { navigation.goBack() },
			}} />
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.intro_con}>
				<View style={styles.item_con}>
					<Text style={styles.item_tit}>{"1、等级说明"}</Text>
					<Text style={styles.item_text}>{"用户在香水时代写香评、发帖、分享、评论互动、每日登陆、反馈等行为，会产生经验值，经验值累计到一定分数即可达到对应等级。"}</Text>
				</View>
				<View style={styles.item_con}>
					<Text style={styles.item_tit}>{"2、用香等级一览"}</Text>
					<View style={styles.level_con}>
						<View style={[styles.level_tit, styles.level_style]}>
							<Text style={[styles.textstyle, styles.flex1]}>{"等级"}</Text>
							<Text style={[styles.textstyle, styles.flex4]}>{"等级名称"}</Text>
						</View>
						<View style={styles.level_style}>
							<View style={styles.flex1}>
								{levelitems.map((item: any, index: number) => {
									return (
										<View key={item} style={styles.level}>
											<Image style={[styles.level_icon, handlelevelLeft(index + 1), handlelevelTop(index + 1)]}
												defaultSource={require("../../assets/images/nopic.png")}
												source={require("../../assets/images/level.png")}
											/>
										</View>
									)
								})}
							</View>
							<View style={styles.flex4}>
								{levelitems.map((item: any, index: number) => {
									return (
										<Text key={item} style={styles.levelstr}>{handleLevel(item)}</Text>
									)
								})}
							</View>
						</View>
					</View>
				</View>
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	header_bg: {
		...StyleSheet.absoluteFillObject,
		zIndex: 0,
	},
	intro_con: {
		paddingHorizontal: 25,
		paddingBottom: 50
	},
	item_con: {
		marginTop: 28,
	},
	item_tit: {
		fontSize: 16,
		color: theme.toolbarbg,
	},
	item_text: {
		fontSize: 15,
		color: theme.toolbarbg,
		marginTop: 10,
		lineHeight: 25,
		opacity: 0.8
	},
	level_con: {
		marginTop: 13,
		backgroundColor: "rgba(255,255,255,0.1)",
		borderRadius: 10,
		overflow: "hidden",
	},
	level_style: {
		paddingVertical: 13,
		paddingHorizontal: 30,
		flexDirection: "row",
		alignItems: "center",
	},
	level_tit: {
		backgroundColor: "rgba(255,255,255,0.06)",
	},
	flex1: {
		flex: 1,
	},
	flex4: {
		flex: 4,
	},
	textstyle: {
		fontSize: 15,
		color: theme.toolbarbg,
	},
	level: {
		width: 25,
		height: 30,
		overflow: "hidden",
	},
	level_icon: {
		position: "absolute",
		width: 80,
		height: 133,
		left: -1,
		top: 2,
	},
	level_left_28: {
		left: -28,
	},
	level_left_54: {
		left: -54,
	},
	level_top_25: {
		top: -25,
	},
	level_top_51: {
		top: -51,
	},
	level_top_78: {
		top: -78,
	},
	level_top_105: {
		top: -105,
	},
	levelstr: {
		height: 30,
		lineHeight: 30,
		fontSize: 15,
		color: theme.toolbarbg,
		opacity: 0.8
	}
});

export default UserLevelIntro;