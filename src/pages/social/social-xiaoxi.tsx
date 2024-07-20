import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image } from "react-native";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TabBar, TabView } from "react-native-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ToastCtrl from "../../components/controller/toastctrl";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";
import SocialSixin from "./social-sixin";
import SocialTixing from "./social-tixing";

const { width, height } = Dimensions.get("window");

function SocialXiaoxi({ navigation, route }: any): React.JSX.Element {

	// 控件
	const insets = useSafeAreaInsets();
	// 参数
	const [routes] = React.useState([
		{ key: "sixin", title: "私信", text: "私信" },
		{ key: "tixing", title: "提醒", text: "提醒" },
	]);
	// 变量
	const [index, setIndex] = React.useState(0);
	const [sixin, setSixin] = React.useState(0);
	const [tixing, setTixing] = React.useState(0);
	// 数据
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	const cleartixing = () => {
		if (tixing == 0) {
			return ToastCtrl.show({ message: "当前无未读消息", duration: 1500, viewstyle: "medium_toast", key: "not_msg_toast" });
		}
		http.post(ENV.tixing + "?method=readall&uid=" + us.user.uid, { token: us.user.token }).then((resp_data: any) => {
			setTixing(0);
			events.publish("cleartixing");
			ToastCtrl.show({ message: "操作成功", duration: 1500, viewstyle: "short_toast", key: "read_success_toast" });
		});
	}

	return (
		<GestureHandlerRootView>
			<View style={[Globalstyles.header_bg, { height: 90 + insets.top }]}>
				<Image style={{ width: "100%", height: "100%" }}
					source={require("../../assets/images/headbgpage/messagebg.jpg")}
				/>
			</View>
			<Pressable onPress={() => { navigation.goBack() }} style={[styles.title_icon, { marginTop: insets.top }]}>
				<Icon name="leftarrow" size={20} color={theme.toolbarbg} />
			</Pressable>
			{index == 1 && <Pressable onPress={cleartixing} style={[styles.title_icon, { right: 0, marginTop: insets.top }]}>
				<View style={styles.clear_btn}>
					<Icon name={(tixing > 0) ? "qingchu1" : "qingchu2"} size={16} color={theme.toolbarbg} />
				</View>
			</Pressable>}
			<TabView navigationState={{ index, routes }}
				renderScene={({ route }) => {
					switch (route.key) {
						case "sixin":
							return <SocialSixin navigation={navigation} setSixin={setSixin} />;
						case "tixing":
							return <SocialTixing navigation={navigation} setTixing={setTixing} />;
						default:
							return null;
					}
				}}
				renderTabBar={(props: any) => {
					return (
						<TabBar {...props}
							renderLabel={({ route, focused, color }: any) => {
								return (
									<View style={styles.tab_bar_item}>
										<Text style={[{ width: "100%", textAlign: "center", color }]}>{route.title}</Text>
										{(route.key == "sixin" && sixin > 0) && <Text style={[Globalstyles.redbadge, { borderWidth: 0 }]}>{sixin}</Text>}
										{(route.key == "tixing" && tixing > 0) && <Text style={[Globalstyles.redbadge, { borderWidth: 0 }]}>{tixing}</Text>}
									</View>
								)
							}}
							activeColor={theme.toolbarbg}
							inactiveColor={"rgba(255,255,255,0.7)"}
							android_ripple={{ color: "transparent" }}
							tabStyle={{ width: width * 0.25 }}
							indicatorStyle={{
								backgroundColor: theme.toolbarbg, width: 17, height: 1, bottom: 7,
								left: (((width * 0.25 * 2) / 2 - 17) / 2)
							}}
							indicatorContainerStyle={{ backgroundColor: "transparent", left: width * 0.25 }}
							contentContainerStyle={{ justifyContent: "center" }}
							style={{ marginTop: insets.top, shadowColor: "transparent", backgroundColor: "transparent" }}
						/>
					)
				}}
				sceneContainerStyle={Globalstyles.list_content}
				onIndexChange={setIndex}
				initialLayout={{ width }}
			/>
		</GestureHandlerRootView>
	);
}

const styles = StyleSheet.create({
	title_icon: {
		position: "absolute",
		width: 48,
		height: 48,
		alignItems: "center",
		justifyContent: "center",
		zIndex: 2
	},
	tab_bar_item: {
		flexDirection: "row",
		alignItems: "center",
	},
	clear_btn: {
		width: 25,
		height: 25,
		backgroundColor: "rgba(255,255,255,0.2)",
		borderRadius: 50,
		alignItems: "center",
		justifyContent: "center",
	},
});

export default SocialXiaoxi;