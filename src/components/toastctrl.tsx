import React from "react";
import {
	Modal,
	StyleSheet,
	Text,
	View,
	AppRegistry,
	Dimensions
} from "react-native";

import theme from "../configs/theme";

/**
 * 自定义toast弹框
 *
 * @param {Boolean} show - 控制toast是否显示
 * @param {Function} close - 关闭toast的方法
 * @param {any} toastdata - 要显示的toast数据
 * @param {Element} children - 类似插槽 自定义组件(待定)
 */

let toastCtrlInstance: ToastCtrl | undefined = undefined;
const { width, height } = Dimensions.get("window");
class ToastCtrl extends React.Component {

	constructor(props: any) {
		super(props);
		toastCtrlInstance = this;
	}

	public readonly state: any = {
		visible: false,
		message: "这是一个Toast组件",
		timer: null,
		duration: 2000,
		btnbg: theme.text2,
		viewstyle: "medium_toast"
	};

	public static show = (props: any) => {
		toastCtrlInstance!.setState({ ...props, visible: true });
		if (toastCtrlInstance!.state.timer) {
			clearTimeout(toastCtrlInstance!.state.timer);
			toastCtrlInstance!.state.timer = null;
		}
		toastCtrlInstance!.state.timer = setTimeout(() => {
			toastCtrlInstance!.setState({ visible: false });
		}, toastCtrlInstance!.state.duration);
	}

	public render() {
		const { visible, message }: any = this.state;
		return (
			visible && (
				<Modal
					animationType="fade"
					visible={true}
					transparent
					statusBarTranslucent
					presentationStyle="overFullScreen"
				>
					<View style={styles.containerView}>
						<View style={[styles.toast_wrapper,styles[this.state.viewstyle]]}>
							<Text style={styles.toast_text}>{message}</Text>
						</View>
					</View>
				</Modal>
			)
		)
	}
}

const registerComponentOld = AppRegistry.registerComponent;

AppRegistry.registerComponent = (appKey, component) => {
	const createRootApp = () => {
		const OriginAppComponent = component(); // 获取原来的App根组件

		return () => (
			<View style={styles.container}>
				<OriginAppComponent />
				<ToastCtrl />
			</View>
		);
	};

	return registerComponentOld(appKey, createRootApp);
};

const styles: any = StyleSheet.create({
	container: {
		position: "relative",
		flex: 1,
	},
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

export default ToastCtrl;