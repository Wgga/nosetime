
import { View, Text, StyleSheet, Dimensions } from "react-native";

import { ShadowedView } from "react-native-fast-shadow";

import { ModalPortal } from "./modals";

import theme from "../configs/theme";

const { width, height } = Dimensions.get("window");


// 自定义Toast组件
class Toast {
	private toast_data: any = {
		message: "这是一个Toast组件",
		duration: 2000,
		position: "center",
		viewstyle: "medium_toast",
		key: "toast",
		onShow: () => { },
		onDismiss: () => { },
		onTouchOutside: null,
		hasOverlay: false,
		animationDuration: 300,
		modalStyle: { backgroundColor: "transparent" },
		containerStyle: {},
		textStyle: {},
	}

	show(toastdata: any) {
		let data: any = { ...Object.assign(this.toast_data, toastdata) };
		ModalPortal.show((
			<View style={styles.containerView}>
				{data.key == "loading_toast" && <View style={styles.toast_loading_wrapper}>
					<Text style={styles.toast_loading_text}>{data.message}</Text>
				</View>}
				{(data.key != "permission_toast" && data.key != "loading_toast") && <View style={[styles.toast_wrapper, data.viewstyle && styles[data.viewstyle]]}>
					<Text style={styles.toast_text}>{data.message}</Text>
				</View>}
				{data.key == "permission_toast" && <ShadowedView style={[styles.toast_permission_wrapper, data.containerStyle]}>
					<Text style={styles.toast_permission_text}>{data.message}</Text>
				</ShadowedView>}
			</View>
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
			hasOverlay: data.key == "loading_toast" ? true : data.hasOverlay,
			animationDuration: data.animationDuration,
			modalStyle: data.modalStyle,
			style: { justifyContent: data.position == "top" ? "flex-start" : "center" }
		})
		if (data.duration > 0) {
			setTimeout(() => {
				ModalPortal.dismiss(data.key);
			}, data.duration);
		}
		return data.key;
	}

	close(key: string) {
		if (key) {
			ModalPortal.dismiss(key);
		}
	}
}

const styles: any = StyleSheet.create({
	containerView: {
		alignItems: "center",
		justifyContent: "center",
	},
	toast_wrapper: {
		backgroundColor: "rgba(0,0,0,0.7)",
		borderRadius: 5,
		overflow: "hidden",
		padding: 15,
	},
	toast_loading_wrapper: {
		backgroundColor: "#F2F2F2",
		padding: 24,
		borderRadius: 2,
	},
	toast_loading_text: {
		color: "#262626",
		fontSize: 14,
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
	toast_permission_text: {
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