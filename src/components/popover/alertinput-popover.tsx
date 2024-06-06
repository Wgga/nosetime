import React from "react";
import { StyleSheet, Text, TouchableHighlight, View, Pressable, Dimensions, TextInput } from "react-native";

import theme from "../../configs/theme";

const { width, height } = Dimensions.get("window");

// 自定义AlertInput弹框
const AlertInputPopover = React.memo(({ data }: any) => {

	const [isrender, setIsRender] = React.useState(false); // 是否渲染
	const alert_data = React.useRef<any>({
		header: "这是一个AlertInput组件",
		headstyle: {},
		message: "这是AlertInput组件的一串描述",
		inputs: [],
		buttons: [],
		btnbg: theme.text2,
	})

	React.useEffect(() => {
		if (data) {
			Object.assign(alert_data.current, data);
			setIsRender(val => !val);
		}
	}, [])

	return (
		<View style={styles.containerView}>
			<View style={styles.alert_wrapper}>
				<View>
					{alert_data.current.header && <Text style={styles.alert_head}>{alert_data.current.header}</Text>}
					{alert_data.current.message && <Text style={styles.alert_message}>{alert_data.current.message}</Text>}
				</View>
				{(alert_data.current.inputs && alert_data.current.inputs.length > 0) && <View style={styles.alert_input_group}>
					{alert_data.current.inputs.map((item: any, index: number) => {
						return (
							<View key={item.type} style={styles.alert_input}>
								<TextInput style={styles.input}
									value={item.value}
									onChangeText={(e) => {
										item.value = e;
										item.onChangeText(e);
										setIsRender(val => !val);
									}}
									placeholder={item.placeholder}
									placeholderTextColor={theme.placeholder}
									secureTextEntry={item.type == "password"}
								/>
							</View>
						)
					})}
				</View>}
				<View style={styles.alert_button_group}>
					{
						alert_data.current.buttons && alert_data.current.buttons.map((item: any, index: number) => {
							return (
								<TouchableHighlight key={index} style={[styles.alert_button, index == 1 && {
									borderLeftWidth: 1,
									borderLeftColor: "rgba(224,224,224,0.3333)",
								}]}
									onPress={() => {
										alert_data.current.btnbg = theme.text2;
										console.log("%c Line:65 🥥 item", "color:#2eafb0", item.handler());
										item.handler();
									}}
									onShowUnderlay={() => {
										alert_data.current.btnbg = theme.tit;
									}}
									underlayColor="rgba(0,0,0,.1)">
									<Text style={[{ color: alert_data.current.btnbg }, styles.alert_button_inner]}>{item.text}</Text>
								</TouchableHighlight>
							)
						})
					}
				</View>
			</View>
		</View>
	)
})

const styles = StyleSheet.create({
	containerView: {
		alignItems: "center",
		justifyContent: "center",
	},
	alert_wrapper: {
		backgroundColor: "#fff",
		borderRadius: 15,
		overflow: "hidden",
		width: 250,
	},
	alert_head: {
		width: "100%",
		textAlign: "center",
		padding: 20,
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
	alert_input_group: {
		paddingBottom: 21,
		paddingHorizontal: 16,
	},
	alert_input: {
		backgroundColor: "rgba(224,224,224,0.3333)",
		padding: 6,
		borderRadius: 4,
		overflow: "hidden",
	},
	input: {
		fontSize: 14,
		color: theme.text2,
		padding: 0,
		margin: 0,
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

export default AlertInputPopover;