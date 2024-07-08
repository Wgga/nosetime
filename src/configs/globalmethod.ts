import { StyleSheet } from "react-native";

import reactNativeTextSize from "react-native-text-size";

import theme from "./theme";

// 设置等级的左偏移量
const handlelevelLeft = (level: number) => {
	if (level == 2 || level == 5 || level == 8 || level == 11 || level == 14) {
		return Globalstyles.level_left_20;
	} else if (level == 3 || level == 6 || level == 9 || level == 12 || level == 15) {
		return Globalstyles.level_left_40;
	}
}

// 设置等级的上偏移量
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

// 设置星星的左偏移量
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

// 设置评论中星星的左偏移量
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

//控制显示前两回复，arr.show用于显示剩余回复
const show_items = (items: any, num: number) => {
	if (num == -1 && items.length > 2) {
		return true;
	}
	if (num == 0 || num == 1) {
		return true
	} else if (!items.show) {
		return false;
	} else {
		return true;
	}
}

//用于显示剩余回复
const display = (items: any) => {
	if (!items.show) {
		items.show = true;
	} else {
		items.show = false;
	}
}

// 设置内容折叠
const setContentFold = (params: any) => {
	let srclist = ["smart", "article", "user"];
	if (srclist.includes(params.src)) {
		handleContent(params.item, params);
	} else {
		params.items.forEach((item: any) => {
			item[params.key + "2"] = "";
			item["isopen"] = true;
			if (item[params.key].length > 0) {
				handleContent(item, params);
			}
		});
	}
}
const handleContent = (item: any, params: any) => {
	reactNativeTextSize.measure({
		width: params.width,
		fontSize: params.fontSize,
		fontFamily: "monospace",
		fontWeight: "normal",
		text: item[params.key],
		lineInfoForLine: params.lineInfoForLine,
	}).then((data: any) => {
		if (data.lineCount < params.lineInfoForLine) {
			item[params.key + "2"] = "";
			item["isopen"] = true;
		} else {
			item[params.key + "2"] = item[params.key].slice(0, data.lineInfo.start - params.moreTextLen);
			item["isopen"] = false;
		}
	}).catch((error) => {
		item[params.key + "2"] = "";
		item["isopen"] = true;
	});
}

// 转化page首字母大写
const toCamelCase = (page: string) => {
	return page.split("-").map((word: string, index: number) => {
		if (index === 0) {
			return word.charAt(0).toUpperCase() + word.slice(1);
		} else {
			return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
		}
	}).join("");
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
	// 各页面容器
	container: {
		flex: 1,
		backgroundColor: theme.toolbarbg,
	},
	// 头部标题右侧按钮
	title_text_con: {
		width: 44,
		height: 44,
		justifyContent: "center",
	},
	title_text: {
		fontSize: 13,
		color: theme.tit2,
	},
	title_icon: {
		width: 44,
		height: 44,
		textAlign: "center",
		lineHeight: 44,
		zIndex: 1
	},
	// 头部View脱离文档流
	absolute: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		backgroundColor: "transparent",
	},
	// 头部头像背景
	header_bg_con: {
		...StyleSheet.absoluteFillObject,
		zIndex: 0,
	},
	header_bg_msk: {
		position: "absolute",
		width: "100%",
		height: "100%",
		backgroundColor: "rgba(0,0,0,0.3)",
		zIndex: 1,
	},
	header_bg_img: {
		width: "100%",
		height: "100%",
		zIndex: 0,
	},
	// 帖子首页类型筛选遮罩
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
	// 列表容器
	list_content: {
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		overflow: "hidden",
	},
	// 键盘遮罩
	keyboardmask: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.5)",
		zIndex: 12
	},
	// 二级评论展开收起
	more_reply: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 45,
		marginBottom: 10,
	},
	more_reply_text: {
		fontSize: 12,
		color: theme.tit,
	},
	morebtn_con: {
		position: "absolute",
		right: 0,
		bottom: 0,
		flexDirection: "row",
		alignItems: "center",
	},
	open_morebtn: {
		position: "relative",
		justifyContent: "flex-end",
	},
	ellipsis_text: {
		fontSize: 14,
		lineHeight: 20,
		color: theme.text1,
	},
	morebtn_text: {
		fontSize: 14,
		color: theme.text1,
		marginLeft: 8,
	},
	// 页面数据加载中遮罩
	loading_con: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 999,
		backgroundColor: theme.toolbarbg,
		alignItems: "center",
		justifyContent: "center",
	},
	loading_img: {
		width: 32,
		height: 32,
		opacity: .8,
	},
	// 页面红点徽标
	redbadge: {
		width: 16,
		height: 16,
		borderRadius: 50,
		backgroundColor: theme.redchecked,
		position: "absolute",
		right: 0,
		color: theme.toolbarbg,
		fontSize: 10,
		lineHeight: 16,
		textAlign: "center",
		borderColor: theme.toolbarbg,
		borderWidth: 1,
	},
	// flex居中
	confirm_btn: {
		justifyContent: "center",
		alignItems: "center",
	},
	btn_text: {
		fontSize: 14,
		color: theme.toolbarbg,
	},
	// 列表Tab(个人页面 话题/香单 列表)
	tab_tit_con: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomColor: theme.bg,
		borderBottomWidth: 1,
	},
	tab_tit: {
		flexGrow: 1,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	tabtext: {
		fontSize: 16,
		color: theme.color
	},
	tabline: {
		position: "absolute",
		bottom: 5,
		width: 20,
		height: 1.5,
		backgroundColor: theme.tit
	},
	activetab: {
		color: theme.tit
	},
});



export {
	Globalstyles,
	handlelevelLeft, handlelevelTop,
	handlestarLeft, handlereplystarLeft,
	show_items, display,
	setContentFold,
	toCamelCase
};