import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";
import events from "../../hooks/events/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function SocialTixing({ navigation, route }: any): React.JSX.Element {

	// 控件
	// 参数
	// 变量
	// 数据
	// 状态

	return (
		<View style={Globalstyles.container}>
			<Text>SocialTixing!</Text>
		</View>
	);
}

const styles = StyleSheet.create({
});

export default SocialTixing;