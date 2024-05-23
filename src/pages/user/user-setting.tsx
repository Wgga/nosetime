import React from "react";
import { ScrollView, View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, Image } from "react-native";

import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import LinearGradient from "react-native-linear-gradient";
import { Blurhash } from "react-native-blurhash";
import { Brightness } from "react-native-color-matrix-image-filters";
import { ShadowedView } from "react-native-fast-shadow";

import http from "../../utils/api/http";

import us from "../../services/user-service/user-service";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";
import { GestureHandlerRootView, TextInput } from "react-native-gesture-handler";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

const Person = React.memo(() => {

	const [isrender, setisRender] = React.useState(false); // 是否渲染
	let fullname = React.useRef<string>(""); // 签名香名称
	let signperfume = React.useRef<any>({}); // 签名香数据

	React.useEffect(() => {
		if (us.user.uiid > 0) {
			cache.getItem("item" + us.user.uiid + "getinfo").then((cacheobj) => {
				if (cacheobj) {
					signperfume.current = cacheobj;
					fullname.current = cacheobj.ifullname;
					setisRender(val => !val);
				}
			}).catch(() => {
				http.get(ENV.item + "?method=getinfo&id=" + us.user.uiid).then((resp_data: any) => {
					signperfume.current = resp_data;
					fullname.current = resp_data.ifullname;
					cache.saveItem("item" + us.user.uiid + "getinfo", resp_data, 60);
					setisRender(val => !val);
				});
			});
		} else {
			// 20230516 shibo:修复删除签名香后退出重进数据未更新
			signperfume.current = { iid: null };
			fullname.current = '';
			setisRender(val => !val);
		}
	}, [])

	return (
		<ScrollView contentContainerStyle={styles.setting_list_con}
			showsVerticalScrollIndicator={false}
			nestedScrollEnabled={true}>
			<ShadowedView style={styles.list_item_con}>
				<View style={styles.list_item}>
					<Text style={styles.item_title}>{"头像"}</Text>
					<View style={styles.item_msg}>
						<Image style={styles.item_user_avatar}
							source={{ uri: ENV.avatar + us.user.uid + ".jpg?" + us.user.uface }}
						/>
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</View>
				<View style={styles.list_item}>
					<Text style={styles.item_title}>{"昵称"}</Text>
					<View style={styles.item_msg}>
						{us.user.uname && <Text style={styles.item_msg_text}>{us.user.uname}</Text>}
						{!us.user.uname && <Text style={styles.item_msg_text}>{"请设置昵称"}</Text>}
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</View>
				<View style={styles.list_item}>
					<Text style={styles.item_title}>{"性别"}</Text>
					<View style={styles.item_msg}>
						{us.user.ugender == "m" && <Text style={styles.item_msg_text}>{"男"}</Text>}
						{us.user.ugender == "f" && <Text style={styles.item_msg_text}>{"女"}</Text>}
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</View>
				<View style={styles.list_item}>
					<Text style={styles.item_title}>{"地区"}</Text>
					<View style={styles.item_msg}>
						{us.user.ulocation && <Text style={styles.item_msg_text}>{us.user.ulocation}</Text>}
						{!us.user.ulocation && <Text style={styles.item_msg_text}>{"无"}</Text>}
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</View>
			</ShadowedView>
			<ShadowedView style={styles.list_item_con}>
				<View style={styles.list_item}>
					<Text style={styles.item_title}>{"签名香"}</Text>
					<View style={styles.item_msg}>
						{fullname.current && <Text style={styles.item_msg_text}>{"修改"}</Text>}
						{!fullname.current && <Text style={styles.item_msg_text}>{"无"}</Text>}
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</View>
				<Text style={styles.fullname_con}>{fullname.current}</Text>
			</ShadowedView>
			<ShadowedView style={styles.list_item_con}>
				<View style={styles.list_item}>
					<Text style={styles.item_title}>{"简介"}</Text>
					<View style={styles.item_msg}>
						{!us.user.udesc && <Text style={styles.item_msg_text}>{"未填写"}</Text>}
						<Icon name="back1" style={styles.item_icon} size={16} color={theme.placeholder} />
					</View>
				</View>
				{us.user.udesc && <GestureHandlerRootView>
					<TextInput style={[styles.fullname_con]}
						editable={false}
						multiline={true}
						value={us.user.udesc}
					/>
				</GestureHandlerRootView>}
			</ShadowedView>
		</ScrollView >
	)
})

const Account = React.memo(() => {
	return (
		<View></View>
	)
})

const System = React.memo(() => {
	return (
		<View></View>
	)
})

