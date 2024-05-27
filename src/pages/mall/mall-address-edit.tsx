import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, ScrollView, TextInput } from "react-native";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

import HeaderView from "../../components/headerview";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

function MallAddressEdit({ navigation, route }: any): React.JSX.Element {
	// 控件
	// 参数
	const { item, cnt } = route.params;
	// 变量
	let add = React.useRef<any>({});
	// 数据
	// 状态
	React.useEffect(() => {
		console.log("%c Line:22 🍇 item", "color:#ed9ec7", route.params);
	}, [])

	return (
		<View style={styles.address_edit_con}>
			<HeaderView data={{
				title: (item && item.maid > 0) ? "编辑地址" : "添加新地址",
				isShowSearch: false,
				style: { backgroundColor: theme.bg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}} />
			<ScrollView>
				<View style={styles.goods_item_con}>
					<Text style={styles.goods_item_label}>{"收货人："}</Text>
					<TextInput
						style={styles.goods_item_input}
						value={add.current.maname}
						onChangeText={(e) => { }}
						placeholder="收货人姓名"
						placeholderTextColor={theme.placeholder}
					/>
				</View>
				<View style={styles.goods_item_con}>
					<Text style={styles.goods_item_label}>{"手机号："}</Text>
					<TextInput
						style={styles.goods_item_input}
						value={add.current.maname}
						onChangeText={(e) => { }}
						placeholder="收货人手机号"
						placeholderTextColor={theme.placeholder}
					/>
				</View>
			</ScrollView>
		</View>
	);
}
const styles = StyleSheet.create({
	address_edit_con: {
		height: "100%",
		backgroundColor: theme.toolbarbg
	},
	goods_item_con: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 17,
		paddingHorizontal: 13,
		borderBottomWidth: 1,
		borderBottomColor: theme.border,
	},
	goods_item_label: {
		fontSize: 14,
		color: "#000"
	},
	goods_item_input: {
		flex: 1,
		padding: 0,
		margin: 0,
		fontSize: 14,
	}
});
export default MallAddressEdit;