import React from "react";
import { StyleSheet, Dimensions } from "react-native";

import { TabView, TabBar } from "react-native-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SmartDiscuss from "./smart-discuss";
import SmartVod from "./smart-vod";
import SmartWiki from "./smart-wiki";
import SmartCatalog from "./smart-catalog";

import theme from "../../configs/theme";

const { width, height } = Dimensions.get("window");

function Smart({ route, navigation }: any): React.JSX.Element {

	// 控件
	const insets = useSafeAreaInsets();

	// 变量
	const [index, setIndex] = React.useState(0);
	// 数据
	const [routes] = React.useState([
		{ key: "discuss", title: "新鲜事" },
		{ key: "vod", title: "视频" },
		{ key: "wiki", title: "百科" },
		{ key: "catalog", title: "排行" },
	]);
	// 参数
	// 状态
	return (
		<TabView navigationState={{ index, routes }}
			renderScene={({ route }) => {
				switch (route.key) {
					case "discuss":
						return <SmartDiscuss navigation={navigation} />;
					case "vod":
						return <SmartVod navigation={navigation} />;
					case "wiki":
						return <SmartWiki navigation={navigation} />;
					case "catalog":
						return <SmartCatalog navigation={navigation} />;
					default:
						return null;
				}
			}}
			renderTabBar={(props: any) => {
				return (
					<TabBar {...props}
						activeColor={theme.tit}
						inactiveColor={theme.text2}
						indicatorStyle={{ backgroundColor: theme.tit, width: 15, height: 1, bottom: 11, left: ((width / 4 - 15) / 2) }}
						android_ripple={{ color: "transparent" }}
						indicatorContainerStyle={{ backgroundColor: theme.toolbarbg }}
						labelStyle={{ fontSize: 16, fontWeight: "bold" }}
						style={{ paddingTop: insets.top, backgroundColor: theme.toolbarbg, shadowColor: "transparent" }}
					/>
				)
			}}
			onIndexChange={() => { }}
			initialLayout={{ width }}
		/>
	);
};

const styles = StyleSheet.create({
});
export default Smart;