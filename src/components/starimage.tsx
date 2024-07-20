import React from "react";
import { View, StyleSheet, Image, Text } from "react-native";

import theme from "../configs/theme";
import { Globalstyles, handlestarLeft } from "../utils/globalmethod";

function StarImage({ item, style, isShowScore }: any): React.JSX.Element {
	return (
		<>
			{item.istotal >= 10 && <View style={styles.item_star}>
				<View style={Globalstyles.star}>
					{item.s0 == 1 && <Image
						style={[Globalstyles.star_icon, handlestarLeft(item.s1)]}
						defaultSource={require("../assets/images/nopic.png")}
						source={require("../assets/images/star/star2.png")}
					/>}
					{item.s0 == 0 && <Image
						style={[Globalstyles.star_icon, handlestarLeft(item.s1)]}
						defaultSource={require("../assets/images/nopic.png")}
						source={require("../assets/images/star/star.png")}
					/>}
				</View>
				{isShowScore && <Text style={[styles.score_total, style]}>&nbsp;{item.isscore}分&nbsp;/&nbsp;{item.istotal}人</Text>}
			</View>}
			{item.istotal < 10 && <View style={styles.item_star}>
				<View style={Globalstyles.star}>
					<Image
						style={[Globalstyles.star_icon, handlestarLeft(0)]}
						defaultSource={require("../assets/images/nopic.png")}
						source={require("../assets/images/star/star.png")}
					/>
				</View>
				{isShowScore && <Text style={[styles.score_total, style]}>&nbsp;{item.istotal}人</Text>}
			</View>}
		</>
	)
}

const styles = StyleSheet.create({
	item_star: {
		flexDirection: "row",
		alignItems: "center",
	},
	score_total: {
		color: theme.placeholder,
		fontSize: 13,
	},
})

export default StarImage;