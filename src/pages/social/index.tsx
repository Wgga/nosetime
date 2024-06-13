import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Animated } from "react-native";

import { TabView, TabBar } from "react-native-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import SocialShequ from "./social-shequ";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

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
	const topic_btn: any = [
		{ text: "闲谈", id: "1" },
		{ text: "求助", id: "2" },
		{ text: "气味", id: "3" },
		{ text: "沙龙", id: "4" },
	]
	// 变量
	const [index, setIndex] = React.useState(0);
	let fids = React.useRef<string>("1234");
	// 数据
	const [routes] = React.useState([
		{ key: "new", title: "最新", text: "最新" },
		{ key: "chat", title: "闲谈", text: "香水闲谈" },
		{ key: "resort", title: "求助", text: "荐香求助" },
		{ key: "smell", title: "气味", text: "有关气味" },
		{ key: "salon", title: "沙龙", text: "小众沙龙" },
	]);
	// 状态
	let flag = React.useRef<string>("new");
	let tabbarH = React.useRef<number>(0);
	let showfilter = React.useRef<Animated.Value>(new Animated.Value(0)).current; // 滚动值
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染
	const [isShowfilter, setIsShowFilter] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		if (us.user.uid) {
			fids.current = us.user.fids;
		}
		events.subscribe("social_show_filter", (val: boolean) => {
			setIsShowFilter(val);
			if (val) {
				Animated.timing(showfilter, {
					toValue: 1,
					duration: 150,
					useNativeDriver: true,
				}).start();
			} else {
				Animated.timing(showfilter, {
					toValue: 0,
					duration: 150,
					useNativeDriver: true,
				}).start();
			}
		});
		return () => {
			events.unsubscribe("social_show_filter");
		}
	}, [])

	// 筛选弹窗动画
	const top = showfilter.interpolate({
		inputRange: [0, 1],
		outputRange: [-10, tabbarH.current],
		extrapolate: "clamp",
	});

	const togglefid = (fid: string) => {
		if (!us.user.uid) {
			events.publish("social_show_filter", false);
			return navigation.navigate("Page", { screen: "Login", params: { src: "App帖子页" } });
		}
		if (fids.current.indexOf(fid) > -1) {
			fids.current = fids.current.replace(fid, "");
		} else {
			fids.current = (fids.current + fid).split("").sort().join("");
		}
		us.user.fids = fids.current;
		us.saveUser(us.user);
		http.post(ENV.user, { method: "setting", uid: us.user.uid, token: us.user.token, fids: fids.current, type: "fids" }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App帖子页" } });
			} else {
				events.publish("social_shequ_fecth_new");
			}
			setIsRender(val => !val);
		});
	}

	return (
		<GestureHandlerRootView>
			<TabView navigationState={{ index, routes }}
				renderScene={({ route }) => {
					return <SocialShequ navigation={navigation} type={route.text} />;
				}}
				renderTabBar={(props: any) => {
					return (
						<>
							{isShowfilter && <Pressable style={[Globalstyles.social_mask, { zIndex: 1 }]} onPress={() => {
								events.publish("social_show_filter", false);
							}}></Pressable>}
							<View style={{ paddingTop: insets.top, backgroundColor: theme.toolbarbg, zIndex: 2 }} onLayout={(e) => {
								tabbarH.current = e.nativeEvent.layout.height;
								setIsRender(val => !val);
							}}>
								<TabBar {...props}
									renderLabel={({ route, focused, color }: any) => {
										return (
											<View style={styles.tabbar_con}>
												<Text style={[styles.title_text, { color }]}>{route.title}</Text>
												{route.key == "new" && <Icon name={isShowfilter ? "toparrow" : "btmarrow"} size={16} color={color} />}
											</View>
										)
									}}
									onTabPress={({ route, preventDefault }) => {
										if (route.key == "new" && flag.current == "new") {
											preventDefault();
											if (!isShowfilter) events.publish("social_show_filter", true);
										}
										flag.current = route.key;
										if (isShowfilter) events.publish("social_show_filter", false);
									}}
									activeColor={theme.tit}
									inactiveColor={theme.text2}
									indicatorStyle={{ backgroundColor: theme.tit, width: 20, height: 1, bottom: 7, left: ((width / 5 - 20) / 2) }}
									android_ripple={{ color: "transparent" }}
									indicatorContainerStyle={{ backgroundColor: theme.toolbarbg }}
									style={{ backgroundColor: theme.toolbarbg, shadowColor: "transparent", zIndex: 2 }}
								/>
							</View>
							<Animated.View style={[styles.topic_con, { transform: [{ translateY: top }] }]}>
								<Text style={styles.topic_title}>{"筛选最新话题显示"}</Text>
								<View style={styles.topic_btn_con}>
									{topic_btn.map((item: any, index: number) => {
										return (
											<Pressable key={item.id} style={styles.topic_btn} onPress={() => { togglefid(item.id) }}>
												<Text style={[styles.btn_text, fids.current.includes(item.id) && { color: theme.tit }]}>{item.text}</Text>
												<Icon name={fids.current.includes(item.id) ? "select-checked" : "select"} size={10} color={fids.current.includes(item.id) ? theme.tit : theme.text2} />
											</Pressable>
										)
									})}
								</View>
							</Animated.View>
						</>
					)
				}}
				onIndexChange={() => { }}
				initialLayout={{ width }}
			/>
		</GestureHandlerRootView>
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
		zIndex: 1,
		backgroundColor: theme.toolbarbg,
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