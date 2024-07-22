import React from "react";
import { StyleSheet, Text, TouchableHighlight, View, Dimensions } from "react-native";

import { ModalPortal } from "../modals";

import theme from "../../configs/theme";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

// 自定义Alert弹框
class ActionSheet {
	private action_sheet_data: any = {
		key: "action_sheet",
		buttons: [],
		btnbg: theme.text2,
		onShow: () => { },
		onDismiss: () => { },
		onTouchOutside: null,
		animationDuration: 300,
		modalStyle: { backgroundColor: "transparent" },
	}

	show(actionsheetdata: any) {
		let data: any = { ...Object.assign(this.action_sheet_data, actionsheetdata) };

		ModalPortal.show((
			<View style={styles.containerView}>
				<View style={styles.action_sheet_wrapper}>
					<View style={styles.action_sheet_button_group}>
						{data.buttons && data.buttons.map((item: any, index: number) => {
							return (
								<TouchableHighlight key={index} style={[
									styles.action_sheet_button,
									index == 0 && styles.action_sheet_button1,
									index == (data.buttons.some((item: any) => item.text == "取消") ? (data.buttons.length - 2) : (data.buttons.length - 1)) && styles.action_sheet_button2,
									item.text == "取消" && styles.action_sheet_cancel_button,
								]} onPress={item.handler} underlayColor="rgba(255,255,255,0.8)">
									<View style={[styles.action_sheet_button_text_con, !item.text2 && { justifyContent: "center" }]}>
										{item.icon && <Icon name={item.icon.name}
											size={item.icon.size ? item.icon.size : data.icon?.size ? data.icon.size : 20}
											color={item.icon.color ? item.icon.color : data.icon?.color ? data.icon.color : theme.tit2}
											style={{ marginRight: 5 }}
										/>}
										<Text style={[styles.action_sheet_button_inner, data.textStyle, item.style]}>{item.text}</Text>
										{item.text2 && <Text style={[styles.action_sheet_button_inner, data.textStyle, item.style, item.style2]}>{item.text2}</Text>}
									</View>
								</TouchableHighlight>
							)
						})}
					</View>
				</View>
			</View>
		), {
			key: data.key,
			width: width,
			rounded: false,
			useNativeDriver: true,
			type: "bottomModal",
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
		if (key) ModalPortal.dismiss(key);
	}
}

const styles = StyleSheet.create({
	containerView: {
		alignItems: "center",
		justifyContent: "flex-end",
	},
	action_sheet_wrapper: {
		width: width,
		paddingHorizontal: 10,
	},
	action_sheet_button_group: {
		padding: 8
	},
	action_sheet_button: {
		backgroundColor: theme.toolbarbg,
		overflow: "hidden",
		borderTopWidth: 1,
		borderTopColor: theme.bg,
	},
	action_sheet_button1: {
		borderTopLeftRadius: 12,
		borderTopRightRadius: 12,
		borderRadius: 0,
		borderTopWidth: 0,
	},
	action_sheet_button2: {
		borderBottomLeftRadius: 12,
		borderBottomRightRadius: 12,
		borderRadius: 0,
	},
	action_sheet_cancel_button: {
		borderRadius: 12,
		marginVertical: 5,
	},
	action_sheet_button_inner: {
		fontSize: 15,
	},
	action_sheet_button_text_con: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		padding: 18
	}
})

const ActionSheetCtrl = new ActionSheet();
export default ActionSheetCtrl;