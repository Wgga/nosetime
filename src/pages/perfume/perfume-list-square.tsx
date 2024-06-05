import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";
import HeaderView from "../../components/headerview";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";

import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function PerfumeListSquare({ navigation }: any): React.JSX.Element {
	// 控件
	// 变量
	// 数据
	// 参数
	// 状态
	return (
		<View style={styles.pefume_list_container}>
			<HeaderView data={{
				title: "香单广场",
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}}>
				<Pressable style={styles.title_text_con} onPress={() => { }}>
					<Text style={styles.title_text}>{"分类"}</Text>
				</Pressable>
			</HeaderView>
		</View>
	);
}
const styles = StyleSheet.create({
	pefume_list_container: {
		flex: 1,
		backgroundColor: theme.toolbarbg,
	},
	title_text_con: {
		width: 44,
		height: 44,
		justifyContent: "center",
	},
	title_text: {
		fontSize: 13,
		color: theme.tit2,
	},
});
export default PerfumeListSquare;