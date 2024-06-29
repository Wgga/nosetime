import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image, FlatList, ScrollView } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TabBar, TabView } from "react-native-tab-view";
import FastImage from "react-native-fast-image";

import HeaderView from "../../components/headerview";
import ListBottomTip from "../../components/listbottomtip";
import AlertCtrl from "../../components/alertctrl";
import ToastCtrl from "../../components/toastctrl";
import RnImage from "../../components/RnImage";

import us from "../../services/user-service/user-service";
import articleService from "../../services/article-service/article-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

const ArticlePage = React.memo(({ uid, navigation }: any) => {

	// 控件

	// 变量
	// 数据
	let articlelist = React.useRef<any[]>([]);
	// 状态
	const [isrender, setIsRender] = React.useState(false);

	React.useEffect(() => {
		http.post(ENV.user + "?uid=" + us.user.uid, { method: "getfav", token: us.user.token, type: "文章" }).then((resp_data: any) => {
			articlelist.current = resp_data;
			setIsRender(val => !val);
		})
	}, [])

	const unitNumber = (number: number) => {
		return articleService.unitNumber(number, 1);
	}

	const deletefav = (item: any) => {
		AlertCtrl.show({
			header: "确定要删除吗？",
			key: "del_fav_alert",
			message: "",
			buttons: [{
				text: "取消",
				handler: () => {
					AlertCtrl.close("del_fav_alert");
				}
			}, {
				text: "确定",
				handler: () => {
					AlertCtrl.close("del_fav_alert");
					http.post(ENV.article + "?uid=" + us.user.uid, {
						method: "togglefav", aid: item.id, token: us.user.token
					}).then((resp_data: any) => {
						if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
							us.delUser();
							return navigation.navigate("Page", { screen: "Login", params: { src: "App我的喜好页面" } });
						}
						articlelist.current = articlelist.current.filter(item2 => { return item2.id != item.id });
						setIsRender(val => !val);
						ToastCtrl.show({ message: "删除成功", duration: 1000, viewstyle: "short_toast", key: "del_success_toast" });
					});
				}
			}],
		})
	}

	return (
		<>
			{(articlelist.current && articlelist.current.length > 0) && <FlatList data={articlelist.current}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={styles.list_container}
				keyExtractor={(item: any) => item.id}
				renderItem={({ item, index }: any) => {
					return (
						<Pressable onPress={() => {
							navigation.navigate("Page", { screen: "ArticleDetail", params: { id: item.id } });
						}} style={styles.list_item}>
							<FastImage style={styles.item_image}
								source={{ uri: ENV.image + item.apicurl + "!m" }}
							/>
							<View style={styles.item_info}>
								<Text style={styles.item_title}>{item.atitle}</Text>
								<View style={styles.flex_row}>
									<View style={[styles.icon_item_con, styles.flex_row]}>
										<View style={styles.icon_item}>
											<Icon name="heart" size={14} color={"#808080"} />
											<Text style={styles.icon_text}>{unitNumber(item.favcnt)}</Text>
										</View>
										<View style={styles.icon_item}>
											<Icon name="message" size={13.5} color={"#808080"} />
											<Text style={styles.icon_text}>{unitNumber(item.replycnt)}</Text>
										</View>
										<View style={styles.icon_item}>
											<Icon name="look" size={16} color={"#808080"} />
											<Text style={styles.icon_text}>{unitNumber(item.click)}</Text>
										</View>
									</View>
									<Pressable onPress={() => {
										deletefav(item)
									}}>
										<Icon name="del2" size={16} color={"#CCCCCC"} />
									</Pressable>
								</View>
							</View>
						</Pressable>
					)
				}}
				ListFooterComponent={<ListBottomTip noMore={true} isShowTip={articlelist.current.length > 0} />}
			/>}
		</>
	)
})
const VodPage = React.memo(({ uid, navigation }: any) => {

	// 控件
	// 变量
	// 数据
	let vodlist = React.useRef<any[]>([]);
	// 状态
	const [isrender, setIsRender] = React.useState(false);

	React.useEffect(() => {
		http.post(ENV.user + "?uid=" + uid, { method: "getfav", token: us.user.token, type: "视频" }).then((resp_data: any) => {
			resp_data.map((item: any) => {
				item["mainname"] = item["name"] ? item["name"].split("：")[0] : "";
				item["subname"] = item["name"] ? item["name"].split("：")[1] : "";
			});
			vodlist.current = resp_data;
			setIsRender(val => !val);
		})
	}, [])

	return (
		<>
			{(vodlist.current && vodlist.current.length > 0) && <FlatList data={vodlist.current}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[styles.list_container, { paddingTop: 20 }]}
				horizontal={false}
				numColumns={2}
				keyExtractor={(item: any) => item.mid}
				renderItem={({ item, index }: any) => {
					return (
						<View style={{
							marginBottom: 20,
							marginLeft: (index + 1) % 2 == 0 ? 8 : 0,
							marginRight: (index + 1) % 2 == 1 ? 8 : 0
						}}>
							<View style={styles.list_img_con}>
								<FastImage style={{ width: "100%", height: "100%" }}
									defaultSource={require("../../assets/images/nopic.png")}
									source={{ uri: item.picurl }}
								/>
								<Image style={styles.triangle}
									source={require("../../assets/images/player/play.png")}
								/>
							</View>
							{item.mainname && <Text numberOfLines={1} style={[styles.list_mainname, styles.list_width]}>{item.mainname}</Text>}
							{item.subname && <Text numberOfLines={1} style={[styles.list_subname, styles.list_width]}>{item.subname}</Text>}
						</View>
					)
				}}
				ListFooterComponent={<ListBottomTip noMore={true} isShowTip={vodlist.current.length > 0} />}
			/>
			}
		</>
	)
})
const WikiPage = React.memo(({ uid, navigation }: any) => {

	// 控件
	// 变量
	// 数据
	const wikilist: any = ["fragrances", "odors", "brands", "perfumers"];
	let wikidata = React.useRef<any>({
		fragrances: {
			items: [],
			moreitems: [],
			cnt: 0,
			text: "香调",
			index: 0
		},
		odors: {
			items: [],
			moreitems: [],
			cnt: 0,
			text: "气味",
			index: 0
		},
		brands: {
			items: [],
			moreitems: [],
			cnt: 0,
			text: "品牌",
			index: 0
		},
		perfumers: {
			items: [],
			moreitems: [],
			cnt: 0,
			text: "调香师",
			index: 0
		}
	});
	let wikilength = React.useRef<number>(0);
	let noMore = React.useRef<any>({
		fragrances: true,
		odors: true,
		brands: true,
		perfumers: true
	})

	// 状态
	const [isrender, setIsRender] = React.useState(false);

	React.useEffect(() => {
		init();
	}, [])

	const getlist = (type: string) => {
		return new Promise((resolve, reject) => {
			http.post(ENV.user + "?uid=" + us.user.uid, {
				method: "getfav", token: us.user.token, type: type
			}).then((resp_data: any) => {
				resolve(resp_data);
			})
		})
	}

	const init = () => {
		Promise.all([getlist("香调"), getlist("气味"), getlist("品牌"), getlist("调香师")]).then((resp_data: any) => {
			Object.keys(wikidata.current).forEach((item, index) => {
				wikidata.current[item]["cnt"] = resp_data[index].length;
				wikidata.current[item]["moreitems"] = resp_data[index].splice(3, 1000);
				wikidata.current[item]["items"] = resp_data[index];
				wikilength.current += resp_data[index].length;
				if (wikidata.current[item]["cnt"] <= wikidata.current[item]["items"].length) {
					noMore.current[item] = false;
				}
			})
			setIsRender(val => !val);
		})
	}

	const deletewiki = (item: any, type: string) => {
		AlertCtrl.show({
			header: "确定要删除吗？",
			key: "del_wiki_alert",
			message: "",
			buttons: [{
				text: "取消",
				handler: () => {
					AlertCtrl.close("del_wiki_alert");
				}
			}, {
				text: "确定",
				handler: () => {
					AlertCtrl.close("del_wiki_alert");
					http.post(ENV.wiki + "?uid=" + us.user.uid, {
						method: "togglefav", wid: item.id, token: us.user.token
					}).then((resp_data: any) => {
						if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
							us.delUser();
							return navigation.navigate("Page", { screen: "Login", params: { src: "App我的喜好页面" } });
						}
						wikidata.current[type].items = wikidata.current[type].items.filter((item2: any) => { return item2.id != item.id })
						wikidata.current[type]["cnt"] -= 1;
						setIsRender(val => !val);
						ToastCtrl.show({ message: "删除成功", duration: 1000, viewstyle: "short_toast", key: "del_success_toast" });
					});
				}
			}],
		})
	}

	const loadMore = (type: string) => {
		let wikidata2: any = wikidata.current[type];
		if (wikidata2["moreitems"]) {
			let moreitems = [];
			moreitems.push(...wikidata2["moreitems"].slice(wikidata2["index"] * 10, wikidata2["index"] * 10 + 10))
			wikidata2["index"]++
			wikidata2["items"] = wikidata2["items"].concat(moreitems);
			if (wikidata2["items"].length == wikidata2["cnt"]) {
				noMore.current[type] = false;
			}
		}
		setIsRender(val => !val);
	}

	return (
		<ScrollView contentContainerStyle={[styles.list_container, { paddingTop: 20 }]}
			showsVerticalScrollIndicator={false}>
			{wikilist.map((item: any, index: number) => {
				return (
					<View key={item}>
						{wikidata.current[item].items.length > 0 && <>
							<Text style={styles.wiki_title}>{wikidata.current[item].text + "（" + wikidata.current[item].cnt + "）"}</Text>
							{wikidata.current[item].items.map((item2: any, index: number) => {
								return (
									<View key={item2.id} style={styles.wiki_list_item}>
										<View style={styles.wiki_list_image}>
											{item == "fragrances" && <FastImage style={{ width: "100%", height: "100%" }}
												source={{ uri: ENV.image + "/fragrance/" + item2.id + ".jpg" }}
											/>}
											{item == "odors" && <FastImage style={{ width: "100%", height: "100%" }}
												source={{ uri: ENV.image + "/odor/" + (item2.id % 100000) + ".jpg" }}
											/>}
											{item == "brands" && <FastImage style={{ width: "100%", height: "100%" }}
												source={{ uri: ENV.image + "/brand/" + (item2.id % 100000) + ".jpg" }}
												resizeMode="contain"
											/>}
											{item == "perfumers" && <RnImage style={{ width: "100%", height: "100%" }}
												source={{ uri: ENV.image + "/nosevi/" + item2.id + ".jpg" }}
												errsrc={require("../../assets/images/perfumer.png")}
												type="perfumer"
											/>}
										</View>
										<View style={styles.wiki_list_info}>
											<View style={styles.info_name_con}>
												<Text style={styles.info_name}>{item2.wname + " " + item2.woriname}</Text>
												<Pressable onPress={() => {
													deletewiki(item2, item)
												}}>
													<Icon name="del2" size={16} color={"#CCCCCC"} />
												</Pressable>
											</View>
											<Text numberOfLines={2} style={styles.info_desc}>{item2.desc}</Text>
										</View>
									</View>
								)
							})}
							{noMore.current[item] && <Pressable onPress={() => {
								loadMore(item)
							}} style={styles.wiki_more_btn}>
								<Text style={styles.more_text}>{"查看更多" + wikidata.current[item].text}</Text>
								<Icon name="btmarrow" size={16} color={theme.text1} />
							</Pressable>}
						</>}
					</View>
				)
			})}
		</ScrollView>
	)
})
const ListPage = React.memo(({ uid, navigation }: any) => {
	// 控件
	// 变量
	// 数据
	let list = React.useRef<any[]>([]);
	// 状态
	const [isrender, setIsRender] = React.useState(false);

	React.useEffect(() => {
		http.post(ENV.user + "?uid=" + uid, { method: "getfav", token: us.user.token, type: "清单" }).then((resp_data: any) => {
			list.current = resp_data;
			setIsRender(val => !val);
		})
	}, [])

	return (
		<>
			{(list.current && list.current.length > 0) && <FlatList data={list.current}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={[styles.list_container, { paddingTop: 20 }]}
				horizontal={false}
				numColumns={2}
				keyExtractor={(item: any) => item.id}
				renderItem={({ item, index }: any) => {
					return (
						<View style={{
							marginBottom: 20,
							marginLeft: (index + 1) % 2 == 0 ? 8 : 0,
							marginRight: (index + 1) % 2 == 1 ? 8 : 0
						}}>
							<View style={styles.list_img_con}>
								<FastImage style={{ width: "100%", height: "100%" }}
									defaultSource={require("../../assets/images/nopic.png")}
									source={{ uri: ENV.image + item.img + "!l" }}
								/>
							</View>
							{item.name && <Text numberOfLines={1} style={[styles.list_mainname, styles.list_width]}>{item.name}</Text>}
							{item.desc && <Text numberOfLines={1} style={[styles.list_subname, styles.list_width]}>{item.desc}</Text>}
						</View>
					)
				}}
				ListFooterComponent={<ListBottomTip noMore={true} isShowTip={list.current.length > 0} />}
			/>}
		</>
	)
})
const DiscussPage = React.memo(({ uid, navigation }: any) => {
	return (
		<></>
	)
})


