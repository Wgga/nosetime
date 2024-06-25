import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Animated } from "react-native";

import { TabView, TabBar } from "react-native-tab-view";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import SocialShequ from "./social-shequ";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import events from "../../hooks/events";

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
	const [routes] = React.useState([
		{ key: "new", title: "最新", text: "最新" },
		{ key: "chat", title: "闲谈", text: "香水闲谈" },
		{ key: "resort", title: "求助", text: "荐香求助" },
		{ key: "smell", title: "气味", text: "有关气味" },
		{ key: "salon", title: "沙龙", text: "小众沙龙" },
	]);
	// 变量
	const [index, setIndex] = React.useState(0);
	let fids = React.useRef<string>("1234");
	let flag = React.useRef<string>("new");
	let tabbarH = React.useRef<number>(0);
	let showfilter = React.useRef<Animated.Value>(new Animated.Value(0)).current; // 滚动值
	let headerOpt = React.useRef(new Animated.Value(0)).current; // 头部透明度动画
	let headerZ = React.useRef(new Animated.Value(-1)).current; // 底部层级动画
	// 数据
	// 状态
	let isShowHeader = React.useRef<boolean>(false); // 是否显示头部
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
		outputRange: [tabbarH.current - (80 + insets.top), (tabbarH.current - insets.top)],
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

	const showHeaderView = (e: any) => {
		if (e.nativeEvent.contentOffset.y > 208) {
			if (isShowHeader.current) return;
			isShowHeader.current = true;
			Animated.timing(headerOpt, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
			Animated.timing(headerZ, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
		} else {
			if (!isShowHeader.current) return;
			isShowHeader.current = false;
			Animated.timing(headerOpt, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start();
			Animated.timing(headerZ, {
				toValue: -1,
				duration: 200,
				useNativeDriver: true,
			}).start();
		}
	}

	return (
		<GestureHandlerRootView>
			<TabView navigationState={{ index, routes }}
				renderScene={({ route }) => {
					return <SocialShequ navigation={navigation} type={route.text} showHeaderView={showHeaderView} />;
				}}
				renderTabBar={(props: any) => {
					return (
						<>
							{isShowfilter && <Pressable style={[Globalstyles.social_mask, { zIndex: 1 }]} onPress={() => {
								events.publish("social_show_filter", false);
							}}></Pressable>}
							<View style={{ zIndex: 2 }} onLayout={(e) => {
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
									style={{ paddingTop: insets.top, shadowColor: "transparent" }}
								/>
								<Animated.View style={[styles.search_con, { paddingTop: insets.top, opacity: headerOpt, zIndex: headerZ }]}>
									<Pressable onPress={() => {
										// 跳转到搜索页面
										navigation.navigate("Page", { screen: "Search", params: { from: "social" } });
									}}>
										<View style={[styles.searchbar]}>
											<Text style={styles.placeholder}>搜索帖子</Text>
											<Icon name="search" size={23} color="#adadad" style={{ marginRight: 13 }} />
										</View>
									</Pressable>
								</Animated.View>
							</View>
							<Animated.View style={[styles.topic_con, { height: 80 + insets.top, paddingTop: insets.top, transform: [{ translateY: top }] }]}>
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
	search_con: {
		...StyleSheet.absoluteFillObject,
		justifyContent: "center",
		paddingHorizontal: 13,
		backgroundColor: theme.toolbarbg,
	},
	searchbar: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: theme.bg,
		height: 37,
		borderRadius: 30,
		paddingLeft: 13,
	},
	placeholder: {
		color: theme.placeholder2,
		fontSize: 12,
	},
	topic_con: {
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