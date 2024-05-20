import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, Image } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { Grayscale } from "react-native-color-matrix-image-filters"

import http from "../../utils/api/http";

import smartService from "../../services/smart-service/smart-service";
import us from "../../services/user-service/user-service";

import ListBottomTip from "../../components/listbottomtip";
import SkewableView from "../../components/SkewableView";
import RnImage from "../../components/RnImage";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

const SmartWiki = React.memo(({ navigation }: any) => {
	// 控件
	// 变量
	const [isrender, setIsRender] = React.useState(false); // 是否渲染
	let current_tab = React.useRef<string>("brand"); // 当前tab
	let current_index = React.useRef<number>(0); // 当前tab的索引
	// 数据
	let wikilist = React.useRef<any[]>([
		{ tit: "品牌", text: "brand", code: 2, items: [], noMore: false, img: require("../../assets/images/tab1-1.jpg") },
		{ tit: "气味", text: "odor", code: 1, items: [], noMore: false, img: require("../../assets/images/tab2-1.jpg") },
		{ tit: "调香师", text: "perfumer", code: 3, items: [], noMore: false, img: require("../../assets/images/tab3-1.jpg") },
		{
			tit: "香调", text: "fragrance", items: [],
			lists: [
				{ text: "hua", code: 14000008 },
				{ text: "dong", code: 14000002 },
				{ text: "mu", code: 14000003 },
				{ text: "pi", code: 14000010 },
				{ text: "gan", code: 14000004 },
				{ text: "fu", code: 14000001 },
				{ text: "fang", code: 14000012 },
				{ text: "ye", code: 14000005 },
				{ text: "shui", code: 14000006 },
				{ text: "ju", code: 14000011 },
				{ text: "mei", code: 14000009 },
				{ text: "guo", code: 14000007 },
			],
			noMore: false,
			img: require("../../assets/images/tab4-1.jpg")
		}
	]);
	let favs = React.useRef<any>({}); // 用户喜欢的数据列表
	let like_ = React.useRef<any>({}); // 用户喜欢的数据ID列表
	// 参数
	const words: any = { brand: "品牌", odor: "气味", perfumer: "调香师", fragrance: "香调" };
	// 状态


	React.useEffect(() => {
		init();

		events.addListener("nosetime_smartlistUpdated", (type: string) => {
			if (current_tab.current != type) return;
			wikilist.current[current_index.current].items = smartService.getItems(type);
			wikilist.current[current_index.current].noMore = !smartService.moreDataCanBeLoaded(type);
			var ids = [];
			for (var i in wikilist.current[current_index.current].items) {
				ids.push(wikilist.current[current_index.current].items[i].id);
			}
			islike(ids);
		});
		events.addListener("nosetime_smartlistUpdatedError", (type) => {
			wikilist.current[current_index.current].noMore = !smartService.moreDataCanBeLoaded(type);
			setIsRender((val) => !val);
		});
		return () => {
			events.removeAllListeners("nosetime_smartlistUpdated");
			events.removeAllListeners("nosetime_smartlistUpdatedError");
		}
	}, [])

	const init = () => {
		clicktab("brand");
	}

	const islike = (ids: any[]) => {
		if (!us.user.uid || ids.length == 0) {
			setIsRender((val) => !val);
			return;
		}
		http.post(ENV.wiki, { method: "islike", uid: us.user.uid, ids: ids }).then((resp_data: any) => {
			for (var i in resp_data) {
				like_.current[resp_data[i]] = 1;
			}
			setIsRender((val) => !val);
		});
	}

	const getfavs = (word: string) => {
		if (!us.user.uid) return;
		http.post(ENV.user + "?uid=" + us.user.uid, { method: "getfav", token: us.user.token, type: words[word] }).then((resp_data: any) => {
			favs.current[current_tab.current] = resp_data.slice(0, 3);
		});
	}

	const clicktab = (tab: string) => {
		current_tab.current = tab;
		current_index.current = wikilist.current.findIndex((item: any) => {
			return item.text == tab;
		})

		smartService.fetch(current_tab.current, us.user.uid, "init");

		if (favs.current[tab] == undefined) getfavs(tab);
	}

	const loadMore = () => {

	}

	return (
		<>
			{(wikilist.current[current_index.current].items && wikilist.current[current_index.current].items.length > 0) && <FlashList data={wikilist.current[current_index.current].items}
				estimatedItemSize={100}
				onEndReached={loadMore}
				onEndReachedThreshold={0.1}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ backgroundColor: theme.toolbarbg }}
				keyExtractor={(item: any) => item.id}
				ListHeaderComponent={(
					<View style={styles.wiki_header_con}>
						<View style={styles.header_img_con}>
							{wikilist.current.map((item: any, index: number) => {
								let SkewViewW = 0;
								if (index == 1) {
									SkewViewW = width * 0.335;
								} else if (index == 2) {
									SkewViewW = width * 0.30;
								} else if (index == 3) {
									SkewViewW = width * 0.41;
								} else {
									SkewViewW = width * 0.275;
								}
								return (
									<SkewableView
										key={index}
										skewDirection={"horizontal-right"}
										style={[
											styles.header_img,
											index == 1 && { left: width * 0.218, zIndex: 6 },
											index == 2 && { left: width * 0.49, zIndex: 8 },
											index == 3 && { left: width * 0.71, zIndex: 2 },
										]}
										skewValue={index == 0 ? 0 : 10}
										skewUnits={"deg"}
										boundingBoxWidth={SkewViewW}
										boundingBoxHeight={130}>
										<Pressable onPress={() => {
											clicktab(item.text);
										}} style={[{
											width: SkewViewW,
											height: 130,
											justifyContent: "flex-end",
										}]}>
											{current_index.current == index && <View style={styles.image_con}>
												<Image
													style={{ width: "100%", height: "100%" }}
													defaultSource={require("../../assets/images/nopic.png")}
													source={item.img}
												/>
											</View>}
											{(current_index.current != index) && <Grayscale style={styles.image_con}>
												<Image
													style={{ width: "100%", height: "100%" }}
													defaultSource={require("../../assets/images/nopic.png")}
													source={item.img}
												/>
											</Grayscale>}
											<Text style={[
												styles.header_img_tit,
												index == 0 && { left: SkewViewW * 0.22 },
												index == 1 && { left: SkewViewW * 0.37 },
												index == 2 && { left: SkewViewW * 0.26 },
												index == 3 && { left: SkewViewW * 0.32 }
											]}>{item.tit}</Text>
											{(current_index.current != index) && <View style={styles.header_img_msk}></View>}
										</Pressable>
									</SkewableView>
								)
							})}
						</View>
						{current_index.current != 3 && <View style={[styles.like_con, styles.flex_row]}>
							<Text style={styles.flex_row_tit}>{"我喜欢的" + wikilist.current[current_index.current].tit}</Text>
							<View style={styles.flex_row}>
								{(favs.current[current_tab.current] && favs.current[current_tab.current].length > 0) && favs.current[current_tab.current].map((item: any, index: number) => {
									return (
										<View key={item.id}>
											{current_tab.current == "brand" && <Image style={styles.like_avatar}
												defaultSource={require("../../assets/images/nopic.png")}
												source={{ uri: ENV.image + "/brand/" + (item.id % 100000) + ".jpg" }}
												resizeMode="contain"
											/>}
											{current_tab.current == "odor" && <Image style={styles.like_avatar}
												defaultSource={require("../../assets/images/nopic.png")}
												source={{ uri: ENV.image + "/odor/" + (item.id % 100000) + ".jpg" }}
												resizeMode="contain"
											/>}
											{current_tab.current == "perfumer" && <RnImage style={styles.like_avatar}
												source={{ uri: ENV.image + "/nosevi/" + item.id + ".jpg" }}
												resizeMode="contain"
											/>}
										</View>
									);
								})}
								<Icon name="r-return" size={15} color={theme.tit2} />
							</View>
						</View>}
					</View>
				)}
				renderItem={({ item, index }: any) => {
					return (
						<View style={styles.wiki_item_con}>

						</View>
					)
				}}
				ListFooterComponent={<ListBottomTip noMore={wikilist.current[current_index.current].noMore} isShowTip={wikilist.current[current_index.current].items.length > 0} />}
			/>}
		</>
	);
})

