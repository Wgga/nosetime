
import { View, Text, StyleSheet, Dimensions } from "react-native";

import { ShadowedView } from "react-native-fast-shadow";

import { ModalPortal } from "./modals";

import theme from "../configs/theme";

const { width, height } = Dimensions.get("window");


// 自定义Toast组件
class Toast {
	private toast: any = null;
	private toast_data: any = {
		message: "这是一个Toast组件",
		duration: 2000,
		position: "center",
		viewstyle: "medium_toast",
		key: "toast",
		onShow: () => { },
		onDismiss: () => { },
		onTouchOutside: () => { },
		hasOverlay: false,
		animationDuration: 300,
		modalStyle: { backgroundColor: "transparent" },
		textStyle: {},
	}

	show(toastdata: any) {
		if (toastdata) {
			Object.assign(this.toast_data, toastdata);
		}
		this.toast = ModalPortal.show((
			<View style={styles.containerView}>
				{this.toast_data.key != "permission_toast" && <View style={[styles.toast_wrapper, this.toast_data.viewstyle && styles[this.toast_data.viewstyle]]}>
					<Text style={styles.toast_text}>{this.toast_data.message}</Text>
				</View>}
				{this.toast_data.key == "permission_toast" && <ShadowedView style={styles.toast_permission_wrapper}>
					<Text style={styles.toast_permission_text}>{this.toast_data.message}</Text>
				</ShadowedView>}
			</View>
		), {
			key: this.toast_data.key,
			width: width,
			height: 200,
			rounded: false,
			useNativeDriver: true,
			onShow: this.toast_data.onShow,
			onDismiss: () => {
				this.toast_data.onDismiss();
				this.toast = null;
			},
			onTouchOutside: this.toast_data.onTouchOutside,
			hasOverlay: this.toast_data.hasOverlay,
			animationDuration: this.toast_data.animationDuration,
			modalStyle: this.toast_data.modalStyle,
			style: { justifyContent: this.toast_data.position == "top" ? "flex-start" : "center" }
		})
		if (this.toast_data.duration > 0) {
			setTimeout(() => {
				ModalPortal.dismiss(this.toast_data.key);
				this.toast = null;
			}, this.toast_data.duration);
		}
		return this.toast;
	}

	close(key: string) {
		if (key) {
			ModalPortal.dismiss(key);
		}
	}
}

const styles: any = StyleSheet.create({
	containerView: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
	},
	toast_wrapper: {
		backgroundColor: "rgba(0,0,0,0.7)",
		borderRadius: 5,
		overflow: "hidden",
		padding: 15,
	},
	toast_permission_wrapper: {
		backgroundColor: theme.toolbarbg,
		paddingVertical: 14,
		paddingHorizontal: 16,
		marginHorizontal: 8,
		borderRadius: 5,
		shadowOpacity: 0.2,
		shadowRadius: 10,
		shadowOffset: {
			width: 0,
			height: 0,
		},
	},
	toast_permission_text:{
		color: theme.text2,
		fontSize: 16,
	},
	toast_text: {
		color: theme.toolbarbg,
		fontSize: 16,
		textAlign: "center",
	},
	short_toast: {
		//<=5字
		width: 160,
	},
	medium_toast: {
		//<=10字
		width: width * 0.6,
	},
	superior_toast: {
		//>10字<15字
		width: width * 0.7,
	},
	long_toast: {
		//>15字
		width: 360,
	}
})

const ToastCtrl = new Toast();
export default ToastCtrl;