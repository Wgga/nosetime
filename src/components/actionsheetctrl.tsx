import React from "react";
import { StyleSheet, Text, TouchableHighlight, View, Pressable, Dimensions } from "react-native";

import { ModalPortal, SlideAnimation } from "./modals";

import theme from "../configs/theme";

const { width, height } = Dimensions.get("window");

// 自定义Alert弹框
class ActionSheet {
	private action_sheet_data: any = {
		key: "action_sheet",
		buttons: [],
		btnbg: theme.text2,
		onShow: () => { },
		onDismiss: () => { },
		onTouchOutside: () => { },
		animationDuration: 300,
		modalStyle: { backgroundColor: "transparent" },
	}

	show(actionsheetdata: any) {
		if (actionsheetdata) {
			Object.assign(this.action_sheet_data, actionsheetdata);
		}
		ModalPortal.show((
			<View style={styles.containerView}>
				<View style={styles.action_sheet_wrapper}>
					<View style={styles.action_sheet_button_group}>
						{
							this.action_sheet_data.buttons && this.action_sheet_data.buttons.map((item: any, index: number) => {
								return (
									<TouchableHighlight key={index} style={[
										styles.action_sheet_button,
										index == 0 && styles.action_sheet_button1,
										index == 1 && styles.action_sheet_button2,
										index == 2 && styles.action_sheet_button3,
									]}
										onPress={item.handler}
										underlayColor="rgba(255,255,255,0.8)">
										<Text style={[
											styles.action_sheet_button_inner,
											item.style,
											index == 2 ? styles.button_color_tit : styles.button_color_tit2
										]}>{item.text}</Text>
									</TouchableHighlight>
								)
							})
						}
					</View>
				</View>
			</View>
		), {
			key: this.action_sheet_data.key,
			width: width,
			height: (57 + 10) * this.action_sheet_data.buttons.length,
			rounded: false,
			useNativeDriver: true,
			modalAnimation: new SlideAnimation({
				initialValue: 0,
				slideFrom: "bottom",
				useNativeDriver: true,
			}),
			swipeDirection: "down",
			type: "bottomModal",
			onShow: this.action_sheet_data.onShow,
			onDismiss: () => {
				this.action_sheet_data.onDismiss();
			},
			onTouchOutside: this.action_sheet_data.onTouchOutside,
			animationDuration: this.action_sheet_data.animationDuration,
			modalStyle: this.action_sheet_data.modalStyle,
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
		justifyContent: "flex-end",
	},
	action_sheet_wrapper: {
		width: width,
		paddingHorizontal: 10,
	},
	action_sheet_button_group: {
		padding: 8,
	},
	action_sheet_button: {
		height: 57,
		backgroundColor: "#fff",
		overflow: "hidden",
	},
	action_sheet_button1: {
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
	},
	action_sheet_button2: {
		borderBottomLeftRadius: 12,
		borderBottomRightRadius: 12,
		borderTopWidth: 1,
		borderTopColor: "#f5f5f5",
	},
	action_sheet_button3: {
		borderRadius: 12,
		marginVertical: 5,
	},
	action_sheet_button_inner: {
		width: "100%",
		height: "100%",
		lineHeight: 57,
		textAlign: "center",
		fontSize: 15,
	},
	button_color_tit: {
		color: theme.tit,
	},
	button_color_tit2: {
		color: theme.tit2,
	},
})

const ActionSheetCtrl = new ActionSheet();
export default ActionSheetCtrl;