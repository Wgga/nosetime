import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";

import LinearGradient from "react-native-linear-gradient";

import HeaderView from "../../components/headerview";
import AlertCtrl from "../../components/alertctrl";
import LinearButton from "../../components/linearbutton";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";

function MallAddress({ navigation }: any): React.JSX.Element {
	// 控件
	// 变量
	// 数据
	let address_list = React.useRef<any>({});
	// 参数
	// 状态
	const [edit, setEdit] = React.useState<boolean>(false); // 是否编辑
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	React.useEffect(() => {
		init()
	}, [])

	const init = () => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App地址列表页" } });
		}

		http.post(ENV.mall + "?uid=" + us.user.uid, { method: "getaddresslist", token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App地址列表页" } });
			}
			address_list.current = resp_data;
			setIsRender(val => !val);
		});
	}

	// 切换默认地址
	const defaultaddress = (item: any) => {
		http.post(ENV.mall + "?uid=" + us.user.uid, { method: "setdefaultaddress", token: us.user.token, id: item.maid }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App地址列表页" } });
			}
			for (var i in resp_data) {
				if (resp_data.length > 0 && resp_data[0].maid == address_list.current[i].maid) {
					address_list.current[i].madefault = 1;
				} else {
					address_list.current[i].madefault = 0;
				}
			}
			setIsRender(val => !val);
		});
	}

	// 删除地址
	const deladdress = (item: any) => {
		AlertCtrl.show({
			header: "确定要删除该地址吗？",
			key: "del_address_alert",
			message: "",
			buttons: [{
				text: "取消",
				handler: () => {
					AlertCtrl.close("del_address_alert")
				}
			}, {
				text: "确定",
				handler: () => {
					AlertCtrl.close("del_address_alert");
					_deladdress(item);
				}
			}]
		});
	}

	const _deladdress = (item: any) => {
		http.post(ENV.mall + "?uid=" + us.user.uid, { method: "deladdress", token: us.user.token, id: item.maid }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App地址列表页" } });
			}
			address_list.current = resp_data;
			setIsRender(val => !val);
		});
	}

	const gotodetail = (item: any) => {
		navigation.navigate("Page", { screen: "MallAddressEdit", params: { item, cnt: address_list.current.length } });
	}

	return (
		<View style={styles.address_container}>
			<HeaderView data={{
				title: "管理收获地址",
				isShowSearch: false,
				style: { backgroundColor: theme.bg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}}>
				<Pressable style={Globalstyles.title_text_con} onPress={() => { setEdit(val => !val) }}>
					{!edit && <Text style={Globalstyles.title_text}>{"编辑"}</Text>}
					{edit && <Text style={Globalstyles.title_text}>{"完成"}</Text>}
				</Pressable>
			</HeaderView>
			{(address_list.current && address_list.current.length > 0) && <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.address_list}>
				{address_list.current.map((item: any, index: number) => {
					return (
						<View key={item.maid} style={styles.address_item}>
							<View style={styles.item_city}>
								{item.madefault == 1 && <LinearGradient style={styles.default_bg}
									colors={["#81B4EC", "#9BA6F5"]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									locations={[0, 1]}
								>
									<Text style={styles.default_text}>{"默认"}</Text>
								</LinearGradient>}
								<Text style={styles.item_text}>{item.maprov + " " + item.macity + " " + item.maregion + " " + item.mastreet}</Text>
							</View>
							<Text style={styles.item_address_text}>{item.maaddress}</Text>
							<View style={styles.item_uinfo}>
								<Text style={[styles.item_text, { marginRight: 25 }]}>{item.maname}</Text>
								<Text style={styles.item_text}>{item.mamobile}</Text>
							</View>
							<Icon name="edit1" size={20} color={theme.placeholder} style={styles.edit_icon} />
							{edit && <View style={styles.edit_con}>
								<Pressable style={styles.default_btn} onPress={() => { defaultaddress(item) }}>
									{item.madefault == 0 && < Icon name="radio-button-off" size={18} color={theme.text1} />}
									{item.madefault == 1 && <Icon name="right" size={16} color={theme.text1} style={styles.selected_icon} />}
									<Text style={styles.default_btn_text}>{"默认地址"}</Text>
								</Pressable>
								<Pressable onPress={() => { deladdress(item) }}>
									<Text style={styles.del_btn_text}>{"删除"}</Text>
								</Pressable>
							</View>}
						</View>
					)
				})}
			</ScrollView>}
			<LinearButton containerStyle={styles.footer_con} text="+ 添加新地址" onPress={() => { gotodetail(null) }} />
		</View>
	);
}
const styles = StyleSheet.create({
	address_container: {
		flex: 1,
		backgroundColor: theme.bg,
	},
	address_list: {
		paddingTop: 15,
		paddingBottom: 50
	},
	address_item: {
		marginHorizontal: 20,
		marginBottom: 15,
		borderRadius: 4,
		backgroundColor: theme.toolbarbg,
		paddingVertical: 15,
		paddingHorizontal: 16,
		justifyContent: "center",
	},
	item_city: {
		flexDirection: "row",
		alignItems: "center",
	},
	default_bg: {
		paddingHorizontal: 8,
		marginRight: 14,
		borderRadius: 20,
		overflow: "hidden",
	},
	default_text: {
		color: theme.toolbarbg,
		fontSize: 12,
	},
	item_text: {
		fontSize: 13,
		color: theme.comment,
	},
	item_address_text: {
		width: "85%",
		marginTop: 6,
		marginBottom: 8,
		fontSize: 15,
		color: theme.text2,
		fontWeight: "bold",
	},
	item_uinfo: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
	},
	edit_icon: {
		position: "absolute",
		right: 15,
	},
	edit_con: {
		marginTop: 10,
		flexDirection: "row",
		justifyContent: "space-between",
	},
	default_btn: {
		flexDirection: "row",
		alignItems: "center",
	},
	selected_icon: {
		width: 18,
		height: 18.8,
		paddingTop: 1,
		paddingLeft: 1
	},
	default_btn_text: {
		fontSize: 13,
		color: theme.text2,
		marginLeft: 5
	},
	del_btn_text: {
		fontSize: 13,
		color: theme.text2,
	},
	footer_con: {
		paddingHorizontal: 40,
		paddingVertical: 21,
		backgroundColor: theme.toolbarbg,
	},
});
export default MallAddress;