function UserSetting({ navigation }: any): React.JSX.Element {
	// 控件
	const insets = useSafeAreaInsets();
	// 变量
	const [index, setIndex] = React.useState(0);
	// 数据
	const [routes] = React.useState([
		{ key: "person", title: "个人" },
		{ key: "account", title: "账户" },
		{ key: "system", title: "系统" },
	]);
	// 参数
	const tabbar_icon = [
		require("../../assets/images/setting/person.png"),
		require("../../assets/images/setting/account.png"),
		require("../../assets/images/setting/system.png"),
	];
	// 状态

	return (
		<View style={styles.setting_con}>
			<Pressable style={[styles.leftback, { marginTop: insets.top }]} onPress={() => { navigation.goBack(); }}>
				<Icon name="leftarrow" size={20} color={theme.toolbarbg} style={styles.backicon} />
			</Pressable>
			<Brightness amount={0.85} style={styles.header_bg_con}>
				<LinearGradient
					colors={["transparent", theme.bg]}
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 1 }}
					locations={[0.5, 1]}
					style={styles.linear_bg}
				></LinearGradient>
				<Blurhash style={styles.header_bg}
					blurhash={us.user.blurhash}
					decodeWidth={32}
					decodeHeight={32}
					decodePunch={1}
					resizeMode="cover"
					decodeAsync={true}
				/>
			</Brightness>
			<View style={[styles.setting_header, { paddingTop: insets.top ? insets.top + 30 : 55 }]}>
				<Image style={styles.user_avatar}
					source={{ uri: ENV.avatar + us.user.uid + ".jpg?" + us.user.uface }}
				/>
				<Text style={styles.setting_text}>{"个人设置"}</Text>
			</View>
			<TabView style={{ backgroundColor: "transparent", marginTop: 20 }}
				navigationState={{ index, routes }}
				renderScene={SceneMap({
					person: Person,
					account: Account,
					system: System,
				})}
				renderTabBar={(props: any) => {
					return (
						<View style={styles.tabbar_con}>
							<View style={styles.tabbar_icon_con}>
								{tabbar_icon.map((item: any, index: number) => {
									return (
										<View key={index} style={styles.tabbar_icon}>
											<Image style={styles.tabbar_icon_img} source={item} resizeMode="contain" />
										</View>
									)
								})}
							</View>
							<TabBar {...props}
								activeColor={theme.tit2}
								inactiveColor="rgba(46,46,46,0.6)"
								indicatorStyle={{ backgroundColor: "#444", width: 20, height: 2, bottom: 9, left: "14%" }}
								android_ripple={{ color: "transparent" }}
								indicatorContainerStyle={{ backgroundColor: "transparent" }}
								labelStyle={{ fontSize: 15, fontWeight: "500" }}
								style={styles.tabbar}
							/>
						</View>
					)
				}}
				onIndexChange={setIndex}
				initialLayout={{ width }}
			/>
		</View>
	);
}
const styles = StyleSheet.create({
	setting_con: {
		height: height,
		backgroundColor: theme.bg,
	},
	leftback: {
		position: "absolute",
		left: 0,
		top: 0,
		zIndex: 1
	},
	backicon: {
		width: 44,
		height: 44,
		textAlign: "center",
		lineHeight: 44,
		fontWeight: "bold",
	},
	header_bg_con: {
		position: "absolute",
		width: width,
		height: height * 0.75,
		overflow: "hidden",
	},
	linear_bg: {
		...StyleSheet.absoluteFillObject,
		zIndex: 1,
	},
	header_bg: {
		...StyleSheet.absoluteFillObject,
		margin: -30,
	},
	setting_header: {
		alignItems: "center",
	},
	user_avatar: {
		width: 60,
		height: 60,
		borderRadius: 30,
		borderWidth: 1,
		borderColor: theme.toolbarbg,
	},
	setting_text: {
		fontSize: 18,
		color: theme.tit2,
		marginTop: 6,
	},
	tabbar_con: {
		height: 94,
		justifyContent: "flex-end",
		marginHorizontal: 20,
		marginBottom: 20,
	},
	tabbar_icon_con: {
		width: "100%",
		height: 90,
		position: "absolute",
		top: 0,
		flexDirection: "row",
	},
	tabbar_icon: {
		flex: 1,
		alignItems: "center",
	},
	tabbar_icon_img: {
		width: 20,
		height: "100%",
	},
	tabbar: {
		backgroundColor: "rgba(255,255,255,0.65)",
		shadowColor: "transparent",
		borderRadius: 10,
	},
	setting_list_con: {
		paddingTop: 5,
		paddingHorizontal: 20,
		paddingBottom: 50,
	},
	list_item_con: {
		paddingVertical: 5,
		marginBottom: 20,
		borderRadius: 10,
		backgroundColor: "rgba(255,255,255,0.65)",
		shadowColor: "rgba(0,0,0,0.1)",
		shadowOpacity: 1,
		shadowRadius: 6.7,
		shadowOffset: {
			width: 0,
			height: 0,
		},
	},
	list_item: {
		paddingVertical: 12,
		paddingLeft: 20,
		paddingRight: 15,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	item_title: {
		color: theme.tit2,
		fontSize: 15,
		fontFamily: "PingFang SC",
		height: 32,
		lineHeight: 32,
	},
	item_msg: {
		flexDirection: "row",
		alignItems: "center",
	},
	item_msg_text: {
		fontSize: 14,
		color: theme.placeholder
	},
	item_icon: {
		transform: [{ rotate: "180deg" }],
		marginLeft: 5,
	},
	item_user_avatar: {
		width: 32,
		height: 32,
		borderRadius: 50,
	},
	fullname_con: {
		marginHorizontal: 20,
		maxHeight: 80,
		color: theme.comment,
		fontSize: 12,
		marginBottom: 10,
	},
});
export default UserSetting;