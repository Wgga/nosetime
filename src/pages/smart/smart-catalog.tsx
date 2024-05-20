import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, Image } from "react-native";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get('window');
const events = new NativeEventEmitter();

console.log("%c Line:14 🍌 width, height", "color:#7f2b82", width, height);
function SmartCatalog({ navigation }: any): React.JSX.Element {
	// 控件
	// 变量
	// 数据
	// 参数
	// 状态
	return (
		<View style={styles.catalog_con}>
			<View style={styles.catalog_top_con}>
				<View style={styles.ranking_top}>
					<Image style={styles.tradepic}
						source={require("../../assets/images/catalog/tradepic.jpg")}
					/>
					<Text>{"商业香排行榜"}</Text>
					<Text>{"TOP200"}</Text>
				</View>
				<View style={styles.ranking_btm}>
					<View style={[styles.ranking_btm_con, { marginRight: 5 }]}>
						<Image style={styles.salonpic}
							source={require("../../assets/images/catalog/salonpic.jpg")}
						/>
						<Text>{"沙龙香排行榜"}</Text>
						<Text>{"TOP200"}</Text>
					</View>
					<View style={[styles.ranking_btm_con, { marginLeft: 5 }]}>
						<View style={[styles.btm_right_con, { marginBottom: 5 }]}>
							<Image style={[styles.btm_right_img, styles.recentpic]}
								source={require("../../assets/images/catalog/recentpic.jpg")}
							/>
							<Text>{"新香排行榜"}</Text>
						</View>
						<View style={[styles.btm_right_con, { marginTop: 5 }]}>
							<Image style={[styles.btm_right_img, styles.affordablepic]}
								source={require("../../assets/images/catalog/affordablepic.jpg")}
							/>
							<Text>{"平价排行榜"}</Text>
						</View>
					</View>
				</View>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	catalog_con: {
		flex: 1,
		backgroundColor: theme.toolbarbg
	},
	catalog_top_con: {
		paddingHorizontal: 20,
	},
	ranking_top: {
		width: width - 40,
		height: 167,
		borderRadius: 4,
		overflow: "hidden",
		marginBottom: 10,
		justifyContent: "flex-end",
	},
	tradepic: {
		position: "absolute",
		width: "100%",
		height: (width - 40) / 750 * 532,
		top: -(167 * 0.12),
	},
	ranking_btm: {
		height: 199,
		flexDirection: "row",
	},
	ranking_btm_con: {
		width: (width - 40 - 10) / 2,
		height: "100%",
		borderRadius: 4,
		overflow: "hidden",
		justifyContent: "flex-end",
	},
	salonpic: {
		position: "absolute",
		width: 199 / 532 * 750,
		height: "100%",
		left: -((199 / 532 * 750) * 0.13),
	},
	btm_right_con: {
		width: (width - 40 - 10) / 2,
		height: (199 - 10) / 2,
		borderRadius: 4,
		overflow: "hidden",
		justifyContent: "flex-end",
	},
	btm_right_img: {
		position: "absolute",
		width: "100%",
		height: ((width - 40 - 10) / 2) / 750 * 532,
	},
	recentpic:{
		top: -(((199 - 10) / 2) * 0.06),
	},
	affordablepic: {
		top: -(((199 - 10) / 2) * 0.22),
	},
});

export default SmartCatalog;