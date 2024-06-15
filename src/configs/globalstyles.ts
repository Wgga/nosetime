import { StyleSheet } from "react-native";

import theme from "./theme";

const handlelevelLeft = (level: number) => {
	if (level == 2 || level == 5 || level == 8 || level == 11 || level == 14) {
		return Globalstyles.level_left_20;
	} else if (level == 3 || level == 6 || level == 9 || level == 12 || level == 15) {
		return Globalstyles.level_left_40;
	}
}

const handlelevelTop = (level: number) => {
	if (level == 4 || level == 5 || level == 6) {
		return Globalstyles.level_top_20;
	} else if (level == 7 || level == 8 || level == 9) {
		return Globalstyles.level_top_40;
	} else if (level == 10 || level == 11 || level == 12) {
		return Globalstyles.level_top_60;
	} else if (level == 13 || level == 14 || level == 15) {
		return Globalstyles.level_top_80;
	}
}

const handlestarLeft = (star: number) => {
	if (star == 0) {
		return Globalstyles.star_left_75;
	} else if (star == 1 || star == 2) {
		return Globalstyles.star_left_60;
	} else if (star == 3 || star == 4) {
		return Globalstyles.star_left_45;
	} else if (star == 5 || star == 6) {
		return Globalstyles.star_left_30;
	} else if (star == 7 || star == 8) {
		return Globalstyles.star_left_15;
	}
}

const handlereplystarLeft = (star: number) => {
	if (star == 1 || star == 2) {
		return Globalstyles.replystar_left_52;
	} else if (star == 3 || star == 4) {
		return Globalstyles.replystar_left_39;
	} else if (star == 5 || star == 6) {
		return Globalstyles.replystar_left_26;
	} else if (star == 7 || star == 8) {
		return Globalstyles.replystar_left_12;
	}
}

const Globalstyles: any = StyleSheet.create({
	// 搜索结果页面star
	star: {
		width: 76,
		height: 14,
		overflow: "hidden",
	},
	star_icon: {
		width: 151.5,
		height: 14,
		position: "absolute",
		top: 0,
		left: 0,
	},
	star_left_15: {
		left: -15,
	},
	star_left_30: {
		left: -30,
	},
	star_left_45: {
		left: -45,
	},
	star_left_60: {
		left: -60,
	},
	star_left_75: {
		left: -75,
	},
	// 单品页香水时代评分star
	star_num: {
		width: 56,
		height: 9,
		overflow: "hidden",
		transform: [{ rotateY: "180deg" }],
		marginRight: 3
	},
	star_num_icon: {
		width: 98,
		height: 9,
		position: "absolute",
		top: 0,
	},
	star_num_icon_1: {
		left: -49,
	},
	star_num_icon_2: {
		left: -58.64,
	},
	star_num_icon_3: {
		left: -68.64,
	},
	star_num_icon_4: {
		left: -78.64,
	},
	star_num_icon_5: {
		left: -88.5,
	},
	// 单品页一句话香评star
	replystar: {
		width: 66,
		height: 12,
		overflow: "hidden",
	},
	replystar_icon: {
		width: 130,
		height: 12,
		position: "absolute",
		top: 0,
		left: 0,
	},
	replystar_left_12: {
		left: -12,
	},
	replystar_left_26: {
		left: -26,
	},
	replystar_left_39: {
		left: -39,
	},
	replystar_left_52: {
		left: -52,
	},
	// 等级
	level: {
		width: 20,
		height: 20,
		marginLeft: 8,
		overflow: "hidden",
	},
	level_icon: {
		width: 60,
		height: 100,
		position: "absolute",
		top: 0,
		left: 0,
	},
	level_left_20: {
		left: -20,
	},
	level_left_40: {
		left: -40,
	},
	level_top_20: {
		top: -20,
	},
	level_top_40: {
		top: -40,
	},
	level_top_60: {
		top: -60,
	},
	level_top_80: {
		top: -80,
	},
	// 空页面
	emptyimg: {
		width: "100%",
		height: 500,
	},
	// 容器样式
	container: {
		flex: 1,
		backgroundColor: theme.toolbarbg,
	},
	title_text_con: {
		width: 44,
		height: 44,
		justifyContent: "center",
	},
	title_text: {
		fontSize: 13,
		color: theme.tit2,
	},
	social_mask: {
		...StyleSheet.absoluteFillObject,
		zIndex: 1,
		backgroundColor: "rgba(0,0,0,0.5)"
	},
	// 头部图片背景
	header_bg: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		overflow: "hidden"
	},
	// 右上角菜单
	menu_icon_con: {
		paddingLeft: 5,
		paddingVertical: 13,
		paddingRight: 9,
		alignItems: "center",
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: theme.bg
	},
	no_border_bottom: {
		borderBottomWidth: 0,
	},
	no_border_right: {
		borderRightWidth: 0,
	},
	menu_icon: {
		marginRight: 9,
		marginTop: 2,
	},
	menu_text: {
		fontSize: 14,
		color: theme.tit2,
		marginRight: 15,
	},
	list_content: {
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		overflow: "hidden",
	},
	keyboardmask: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.5)",
		zIndex: 12
	}
});

export { Globalstyles, handlelevelLeft, handlelevelTop, handlestarLeft, handlereplystarLeft };