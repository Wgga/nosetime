import React from "react";
import {
	Modal,
	StyleSheet,
	Text,
	TouchableHighlight,
	View,
	AppRegistry,
	Pressable
} from "react-native";

import theme from "../configs/theme";

/**
 * 自定义Alert弹框
 *
 * @param {Boolean} show - 控制Alert是否显示
 * @param {Function} close - 关闭Alert的方法
 * @param {any} alertdata - 要显示的弹窗数据
 * @param {Element} children - 类似插槽 自定义组件(待定)
 */

let alertCtrlInstance: AlertCtrl | undefined = undefined;

class AlertCtrl extends React.Component {

	constructor(props: any) {
		super(props);
		alertCtrlInstance = this;
	}

	public readonly state: any = {
		visible: false,
		header: "这是一个Alert组件",
		message: "这是Alert组件的一串描述",
		buttons: [],
		btnbg: theme.text2
	};

	public static show = (props: any) => {
		alertCtrlInstance!.setState({ ...props, visible: true });
	}

	public static close = () => {
		alertCtrlInstance!.setState({ visible: false });
	}

	public render() {
		const { visible, header, message, buttons }: any = this.state;
		return (
			visible && (
				<Modal
					animationType="fade"
					visible={true}
					transparent
					statusBarTranslucent
					presentationStyle="overFullScreen"
					onRequestClose={() => {
						AlertCtrl.close();
					}}
				>
					<Pressable style={{ flex: 1 }} onPress={(e) => { AlertCtrl.close(); }}>
						<View style={styles.containerView}>
							<Pressable onPress={(e) => { e.stopPropagation() }}>
								<View style={styles.alert_wrapper}>
									<View>
										{header && <Text style={[styles.alert_head, message ? styles.alert_showmsg_head : styles.alert_hidemsg_head]}>{header}</Text>}
										{message && <Text style={styles.alert_message}>{message}</Text>}
									</View>
									<View style={styles.alert_button_group}>
										{
											buttons && buttons.map((item: any, index: number) => {
												return (
													<TouchableHighlight key={index} style={styles.alert_button}
														onPress={() => {
															this.setState({ ...this.state, btnbg: theme.text2 });
															item.handler();
														}}
														onShowUnderlay={() => {
															this.setState({ ...this.state, btnbg: theme.tit });
														}}
														underlayColor="rgba(0,0,0,.1)">
														<Text style={[{ color: this.state.btnbg }, styles.alert_button_inner]}>{item.text}</Text>
													</TouchableHighlight>
												)
											})
										}
									</View>
								</View>
							</Pressable>
						</View>
					</Pressable>
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
				<AlertCtrl />
			</View>
		);
	};

	return registerComponentOld(appKey, createRootApp);
};

const styles = StyleSheet.create({
	container: {
		position: "relative",
		flex: 1,
	},
	containerView: {
		flex: 1,
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,.5)",
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
		borderTopColor: "#F5F5F5"
	},
	alert_button: {
		width: "100%",
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

export default AlertCtrl;