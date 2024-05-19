import React from "react";
import { Animated, ScrollView, View, Text, StyleSheet, StatusBar, Pressable, NativeEventEmitter } from "react-native";

import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Tabs, MaterialTabBar, MaterialTabItem } from "react-native-collapsible-tab-view"
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import Icon from "../../assets/iconfont";

import { ENV } from "../../configs/ENV";
import theme from "../../configs/theme";

import ToastCtrl from "../../components/toastctrl";
import StickyHeader from "../../components/StickyHeader";

import Header from "./header";
import ArticleList from "../article/article-list";

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
	let debounceTimer = React.useRef<any>(null); // 防抖定时器

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
		// init();
		events.addListener("HomeHeaderHeight", (data: number) => {
			if (data - searchHeight.current > 0) {
				setContentHeight(data - searchHeight.current);
			}
		})
		return () => {
			events.removeAllListeners("HomeHeaderHeight");
		}
	}, []);

	const init = () => {
		setTimeout(() => {
			if (us.user.uid) {
				//登录用户不显示协议
				cache.saveItem("show_protocol", true, 3650 * 86400);
				// events.emit("can_push", true);
				lowPrice();

				//首次登录（在登录处）
				//次日登录，连续登录
				http.post(ENV.points + "?uid=" + us.user.uid, { method: "increasetip", token: us.user.token }).then((resp_data: any) => {
					if (resp_data.msg && resp_data.msg.indexOf('+') > 0) {
						ToastCtrl.show({ message: resp_data.msg, duration: 1000, viewstyle: "medium_toast" });
					}
				});

				http.post(ENV.mall + "?uid=" + us.user.uid, { method: "getunshowcoupon", token: us.user.token }).then((resp_data: any) => {
					if (resp_data.title && resp_data.value) {
						/* this.popoverCtrl.create({
							component: MallCouponPopoverPage,
							componentProps: resp_data,
							cssClass: 'mallcoupon',
							//event: ev,
							translucent: true
						}).then((popover) => { popover.present() }); */
					}
				});
			} else {
				//没有登录的用户显示协议
				show_protocol()
			}
		}, 500);
	};

	const show_protocol = () => {
		cache.getItem("show_protocol").then(() => {
			events.emit("can_push", true);
			lowPrice();
		}).catch(() => {
			/* this.alertCtrl.create({
				header: '使用协议与隐私政策',
				cssClass: 'cart_tip protocol_tip',
				backdropDismiss: false,
				message: "为更好的提供个性推荐、发布信息、购买商品、交流沟通等相关服务，我们会根据您使用服务的具体功能需要，收集您的设备信息、操作日志等个人信息。您可以在手机“设置”中查看、变更、删除个人信息并管理您的授权。" +
					"<br>您可以阅读<span class='use_protocol protocol'>《使用协议》</span>和<span class='use_protocol private'>《隐私政" +
					"策》</span>了解详细信息。如您同意，请点击" +
					"“同意”开始接受我的服务。",
				buttons: [
					{
						text: '暂不使用',
						handler: () => {
							navigator['app'].exitApp();
						}
					},
					{
						text: '同意',
						handler: () => {
							this.cache.saveItem('show_protocol', true, 'show_protocol', 3650 * 86400);
							//20220901 shibo:发布可执行推送
							this.events.publish('can_push', true);
							this.lowPrice();
						}
					}
				]
			}).then((alertCtrl) => {
				//yak
				var _this = this;
				alertCtrl.present()
				var protocol_ele = alertCtrl.querySelector('.protocol');
				var private_ele = alertCtrl.querySelector('.private');
				protocol_ele.addEventListener('click', function () {
					_this.popoverCtrl.create({ component: UserProtocolPage, componentProps: { type: 'protocol' }, cssClass: 'loginpopover' }).then((popover) => { popover.present() });
				}, false)
				private_ele.addEventListener('click', function () {
					_this.popoverCtrl.create({ component: UserProtocolPage, componentProps: { type: 'privacy' }, cssClass: 'loginpopover' }).then((popover) => { popover.present() });
				}, false)
			}); */
		});
	}

	const lowPrice = () => {

	}


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