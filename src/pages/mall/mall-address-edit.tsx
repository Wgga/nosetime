import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, TextInput } from "react-native";

import { GestureHandlerRootView } from "react-native-gesture-handler";

import HeaderView from "../../components/headerview";
import Switch from "../../components/switch";
import LinearButton from "../../components/linearbutton";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function MallAddressEdit({ navigation, route }: any): React.JSX.Element {
	// 控件
	// 参数
	const { item, cnt } = route.params;
	// 变量
	let add = React.useRef<any>({});
	// 数据
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false);

	React.useEffect(() => {
	}, [])

	const onChange = (type: string, value: string | boolean) => {
		add.current[type] = value;
		setIsRender(val => !val);
	}

	return (
		<View style={styles.address_edit_con}>
			<HeaderView data={{
				title: (item && item.maid > 0) ? "编辑地址" : "添加新地址",
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}} />
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.address_list_con}>
				<View style={styles.goods_item_con}>
					<Text style={styles.goods_item_label}>{"收货人："}</Text>
					<TextInput style={styles.goods_item_input}
						value={add.current.maname}
						onChangeText={(val: string) => {
							onChange("maname", val);
						}}
						placeholder="收货人姓名"
						placeholderTextColor={theme.placeholder}
					/>
				</View>
				<View style={styles.goods_item_con}>
					<Text style={styles.goods_item_label}>{"手机号："}</Text>
					<TextInput style={styles.goods_item_input}
						value={add.current.mamobile}
						onChangeText={(val: string) => {
							onChange("mamobile", val);
						}}
						placeholder="收货人手机号"
						placeholderTextColor={theme.placeholder}
					/>
				</View>
				<View style={styles.address_detail}>
					<TextInput style={styles.address_detail_input}
						value={add.current.maaddress}
						onChangeText={(val: string) => {
							onChange("maaddress", val);
						}}
						placeholder="道路名、小区机构、楼栋单元、门牌号"
						placeholderTextColor={theme.placeholder}
					/>
				</View>
				<View style={styles.toggle_con}>
					<Text style={styles.toggle_text}>{"设为默认地址"}</Text>
					<GestureHandlerRootView style={{ alignItems: "flex-end" }}>
						<Switch value={add.current.madefault}
							onValueChange={(val: boolean) => {
								onChange("madefault", val);
							}}
							activeColor={theme.primary}
							inactiveColor={theme.bg}
							circleStyle={{ backgroundColor: theme.toolbarbg }}
						/>
					</GestureHandlerRootView>
				</View>
			</ScrollView>
			<LinearButton containerStyle={styles.footer_con} text="保存" onPress={() => { }} />
		</View>
	);
}
const styles = StyleSheet.create({
	address_edit_con: {
		height: "100%",
		backgroundColor: theme.toolbarbg
	},
	address_list_con: {
		paddingTop: 8,
		paddingBottom: 50,
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
	},
	address_detail: {
		height: 110,
		borderBottomWidth: 1,
		borderBottomColor: theme.border,
		paddingTop: 10,
		paddingLeft: 10
	},
	address_detail_input: {
		padding: 0,
		margin: 0,
	},
	toggle_con: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 17,
		paddingHorizontal: 13,
		borderBottomWidth: 1,
		borderBottomColor: theme.border,
	},
	toggle_text: {
		fontSize: 14,
		color: theme.text2
	},
	footer_con: {
		paddingHorizontal: 40,
		paddingVertical: 21,
		backgroundColor: theme.toolbarbg,
	},
});
export default MallAddressEdit;