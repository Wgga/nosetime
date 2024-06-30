import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, TextInput } from "react-native";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function Mall({ navigation, route }: any): React.JSX.Element {

	// 控件
	// 参数
	// 变量
	// 数据
	// 状态

	return (
		<View style={Globalstyles.container}>
			<Pressable onPress={() => {
				// 跳转到搜索页面
				navigation.navigate("Page", { screen: "Search", params: { from: "home" } });
			}} style={styles.searchbg}>
				<Text style={styles.placeholder}>搜索香水、品牌、气味、帖子</Text>
				<Icon name="search" size={23} color="#adadad" style={{ marginRight: 13 }} />
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	searchbg: {
		backgroundColor: theme.bg,
		flexDirection: "row",
		alignItems: "center",
		height: 36,
		paddingLeft: 16,
		marginTop: 6,
		marginBottom: 6,
		borderRadius: 30,
	},
	placeholder: {

	}
});

export default Mall;