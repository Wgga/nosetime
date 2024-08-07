import React from "react";
import { StyleSheet, Text, TouchableHighlight, View, Dimensions } from "react-native";

import { ModalPortal } from "../modals";

import theme from "../../configs/theme";

const { width, height } = Dimensions.get("window");

// 自定义Alert弹框
class Alert {
	private alert_data: any = {
		header: "",
		headstyle: {},
		key: "alert",
		message: "",
		isOnlybtn: false,
		buttons: [],
		btnbg: theme.text2,
		onShow: () => { },
		onDismiss: () => { },
		onTouchOutside: null,
		animationDuration: 300,
		modalStyle: { backgroundColor: "transparent" },
	}

	show(alertdata: any) {
		let data: any = { ...Object.assign(this.alert_data, alertdata) };
		ModalPortal.show((
			<View style={styles.containerView}>
				<View style={styles.alert_wrapper}>
					{(data.header || data.message) && <View>
						{data.header && <Text style={[
							styles.alert_head,
							data.message ? styles.alert_showmsg_head : styles.alert_hidemsg_head,
							data.headstyle && data.headstyle
						]}>{data.header}</Text>}
						{data.message && <Text style={styles.alert_message}>{data.message}</Text>}
					</View>}
					<View style={[
						styles.alert_button_group,
						!data.isOnlybtn && styles.button_top_border,
						data.isOnlybtn && styles.alert_only_button_group
					]}>
						{
							data.buttons && data.buttons.map((item: any, index: number) => {
								return (
									<TouchableHighlight key={index} style={[
										styles.alert_button,
										(!data.isOnlybtn && index == 1) && styles.button_left_border,
										(data.isOnlybtn && index >= 1) && styles.button_top_border,
										data.isOnlybtn && styles.alert_only_button
									]}
										onPress={() => {
											data.btnbg = theme.text2;
											item.handler();
										}}
										onShowUnderlay={() => {
											data.btnbg = theme.tit;
										}}
										underlayColor="rgba(0,0,0,.1)">
										<Text style={[{ color: data.btnbg }, styles.alert_button_inner]}>{item.text}</Text>
									</TouchableHighlight>
								)
							})
						}
					</View>
				</View>
			</View >
		), {
			key: data.key,
			width: width,
			rounded: false,
			useNativeDriver: true,
			onShow: data.onShow,
			onDismiss: () => { data.onDismiss() },
			onTouchOutside: data.onTouchOutside ? data.onTouchOutside : () => { this.close(data.key) },
			onHardwareBackPress: () => {
				this.close(data.key);
				return true;
			},
			animationDuration: data.animationDuration,
			modalStyle: data.modalStyle,
		})
	}

	close(key: string) {
		if (key) {
			ModalPortal.dismiss(key);
		}
	}
}

const styles = StyleSheet.create({
	containerView: {
		alignItems: "center",
		justifyContent: "center",
	},
	alert_wrapper: {
		backgroundColor: theme.toolbarbg,
		borderRadius: 15,
		overflow: "hidden",
		width: 250,
	},
	alert_hidemsg_head: {
		paddingBottom: 35,
	},
	alert_showmsg_head: {
		paddingBottom: 20,
	},
	alert_head: {
		width: "100%",
		textAlign: "center",
		paddingLeft: 20,
		paddingTop: 35,
		paddingRight: 20,
		fontSize: 16,
		fontWeight: "500",
		color: theme.text2
	},
	alert_message: {
		paddingBottom: 16,
		paddingLeft: 19,
		paddingRight: 19,
		textAlign: "center",
		fontSize: 14,
		color: theme.comment,
	},
	alert_button_group: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
	},
	button_top_border: {
		borderTopWidth: 1,
		borderTopColor: "rgba(224,224,224, 0.3333)"
	},
	button_left_border: {
		borderLeftWidth: 1,
		borderLeftColor: "rgba(224,224,224, 0.3333)",
	},
	alert_button: {
		flex: 1,
		height: 44,
	},
	alert_button_inner: {
		width: "100%",
		height: "100%",
		lineHeight: 44,
		textAlign: "center",
		fontSize: 15,
	},
	alert_only_button_group: {
		flexDirection: "column",
	},
	alert_only_button: {
		width: "100%",
		flex: 0,
	},
})

const AlertCtrl = new Alert();
export default AlertCtrl;