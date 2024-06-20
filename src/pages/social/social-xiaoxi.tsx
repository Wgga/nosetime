import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image } from "react-native";

import { GestureHandlerRootView } from "react-native-gesture-handler";
import { TabBar, TabView } from "react-native-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";
import events from "../../hooks/events/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

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
	// 数据
	// 状态

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
			<TabView navigationState={{ index, routes }}
				renderScene={({ route }) => {
					switch (route.key) {
						case "sixin":
							return <SocialSixin navigation={navigation} />;
						case "tixing":
							return <SocialTixing navigation={navigation} />;
						default:
							return null;
					}
				}}
				renderTabBar={(props: any) => {
					return (
						<TabBar {...props}
							activeColor={theme.toolbarbg}
							inactiveColor={"rgba(255,255,255,0.7)"}
							indicatorStyle={{
								backgroundColor: theme.toolbarbg, width: 17, height: 1, bottom: 7,
								left: (((width * 0.25 * 2) / 2 - 17) / 2)
							}}
							android_ripple={{ color: "transparent" }}
							tabStyle={{ width: width * 0.25 }}
							indicatorContainerStyle={{ backgroundColor: "transparent", left: width * 0.25 }}
							contentContainerStyle={{ justifyContent: "center" }}
							style={{ paddingTop: insets.top, shadowColor: "transparent", backgroundColor: "transparent" }}
						/>
					)
				}}
				sceneContainerStyle={Globalstyles.list_content}
				onIndexChange={() => { }}
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
});

export default SocialXiaoxi;