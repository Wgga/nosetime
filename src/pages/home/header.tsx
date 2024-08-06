import React from "react";
import { FlatList, View, Text, StyleSheet, Image, Pressable, Dimensions } from "react-native";

import FastImage from "react-native-fast-image";
import Animated, { useSharedValue, withDecay, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import { ShadowedView } from "react-native-fast-shadow";

import Slider from "./slider";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import { ENV } from "../../configs/ENV";
import theme from "../../configs/theme";

const { width, height } = Dimensions.get("window");

function Header({ navigation, setSliderHeight }: any): React.JSX.Element {

	// 控件
	// 参数
	const imagelist = [
		require("../../assets/images/discussBg/bac01.png"),
		require("../../assets/images/discussBg/bac02.png"),
		require("../../assets/images/discussBg/bac03.png"),
		require("../../assets/images/discussBg/bac04.png"),
		require("../../assets/images/discussBg/bac05.png"),
	];
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染
	let homedata = React.useRef<any>({
		banner: [],
		newitem: {},
		smellitems: [],
		hotvod: [],
		newvod: {},
		topiclist: [],
		knowledgeitems: [],
	}); // 首页数据
	// 变量
	const initX = useSharedValue<number>(0); // 初始化位置
	const initY = useSharedValue<number>(0); // 初始化位置
	const prev_style = useSharedValue<number>(0);
	const width = useSharedValue<number>(0);

	// 获取顶部内容高度
	const onLayout = (event: any) => {
		const { height: viewHeight } = event.nativeEvent.layout;
		events.publish("HomeHeaderHeight", viewHeight);
	};

	// 初始化首页数据
	React.useEffect(() => {
		http.get(ENV.article + "?method=gethomearticles").then((resp_data: any) => {
			Object.assign(homedata.current, resp_data);
			http.get(ENV.evaluate + "?method=gethomemorevod").then((resp_data2: any) => {
				resp_data2.items_heji.map((item: any) => {
					item["maintit"] = item["name"].split("：")[0];
					item["subtit"] = item["name"].split("：")[1];
				});
				// 处理本期视频数据
				if (resp_data2.items_heji.length > 0 && resp_data.newitem.id == resp_data2.items_heji[0].viid) {
					homedata.current.newvod = resp_data2.items_heji[1];
				} else {
					homedata.current.newvod = resp_data2.items_heji[0];
				}
				setIsRender(val => !val);
				cache.saveItem("newitemid", [resp_data.newitem.id, homedata.current.newvod.viid], 12 * 3600);
			}).catch((error: any) => { });
		}).catch((error: any) => { });

		http.get(ENV.evaluate + "?method=gethotvod").then((resp_data: any) => {
			resp_data.map((item: any) => {
				item["maintit"] = item["name"].split("：")[0];
				item["subtit"] = item["name"].split("：")[1];
			});
			homedata.current.hotvod = resp_data;
		}).catch((error: any) => { });

		http.get(ENV.shequ + "?method=gettopiclist&forum=热门讨论").then((resp_data: any) => {
			homedata.current.topiclist = resp_data;
		}).catch((error: any) => { });
	}, []);

	const gotoArticle = (id: number) => {
		navigation.navigate("Page", { screen: "ArticleDetail", params: { id } });
	}

	const gotoVod = (item: any) => {
		if (item.mid != null) {
			navigation.navigate("Page", { screen: "MediaListDetail", params: { mid: item.mid, id: item.viid } });
		} else {
			navigation.navigate("Page", { screen: "ArticleDetail", params: { id: item.viid } });
		}
	}

	const pan = Gesture.Pan().onStart((event: any) => {
		initX.value = event.absoluteX;
		initY.value = event.absoluteY;
	}).onChange((event: any) => {
		let dis = event.absoluteX - initX.value;
		let abs_dis = Math.abs(dis);
		let rate = abs_dis / width.value;
		prev_style.value = (6 + 27 * rate)
		// console.log("%c Line:99 🥝 event", "color:#42b983", event);
	});

	const animatedStyles = useAnimatedStyle(() => ({
		left: withTiming(prev_style.value),
	}));

	// 获取slider高度，用于开发顶部搜索框根据滑动距离显示背景颜色
	return (
		<View onLayout={onLayout}>
			<Slider navigation={navigation} banner={homedata.current.banner} setSliderHeight={setSliderHeight} />
			<View style={styles.homepart}>
				<Pressable onPress={() => { gotoArticle(homedata.current.newitem.id) }}>
					<Text style={styles.title}>{"本期专题"}</Text>
					<View style={[styles.newarticleimg, styles.homemargin, styles.homebrs8]}>
						<FastImage style={{ width: "100%", height: "100%" }} source={{ uri: ENV.image + homedata.current.newitem.pic }} />
					</View>
					<View style={styles.title_box}>
						<Text numberOfLines={1} style={[styles.newitemtit2, styles.newitemtit]}>{homedata.current.newitem?.title2}</Text>
						<Text numberOfLines={1} style={[styles.newitemtit3, styles.newitemtit]}>{homedata.current.newitem?.title3}</Text>
					</View>
				</Pressable>
			</View>
			<View style={styles.homepart}>
				<Text style={styles.title}>{"寻味之旅"}</Text>
				<FlatList data={homedata.current.smellitems}
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingRight: 20 }}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item }: any) => {
						return (
							<View style={styles.itemContainer}>
								<Pressable onPress={() => { gotoArticle(item.id) }}>
									<View style={[styles.itemImg, styles.homebrs6]}>
										{(homedata.current.smellitems && homedata.current.smellitems.length > 0) && <FastImage style={{ width: "100%", height: "100%" }}
											source={{ uri: ENV.image + item.pic }} />}
									</View>
									<Text numberOfLines={1} style={styles.smellitemtit2}>{item.title2}</Text>
									<Text numberOfLines={1} style={styles.smellitemtit3}>{item.title3}</Text>
								</Pressable>
							</View>
						)
					}}
				/>
			</View>
			<View style={styles.homepart} onLayout={(event: any) => { width.value = event.nativeEvent.layout.width }}>
				<Text style={styles.title}>{"秒懂百科"}</Text>
				<GestureDetector gesture={pan}>
					<View style={styles.wiki_list_con}>
						{homedata.current.knowledgeitems.length > 0 && homedata.current.knowledgeitems.map((item: any, index: number) => {
							return (
								<Animated.View key={item.id} style={[
									styles.wiki_list_item,
									animatedStyles,
									index == 0 && styles.list_prev_item,
									index == 1 && styles.list_cur_item,
									index == 2 && styles.list_next_item,
								]}>
									<ShadowedView style={styles.item_shadowed}>
										<Image style={styles.list_item_img} source={{ uri: ENV.image + item.pic + "!l" }} />
										<Text numberOfLines={1} style={styles.list_item_tit}>{item.title2}</Text>
										<Text style={[styles.list_item_tit, styles.list_item_tit2]}>{item.title3}</Text>
									</ShadowedView>
								</Animated.View>
							)
						})}
					</View>
				</GestureDetector>
			</View>
			<View style={styles.homepart}>
				<Text style={styles.title}>{"本期视频"}</Text>
				<View style={styles.homemargin}>
					<Pressable onPress={() => { gotoArticle(homedata.current.newvod.viid) }}>
						<View style={[styles.newvideoimg, styles.homebrs8]}>
							{(homedata.current.newvod && homedata.current.newvod.vpicurl) && <FastImage style={{ width: "100%", height: "100%" }}
								source={{ uri: homedata.current.newvod.vpicurl }} />}
							<Image style={styles.triangle} source={require("../../assets/images/player/play.png")} resizeMode="contain" />
						</View>
						<Text numberOfLines={1} style={[styles.newvideomaintit]}>{homedata.current.newvod.maintit}</Text>
						{homedata.current.newvod.subtit && <Text numberOfLines={1} style={[styles.newvideosubtit]}>{homedata.current.newvod.subtit}</Text>}
					</Pressable>
				</View>
			</View>
			<View style={styles.homepart}>
				<Text style={styles.title}>{"热门视频"}</Text>
				<FlatList data={homedata.current.hotvod}
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={{ paddingRight: 20 }}
					keyExtractor={(item: any, index: number) => item.viid + index}
					renderItem={({ item, index }: any) => {
						return (
							<View style={[styles.itemContainer, { width: 264 }]}>
								<Pressable onPress={() => { gotoVod(item) }}>
									<View style={[styles.itemvodImg, styles.homebrs6]}>
										{(homedata.current.hotvod && homedata.current.hotvod.length > 0) && <FastImage style={{ width: "100%", height: "100%" }}
											source={{ uri: item.vpicurl }} />}
										<Image style={styles.triangle} source={require("../../assets/images/player/play.png")} resizeMode="contain" />
									</View>
									<Text numberOfLines={1} style={styles.smellitemtit2}>{item.maintit}</Text>
									<Text numberOfLines={1} style={styles.smellitemtit3}>{item.subtit}</Text>
								</Pressable>
							</View>
						)
					}}
				/>
			</View>
			<View style={styles.homepart}>
				<Text style={styles.title}>{"热门讨论"}</Text>
				<FlatList data={homedata.current.topiclist}
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.topicContent}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item, index }: any) => {
						return (
							<Pressable onPress={() => {
								navigation.navigate("Page", { screen: "SocialShequDetail", params: { id: item.id, ctdlgid: item.dlgid } });
							}} style={styles.topicitem}>
								<View style={[styles.topicitemImg, styles.homebrs6]}>
									{(homedata.current.topiclist && homedata.current.topiclist.length > 0) &&
										<Image style={styles.topicitemImg} source={(imagelist[(index % 5)])} />}
								</View>
								<View style={styles.topic_title_box}>
									<Text numberOfLines={2} style={styles.topicitemtit}>{item.title}</Text>
									<Text style={[styles.topicitemcnt]}>- {item.cnt} 人互动 -</Text>
								</View>
							</Pressable>
						)
					}}
				/>
			</View>
		</View>
	);
}

