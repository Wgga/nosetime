import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function UserDiscuss({ navigation, route }: any): React.JSX.Element {

	// 控件
	// 参数
	// 变量
	// 数据
	// 状态

	return (
		<View style={Globalstyles.container}>
			<Text>UserDiscuss!</Text>
		</View>
	);
}

const styles = StyleSheet.create({
});

export default UserDiscuss;