import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Image, TextInput } from "react-native";

import HeaderView from "../../components/headerview";
import ToastCtrl from "../../components/toastctrl";

import searchService from "../../services/search-service/search-service";
import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";
import events from "../../hooks/events/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

function UserChangeSignPerfume({ navigation, route }: any): React.JSX.Element {
	// 控件
	// 参数
	// 变量
	let signperfume = React.useRef<any>({});
	let word = React.useRef<string>("");
	let list = React.useRef<any[]>([]);
	// 数据
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false);


	const search = () => {
		searchService.fetch("all", word.current, "init");
	}

	React.useEffect(() => {
		signperfume.current = route.params.signperfume;
		setIsRender(val => !val);
		events.subscribe("nosetime_searchlistUpdated", (data: any) => {
			const { word, type } = data;
			list.current = searchService.getItems("item", word);
			setIsRender(val => !val);
		});
		return () => {
			events.unsubscribe("nosetime_searchlistUpdated");
		}
	}, [])

	const change = (id: any) => {
		us.user.uiid = id;
		us.saveUser(us.user);
		http.post(ENV.api + ENV.user, { method: "changesetting", id: us.user.uid, token: us.user.token, info: { uiid: id } }).then((resp_data: any) => {
			if (id == 0) {
				signperfume.current = {};
				cache.saveItem("item" + us.user.uiid + "getinfo", signperfume.current, 60);
				events.publish("nosetime_reload_user_setting_list_page");
				setIsRender(val => !val);
			} else {
				ToastCtrl.show({ message: "修改成功", duration: 2000, viewstyle: "short_toast", key: "change_success_toast" });
				getsignperfume();
			}
		});
	}

	const getsignperfume = () => {
		http.get(ENV.item + "?method=getinfo&id=" + us.user.uiid).then((resp_data: any) => {
			signperfume.current = resp_data;
			cache.saveItem("item" + us.user.uiid + "getinfo", signperfume.current, 60);
			events.publish("nosetime_reload_user_setting_list_page");
			setIsRender(val => !val);
		});
	}

	return (
		<View style={styles.signperfume_container}>
			<HeaderView data={{
				title: "修改签名香",
				isShowSearch: false,
			}} method={{
				back: () => { navigation.goBack() },
			}} />
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.signperfume_con}>
				{signperfume.current.iid && <>
					<View>
						<Text style={styles.signperfume_title}>{"当前签名香"}</Text>
						<View style={styles.current_con}>
							<Image style={styles.current_image}
								source={{ uri: ENV.image + "/perfume/" + signperfume.current.iid + ".jpg!m" }}
								resizeMode="contain"
							/>
							<Text style={styles.current_text}>{signperfume.current.ifullname}</Text>
						</View>
					</View>
					<Pressable onPress={() => { change(0) }}>
						<Text style={styles.del_current_btn}>{"删除当前签名香"}</Text>
					</Pressable>
				</>}
				<View>
					<Text style={styles.signperfume_title}>{"修改签名香"}</Text>
					<View style={styles.searchbar_con}>
						<TextInput style={styles.searchbar}
							placeholder={"搜索香水"}
							onChangeText={text => {
								word.current = text;
								setIsRender(val => !val);
							}}
							value={word.current}
						/>
						<View style={styles.search_icon_con}>
							{word.current && <Pressable style={{ paddingRight: 7 }} onPress={() => {
								word.current = "";
								list.current = [];
								setIsRender(val => !val);
							}}>
								<Icon name="close1" size={16} color={theme.placeholder2} style={styles.search_icon} />
							</Pressable>}
							<Pressable style={{ borderLeftWidth: 1, borderLeftColor: theme.border, marginRight: 5 }} onPress={search}>
								<Icon name="search1" size={20} color={theme.placeholder2} style={styles.search_icon} />
							</Pressable>
						</View>
					</View>
					{(list && list.current.length > 0) && <View>
						<View style={styles.triangle_top}></View>
						<View style={styles.signperfume_list}>
							{list.current.map((item: any, index: number) => {
								return (
									<Pressable onPress={() => { change(item.id) }} key={item.id} style={styles.signperfume_item}>
										<Image style={styles.item_image}
											defaultSource={require("../../assets/images/noxx.png")}
											source={{ uri: ENV.image + "/perfume/" + item.id + ".jpg!m" }}
											resizeMode="contain"
										/>
										<Text style={styles.item_text}>{item.title}</Text>
									</Pressable>
								)
							})}
						</View>
					</View>}
				</View>
			</ScrollView>
		</View>
	);
}
const styles = StyleSheet.create({
	signperfume_container: {
		flex: 1,
		backgroundColor: theme.bg
	},
	signperfume_con: {
		paddingTop: 5,
		paddingHorizontal: 20,
	},
	signperfume_title: {
		marginVertical: 18,
		fontSize: 15,
		fontWeight: "500",
		color: theme.text1
	},
	current_con: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 11,
		paddingHorizontal: 6,
		backgroundColor: theme.toolbarbg,
		borderRadius: 8,
		overflow: "hidden",
	},
	current_image: {
		width: 60,
		height: 60,
		marginRight: 7,
	},
	current_text: {
		flex: 1,
		fontSize: 15,
		lineHeight: 20,
	},
	del_current_btn: {
		marginTop: 8,
		fontSize: 14,
		color: theme.placeholder,
		textAlign: "right",
	},
	searchbar_con: {
		marginTop: 8,
		height: 37,
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: theme.toolbarbg,
		alignItems: "center",
		flexDirection: "row",
		marginBottom: 15,
	},
	searchbar: {
		flex: 1,
		padding: 0,
		backgroundColor: "transparent",
		fontSize: 12,
		color: theme.text2,
		paddingLeft: 20,
	},
	search_icon_con: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 12,
	},
	search_icon: {
		marginLeft: 9,
	},
	signperfume_list: {
		backgroundColor: theme.toolbarbg,
		marginBottom: 50,
		borderRadius: 10,
		overflow: "hidden",
	},
	triangle_top: {
		position: "absolute",
		left: 13,
		top: -10,
		zIndex: 1,
		borderTopWidth: 0,
		borderBottomWidth: 10,
		borderLeftWidth: 8,
		borderRightWidth: 8,
		borderTopColor: "transparent",
		borderLeftColor: "transparent",
		borderRightColor: "transparent",
		borderBottomColor: theme.toolbarbg,
	},
	signperfume_item: {
		paddingVertical: 15,
		paddingHorizontal: 11,
		flexDirection: "row",
		alignItems: "center",
	},
	item_image: {
		width: 45,
		height: 45,
		marginRight: 10,
	},
	item_text: {
		flex: 1,
		fontSize: 14,
		color: "#000",
	}
});
export default UserChangeSignPerfume;