const UserFav = React.memo(({ navigation, route }: any) => {

	// 控件
	const insets = useSafeAreaInsets();
	// 变量
	const [index, setIndex] = React.useState(0);
	// 数据
	const [routes] = React.useState([
		{ key: "article", title: "文章" },
		{ key: "vod", title: "视频" },
		{ key: "wiki", title: "百科" },
		{ key: "list", title: "清单" },
		{ key: "discuss", title: "香评" },
	]);
	let favcntlist = React.useRef<any>({});
	let uid = React.useRef<string>("");
	// 参数
	// 状态
	const [isrender, setIsRender] = React.useState(false);

	React.useEffect(() => {
		if (route.params && route.params.uid) {
			uid.current = route.params.uid;
			events.publish("current_uid", uid.current);
		}
		init();
	}, [])

	const init = () => {
		http.post(ENV.user + "?uid=" + uid.current, { method: "getfavcnt", token: us.user.token }).then((resp_data: any) => {
			favcntlist.current = resp_data;
			setIsRender(val => !val);
		});
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: "我的喜好",
				isShowSearch: false,
				style: { zIndex: 0 },
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				}
			}} method={{
				back: () => { navigation.goBack() },
			}}>
				<View style={[Globalstyles.header_bg, { height: 90 + insets.top }]}>
					<Image style={{ width: "100%", height: "100%" }}
						source={require("../../assets/images/headbgpage/likebg.jpg")}
					/>
				</View>
			</HeaderView>
			<TabView navigationState={{ index, routes }}
				renderScene={({ route }) => {
					switch (route.key) {
						case "article":
							return <ArticlePage uid={uid.current} navigation={navigation} />;
						case "vod":
							return <VodPage uid={uid.current} navigation={navigation} />;
						case "wiki":
							return <WikiPage uid={uid.current} navigation={navigation} />;
						case "list":
							return <ListPage uid={uid.current} navigation={navigation} />;
						case "discuss":
							return <DiscussPage uid={uid.current} navigation={navigation} />;
						default:
							return null;
					}
				}}
				renderTabBar={(props: any) => {
					return (
						<TabBar {...props}
							renderLabel={({ route, focused, color }: any) => {
								return (
									<View style={styles.tabbar_con}>
										<Text style={[styles.title_text, { color }]}>{route.title}</Text>
										<Text style={[styles.favcnt, { color }]}>{favcntlist.current[route.title]}</Text>
									</View>
								)
							}}
							activeColor={theme.tit}
							inactiveColor={theme.comment}
							indicatorStyle={{ backgroundColor: theme.tit, width: 20, height: 1, bottom: 9, left: ((width / 5 - 20) / 2) }}
							android_ripple={{ color: "transparent" }}
							indicatorContainerStyle={{ backgroundColor: theme.toolbarbg }}
							style={{ backgroundColor: theme.toolbarbg, shadowColor: "transparent" }}
						/>
					)
				}}
				style={{ backgroundColor: theme.toolbarbg, borderTopLeftRadius: 15, borderTopRightRadius: 15 }}
				onIndexChange={() => { }}
				initialLayout={{ width }}
			/>
		</View>
	);
})

