import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";

import LinearGradient from "react-native-linear-gradient";

import theme from "../configs/theme";

function LinearButton({ text, onPress, containerStyle, colors, colors2 }: any): React.JSX.Element {
	// 控件
	// 变量
	// 数据
	// 参数
	// 状态
	return (
		<View style={containerStyle}>
			<Pressable onPress={onPress} style={styles.btn}>
				<LinearGradient
					colors={colors ? colors : ["#81B4EC", "#9BA6F5"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					locations={[0, 1]}
					style={[styles.btn_bg, { zIndex: 1, transform: [{ translateY: -2 }, { translateX: -2 }] }]}
				/>
				<LinearGradient
					colors={colors2 ? colors2 : ["#61A2E9", "#95A0EB"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					locations={[0, 1]}
					style={styles.btn_bg}
				/>
				<Text style={styles.btn_text}>{text}</Text>
			</Pressable>
		</View>

	);
}
const styles = StyleSheet.create({
	btn: {
		padding: 12,
		borderRadius: 30,
		overflow: "hidden",
		alignItems: "center",
	},
	btn_text: {
		fontSize: 16,
		color: theme.toolbarbg,
		zIndex: 2,
	},
	btn_bg: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 30,
		zIndex: 0,
	},
});

export default LinearButton;