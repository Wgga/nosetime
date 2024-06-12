import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";

import Animated, { SlideInUp, SlideOutDown } from "react-native-reanimated";
import { TabView, TabBar } from "react-native-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import SocialList from "./social-list";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";
import events from "../../hooks/events/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function Social({ navigation, route }: any): React.JSX.Element {

	// 控件
	const insets = useSafeAreaInsets();
	// 参数
	// 变量
	const [index, setIndex] = React.useState(0);
	let fids = React.useRef<string>("1234");
	// 数据
	const [routes] = React.useState([
		{ key: "new", title: "最新" },
		{ key: "chat", title: "闲谈" },
		{ key: "resort", title: "求助" },
		{ key: "smell", title: "气味" },
		{ key: "salon", title: "沙龙" },
	]);
	// 状态
	let flag = React.useRef<string>("");
	let tabbarH = React.useRef<number>(0);
	const [showfilter, setShowFilter] = React.useState<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	return (
		<TabView style={{ paddingTop: insets.top, backgroundColor: theme.toolbarbg }}
			navigationState={{ index, routes }}
			renderScene={({ route }) => {
				return <SocialList navigation={navigation} type={route.key} />;
			}}
			renderTabBar={(props: any) => {
				return (
					<>
						<View onLayout={(e) => {
							tabbarH.current = e.nativeEvent.layout.height + insets.top;
							setIsRender(val => !val);
						}}>
							<TabBar {...props}
								renderLabel={({ route, focused, color }: any) => {
									return (
										<View style={styles.tabbar_con}>
											<Text style={[styles.title_text, { color }]}>{route.title}</Text>
											{route.key == "new" && <Icon name={showfilter ? "toparrow" : "btmarrow"} size={16} color={color} />}
										</View>
									)
								}}
								onTabPress={({ route, preventDefault }) => {
									if (route.key == "new" && flag.current == "new") {
										preventDefault();
										setShowFilter(val => !val);
									}
									flag.current = route.key;
								}}
								activeColor={theme.tit}
								inactiveColor={theme.text2}
								indicatorStyle={{ backgroundColor: theme.tit, width: 20, height: 1, bottom: 7, left: ((width / 5 - 20) / 2) }}
								android_ripple={{ color: "transparent" }}
								indicatorContainerStyle={{ backgroundColor: theme.toolbarbg }}
								style={{ backgroundColor: theme.toolbarbg, shadowColor: "transparent", zIndex: 2 }}
							/>
						</View>
						{showfilter && <View style={[styles.topic_con, { marginTop: tabbarH.current }]}>
							<Text style={styles.topic_title}>{"筛选最新话题显示"}</Text>
							<View style={styles.topic_btn_con}>
								<Pressable style={styles.topic_btn}>
									<Text style={[styles.btn_text, fids.current.includes("1") && { color: theme.tit }]}>{"闲谈"}</Text>
									<Icon name={fids.current.includes("1") ? "select-checked" : "select"} size={10} color={fids.current.includes("1") ? theme.tit : theme.text2} />
								</Pressable>
								<Pressable style={styles.topic_btn}>
									<Text style={[styles.btn_text, fids.current.includes("2") && { color: theme.tit }]}>{"求助"}</Text>
									<Icon name={fids.current.includes("2") ? "select-checked" : "select"} size={10} color={fids.current.includes("1") ? theme.tit : theme.text2} />
								</Pressable>
								<Pressable style={styles.topic_btn}>
									<Text style={[styles.btn_text, fids.current.includes("3") && { color: theme.tit }]}>{"气味"}</Text>
									<Icon name={fids.current.includes("3") ? "select-checked" : "select"} size={10} color={fids.current.includes("1") ? theme.tit : theme.text2} />
								</Pressable>
								<Pressable style={styles.topic_btn}>
									<Text style={[styles.btn_text, fids.current.includes("4") && { color: theme.tit }]}>{"沙龙"}</Text>
									<Icon name={fids.current.includes("4") ? "select-checked" : "select"} size={10} color={fids.current.includes("1") ? theme.tit : theme.text2} />
								</Pressable>
							</View>
						</View>}
					</>
				)
			}}
			onIndexChange={() => { }}
			initialLayout={{ width }}
		/>
	);
}

const styles = StyleSheet.create({
	tabbar_con: {
		flexDirection: "row",
		alignItems: "center",
	},
	title_text: {
		fontSize: 16,
		fontFamily: "PingFang SC",
		fontWeight: "500",
	},
	topic_con: {
		height: 80,
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		zIndex: 99,
		backgroundColor: theme.toolbarbg
	},
	topic_title: {
		fontSize: 13,
		height: 27,
		marginTop: 13,
		marginLeft: 13,
		fontFamily: "PingFang SC",
		fontWeight: "500",
		color: theme.comment
	},
	topic_btn_con: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 13,
		height: 27,
	},
	topic_btn: {
		flex: 1,
		flexDirection: "row",
		alignItems: "center",
	},
	btn_text: {
		fontSize: 13,
		color: theme.text2,
		marginRight: 8,
	},
});

export default Social;