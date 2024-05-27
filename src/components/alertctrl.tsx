import React from "react";
import { StyleSheet, Text, TouchableHighlight, View, Pressable, Dimensions, TextInput } from "react-native";

import { ModalPortal } from "./modals";

import theme from "../configs/theme";

const { width, height } = Dimensions.get("window");

// 自定义Alert弹框
class Alert {
	private alert_data: any = {
		header: "这是一个Alert组件",
		headstyle: {},
		key: "alert",
		message: "这是Alert组件的一串描述",
		buttons: [],
		btnbg: theme.text2,
		onShow: () => { },
		onDismiss: () => { },
		onTouchOutside: () => { },
		animationDuration: 300,
		modalStyle: { backgroundColor: "transparent" },
	}

	show(alertdata: any) {
		if (alertdata) {
			Object.assign(this.alert_data, alertdata);
		}
		ModalPortal.show((
			<View style={styles.containerView}>
				<View style={styles.alert_wrapper}>
					<View>
						{this.alert_data.header && <Text style={[
							styles.alert_head,
							this.alert_data.message ? styles.alert_showmsg_head : styles.alert_hidemsg_head,
							this.alert_data.headstyle && this.alert_data.headstyle
						]}>{this.alert_data.header}</Text>}
						{this.alert_data.message && <Text style={styles.alert_message}>{this.alert_data.message}</Text>}
					</View>
					<View style={styles.alert_button_group}>
						{
							this.alert_data.buttons && this.alert_data.buttons.map((item: any, index: number) => {
								return (
									<TouchableHighlight key={index} style={[styles.alert_button, index == 1 && {
										borderLeftWidth: 1,
										borderLeftColor: "rgba(224,224,224,0.3333)",
									}]}
										onPress={() => {
											this.alert_data.btnbg = theme.text2;
											item.handler();
										}}
										onShowUnderlay={() => {
											this.alert_data.btnbg = theme.tit;
										}}
										underlayColor="rgba(0,0,0,.1)">
										<Text style={[{ color: this.alert_data.btnbg }, styles.alert_button_inner]}>{item.text}</Text>
									</TouchableHighlight>
								)
							})
						}
					</View>
				</View>
			</View>
		), {
			key: this.alert_data.key,
			width: width,
			height: 200,
			rounded: false,
			useNativeDriver: true,
			onShow: this.alert_data.onShow,
			onDismiss: () => {
				this.alert_data.onDismiss();
			},
			onTouchOutside: this.alert_data.onTouchOutside,
			animationDuration: this.alert_data.animationDuration,
			modalStyle: this.alert_data.modalStyle,
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
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	alert_wrapper: {
		backgroundColor: "#fff",
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
		borderTopWidth: 1,
		borderTopColor: "rgba(224,224,224,0.3333)"
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
})

const AlertCtrl = new Alert();
export default AlertCtrl;