import React from "react";
import { View, Text, Pressable, StyleSheet, Dimensions } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { CameraRoll } from "@react-native-camera-roll/camera-roll";

import permissionService from "../../services/permission-service/permission-service";

import http from "../../utils/api/http";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import WX from "../../assets/svg/share/wx.svg";
import PYQ from "../../assets/svg/share/pyq.svg";
import WEIBO from "../../assets/svg/share/weibo.svg";
import QQ from "../../assets/svg/share/qq.svg";
import Link from "../../assets/svg/share/link.svg";
import Download from "../../assets/svg/share/download.svg";
import ToastCtrl from "../toastctrl";

const { width, height } = Dimensions.get("window");

function SharePopover({ data = {} }: any): React.JSX.Element {
	// 控件
	const insets = useSafeAreaInsets();
	// 变量
	// 数据
	let sharelist = React.useRef<any[]>([
		{ id: 1, icon: <WX width={56 * 0.65} height={56 * 0.65} />, text: "微信好友" },
		{ id: 2, icon: <PYQ width={56 * 0.65} height={56 * 0.65} />, text: "朋友圈" },
		{ id: 3, icon: <WEIBO width={56 * 0.65} height={56 * 0.65} />, text: "微博" },
		// { id: 4, icon: <Link width={56 * 0.65} height={56 * 0.65} />, text: "复制链接" },
		// { id: 5, icon: <QQ width={56 * 0.65} height={56 * 0.65} />, text: "QQ" },
		{ id: 6, icon: <Download width={56 * 0.65} height={56 * 0.65} />, text: "保存到相册" },
	])
	// 参数
	const { uri, containerStyle } = data;
	// 状态

	const clickbtn = async (item: any) => {
		if (item.id == 6) {
			if (!(await permissionService.checkPermission("write", { marginTop: insets.top }))) return;
			CameraRoll.saveAsset(uri, { type: "photo" }).then((data: any) => {
				ToastCtrl.show({ message: "保存成功", duration: 1000, viewstyle: "short_toast", key: "save_success_toast" });
			}).catch((err: any) => {
				ToastCtrl.show({ message: "保存失败", duration: 1000, viewstyle: "short_toast", key: "save_error_toast" });
			})
		}
	}

	return (
		<View style={[styles.share_con, containerStyle]}>
			<Text style={styles.share_title}>{"分享至"}</Text>
			<View style={styles.share_item_con}>
				{sharelist.current.length > 0 && sharelist.current.map((item: any, index: number) => {
					return (
						<View key={item.id}>
							<Pressable style={styles.share_item} onPress={() => { clickbtn(item) }}>
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