const styles = StyleSheet.create({
	tabbar_con: {
		flexDirection: "row",
		alignItems: "baseline",
	},
	title_text: {
		fontSize: 14,
		fontFamily: "PingFang SC",
		fontWeight: "500",
	},
	favcnt: {
		fontSize: 12,
		marginLeft: 2,
		transform: [{ scale: 0.9 }, { translateY: 2 }]
	},
	list_container: {
		backgroundColor: theme.toolbarbg,
		paddingHorizontal: 20,
	},
	list_item: {
		paddingVertical: 20,
		flexDirection: "row",
	},
	item_image: {
		width: 120,
		height: 75,
		borderRadius: 8,
		overflow: "hidden"
	},
	item_info: {
		flex: 1,
		marginLeft: 15,
		justifyContent: "space-between",
	},
	item_title: {
		fontSize: 14,
		color: theme.text1,
		fontFamily: "PingFang SC",
		fontWeight: "500",
	},
	flex_row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	icon_item_con: {
		width: "65%",
		opacity: 0.8,
	},
	icon_item: {
		flexDirection: "row",
		alignItems: "center",
	},
	icon_text: {
		fontSize: 13,
		color: "#808080",
		marginLeft: 5,
	},
	list_img_con: {
		width: (width - 40 - 16) / 2,
		aspectRatio: 1728 / 1080,
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: theme.bg
	},
	triangle: {
		position: "absolute",
		width: (width - 40 - 16) / 2 * 0.23,
		height: "auto",
		aspectRatio: 137 / 137,
		zIndex: 9,
		bottom: 0,
		right: 0,
		marginBottom: "6%",
		marginRight: "6%",
	},
	list_width: {
		width: (width - 40 - 16) / 2
	},
	list_mainname: {
		width: width - 40,
		fontSize: 14,
		color: theme.text1,
		fontWeight: "500",
		marginTop: 13,
		fontFamily: "PingFang SC",
	},
	list_subname: {
		width: width - 40,
		fontSize: 13,
		color: theme.comment,
		marginTop: 5,
	},
	wiki_title: {
		fontSize: 14,
		color: theme.text1,
		marginBottom: 15,
		fontWeight: "500",
	},
	wiki_list_item: {
		marginBottom: 30,
		flexDirection: "row",
		alignItems: "center",
	},
	wiki_list_image: {
		width: 68,
		height: 68,
		borderRadius: 8,
		overflow: "hidden",
	},
	wiki_list_info: {
		flex: 1,
		marginLeft: 15,
	},
	info_name_con: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	info_name: {
		fontSize: 14,
		color: theme.text1,
		fontWeight: "500",
		fontFamily: "PingFang SC",
	},
	info_desc: {
		fontSize: 13,
		color: theme.comment,
		marginTop: 10,
		lineHeight: 20,
	},
	wiki_more_btn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: theme.bg,
		paddingVertical: 8,
		borderRadius: 8,
		overflow: "hidden",
		marginBottom: 20,
		marginHorizontal: 80,
	},
	more_text: {
		fontSize: 12,
		color: theme.text1,
	}
});

export default UserFav;