import React from "react";
import { Animated, ScrollView, StyleSheet, View, Text, Dimensions, Pressable, FlatList, } from "react-native";

import { TabView, SceneMap, TabBar } from "react-native-tab-view";
import { Tabs, MaterialTabBar, MaterialTabItem } from "react-native-collapsible-tab-view"
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useFocusEffect } from "@react-navigation/native";

import ToastCtrl from "../../components/toastctrl";
import StickyHeader from "../../components/StickyHeader";
import HomeProtocolPopover from "../../components/popover/homeprotocol-popover";
import LowPricePopover from "../../components/popover/lowprice-popover";
import { ModalPortal } from "../../components/modals";

import Header from "./header";
import ArticleList from "../article/article-list";

import us from "../../services/user-service/user-service";
import articleService from "../../services/article-service/article-service";
import permissionService from "../../services/permission-service/permission-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import { ENV } from "../../configs/ENV";
import theme from "../../configs/theme";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

const Home = React.memo(({ navigation }: any) => {

	// 控件
	const insets = useSafeAreaInsets();
	let debounceTimer = React.useRef<any>(null); // 防抖定时器
	// 变量
	const [sliderHeight, setSliderHeight] = React.useState<number>(0); // 轮播图高度
	const [contentHeight, setContentHeight] = React.useState<number>(0); // 顶部内容高度
	let scrollY = React.useRef<Animated.Value>(new Animated.Value(0)).current; // 滚动值
	let HeaderScrollY = React.useRef<Animated.Value>(new Animated.Value(0)).current; // 顶部滚动动画
	let searchHeight = React.useRef<number>(0); // 顶部搜索框高度
	const [index, setIndex] = React.useState(0);
	let currentindex = React.useRef<number>(0); // 当前页面索引
	// 数据
	const [routes] = React.useState([
		{ key: "new", title: "最新", },
		{ key: "subject", title: "专题", },
		{ key: "smell", title: "寻味", },
		{ key: "knowledge", title: "知识", },
	]);
	// 状态
	let noMore = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

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
		events.subscribe("HomeHeaderHeight", (data: number) => {
			if (data - searchHeight.current > 0) {
				setContentHeight(data - searchHeight.current);
			}
		})

		events.subscribe("list_loadmore", (data: boolean) => {
			cache.getItem("articleService" + routes[index].title).then((itemid) => {
				if (itemid.minid == 0) {
					noMore.current = false;
				}
				setIsRender(val => !val);
			})
		})

		return () => {
			events.unsubscribe("HomeHeaderHeight");
			events.unsubscribe("list_loadmore");
		}
	}, []);

	// 进入页面时执行函数
	useFocusEffect(
		React.useCallback(() => {
			if (us.user.uid) {
				//登录用户不显示协议
				cache.saveItem("showProtocol", true, 3650 * 86400);
				events.publish("can_push", true);
				lowPrice();

				//首次登录（在登录处）
				//次日登录，连续登录
				http.post(ENV.points + "?uid=" + us.user.uid, { method: "increasetip", token: us.user.token }).then((resp_data: any) => {
					if (resp_data.msg && resp_data.msg.indexOf("+") > 0) {
						ToastCtrl.show({ message: resp_data.msg, duration: 1000, viewstyle: "medium_toast", key: "home_increasetip_toast" });
					}
				});

				http.post(ENV.mall + "?uid=" + us.user.uid, { method: "getunshowcoupon", token: us.user.token }).then((resp_data: any) => {
					if (resp_data.title && resp_data.value) {
						/* this.popoverCtrl.create({
							component: MallCouponPopoverPage,
							componentProps: resp_data,
							cssClass: "mallcoupon",
							//event: ev,
							translucent: true
						}).then((popover) => { popover.present() }); */
					}
				});
			} else {
				//没有登录的用户显示协议
				show_protocol()
			}
		}, [])
	);

	// 打开弹窗
	const open_popover = (params: any) => {
		const { modal_width, modal_key, modal_component, onShow, onDismiss, onTouchOutside, modal_style } = params;
		ModalPortal.show((
			modal_component
		), {
			key: modal_key,
			width: modal_width,
			rounded: false,
			useNativeDriver: true,
			onShow,
			onDismiss,
			onTouchOutside,
			onHardwareBackPress: () => {
				ModalPortal.dismiss(modal_key);
				return true;
			},
			animationDuration: 300,
			modalStyle: modal_style,
		})
	}

	// 显示同意协议弹窗
	const show_protocol = () => {
		cache.getItem("showProtocol").then(() => {
			events.publish("can_push", true);
			lowPrice();
		}).catch(() => {
			open_popover({
				modal_width: 280,
				modal_key: "home_protocol_popover",
				modal_component: (<HomeProtocolPopover method={{ lowPrice }} />),
				onShow: () => { },
				onDismiss: () => { },
				onTouchOutside: () => { },
				modal_style: { borderRadius: 15 },
			})
		});
	}

	// 显示特价弹窗
	const lowPrice = () => {
		setTimeout(() => {
			cache.getItem("showLowprice").then(() => {
				showjifenpopup();
			}).catch(() => {
				http.get(ENV.popup + "?method=getpopup").then((resp_data: any) => {
					if (resp_data.title) {
						cache.saveItem("showLowprice", 0, 6 * 3600);
						open_popover({
							modal_width: resp_data.isdiy ? width - 82 : width - 102,
							modal_key: "lowprice_popover" + resp_data.id,
							modal_component: (<LowPricePopover
								modalparams={{ modalkey: "lowprice_popover" + resp_data.id, modaldata: resp_data }}
								navigation={navigation}
							/>),
							onShow: () => {
								// 统计商城UV，不要删
								http.post(ENV.mall + "?uid=" + us.user.uid, {
									token: us.user.token, method: "getpopup", did: us.did, page: resp_data.page, code: resp_data.code
								}).then(() => { }).catch(() => { });
							},
							onDismiss: () => {
								showjifenpopup();
							},
							onTouchOutside: () => {
								ModalPortal.dismiss("lowprice_popover" + resp_data.id);
							},
							modal_style: { backgroundColor: "transparent" },
						})
					} else {
						showjifenpopup();
					}
				})
			})
		}, 300);
	}

	// 显示积分弹窗
	const showjifenpopup = () => {
		cache.getItem("showJifen" + us.user.uid).catch(() => {
			http.get(ENV.popup + "?method=getjifenpopup&uid=" + us.user.uid).then((resp_data: any) => {
				if (resp_data.msg == "ERR") return;
				if (resp_data.msg == "OK") {
					cache.saveItem("showJifen" + us.user.uid, 0, resp_data.expires);
					open_popover({
						modal_width: width - 102,
						modal_key: "jifen_popover",
						modal_component: (<LowPricePopover
							modalparams={{ modalkey: "jifen_popover", modaldata: resp_data }}
							navigation={navigation}
						/>),
						onShow: () => { },
						onDismiss: () => { },
						onTouchOutside: () => {
							ModalPortal.dismiss("jifen_popover");
						},
						modal_style: { backgroundColor: "transparent" },
					})
				}
			})
		})
	}

	const scan = async () => {
		if (!(await permissionService.checkPermission("scan", { marginTop: insets.top }))) return;
		navigation.navigate("Page", { screen: "Scanner", params: { src: "home" } });
	}

	return (
		<>
			<View onLayout={onLayout} style={[styles.search_con, { paddingTop: insets.top ? insets.top : 24 }]}>
				<Animated.View style={[{ opacity }, styles.searchbg]}></Animated.View>
				<Pressable onPress={() => {
					// 跳转到搜索页面
					navigation.navigate("Page", { screen: "Search", params: { src: "home" } });
				}}>
					<Animated.View style={[{ backgroundColor: color }, styles.Searchbar]}>
						<Icon name="scan" size={20} color="#adadad" style={{ marginRight: 13 }} onPress={scan} />
						<Text style={styles.placeholder}>搜索香水、品牌、气味、帖子</Text>
						<Icon name="search" size={23} color={theme.placeholder2} style={{ marginRight: 13 }} />
					</Animated.View>
				</Pressable>
			</View>
			<GestureHandlerRootView>
				<Animated.FlatList data={[1]}
					extraData={isrender}
					showsVerticalScrollIndicator={false}
					onScroll={
						Animated.event(
							[{ nativeEvent: { contentOffset: { y: HeaderScrollY } } }],
							{
								useNativeDriver: true, listener: (e: any) => {
									scrollY.setValue(e.nativeEvent.contentOffset.y - sliderHeight);
								}
							}
						)
					}
					ListHeaderComponent={<Header navigation={navigation} setSliderHeight={setSliderHeight} style={{ height: contentHeight }} />}
					onEndReachedThreshold={0.1}
					onEndReached={() => {
						let type = routes[index].title;
						articleService.fetch(type, 0);
					}}
					renderItem={({ item }) => {
						return (
							<TabView navigationState={{ index, routes }}
								renderScene={({ route }) => {
									return <ArticleList type={route.title} />;
								}}
								sceneContainerStyle={{ backgroundColor: theme.toolbarbg }}
								lazy
								renderTabBar={(props: any) => {
									return (
										<StickyHeader stickyHeaderY={contentHeight + 30} stickyScrollY={HeaderScrollY}>
											<TabBar {...props}
												activeColor={theme.tit}
												inactiveColor={theme.text2}
												indicatorStyle={{ backgroundColor: theme.tit, width: 15, height: 1, bottom: 10, left: ((width / 4 - 15) / 2) }}
												android_ripple={{ color: "transparent" }}
												indicatorContainerStyle={{ backgroundColor: theme.toolbarbg }}
												labelStyle={{ fontSize: 16, fontWeight: "bold" }}
												style={{ paddingTop: 30, backgroundColor: theme.toolbarbg, shadowColor: "transparent" }}
											/>
										</StickyHeader>
									)
								}}
								onIndexChange={setIndex}
								initialLayout={{ width }}
							/>
						)
					}}
				/>
			</GestureHandlerRootView>
		</>
	);
})

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
		borderRadius: 30,
		alignItems: "center",
		flexDirection: "row",
	},
})

export default Home;