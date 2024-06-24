import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function UserDetail({ navigation }: any): React.JSX.Element {

	// 控件
	// 变量
	// 数据
	// 参数
	// 状态

	return (
		<View style={Globalstyles.container}>
			<Text>UserDetail!</Text>
		</View>
	);
}

const styles = StyleSheet.create({
});

export default UserDetail;