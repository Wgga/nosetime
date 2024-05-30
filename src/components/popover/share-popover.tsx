import React from "react";
import { View, Text, Pressable, NativeEventEmitter, StyleSheet, Dimensions } from "react-native";

import http from "../../utils/api/http";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import WX from "../../assets/svg/share/wx.svg";
import PYQ from "../../assets/svg/share/pyq.svg";
import WEIBO from "../../assets/svg/share/weibo.svg";
import QQ from "../../assets/svg/share/qq.svg";
import Link from "../../assets/svg/share/link.svg";
import Download from "../../assets/svg/share/download.svg";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

function SharePopover({ navigation }: any): React.JSX.Element {
	// 控件
	// 变量
	// 数据
	let sharelist = React.useRef<any[]>([
		{ id: 1, icon: <WX width={56 * 0.65} height={56 * 0.65} />, text: "微信好友" },
		{ id: 2, icon: <PYQ width={56 * 0.65} height={56 * 0.65} />, text: "朋友圈" },
		{ id: 3, icon: <WEIBO width={56 * 0.65} height={56 * 0.65} />, text: "微博" },
		// { id: 4, icon: <Link width={56 * 0.65} height={56 * 0.65} />, text: "复制链接" },
		// { id: 5, icon: <QQ width={56 * 0.65} height={56 * 0.65} />, text: "QQ" },
		// { id: 6, icon: <Download width={56 * 0.65} height={56 * 0.65} />, text: "下载" },
	])
	// 参数
	// 状态
	return (
		<View style={styles.share_con}>
			<Text style={styles.share_title}>{"分享至"}</Text>
			<View style={styles.share_item_con}>
				{sharelist.current.length > 0 && sharelist.current.map((item: any, index: number) => {
					return (
						<View key={item.id}>
							<Pressable style={styles.share_item}>
								<View style={styles.share_item_icon}>{item.icon}</View>
								<Text style={styles.share_item_text}>{item.text}</Text>
							</Pressable>
						</View>
					)
				})}
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	share_con: {
		backgroundColor: theme.bg,
		alignItems: "center",
		paddingBottom: 50,
	},
	share_title: {
		fontSize: 17,
		color: theme.tit2,
		marginTop: 27,
		fontWeight: "500",
		fontFamily: "PingFang SC",
	},
	share_item_con: {
		width: "100%",
		flexDirection: "row",
		paddingTop: 30,
		paddingHorizontal: 25,
		justifyContent: "space-around",
	},
	share_item: {
		alignItems: "center",
	},
	share_item_icon: {
		width: 56,
		height: 56,
		backgroundColor: theme.toolbarbg,
		borderRadius: 11,
		justifyContent: "center",
		alignItems: "center",
	},
	share_item_text: {
		marginTop: 11,
		fontSize: 12,
		color: theme.comment
	}
});
export default SharePopover;