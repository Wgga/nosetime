import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, ScrollView, TextInput } from "react-native";

import HeaderView from "../../components/headerview";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

function UserFeedback({ navigation, route }: any): React.JSX.Element {
	// 控件
	// 参数
	const { title } = route.params;
	// 变量
	// 数据
	// 状态
	return (
		<View style={styles.feedback_container}>
			<HeaderView
				data={{
					title,
					isShowSearch: false,
				}}
				method={{
					back: () => { navigation.goBack() },
				}} />
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.feedback_con}>
				<TextInput style={styles.feedback_textarea}
					multiline
					placeholder={"请留下您的宝贵意见或建议，商务合作请发邮件至contact@nosetime.com"}
				/>
			</ScrollView>
		</View>
	);
}
const styles = StyleSheet.create({
	feedback_container: {
		flex: 1,
		backgroundColor: theme.toolbarbg,
	},
	feedback_con: {
		paddingTop: 26,
		paddingHorizontal: 27,
	},
	feedback_textarea: {
		width: "100%",
		backgroundColor: theme.bg,
		borderRadius: 6,
		height: 180,
		fontSize: 14,
		padding: 10,
	},
});
export default UserFeedback;