const styles = StyleSheet.create({
	homepart: {
		paddingBottom: 15,
		backgroundColor: theme.toolbarbg,
	},
	homemargin: {
		marginLeft: 20,
		marginRight: 20,
	},
	homebrs8: {
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: theme.bg,
	},
	homebrs6: {
		borderRadius: 6,
		overflow: "hidden",
		backgroundColor: theme.bg,
	},
	newarticleimg: {
		width: width - 40,
		aspectRatio: (width - 40) / ((width - 40) * 0.58555),
	},
	title_box: {
		position: "absolute",
		bottom: "13%",
		paddingLeft: 42,
	},
	title: {
		fontSize: 16,
		fontWeight: "bold",
		color: theme.tit2,
		paddingTop: 18,
		paddingLeft: 20,
		overflow: "hidden",
		marginBottom: 10,
	},
	newitemtit: {
		textShadowColor: theme.textShadow,
		textShadowRadius: 6,
		color: theme.toolbarbg,
	},
	newitemtit2: {
		fontSize: 18,
		marginBottom: 6,
		fontWeight: "500",
	},
	newitemtit3: {
		fontSize: 14,
		fontWeight: "400",
	},
	itemContainer: {
		width: 260,
		marginLeft: 20,
	},
	itemImg: {
		width: 260,
		aspectRatio: 260 / (260 * 0.585),
	},
	smellitemtit2: {
		color: theme.tit2,
		marginTop: 13,
		fontWeight: "500",
		fontSize: 15,
	},
	smellitemtit3: {
		fontSize: 14,
		color: theme.text2,
		marginTop: 5,
	},
	wiki_list_con: {
		width: "100%",
		height: 260,
	},
	item_shadowed: {
		borderRadius: 8,
		overflow: "hidden",
		shadowOpacity: 0.1,
		shadowRadius: 10,
		shadowOffset: {
			width: 0,
			height: 0,
		},
	},
	wiki_list_item: {
		position: "absolute",
		top: 25,
		width: 180,
		backgroundColor: theme.toolbarbg,
	},
	list_prev_item: {
		transform: [{ scale: 1 }],
		// opacity: 0.7,
		left: "6%",
		zIndex: 1,
	},
	list_cur_item: {
		transform: [{ scale: 1.25 }],
		opacity: 1,
		left: "27%",
		zIndex: 2,
	},
	list_next_item: {
		transform: [{ scale: 1 }],
		// opacity: 0.7,
		left: "48%",
		zIndex: 1,
	},
	list_item_img: {
		width: 180,
		height: 138,
	},
	list_item_tit: {
		fontSize: 12,
		paddingVertical: 10,
		paddingHorizontal: 8,
		fontWeight: "500",
		fontFamily: "PingFang SC",
		color: theme.text2,
		textAlign: "center",
		backgroundColor: theme.toolbarbg,
	},
	list_item_tit2: {
		fontSize: 10,
		paddingTop: 0,
		paddingBottom: 7,
		color: theme.placeholder,
	},
	newvideoimg: {
		width: width - 40,
		aspectRatio: 1728 / 1080,
	},
	triangle: {
		position: "absolute",
		width: 34,
		height: 34,
		zIndex: 9,
		bottom: "8%",
		right: "6%",
	},
	newvideomaintit: {
		fontSize: 15,
		fontWeight: "500",
		color: theme.text1,
		marginTop: 13,
	},
	newvideosubtit: {
		fontSize: 14,
		color: theme.comment,
		marginTop: 3,
	},
	itemvodImg: {
		width: 264,
		aspectRatio: 1728 / 1080,
	},
	topicContent: {
		paddingRight: 20,
		height: 190,
	},
	topicitem: {
		width: 148,
		height: 190,
		marginLeft: 20,
	},
	topicitemImg: {
		width: "100%",
		height: "100%",
	},
	topic_title_box: {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		paddingHorizontal: 19,
		alignItems: "center",
		justifyContent: "center",
	},
	topicitemtit: {
		fontSize: 15,
		marginBottom: 10,
		color: theme.toolbarbg,
		textAlign: "center",
	},
	topicitemcnt: {
		fontSize: 12,
		marginTop: 10,
		color: theme.toolbarbg,
	}
})

export default Header;