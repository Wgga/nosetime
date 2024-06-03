import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, BackHandler } from "react-native";

import { ModalPortal, SlideAnimation } from "../../components/modals";
import ProtocolPopover from "../../components/popover/protocol-popover";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

function HomeProtocolPopover({ method }: any): React.JSX.Element {
	// 控件
	// 变量
	// 数据
	// 参数
	const { lowPrice } = method;
	// 状态

	// 打开协议弹窗
	const openProtocol = (params: any) => {
		ModalPortal.show((
			<ProtocolPopover modalparams={params} />
		), {
			key: params.modalkey,
			width,
			height,
			rounded: false,
			useNativeDriver: true,
			modalAnimation: new SlideAnimation({
				initialValue: 0,
				slideFrom: "bottom",
				useNativeDriver: true,
			}),
			onTouchOutside: () => { },
			swipeDirection: "down",
			animationDuration: 300,
			type: "bottomModal",
		})
	}

	return (
		<View style={styles.protocol_con}>
			<Text style={styles.protocol_title}>{"使用协议与隐私政策"}</Text>
			<View style={styles.protocol_message}>
				<Text style={styles.message_text}>{"为更好的提供个性推荐、发布信息、购买商品、交流沟通等相关服务，我们会根据您使用服务的具体功能需要，收集您的设备信息、操作日志等个人信息。您可以在手机“设置”中查看、变更、删除个人信息并管理您的授权。"}</Text>
				<View style={styles.message_text_con}>
					<Text style={styles.message_text}>{"您可以阅读"}</Text>
					<Pressable onPress={() => {
						openProtocol({ type: "protocol", title: "香水时代使用协议", modalkey: "protocol_popover" });
					}}>
						<Text style={styles.message_btn}>{"《使用协议》"}</Text>
					</Pressable>
					<Text style={styles.message_text}>{"和"}</Text>
					<Pressable onPress={() => {
						openProtocol({ type: "privacy", title: "香水时代隐私政策", modalkey: "privacy_popover" });
					}}>
						<Text style={styles.message_btn}>{"《隐私政策》"}</Text>
					</Pressable>
				</View>
				<Text style={styles.message_text}>{"了解详细信息。如您同意，请点击“同意”开始接受我的服务。"}</Text>
			</View>
			<View style={styles.protocol_button}>
				<Pressable style={{ flex: 1 }} onPress={() => { BackHandler.exitApp() }}>
					<Text style={[styles.button_text, styles.btn1]}>{"暂不使用"}</Text>
				</Pressable>
				<Pressable style={{ flex: 1 }} onPress={() => {
					ModalPortal.dismiss("home_protocol_popover");
					cache.saveItem("showProtocol", true, 3650 * 86400);
					events.emit("can_push", true);
					lowPrice();
				}}>
					<Text style={[styles.button_text, styles.btn2]}>{"同意"}</Text>
				</Pressable>
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	protocol_con: {
		alignItems: "center",
		backgroundColor: theme.toolbarbg
	},
	protocol_title: {
		paddingTop: 25,
		paddingHorizontal: 10,
		fontSize: 18,
		color: theme.text2,
		fontWeight: "bold",
	},
	protocol_message: {
		paddingTop: 15,
		paddingHorizontal: 25,
		paddingBottom: 25,
	},
	message_text_con: {
		flexDirection: "row",
	},
	message_text: {
		fontSize: 13,
		color: theme.tit2,
		lineHeight: 22,
	},
	message_btn: {
		fontSize: 13,
		lineHeight: 22,
		color: theme.tit,
	},
	protocol_button: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		borderTopWidth: 0.5,
		borderTopColor: "rgba(224,224,224,0.3333)",
	},
	button_text: {
		textAlign: "center",
		fontSize: 15,
		color: theme.tit2,
		fontWeight: "500",
		padding: 10,
	},
	btn1: {
		borderRightWidth: 0.5,
		borderRightColor: "rgba(224,224,224,0.3333)",
	},
	btn2: {
		color: theme.tit,
	}
});
export default HomeProtocolPopover;