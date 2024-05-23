
import { View, Text, BackHandler, StatusBar, StyleSheet, Dimensions } from "react-native";

import { ModalPortal } from "./modals";
import theme from "../configs/theme";


const { width, height } = Dimensions.get("window");


class Toast {
	private toast: any = null;
	private toast_data: any = {
		message: "这是一个Toast组件",
		duration: 2000,
		viewstyle: "medium_toast",
		key: "toast",
		onShow: () => { },
		onDismiss: () => { },
		onTouchOutside: () => { },
		hasOverlay: false,
		animationDuration: 300,
		modalStyle: { backgroundColor: "transparent" },
	}

	show(toastdata: any) {
		if (toastdata) {
			Object.assign(this.toast_data, toastdata);
		}
		this.toast = ModalPortal.show((
			<View style={styles.containerView}>
				<View style={[styles.toast_wrapper, styles[this.toast_data.viewstyle]]}>
					<Text style={styles.toast_text}>{this.toast_data.message}</Text>
				</View>
			</View>
		), {
			key: this.toast_data.key,
			width: width,
			height: height,
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
		})
		if (this.toast_data.duration > 0) {
			setTimeout(() => {
				ModalPortal.dismiss(this.toast_data.key);
				this.toast = null;
			}, this.toast_data.duration);
		}
		return this.toast;
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