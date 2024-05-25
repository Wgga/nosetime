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
				<View style={styles.feedback_textarea_con}>
					<TextInput style={styles.textarea}
						multiline={true}
						placeholderTextColor={theme.placeholder}
						placeholder={"请留下您的宝贵意见或建议，商务合作请发邮件至contact@nosetime.com"}
					/>
				</View>
				<View style={styles.feedback_img_list}>
					<Text style={styles.img_tit}>{"添加相关截图"}</Text>
					<View>
						<View>
							
						</View>
					</View>
				</View>
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
	feedback_textarea_con: {
		width: "100%",
		backgroundColor: theme.bg,
		borderRadius: 6,
		height: 180,
		padding: 10,
	},
	textarea: {
		width: "100%",
		fontSize: 14,
		padding: 0,
	},
	feedback_img_list: {
		marginTop: 26,
	},
	img_tit: {
		color: theme.tit2,
		fontFamily: "PingFang SC",
		fontWeight: "500",
		fontSize: 16,
		marginBottom: 23,
	},
});
export default UserFeedback;