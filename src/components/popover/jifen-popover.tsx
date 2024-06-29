import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, TouchableHighlight } from "react-native";

import { ModalPortal, SlideAnimation } from "../../components/modals";
import ProtocolPopover from "../../components/popover/protocol-popover";

import theme from "../../configs/theme";

const { width, height } = Dimensions.get("window");

function ExchangePopover({ params }: any): React.JSX.Element {
	// 控件
	// 变量
	// 数据
	const [data, setData] = React.useState<any>({});
	// 参数
	// 状态

	React.useEffect(() => {
		setData(params);
	}, [])

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
			onTouchOutside: () => { },
			onHardwareBackPress: () => {
				ModalPortal.dismiss(params.modalkey);
				return true;
			},
			animationDuration: 300,
			type: "bottomModal",
		})
	}

	return (
		<View style={styles.exchange_container}>
			<View style={styles.exchange_con}>
				<Text style={styles.exchange_title}>{data.title}</Text>
				<View style={styles.exchange_message_con}>
					<Text style={styles.exchange_message}>{data.message}</Text>
					<View style={styles.exchange_btn}>
						<Text style={styles.btn_text}>{"确认兑换视为同意"}</Text>
						<Pressable onPress={() => {
							openProtocol({ type: "jfrule", title: "积分规则", modalkey: "jfrule_popover" });
						}}>
							<Text style={styles.item_text_link}>{"《积分规则》"}</Text>
						</Pressable>
					</View>
				</View>
				<View style={styles.button_group}>
					{
						data.buttons && data.buttons.map((item: any, index: number) => {
							return (
								<TouchableHighlight key={index} style={[styles.button, index == 1 && {
									borderLeftWidth: 1,
									borderLeftColor: "rgba(224,224,224,0.3333)",
								}]}
									onPress={() => {
										data.btnbg = theme.text2;
										item.handler();
									}}
									onShowUnderlay={() => {
										data.btnbg = theme.tit;
									}}
									underlayColor="rgba(0,0,0,.1)">
									<Text style={[{ color: data.btnbg }, styles.button_inner]}>{item.text}</Text>
								</TouchableHighlight>
							)
						})
					}
				</View>
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	exchange_container: {
		alignItems: "center",
	},
	exchange_con: {
		borderRadius: 15,
		overflow: "hidden",
		width: 250,
		alignItems: "center",
		backgroundColor: theme.toolbarbg
	},
	exchange_title: {
		fontSize: 16,
		fontFamily: "PingFang SC",
		fontWeight: "500",
		color: theme.text2,
		paddingVertical: 20,
	},
	exchange_message_con: {
		paddingHorizontal: 19,
		paddingBottom: 16,
		alignItems: "center",
	},
	exchange_message: {
		fontSize: 14,
		color: theme.comment,
		marginBottom: 5,
		textAlign: "center",
	},
	exchange_btn: {
		flexDirection: "row",
		alignItems: "center",
	},
	btn_text: {
		fontSize: 14,
		color: theme.comment,
	},
	item_text_link: {
		fontSize: 14,
		color: theme.tit,
	},
	button_group: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		borderTopWidth: 1,
		borderTopColor: "rgba(224,224,224,0.3333)"
	},
	button: {
		flex: 1,
		height: 44,
	},
	button_inner: {
		width: "100%",
		height: "100%",
		lineHeight: 44,
		textAlign: "center",
		fontSize: 15,
		color: theme.text2,
	},
});
export default ExchangePopover;