const styles = StyleSheet.create({
	wiki_header_con: {

	},
	header_img_con: {
		position: "relative",
		height: 130,
		paddingTop: 5,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	header_img: {
		position: "absolute",
		top: 0,
		left: 0,
		zIndex: 5,
	},
	image_con: {
		position: "absolute",
		width: "100%",
		height: "100%",
	},
	header_img_tit: {
		color: theme.toolbarbg,
		fontSize: 15,
		marginBottom: "7%",
		textShadowColor: "#777",
		textShadowRadius: 6,
		textShadowOffset: {
			width: 0,
			height: 0
		},
	},
	header_img_msk: {
		position: "absolute",
		width: "100%",
		height: "100%",
		backgroundColor: "rgba(188,188,188,0.2)"
	},
	flex_row: {
		flexDirection: "row",
		alignItems: "center",
	},
	flex_row_tit: {
		fontSize: 15,
		color: theme.tit2,
	},
	like_con: {
		height: 55,
		borderBottomWidth: 1,
		borderBottomColor: theme.bg,
		justifyContent: "space-between",
		paddingHorizontal: 20,
	},
	like_avatar: {
		width: 30,
		height: 30,
		borderRadius: 15,
		overflow: "hidden",
		marginRight: 5,
		backgroundColor: theme.toolbarbg,
	},
	wiki_item_con: {

	}
});

export default SmartWiki;