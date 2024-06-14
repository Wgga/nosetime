import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, Image } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { Grayscale } from "react-native-color-matrix-image-filters"

import ListBottomTip from "../../components/listbottomtip";
import SkewableView from "../../components/SkewableView";
import RnImage from "../../components/RnImage";

import smartService from "../../services/smart-service/smart-service";
import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import events from "../../hooks/events/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlestarLeft } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

const SmartWiki = React.memo(({ navigation }: any) => {
	// 控件
	// 参数
	const words: any = { brand: "品牌", odor: "气味", perfumer: "调香师", fragrance: "香调" };
	// 变量
	let current_tab = React.useRef<string>("brand"); // 当前tab
	let current_index = React.useRef<number>(0); // 当前tab的索引
	// 状态
	const [isrender, setIsRender] = React.useState(false); // 是否渲染
	// 数据
	let wikilist = React.useRef<any[]>([
		{ tit: "品牌", text: "brand", code: 2, items: [], noMore: false, img: require("../../assets/images/tab1-1.jpg") },
		{ tit: "气味", text: "odor", code: 1, items: [], noMore: false, img: require("../../assets/images/tab2-1.jpg") },
		{ tit: "调香师", text: "perfumer", code: 3, items: [], noMore: false, img: require("../../assets/images/tab3-1.jpg") },
		{
			tit: "香调", text: "fragrance", items: [],
			lists: [
				{ text: "hua", id: 14000008, style: { top: width * 0.16, left: width * 0.418 } },
				{ text: "dong", id: 14000002, style: { top: width * 0.18, left: width * 0.56 } },
				{ text: "mu", id: 14000003, style: { top: width * 0.27, left: width * 0.66 } },
				{ text: "pi", id: 14000010, style: { top: width * 0.41, left: width * 0.68 } },
				{ text: "gan", id: 14000004, style: { top: width * 0.55, left: width * 0.66 } },
				{ text: "fu", id: 14000001, style: { top: width * 0.64, left: width * 0.56 } },
				{ text: "fang", id: 14000012, style: { top: width * 0.67, left: width * 0.42 } },
				{ text: "ye", id: 14000005, style: { top: width * 0.64, left: width * 0.28 } },
				{ text: "shui", id: 14000006, style: { top: width * 0.56, left: width * 0.17 } },
				{ text: "ju", id: 14000011, style: { top: width * 0.42, left: width * 0.15 } },
				{ text: "mei", id: 14000009, style: { top: width * 0.27, left: width * 0.18 } },
				{ text: "guo", id: 14000007, style: { top: width * 0.18, left: width * 0.28 } },
			],
			noMore: false,
			img: require("../../assets/images/tab4-1.jpg")
		}
	]);
	let favs = React.useRef<any>({}); // 用户喜欢的数据列表
	let like_ = React.useRef<any>({}); // 用户喜欢的数据ID列表

	React.useEffect(() => {
		clicktab("brand");

		events.subscribe("nosetime_smartlistUpdated", (type: string) => {
			if (current_tab.current != type) return;
			wikilist.current[current_index.current].items = smartService.getItems(type);
			wikilist.current[current_index.current].noMore = !smartService.moreDataCanBeLoaded(type);
			let ids = [];
			for (var i in wikilist.current[current_index.current].items) {
				ids.push(wikilist.current[current_index.current].items[i].id);
			}
			islike(ids);
		});
		events.subscribe("nosetime_smartlistUpdatedError", (type) => {
			wikilist.current[current_index.current].noMore = !smartService.moreDataCanBeLoaded(type);
			setIsRender(val => !val);
		});
		return () => {
			events.unsubscribe("nosetime_smartlistUpdated");
			events.unsubscribe("nosetime_smartlistUpdatedError");
		}
	}, [])

	const islike = (ids: any[]) => {
		if (!us.user.uid) {
			setIsRender(val => !val);
			return navigation.navigate("Page", { screen: "Login", params: { src: "App发现百科页" } });
		}
		http.post(ENV.wiki, { method: "islike", uid: us.user.uid, ids: ids }).then((resp_data: any) => {
			for (var i in resp_data) {
				like_.current[resp_data[i]] = 1;
			}
			setIsRender(val => !val);
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

	const gotodetail = (page: string, item: any) => {
		if (page == "user-fav" && !us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App发现百科页面" } });
		}
		if (page == "item-detail") {
			navigation.push("Page", { screen: "ItemDetail", params: { id: item.id, src: "App发现百科页" } });
		} else if (page == "wiki-detail") {
			navigation.navigate("Page", { screen: "WikiDetail", params: { id: item.id } });
		} else if (page == "user-fav") {
			navigation.navigate("Page", { screen: "UserFav", params: { id: 2, uid: us.user.uid, type: item.text } });
		}
	}

	const togglefav = (wid: number) => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App发现页" } });
		}
		http.post(ENV.wiki + "?uid=" + us.user.uid, {
			method: "togglefav", wid: wid, token: us.user.token
		}).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				like_.current[wid] = true;
			} else if (resp_data.msg == "REMOVE") {
				like_.current[wid] = false;
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App发现页" } });
			}
			setIsRender(val => !val);
		});
	}

	return (
		<>
			{(wikilist.current[current_index.current].items && wikilist.current[current_index.current].items.length > 0) && <FlashList data={wikilist.current[current_index.current].items}
				extraData={isrender}
				estimatedItemSize={100}
				onEndReached={() => {
					smartService.fetch(current_tab.current, us.user.uid, "loadMore");
				}}
				onEndReachedThreshold={0.1}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ backgroundColor: theme.toolbarbg }}
				keyExtractor={(item: any) => item.id}
				ListHeaderComponent={<>
					<View style={styles.header_img_con}>
						{wikilist.current.map((item: any, index: number) => {
							let SkewViewW = 0;
							if (index == 1) {
								SkewViewW = width * 0.35;
							} else if (index == 2) {
								SkewViewW = width * 0.32;
							} else if (index == 3) {
								SkewViewW = width * 0.38;
							} else {
								SkewViewW = width * 0.27;
							}
							return (
								<SkewableView
									key={index}
									skewDirection={"horizontal-right"}
									style={[
										styles.header_img,
										index == 1 && { left: width * 0.19, zIndex: 6 },
										index == 2 && { left: width * 0.47, zIndex: 8 },
										index == 3 && { left: width * 0.71, zIndex: 2 },
									]}
									skewValue={index == 0 ? 0 : 10}
									skewUnits={"deg"}
									boundingBoxWidth={SkewViewW}
									boundingBoxHeight={width / 3.2}>
									<Pressable onPress={() => {
										clicktab(item.text);
									}} style={[{
										width: SkewViewW,
										height: width / 3.2,
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
					{current_index.current != 3 && <Pressable onPress={() => {
						gotodetail("user-fav", wikilist.current[current_index.current])
					}} style={[styles.like_con, styles.flex_row]}>
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
					</Pressable>}
					{current_index.current == 3 && <View style={styles.fragrance_image}>
						<Image style={{ width: "100%", height: "100%" }}
							source={require("../../assets/images/wiki/xiangdiaofenlei3.png")}
						/>
						{wikilist.current[current_index.current].lists.map((fran: any, index: number) => {
							return (
								<Pressable key={fran.id} onPress={() => {
									gotodetail("wiki-detail", fran)
								}}
									style={[styles.fragrance_image_item, fran.style]}>
								</Pressable>
							)
						})}
					</View>}
				</>}
				renderItem={({ item, index }: any) => {
					return (
						<View style={styles.wiki_item_con}>
							{item.type != "discuss" && <Pressable style={{ alignItems: "center" }} onPress={() => { gotodetail("wiki-detail", item) }}>
								{item.type == "brand" && <Image style={styles.wiki_brand_img}
									defaultSource={require("../../assets/images/nopic.png")}
									source={{ uri: ENV.image + "/brand/" + (item.id % 100000) + ".jpg" }}
									resizeMode="contain"
								/>}
								{item.type == "odor" && <Image style={styles.wiki_brand_img}
									defaultSource={require("../../assets/images/nopic.png")}
									source={{ uri: ENV.image + "/odor/" + (item.id % 100000) + ".jpg" }}
									resizeMode="contain"
								/>}
								{item.type == "perfumer" && <RnImage style={styles.wiki_brand_img}
									source={{ uri: ENV.image + "/nosevi/" + item.id + ".jpg" }}
									resizeMode="contain"
								/>}
								{item.type == "fragrance" && <Image style={styles.wiki_brand_img}
									defaultSource={require("../../assets/images/nopic.png")}
									source={{ uri: ENV.image + "/fragrance/" + item.id + ".jpg" }}
									resizeMode="contain"
								/>}
							</Pressable>}
							{(wikilist.current[current_index.current].text == item.type) && <View style={styles.wiki_item_name_con}>
								<Text style={styles.wiki_item_name}>{item.name}</Text>
								<Pressable onPress={() => { togglefav(item.id); }}>
									<Icon name={like_.current[item.id] ? "fav" : "fav-outline"} size={22} color={like_.current[item.id] ? theme.redchecked : theme.tit2} />
								</Pressable>
							</View>}
							{item.type == "brand" && <View style={styles.desc_con}>
								{item.desc && <Pressable onPress={() => {
									if (item.desc2) {
										item.isopen = !item.isopen;
										setIsRender(val => !val);
									}
								}}>
									{item.isopen && <Text style={[styles.desc_text, { fontFamily: "monospace" }]}>{item.desc}</Text>}
									{!item.isopen && <Text style={[styles.desc_text, { fontFamily: "monospace" }]}>{item.desc2}</Text>}
									{item.desc2 && <View style={[styles.desc_morebtn_con, item.isopen && styles.open_morebtn]}>
										{!item.isopen && <Text style={styles.desc_text}>{"..."}</Text>}
										{!item.isopen && <Text style={styles.desc_morebtn_text}>{"(显示全部)"}</Text>}
										{item.isopen && <Text style={styles.desc_morebtn_text}>{"(收起全部)"}</Text>}
									</View>}
								</Pressable>}
							</View>}
							{item.type == "discuss" && <View style={styles.wiki_discuss_con}>
								<Pressable style={{ marginLeft: 10 }} onPress={() => { gotodetail("item-detail", item) }} >
									<Image style={styles.discuss_img}
										defaultSource={require("../../assets/images/noxx.png")}
										source={{ uri: ENV.image + "/perfume/" + item.id + ".jpg!m" }}
										resizeMode="contain"
									/>
								</Pressable>
								<View style={{ flex: 1, marginRight: 10 }}>
									<Pressable onPress={() => { gotodetail("item-detail", item) }}>
										<Text numberOfLines={1} style={styles.discuss_name}>{item.cnname}</Text>
										<Text numberOfLines={2} style={styles.discuss_name}>{item.enname}</Text>
									</Pressable>
									<View style={styles.discuss_uname}>
										<Text style={styles.discuss_uname_text}>{item.uname}</Text>
										{item.score > 0 && <View style={Globalstyles.star}>
											<Image style={[Globalstyles.star_icon, handlestarLeft(item.score * 2)]}
												defaultSource={require("../../assets/images/nopic.png")}
												source={require("../../assets/images/star/star.png")}
											/>
										</View>}
									</View>
									{(item.odors && item.odors.length > 0) && <View style={styles.discuss_tagodor_con}>
										{item.odors.map((item2: any, index: number) => {
											return (
												<Image key={item2} style={styles.discuss_tagodor_img} defaultSource={require("../../assets/images/nopic.png")}
													source={{ uri: ENV.image + "/odor/" + item2 + ".jpg" }} />
											)
										})}
									</View>}
									{item.desc && <Pressable style={{ marginTop: 14 }} onPress={() => {
										if (item.desc2) {
											item.isopen = !item.isopen;
											setIsRender(val => !val);
										}
									}}>
										{item.isopen && <Text style={[styles.desc_text, { fontFamily: "monospace" }]}>{item.desc}</Text>}
										{!item.isopen && <Text style={[styles.desc_text, { fontFamily: "monospace" }]}>{item.desc2}</Text>}
										{item.desc2 && <View style={[styles.desc_morebtn_con, item.isopen && styles.open_morebtn]}>
											{!item.isopen && <Text style={styles.desc_text}>{"..."}</Text>}
											{!item.isopen && <Text style={styles.desc_morebtn_text}>{"(显示全部)"}</Text>}
											{item.isopen && <Text style={styles.desc_morebtn_text}>{"(收起全部)"}</Text>}
										</View>}
									</Pressable>}
								</View>
							</View>}
						</View>
					)
				}}
				ListFooterComponent={<ListBottomTip noMore={wikilist.current[current_index.current].noMore} isShowTip={wikilist.current[current_index.current].items.length > 0} />}
			/>}
		</>
	);
})

const styles = StyleSheet.create({
	header_img_con: {
		position: "relative",
		height: width / 3.2,
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
	fragrance_image: {
		width: width,
		height: width,
		paddingVertical: 15,
		paddingHorizontal: 10,
	},
	fragrance_image_item: {
		position: "absolute",
		width: width * 0.17,
		height: width * 0.17,
		borderRadius: 53,
	},
	wiki_item_con: {
		paddingTop: 11,
	},
	wiki_brand_img: {
		width: width * 0.7,
		height: 75,
	},
	wiki_item_name_con: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 12,
		marginBottom: 20,
		paddingHorizontal: 16,
	},
	wiki_item_name: {
		fontSize: 16,
		color: theme.tit2,
		marginRight: 11,
	},
	desc_con: {
		paddingHorizontal: 16,
		paddingVertical: 14,
		borderBottomWidth: 0.5,
		borderBottomColor: "rgba(224,224,224,0.5)",
	},
	desc_text: {
		fontSize: 14,
		lineHeight: 20,
		color: theme.text1,
	},
	desc_morebtn_con: {
		position: "absolute",
		right: 0,
		bottom: 0,
		flexDirection: "row",
		alignItems: "center",
	},
	open_morebtn: {
		position: "relative",
		justifyContent: "flex-end",
	},
	desc_morebtn_text: {
		fontSize: 14,
		color: theme.text1,
		marginLeft: 8,
	},
	wiki_discuss_con: {
		flexDirection: "row",
		paddingVertical: 14,
		borderBottomWidth: 0.5,
		borderBottomColor: "rgba(224,224,224,0.5)",
	},
	discuss_img: {
		width: 50,
		height: 50,
		marginRight: 10,
	},
	discuss_name: {
		color: theme.tit2,
		fontSize: 14,
	},
	discuss_uname: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		marginVertical: 5,
	},
	discuss_uname_text: {
		color: theme.comment,
		fontSize: 13,
		marginRight: 2,
	},
	discuss_tagodor_con: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 2,
	},
	discuss_tagodor_img: {
		width: 28,
		height: 28,
		borderRadius: 4,
		overflow: "hidden",
		opacity: 0.8,
		marginRight: 6,
	},
	discuss_desc: {
		fontSize: 14,
		marginTop: 14,
		color: theme.text2,
	}
});

export default SmartWiki;