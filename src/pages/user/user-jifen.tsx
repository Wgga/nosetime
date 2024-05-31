import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, ScrollView, Image } from "react-native";

import HeaderView from "../../components/headerview";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

function UserJifen({ navigation }: any): React.JSX.Element {
	// 控件
	// 变量
	let showmenu = React.useRef<boolean>(false); // 是否显示菜单
	// 数据
	// 参数
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据


	// 显示/隐藏右上角菜单
	const showMenu = () => {
		showmenu.current = !showmenu.current;
		setIsRender(val => !val);
	}

	return (
		<View style={styles.points_container}>
			<HeaderView data={{
				title: "积分集市",
				isShowSearch: false,
				showmenu: showmenu.current,
				style: { zIndex: 0 },
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				}
			}} method={{
				back: () => { navigation.goBack() },
			}} MenuChildren={() => {
				return (
					<>
						<Pressable style={styles.menu_icon_con} onPress={() => { showMenu(); }}>
							<Icon style={styles.menu_icon} name="jfrule" size={17} color={theme.text1} />
							<Text style={styles.menu_text}>{"积分规则"}</Text>
						</Pressable>
						<Pressable style={[styles.menu_icon_con, styles.no_border_bottom]} onPress={() => {
							navigation.navigate("Page", { screen: "MallCoupon" });
							showMenu();
						}}>
							<Icon style={styles.menu_icon} name="coupon" size={16} color={theme.text1} />
							<Text style={styles.menu_text}>{"我的优惠券"}</Text>
						</Pressable>
					</>
				)
			}}>
				<View style={styles.header_bg}>
					<Image style={{ width: "100%", height: "100%" }}
						source={require("../../assets/images/headbgpage/jfmallbg.jpg")}
					/>
				</View>
				<Pressable style={{ zIndex: 1 }} onPress={showMenu}>
					<Icon name="sandian" size={20} color={theme.toolbarbg} style={styles.title_icon} />
				</Pressable>
			</HeaderView>
			<View style={styles.points_con}>
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.points_list}>
				</ScrollView>
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	points_container: {
		flex: 1,
		backgroundColor: theme.toolbarbg,
	},
	header_bg: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 90,
		overflow: "hidden"
	},
	title_icon: {
		width: 44,
		height: 44,
		textAlign: "center",
		lineHeight: 44,
	},
	menu_icon_con: {
		paddingLeft: 5,
		paddingVertical: 13,
		paddingRight: 9,
		alignItems: "center",
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: theme.bg
	},
	no_border_bottom: {
		borderBottomWidth: 0,
	},
	menu_icon: {
		marginRight: 9,
		marginTop: 2,
	},
	menu_text: {
		fontSize: 14,
		color: theme.tit2,
		marginRight: 15,
	},
	points_con: {
		flex: 1,
		backgroundColor: theme.bg,
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
	},
	emptyimg: {
		width: "100%",
		height: 500,
	},
	points_list: {
		paddingTop: 11,
		paddingLeft: 12,
		paddingRight: 6,
		paddingBottom: 48,
	},
});
export default UserJifen;