import React from "react";
import { Animated, ScrollView, View, Text, StyleSheet, StatusBar, Pressable, NativeEventEmitter } from "react-native";

import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Tabs, MaterialTabBar, MaterialTabItem } from "react-native-collapsible-tab-view"
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Icon from "../../assets/iconfont";
import theme from "../../configs/theme";

import Header from "./header";

import StickyHeader from "../../components/StickyHeader";
import ArticleList from "../article/article-list";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const events = new NativeEventEmitter();

function Home({ navigation }: any): React.JSX.Element {

	// 控件
	const insets = useSafeAreaInsets();

	// 数据
	const [sliderHeight, setSliderHeight] = React.useState<number>(0); // 轮播图高度
	const [contentHeight, setContentHeight] = React.useState<number>(0); // 顶部内容高度
	const [listH, setListH] = React.useState<number>(2000); // 列表高度

	// 变量
	let scrollY = React.useRef<Animated.Value>(new Animated.Value(0)).current; // 滚动值
	let HeaderScrollY = React.useRef<Animated.Value>(new Animated.Value(0)).current; // 顶部滚动动画
	let searchHeight = React.useRef<number>(0); // 顶部搜索框高度
	let currentindex = React.useRef<number>(0); // 当前页面索引
	let pages = React.useRef<any[]>([
		{ key: "new", title: "最新", pageheight: 2000, },
		{ key: "subject", title: "专题", pageheight: 2000, },
		{ key: "smell", title: "寻味", pageheight: 2000, },
		{ key: "knowledge", title: "知识", pageheight: 2000, },
	]).current; // 文章列表Tab

	// 动态背景透明度
	const opacity = scrollY.interpolate({
		inputRange: [0, sliderHeight],
		outputRange: [0, 1],
		extrapolate: "clamp",
	});

	// 动态背景颜色
	const color = scrollY.interpolate({
		inputRange: [0, sliderHeight],
		outputRange: ["rgba(255,255,255,0.7)", "rgba(235,235,235,0.7)"],
		extrapolate: "clamp",
	});

	// 获取在顶部页面中设置的样式，用于开发顶部搜索框根据滑动距离显示背景颜色
	const onLayout = (event: any) => {
		const { height: viewHeight } = event.nativeEvent.layout;
		searchHeight.current = viewHeight;
	};

	React.useEffect(() => {
		events.addListener("HomeHeaderHeight", (data: number) => {
			if (data - searchHeight.current > 0) {
				setContentHeight(data - searchHeight.current);
			}
		})
		return () => {
			events.removeAllListeners("HomeHeaderHeight");
		}
	}, []);

	let debounceTimer = React.useRef<any>(null);

	const changeIndex = (index: number) => {
		if (debounceTimer.current) {
			clearTimeout(debounceTimer.current);
		}

		debounceTimer.current = setTimeout(() => {
			currentindex.current = index;
			setListH(pages[currentindex.current].pageheight);
		}, 100);
	};

	const setListHeight = (height: number, type: string) => {
		let index = pages.findIndex(item => item.title === type);
		if (index >= 0 && pages[index].pageheight < height) {
			pages[index].pageheight = height;
		}
	}

	return (
		<>
			<View onLayout={onLayout} style={[styles.search_con, { paddingTop: insets.top ? insets.top : 24 }]}>
				<Animated.View style={[{ opacity }, styles.searchbg]}></Animated.View>
				<Pressable onPress={() => {
					// 跳转到搜索页面
					navigation.navigate("Page", { screen: "Search", params: { from: "home" } });
				}}>
					<Animated.View style={[{ backgroundColor: color }, styles.Searchbar]}>
						<Text style={styles.placeholder}>搜索香水、品牌、气味、帖子</Text>
						<Icon name="search" size={23} color="#adadad" style={{ marginRight: 13 }} />
					</Animated.View>
				</Pressable>
			</View>
			<GestureHandlerRootView>
				<Animated.ScrollView
					showsVerticalScrollIndicator={false}
					nestedScrollEnabled={true}
					bounces={false}
					scrollEventThrottle={1}
					onScroll={
						Animated.event(
							[{ nativeEvent: { contentOffset: { y: HeaderScrollY } } }],
							{
								useNativeDriver: true, listener: (e: any) => {
									scrollY.setValue(e.nativeEvent.contentOffset.y - sliderHeight);
								}
							}
						)
					}>
					<Header navigation={navigation} setSliderHeight={setSliderHeight} style={{ height: contentHeight }} />
					{<Tabs.Container
						renderTabBar={(props: any) => {
							return (
								<StickyHeader stickyHeaderY={contentHeight} stickyScrollY={HeaderScrollY}>
									<MaterialTabBar {...props}
										TabItemComponent={props => {
											return (
												<MaterialTabItem {...props} android_ripple={{ color: "transparent" }}></MaterialTabItem>
											)
										}}
										activeColor={theme.tit}
										inactiveColor={theme.text2}
										style={{ height: 48, backgroundColor: theme.toolbarbg }}
										indicatorStyle={{ backgroundColor: "transparent" }}
										labelStyle={{ fontSize: 14, fontWeight: "bold" }}>
									</MaterialTabBar>
								</StickyHeader>
							)
						}}
						onIndexChange={changeIndex}
						headerContainerStyle={{ shadowOpacity: 0, elevation: 0 }}
						containerStyle={{ backgroundColor: theme.toolbarbg, height: listH }}
					>
						<Tabs.Tab name="new" label="最新">
							<ArticleList type="最新" setListHeight={setListHeight} />
						</Tabs.Tab>
						<Tabs.Tab name="subject" label="专题">
							<ArticleList type="专题" setListHeight={setListHeight} />
						</Tabs.Tab>
						<Tabs.Tab name="smell" label="寻味">
							<ArticleList type="寻味" setListHeight={setListHeight} />
						</Tabs.Tab>
						<Tabs.Tab name="knowledge" label="知识">
							<ArticleList type="知识" setListHeight={setListHeight} />
						</Tabs.Tab>
					</Tabs.Container>}
					{/* <TabView
					navigationState={{ index: currentindex, routes }}
					renderTabBar={(props) =>
						<StickyHeader stickyHeaderY={contentHeight} stickyScrollY={HeaderScrollY}>
							<TabBar {...props}
								activeColor={theme.tit}
								inactiveColor={theme.text2}
								indicatorStyle={{ backgroundColor: theme.tit, width: 15, height: 3, bottom: 10, left: "10.5%", borderRadius: 8 }}
								indicatorContainerStyle={{ backgroundColor: theme.toolbarbg }}
								labelStyle={{ fontSize: 14, fontWeight: "bold" }}
								style={{ backgroundColor: theme.toolbarbg, shadowColor: "transparent" }} />
						</StickyHeader>
					}
					renderScene={SceneMap({
						new: () => {
							return (
								<View></View>
								// <ArticleList />
							)
						},
						subject: () => {
							return (
								<View></View>
								// <ArticleList />
							)
						},
						smell: () => {
							return (
								<View></View>
								// <ArticleList />
							)
						},
						knowledge: () => {
							return (
								<View></View>
								// <ArticleList />
							)
						},
					})}
					onIndexChange={index => {
						// setIndex(index)
						console.log("%c Line:144 🍇 index", "color:#6ec1c2", index);
					}}
					style={{ height: 2000 }}
				/> */}
				</Animated.ScrollView >
			</GestureHandlerRootView>
		</>
	);
}

const styles = StyleSheet.create({
	search_con: {
		position: "absolute",
		top: 0,
		zIndex: 111,
		width: "100%",
		alignItems: "center",
	},
	placeholder: {
		flex: 1,
		fontSize: 13,
		color: theme.placeholder2,
	},
	labelStyle: {
		fontSize: 14,
		fontWeight: "bold",
		width: "100%",
		textAlign: "center",
	},
	indicatorStyle: {
		backgroundColor: theme.tit,
	},
	text: {
		position: "absolute",
		color: "white",
		fontSize: 24,
		textAlign: "center",
	},
	searchbg: {
		position: "absolute",
		top: 0,
		bottom: 0,
		width: "100%",
		paddingTop: 35,
		alignItems: "center",
		backgroundColor: "rgb(255,255,255)"
	},
	Searchbar: {
		position: "relative",
		width: "85%",
		height: 38,
		paddingLeft: 16,
		marginTop: 6,
		marginBottom: 6,
		fontSize: 13,
		borderRadius: 30,
		alignItems: "center",
		flexDirection: "row",
	}
})

export default Home;