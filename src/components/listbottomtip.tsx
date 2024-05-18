import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

import theme from "../configs/theme";

function ListBottomTip({ noMore, isShowTip }: any): React.JSX.Element {
	return (
		<View style={styles.loading_con}>
			{!noMore && <Image style={styles.loading_img} source={require("../assets/images/loading.gif")} />}
			{(noMore && isShowTip) && <Text style={styles.tip_text}>{"没有更多内容了"}</Text>}
		</View>
	);
}
const styles = StyleSheet.create({
	loading_con: {
		marginBottom: 100,
		width: "100%",
		height: 60,
		alignItems: "center",
		justifyContent: "center",
	},
	loading_img: {
		width: 32,
		height: 32,
		opacity: .8,
	},
	tip_text: {
		fontSize: 13,
		color: theme.placeholder,
	},
});
export default ListBottomTip;