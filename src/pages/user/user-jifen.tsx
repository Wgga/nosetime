import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions } from "react-native";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

function UserJifen({ navigation }: any): React.JSX.Element {
	// 控件
	// 变量
	// 数据
	// 参数
	// 状态
	return (
		<View style={{ flex: 1, backgroundColor: theme.toolbarbg }}>
			<Text>UserJifen!</Text>
		</View>
	);
}
const styles = StyleSheet.create({
});
export default UserJifen;