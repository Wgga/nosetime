import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";

import theme from "../../configs/theme";

function GiftcodePopover({ data }: any): React.JSX.Element {
	// 控件
	// 变量
	// 数据
	let [list, setList] = React.useState<any[]>([]);
	// 参数
	// 状态
	React.useEffect(() => {
		setList(data.list.map((item: any) => {
			return item.gpname + " " + item.gpspec;
		}))
	}, [])

	return (
		<View style={styles.giftcode_con}>
			<Image style={styles.giftcode_icon}
				source={require("../../assets/images/duihuan.png")}
				resizeMode="contain"
			/>
			<Text style={styles.giftcode_title}>{data.title}</Text>
			{list.length > 0 && list.map((item: any, index: number) => {
				return (
					<Text key={index} style={styles.giftcode_cname}>{item}</Text>
				)
			})}
			<Text style={styles.giftcode_desc}>{data.desc}</Text>
			<Text style={styles.giftcode_btn}>{"确定"}</Text>
		</View>
	);
}
const styles = StyleSheet.create({
	giftcode_con: {
		backgroundColor: theme.toolbarbg,
		marginHorizontal: 50,
		alignItems: "center",
		borderRadius: 20,
		overflow: "hidden",
	},
	giftcode_icon: {
		width: 55,
		height: 94,
	},
	giftcode_title: {
		color: theme.tit2,
		fontSize: 18,
		marginBottom: 15,
		fontWeight: "500",
		fontFamily: "PingFang SC",
	},
	giftcode_cname: {
		fontSize: 14,
		color: theme.text1,
		marginTop: 8,
		paddingHorizontal: 6,
	},
	giftcode_desc: {
		fontSize: 15,
		color: theme.placeholder,
		paddingHorizontal: 9,
		marginTop: 15,
		marginBottom: 25,
	},
	giftcode_btn: {
		borderTopColor: "rgba(224,224,224,0.3333)",
		borderTopWidth: 1,
		width: "100%",
		height: 44,
		textAlign: "center",
		lineHeight: 44,
		fontSize: 15,
		color: theme.tit2,
	}
});
export default GiftcodePopover;