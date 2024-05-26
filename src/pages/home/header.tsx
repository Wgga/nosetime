import React from "react";
import { FlatList, View, Text, StyleSheet, Image, VirtualizedList, NativeEventEmitter, Pressable, ImageBackground, Dimensions } from "react-native";

import FastImage from "react-native-fast-image";

import { ENV } from "../../configs/ENV";
import theme from "../../configs/theme";

import http from "../../utils/api/http";

import Slider from "./slider";

import cache from "../../hooks/storage/storage";

const events = new NativeEventEmitter();
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
	let homedataref = React.useRef<any>({
		banner: [],
		newitem: {},
		smellitems: [],
		hotvod: [],
		newvod: {},
		topiclist: []
	}); // 首页数据

	// 变量

	// 获取顶部内容高度
	const onLayout = (event: any) => {
		const { height: viewHeight } = event.nativeEvent.layout;
		events.emit("HomeHeaderHeight", viewHeight);
	};

	const [responsiveScreen, setResponsiveScreen] = React.useState();

	// 初始化首页数据
	React.useEffect(() => {
		http.get(ENV.article + "?method=gethomearticles").then((resp_data: any) => {
			Object.assign(homedataref.current, resp_data);
			http.get(ENV.evaluate + "?method=gethomemorevod").then((resp_data2: any) => {
				resp_data2.items_heji.map((item: any) => {
					item["maintit"] = item["name"].split("：")[0];
					item["subtit"] = item["name"].split("：")[1];
				});
				// 处理本期视频数据
				if (resp_data2.items_heji.length > 0 && resp_data.newitem.id == resp_data2.items_heji[0].viid) {
					homedataref.current.newvod = resp_data2.items_heji[1];
				} else {
					homedataref.current.newvod = resp_data2.items_heji[0];
				}
				setIsRender((val) => !val);
				cache.saveItem("newitemid", [resp_data.newitem.id, homedataref.current.newvod.viid], 12 * 3600);
			}).catch((error: any) => { });
		}).catch((error: any) => { });

		http.get(ENV.evaluate + "?method=gethotvod").then((resp_data: any) => {
			resp_data.map((item: any) => {
				item["maintit"] = item["name"].split("：")[0];
				item["subtit"] = item["name"].split("：")[1];
			});
			homedataref.current.hotvod = resp_data;
		}).catch((error: any) => { });

		http.get(ENV.shequ + "?method=gettopiclist&forum=热门讨论").then((resp_data: any) => {
			homedataref.current.topiclist = resp_data;
		}).catch((error: any) => { });
	}, []);

	const gotoArticle = (id: number) => {
		navigation.navigate("Page", { screen: "ArticleDetail", params: { id } });
	}

	const gotoVod = (x: any) => {
		if (x.mid != null) {
			// navigation.navigate("Page", { screen: "MediaListDetail", params: { mid: x.mid, viid: x.viid } });
		} else {
			navigation.navigate("Page", { screen: "ArticleDetail", params: { id: x.viid } });
		}
	}

	const [isvisible, setIsVisible] = React.useState(false);

	// 获取slider高度，用于开发顶部搜索框根据滑动距离显示背景颜色
	return (
		<View onLayout={onLayout}>
			<Slider navigation={navigation} banner={homedataref.current.banner} setSliderHeight={setSliderHeight} />
			<View style={styles.homepart}>
				<Pressable onPress={() => { gotoArticle(homedataref.current.newitem.id) }}>
					<Text style={styles.title}>本期专题</Text>
					<View style={[styles.newarticleimg, styles.homemargin]}>
						<Image style={styles.newarticleimg} source={{ uri: ENV.image + homedataref.current.newitem.pic, cache: "force-cache" }} />
					</View>
					<View style={styles.title_box}>
						<Text numberOfLines={1} style={[styles.newitemtit2, styles.newitemtit]}>{homedataref.current.newitem?.title2}</Text>
						<Text numberOfLines={1} style={[styles.newitemtit3, styles.newitemtit]}>{homedataref.current.newitem?.title3}</Text>
					</View>
				</Pressable>
			</View>
			<View style={styles.homepart}>
				<Text style={styles.title}>寻味之旅</Text>
				<FlatList
					data={homedataref.current.smellitems}
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.contentContainer}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item }: any) => {
						return (
							<View style={styles.itemContainer}>
								<Pressable onPress={() => { gotoArticle(item.id) }}>
									<View style={styles.itemImg}>
										{(homedataref.current.smellitems && homedataref.current.smellitems.length > 0) &&
											<FastImage
												style={styles.itemImg}
												source={{
													uri: ENV.image + item.pic,
												}}
												resizeMode={FastImage.resizeMode.cover}
											/>}
									</View>
									<Text numberOfLines={1} style={[styles.smellitemtit2]}>{item.title2}</Text>
									<Text numberOfLines={1} style={[styles.smellitemtit3]}>{item.title3}</Text>
								</Pressable>
							</View>
						)
					}}
				/>
			</View>
			<View style={styles.homepart}>
				<Text style={styles.title}>本期视频</Text>
				<View style={styles.homemargin}>
					<Pressable onPress={() => { gotoArticle(homedataref.current.newvod.viid) }}>
						<View style={styles.newvideoimg}>
							{(homedataref.current.newvod && homedataref.current.newvod.vpicurl) && <Image
								style={styles.newvideoimg}
								source={{ uri: homedataref.current.newvod.vpicurl, cache: "force-cache" }}
							/>}
							<Image style={styles.triangle}
								source={require("../../assets/images/player/play.png")}
								resizeMode="cover"
							/>
						</View>
						<Text numberOfLines={1} style={[styles.newvideomaintit]}>{homedataref.current.newvod.maintit}</Text>
						{homedataref.current.newvod.subtit && <Text numberOfLines={1} style={[styles.newvideosubtit]}>{homedataref.current.newvod.subtit}</Text>}
					</Pressable>
				</View>
			</View>
			<View style={styles.homepart}>
				<Text style={styles.title}>热门视频</Text>
				<FlatList
					data={homedataref.current.hotvod}
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.contentContainer}
					keyExtractor={(item: any, index: number) => item.viid + index}
					renderItem={({ item, index }: any) => {
						return (
							<View style={styles.itemContainer}>
								<Pressable onPress={() => { gotoVod(item) }}>
									<View style={styles.itemImg}>
										{(homedataref.current.hotvod && homedataref.current.hotvod.length > 0) &&
											<FastImage
												style={styles.itemImg}
												source={{
													uri: item.vpicurl,
												}}
												resizeMode={FastImage.resizeMode.cover}
											/>
										}
										<ImageBackground style={styles.triangle}
											source={require("../../assets/images/player/play.png")}
											resizeMode="cover"
										/>
									</View>
									<Text numberOfLines={1} style={[styles.smellitemtit2]}>{item.maintit}</Text>
									<Text numberOfLines={1} style={[styles.smellitemtit3]}>{item.subtit}</Text>
								</Pressable>
							</View>
						)
					}}
				/>
			</View>
			<View style={styles.homepart}>
				<Text style={styles.title}>热门讨论</Text>
				<FlatList
					data={homedataref.current.topiclist}
					horizontal={true}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={styles.topicContent}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item, index }: any) => {
						return (
							<Pressable onPress={() => {
								setIsVisible(true)
							}} style={styles.topicitem}>
								<View style={styles.topicitemImg}>
									{(homedataref.current.topiclist && homedataref.current.topiclist.length > 0) &&
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
	blurhashImage: {
		width: width - 40,
		height: (width - 40) * 0.58555,
	},
	newarticleimg: {
		width: width - 40,
		height: (width - 40) * 0.58555,
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: theme.bg,
	},
	title_box: {
		position: "absolute",
		width: "auto",
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
	scrollX: {
		margin: 0,
		paddingRight: 20,
	},
	contentContainer: {
		paddingRight: 20,
		height: 211.09,
	},
	itemContainer: {
		width: 260,
		marginLeft: 20,
		borderRadius: 6,
		overflow: "hidden",
	},
	itemImg: {
		width: 260,
		height: 260 * 0.585,
		borderRadius: 6,
		overflow: "hidden",
		backgroundColor: theme.bg,
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
	newvideoimg: {
		width: width - 40,
		height: (width - 40) * 0.625,
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: theme.bg,
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
	topicContent: {
		paddingRight: 20,
		height: 190,
	},
	topicitem: {
		width: 148,
		height: 190,
		marginLeft: 20,
		borderRadius: 6,
		overflow: "hidden",
	},
	topicitemImg: {
		width: "100%",
		height: "100%",
		borderRadius: 6,
		backgroundColor: theme.bg,
		overflow: "hidden",
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
		textAlign: 'center',
	},
	topicitemcnt: {
		fontSize: 12,
		marginTop: 10,
		color: theme.toolbarbg,
	}
})

export default Header;