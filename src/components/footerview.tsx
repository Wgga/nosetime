import React from "react";
import { View, Text, StyleSheet, TextInput, Keyboard, Animated, Pressable } from "react-native";

import LinearGradient from "react-native-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AvoidSoftInputView } from "react-native-avoid-softinput";

import events from "../hooks/events";

import theme from "../configs/theme";

function FooterView({ data, method, children }: any): React.JSX.Element {

	//控件
	const insets = useSafeAreaInsets();

	// 参数
	const { placeholder, replytext, style, opacity, zIndex, inputref, classname } = data;
	const { onChangeText, publish } = method;

	// 数据
	const [isfocus, setIsFocus] = React.useState(false); // 是否聚焦输入框

	React.useEffect(() => {
		Keyboard.addListener("keyboardDidShow", () => {
			setIsFocus(true);
			events.publish(classname + "isShowKeyboard", true);
		})
		Keyboard.addListener("keyboardDidHide", () => {
			setIsFocus(false);
			events.publish(classname + "isShowKeyboard", false);
		})

		return () => {
			Keyboard.removeAllListeners("keyboardDidShow");
			Keyboard.removeAllListeners("keyboardDidHide");
		}
	}, [])

	return (
		<Animated.View style={[styles.footer_container, zIndex && { zIndex }, opacity && { opacity }, style]}>
			<AvoidSoftInputView avoidOffset={10} showAnimationDuration={0} hideAnimationDuration={0} showAnimationDelay={0} hideAnimationDelay={0}>
				<View style={[styles.footer_con, { paddingBottom: insets.bottom + 10 }, isfocus && styles.footer_radius]}>
					<View style={styles.footer_con_left}>
						<TextInput ref={inputref}
							style={styles.footer_input}
							onChangeText={onChangeText}
							value={replytext}
							multiline={true}
							placeholder={placeholder} />
					</View>
					<View style={styles.footer_con_right}>
						{children}
						{isfocus && <Pressable onPress={publish}><LinearGradient style={styles.footer_publish}
							colors={["#81B4EC", "#9BA6F5"]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							locations={[0, 1]}
						>
							<Text style={styles.publish_text}>{"发布"}</Text>
						</LinearGradient></Pressable>}
					</View>
				</View>
			</AvoidSoftInputView>
		</Animated.View>
	);
}
const styles = StyleSheet.create({
	footer_container: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 13,
	},
	footer_radius: {
		borderTopRightRadius: 20,
		borderTopLeftRadius: 20,
		borderTopWidth: 0,
		overflow: "hidden",
		alignItems: "flex-end",
	},
	footer_con: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.toolbarbg,
		borderTopWidth: 1,
		borderTopColor: theme.bg,
		paddingTop: 15,
		paddingHorizontal: 24,
	},
	footer_con_left: {
		flex: 1,
		backgroundColor: theme.bg,
		borderRadius: 20,
		paddingLeft: 12,
		paddingRight: 5,
	},
	footer_input: {
		flex: 1,
		padding: 0,
		minHeight: 38,
		maxHeight: 70,
	},
	footer_con_right: {
		marginLeft: 20,
	},
	footer_publish: {
		paddingHorizontal: 16,
		height: 29,
		borderRadius: 20,
		marginBottom: 4,
		justifyContent: "center",
	},
	publish_text: {
		fontSize: 14,
		color: theme.toolbarbg,
	}
});
export default FooterView;