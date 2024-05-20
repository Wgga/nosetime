import React from "react";
import { Image, View, Text, StyleSheet, NativeEventEmitter, FlatList, Pressable, Dimensions, ScrollView } from "react-native";

import { FlashList } from "@shopify/flash-list";

import HeaderView from "../../components/headerview";
import ListBottomTip from "../../components/listbottomtip";
import RnImage from "../../components/RnImage";

import searchService from "../../services/search-service/search-service";
import us from "../../services/user-service/user-service";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlelevelLeft, handlelevelTop, handlestarLeft } from "../../configs/globalstyles";

import http from "../../utils/api/http";

import Icon from "../../assets/iconfont";
import Yimai from "../../assets/svg/itemdetail/yimai.svg";
import DefaultAvatar from "../../assets/svg/default_avatar.svg";
import Sale from "../../assets/svg/sale.svg";
import Sample from "../../assets/svg/sample.svg";
import Bottle from "../../assets/svg/bottle.svg";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

const tabs: any = [
	{ key: "item", title: "香水" },
	{ key: "wiki", title: "百科" },
	{ key: "mall", title: "商城" },
	{ key: "social", title: "圈子" },
	{ key: "vod", title: "视频" },
]; // 选项卡数据

const ItemView = React.memo(({ tab, currentword, navigation }: any) => {

	// 数据
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染
	const [isbuy, setIsBuy] = React.useState<any>({}); // 是否购买过
	const [canbuy, setCanBuy] = React.useState<any>({}); // 是否可购买

	// 变量
	let searchdata = React.useRef<any>({
		items: null,
		articles: null,
		brands: null,
		odors: null,
		perfumers: null,
		malls: null,
		topics: null,
		users: null,
		vods: null,
	}).current; // 搜索结果数据
	let noMore = React.useRef<any>({
		item: true,
		wiki: true, article: true, brand: true, odor: true, perfumer: true,
		mall: true,
		social: true, topic: true, user: true,
		vod: true,
		collection: true,
	}).current; // 是否有更多数据
	let emptyimg = React.useRef<any>({
		item: false,
		wiki: false,
		mall: false,
		social: false,
		vod: false,
		collection: false,
	}).current; // 是否显示空图

	// 高亮搜索关键字
	const handletitle = (title: string, reg: RegExp) => {
		const keyTextArr = title.match(reg);
		const restTextArr = title.split(reg);
		const mainTextArr: any[] = [];
		restTextArr.forEach((item, index) => {
			mainTextArr.push(item);
			if (keyTextArr && keyTextArr[index]) {
				mainTextArr.push(
					<Text key={index} style={{ color: "#6983DA" }}>{keyTextArr[index]}</Text>
				);
			}
		});

		return mainTextArr;
	}

	// 设置视频tab下数据
	const setvodData = () => {
		let vods = searchService.getItems("vod", currentword);
		const reg = new RegExp(currentword, "g");
		vods.forEach((vod: any) => {
			vod["main_title"] = vod.name.split("：")[0]?.indexOf(currentword) >= 0 ? handletitle(vod.name.split("：")[0], reg) : vod.name.split("：")[0];
			vod["sub_title"] = vod.name.split("：")[1]?.indexOf(currentword) >= 0 ? handletitle(vod.name.split("：")[1], reg) : vod.name.split("：")[1];
		});
		searchdata.vods = vods;

		noMore["vod"] = !searchService.moreDataCanBeLoaded("vod", currentword);
		emptyimg["vod"] = !searchdata.vods || searchdata.vods.length == 0;
	}

	React.useEffect(() => {
		events.addListener("nosetime_searchlistUpdatedError", (data: any) => {
			const { word, type } = data;
			if (word != currentword) return;
			noMore[type] = true;
		});
		events.addListener("nosetime_searchlistUpdated", (data: any) => {
			const { word, type } = data;
			const types = ["brand", "odor", "perfumer", "user", "article", "topic", "mall"];
			if (word != currentword) return;
			if (type == "all") {
				searchdata.items = searchService.getItems("item", currentword);
				searchdata.articles = searchService.getItems("article", currentword);
				searchdata.brands = searchService.getItems("brand", currentword);
				searchdata.odors = searchService.getItems("odor", currentword);
				searchdata.perfumers = searchService.getItems("perfumer", currentword);
				searchdata.topics = searchService.getItems("topic", currentword);
				searchdata.users = searchService.getItems("user", currentword);

				if (tab == "collection") {
					noMore["collection"] = !searchService.moreDataCanBeLoaded("item", currentword);
				} else if (tab == "item" || tab == "mall") {
					searchService.fetchbuys(searchdata.items, "all", us.user.uid);
				}

				noMore["item"] = !searchService.moreDataCanBeLoaded("item", currentword);
				noMore["article"] = !searchService.moreDataCanBeLoaded("article", currentword);
				noMore["brand"] = !searchService.moreDataCanBeLoaded("brand", currentword);
				noMore["odor"] = !searchService.moreDataCanBeLoaded("odor", currentword);
				noMore["perfumer"] = !searchService.moreDataCanBeLoaded("perfumer", currentword);
				noMore["topic"] = !searchService.moreDataCanBeLoaded("topic", currentword);
				noMore["user"] = !searchService.moreDataCanBeLoaded("user", currentword);

				emptyimg["item"] = !searchdata.items || searchdata.items.length == 0;
				emptyimg["wiki"] = !searchdata.articles && !searchdata.brands && !searchdata.odors && !searchdata.perfumers;
				emptyimg["social"] = !searchdata.topics && !searchdata.users;

				// emptyimg["collection"] = true;
				// emptyimg["wiki"] = true;

				setvodData();
			} else if (type == "item") {
				searchdata.items = searchService.getItems(type, currentword);

				if (tab == "collection") {
					noMore["collection"] = !searchService.moreDataCanBeLoaded(type, currentword);
				} else if (tab == "item") {
					searchService.fetchbuys(searchdata.items, type, us.user.uid);
				}
				noMore[type] = !searchService.moreDataCanBeLoaded(type, currentword);
			} else if (type == "vod") {
				setvodData();
			} else if (types.indexOf(type) > -1) {
				searchdata[type + "s"] = searchService.getItems(type, currentword);
				if (type == "mall") {
					searchService.fetchbuys(searchdata.malls, type, us.user.uid);
					emptyimg["mall"] = !searchdata.malls || searchdata.malls.length == 0;
				} else {
					setIsRender(true);
					noMore[type] = !searchService.moreDataCanBeLoaded(type, currentword);
				}
			} else if (type == "topicv2") {
				searchdata.topics = searchService.getItems(type, currentword);
				noMore.topics = !searchService.moreDataCanBeLoaded(type, currentword);
			}
		})
		events.addListener("nosetime_buydataUpdated", (type: string) => {
			setIsBuy(searchService.getbuyItems(type).isbuy);
			setCanBuy(searchService.getbuyItems(type).canbuy);
		})
		events.addListener("nosetime_searchwordUpdated", (data: any) => {
			currentword = data.word;
			if (data.tab == "mall") {
				searchService.fetch("mall", data.word);
			} else {
				searchService.fetch("all", data.word);
			}
		})

		return () => {
			events.removeAllListeners("nosetime_searchlistUpdatedError");
			events.removeAllListeners("nosetime_searchlistUpdated");
			events.removeAllListeners("nosetime_buydataUpdated");
			events.removeAllListeners("nosetime_searchwordUpdated");
		}
	}, [])

	const loadMore = (type: string = "") => {
		if (type) {
			setIsRender(false);
			searchService.fetch(type, currentword);
			return
		}
		if (tab == "social") {
			searchService.fetch("topicv2", currentword);
		} else if (tab == "collection") {
			searchService.fetch("item", currentword);
		} else if (tab == "item") {
			searchService.fetch("item", currentword);
		} else if (tab == "vod") {
			searchService.fetch("vod", currentword);
		}
	}

	const gotomall = (page: string, id: string, ev: any) => {
		if (ev) ev.stopPropagation();
		if (page == "mall-item") {
			navigation.navigate("Page", { screen: "MallItem", params: { id: id, src: "APP搜索" } });
		} else if (page == "mall-group") {
			navigation.navigate("Page", { screen: "MallGroup", params: { id: id, src: "APP搜索" } });
		} else if (page == "mall-heji") {
			navigation.navigate("Page", { screen: "MallHeji", params: { id: id, src: "APP搜索" } });
		}
	}

	const gotodetail = (type: string, item: any) => {
		if (type == "article") {
			navigation.navigate("Page", { screen: "ArticleDetail", params: { id: item.id, src: "APP搜索" } });
		} else if (type == "topic") {
			navigation.navigate("Page", { screen: "SocialShequDetail", params: { id: item.id, title: item.title, src: "APP搜索" } });
		} else if (type == "item") {
			navigation.navigate("Page", { screen: "ItemDetail", params: { id: item.id, title: item.cnname, src: "APP搜索" } });
		} else if (type == "brand" || type == "odor" || type == "perfumer") {
			navigation.navigate("Page", { screen: "WikiDetail", params: { id: item.id, src: "APP搜索" } });
		} else if (type == "user-detail") {
			navigation.navigate("Page", { screen: "UserDetail", params: { id: item.uid, src: "APP搜索" } });
		} else if (type == "vod") {
			if (item.mid != null) {
				navigation.navigate("Page", { screen: "MediaListDetail", params: { id: item.viid, src: "APP搜索" } });
			} else {
				navigation.navigate("Page", { screen: "ArticleDetail", params: { id: item.viid, src: "APP搜索" } });
			}
		}
	}

	return (
		<>
			{tab == "item" && <View style={styles.search_con}>
				{emptyimg.item && <Image
					style={styles.emptyimg}
					resizeMode="contain"
					source={require("../../assets/images/empty/sr_blank.png")} />}
				{searchdata.items && searchdata.items.length > 0 && <View style={styles.item_list}>
					<FlashList
						data={searchdata.items}
						renderItem={({ item }: any) => {
							return (
								<Pressable onPress={() => { gotodetail("item", item) }} style={styles.list_brand}>
									<View style={styles.image_con}>
										<Image
											style={styles.brand_image}
											defaultSource={require("../../assets/images/noxx.png")}
											source={{ uri: ENV.image + "/perfume/" + item.id + ".jpg!l" }}
											resizeMode="contain"
										/>
									</View>
									<View style={styles.item_con}>
										<View style={[styles.item_cnname, styles.item_flex]}>
											<Text numberOfLines={1} style={styles.cnname}>{item.cnname}</Text>
											{isbuy[item.id] && <Pressable onPress={(ev) => { gotomall("mall-item", item.id, ev) }}>
												<Yimai width={18} height={18} />
											</Pressable>}
											{(canbuy[item.id] && !isbuy[item.id]) && <Pressable onPress={(ev) => { gotomall("mall-item", item.id, ev) }}>
												<Icon name="shopcart" size={16} color={theme.placeholder2} />
											</Pressable>}
										</View>
										<Text numberOfLines={1} style={styles.item_enname}>{item.enname}</Text>
										<View style={styles.item_flex}>
											<View style={Globalstyles.star}>
												{item.s0 == 1 && <Image
													style={[Globalstyles.star_icon, handlestarLeft(item.s1)]}
													defaultSource={require("../../assets/images/nopic.png")}
													source={require("../../assets/images/star/star2.png")}
												/>}
												{item.s0 == 0 && <Image
													style={[Globalstyles.star_icon, handlestarLeft(item.s1)]}
													defaultSource={require("../../assets/images/nopic.png")}
													source={require("../../assets/images/star/star.png")}
												/>}
											</View>
											<Text style={styles.score_total}>&nbsp;{item.isscore}分&nbsp;/&nbsp;{item.istotal}人</Text>
										</View>
									</View>
								</Pressable>
							)
						}}
						estimatedItemSize={100}
						onEndReachedThreshold={0.1}
						onEndReached={loadMore}
						keyExtractor={(item: any) => item.id}
						ListFooterComponent={<ListBottomTip noMore={noMore.item} isShowTip={searchdata.items.length > 0} />}
					/>
				</View>}
			</View>}
			{tab == "wiki" && <ScrollView style={styles.search_con} showsVerticalScrollIndicator={false}>
				{emptyimg.wiki && <Image
					style={styles.emptyimg}
					resizeMode="contain"
					source={require("../../assets/images/empty/sr_blank.png")} />}
				{searchdata.articles && <View>
					<Text style={[styles.wiki_title, { paddingHorizontal: 13 }]}>{"文章"}</Text>
					<View style={[styles.wiki_list, { paddingHorizontal: 13 }]}>
						{searchdata.articles.map((item: any, index: number) => {
							return (
								<View style={[styles.wiki_list_con, styles.item_flex]} key={item.id}>
									<Image
										style={styles.wiki_list_image}
										defaultSource={require("../../assets/images/nopic.png")}
										source={{ uri: ENV.image + item.pic + "!m" }}
										resizeMode="cover"
									/>
									<View style={styles.wiki_list_info}>
										<Text numberOfLines={1} style={styles.wiki_list_title}>{item.title}</Text>
										<Text numberOfLines={2} style={styles.wiki_list_desc}>{item.desc}</Text>
									</View>
								</View>
							)
						})}
					</View>
				</View>}
				{!noMore.article && <Pressable onPress={() => { loadMore("article") }} style={styles.wiki_list_btmtip}>
					<Text style={styles.btmtip_text}>{"显示更多文章"}</Text>
				</Pressable>}
				{searchdata.brands && <View>
					<Text style={[styles.wiki_title, { paddingHorizontal: 13 }]}>{"品牌"}</Text>
					<View style={[styles.wiki_list, { paddingHorizontal: 13 }]}>
						{searchdata.brands.map((item: any, index: number) => {
							return (
								<View style={[styles.wiki_list_con, styles.item_flex]} key={item.id}>
									<Image
										style={styles.wiki_list_image}
										defaultSource={require("../../assets/images/nopic.png")}
										source={{ uri: ENV.image + "/brand/" + (item.id % 100000) + ".jpg" }}
										resizeMode="contain"
									/>
									<View style={styles.wiki_list_info}>
										<Text numberOfLines={1} style={styles.wiki_list_title}>{item.title}</Text>
										<Text numberOfLines={2} style={styles.wiki_list_desc}>{item.desc}</Text>
									</View>
								</View>
							)
						})}
					</View>
				</View>}
				{!noMore.brand && <Pressable onPress={() => { loadMore("brand") }} style={styles.wiki_list_btmtip}>
					<Text style={styles.btmtip_text}>{"显示更多品牌"}</Text>
				</Pressable>}
				{searchdata.odors && <View>
					<Text style={[styles.wiki_title, { paddingHorizontal: 13 }]}>{"气味"}</Text>
					<View style={[styles.wiki_list, { paddingHorizontal: 13 }]}>
						{searchdata.odors.map((item: any, index: number) => {
							return (
								<View style={[styles.wiki_list_con, styles.item_flex]} key={item.id}>
									<Image
										style={styles.wiki_list_image}
										defaultSource={require("../../assets/images/nopic.png")}
										source={{ uri: ENV.image + "/odor/" + (item.id % 100000) + ".jpg" }}
										resizeMode="cover"
									/>
									<View style={styles.wiki_list_info}>
										<Text numberOfLines={1} style={styles.wiki_list_title}>{item.title}</Text>
										<Text numberOfLines={2} style={styles.wiki_list_desc}>{item.desc}</Text>
									</View>
								</View>
							)
						})}
					</View>
				</View>}
				{!noMore.odor && <Pressable onPress={() => { loadMore("odor") }} style={styles.wiki_list_btmtip}>
					<Text style={styles.btmtip_text}>{"显示更多气味"}</Text>
				</Pressable>}
				{searchdata.perfumers && <View>
					<Text style={[styles.wiki_title, { paddingHorizontal: 13 }]}>{"调香师"}</Text>
					<View style={[styles.wiki_list, { paddingHorizontal: 13 }]}>
						{searchdata.perfumers.map((item: any, index: number) => {
							return (
								<View style={[styles.wiki_list_con, styles.item_flex]} key={item.id}>
									<RnImage style={styles.wiki_list_image}
										source={{ uri: ENV.image + "/nosevi/" + item.id + ".jpg" }}
										resizeMode="contain"
									/>
									<View style={styles.wiki_list_info}>
										<Text numberOfLines={1} style={styles.wiki_list_title}>{item.title}</Text>
										<Text numberOfLines={2} style={styles.wiki_list_desc}>{item.desc}</Text>
									</View>
								</View>
							)
						})}
					</View>
				</View>}
				{!noMore.perfumer && <Pressable onPress={() => { loadMore("perfumer") }} style={styles.wiki_list_btmtip}>
					<Text style={styles.btmtip_text}>{"显示更多调香师"}</Text>
				</Pressable>}
				<View style={{ marginBottom: 100 }}></View>
			</ScrollView>}
			{tab == "mall" && <ScrollView style={styles.search_con} showsVerticalScrollIndicator={false}>
				{emptyimg.mall && <Image
					style={styles.emptyimg}
					resizeMode="contain"
					source={require("../../assets/images/empty/sr_blank.png")} />}
				{searchdata.malls && searchdata.malls.length > 0 && searchdata.malls.map((item: any, index: number) => {
					return (
						<View key={item.name} style={styles.mall_list_con}>
							<Text style={styles.mall_list_title}>{item.name}</Text>
							{item.items && item.items.length > 0 && item.items.map((item2: any, index2: number) => {
								return (
									<Pressable onPress={(ev) => { gotomall(item.page, item2.id, ev) }} key={item2.id} style={styles.mall_list_item}>
										<View>
											<Image
												style={styles.mall_list_image}
												defaultSource={item.name == "单品" ? require("../../assets/images/unbox.png") : require("../../assets/images/nopic.png")}
												source={{ uri: ENV.image + item2.img }}
												resizeMode={item.name == "单品" ? "contain" : "cover"}
											/>
											{item2.discount && <Sale style={styles.mall_list_sale} width={22} height={22} />}
										</View>
										<View style={styles.mall_list_info}>
											{(item.name == "购物清单" || item.name == "合辑") && <Text numberOfLines={1} style={styles.mall_list_info_title}>{item2.title}</Text>}
											{item.name == "购物清单" && <Text style={styles.mall_list_info_desc}>{item2.desc}</Text>}
											{item.name == "单品" && <View style={[styles.mall_list_info_cnname_con, styles.item_flex]}>
												<View style={[styles.item_flex, { maxWidth: item2.marketing ? width - 175 : width - 135 }]}>
													<Text numberOfLines={1} style={[styles.mall_list_info_cnname]}>{item2.cnname}</Text>
													{item2.marketing != 0 && <Text style={styles.mall_list_info_marketing}>{"活动"}</Text>}
												</View>
												{isbuy[item2.id] && <Yimai width={18} height={18} />}
											</View>}
											{item.name == "单品" && <Text numberOfLines={2} style={styles.mall_list_info_enname}>{item2.enname}</Text>}
											{item2.minprice < item2.maxprice && <View style={styles.mall_list_info_price}>
												<Text style={[styles.mall_list_info_price_text, (item2.discount || item2.marketing) ? styles.mall_list_info_price_disprice : null]}>{"¥" + item2.minprice + "﹣¥" + item2.maxprice}</Text>
												<View style={styles.mall_list_info_price_icon}>
													{item2.sample && <Sample width={28} height={14} />}
													{item2.bottle && <Bottle width={28} height={14} />}
												</View>
											</View>}
											{item2.minprice >= item2.maxprice && <View style={styles.mall_list_info_price}>
												<Text style={styles.mall_list_info_price_text}>{"¥" + item2.minprice}</Text>
											</View>}
										</View>
									</Pressable>
								)
							})}
						</View>
					)
				})}
				<View style={{ marginBottom: 100 }}></View>
			</ScrollView>}
			{tab == "social" && <ScrollView style={styles.search_con} showsVerticalScrollIndicator={false}>
				{emptyimg.social && <Image
					style={styles.emptyimg}
					resizeMode="contain"
					source={require("../../assets/images/empty/sr_blank.png")} />}
				{searchdata.topics && <View>
					<Text style={[styles.wiki_title, { paddingHorizontal: 13 }]}>{"帖子"}</Text>
					<View style={[styles.wiki_list, { paddingHorizontal: 13 }]}>
						{searchdata.topics.map((item: any, index: number) => {
							return (
								<View style={styles.social_list_con} key={item.id}>
									<Image
										style={[styles.wiki_list_image, styles.social_list_image]}
										defaultSource={require("../../assets/images/default_avatar.png")}
										source={{ uri: ENV.avatar + item.uid + ".jpg" }}
										resizeMode="cover"
									/>
									<View style={styles.wiki_list_info}>
										<Text numberOfLines={1} style={styles.wiki_list_title}>{item.title}</Text>
										<Text numberOfLines={2} style={styles.wiki_list_desc}>{item.desc}</Text>
									</View>
								</View>
							)
						})}
					</View>
				</View>}
				{!noMore.topic && <Pressable onPress={() => { loadMore("topic") }} style={styles.wiki_list_btmtip}>
					<Text style={styles.btmtip_text}>{"显示更多帖子"}</Text>
				</Pressable>}
				{searchdata.users && <View style={{ paddingHorizontal: 10 }}>
					<Text style={styles.wiki_title}>{"用户"}</Text>
					<View style={styles.wiki_list}>
						{searchdata.users.map((item: any, index: number) => {
							return (
								<View style={[styles.user_list_item, styles.item_flex]} key={item.uid}>
									<Image
										style={[styles.wiki_list_image, styles.user_avatar]}
										defaultSource={require("../../assets/images/default_avatar.png")}
										source={{ uri: ENV.avatar + item.uid + ".jpg" + item.uface }}
										resizeMode="contain"
									/>
									<View style={styles.wiki_list_info}>
										<View style={styles.item_flex}>
											<Text numberOfLines={1}>{item.uname}</Text>
											<View style={Globalstyles.level}>
												<Image
													style={[Globalstyles.level_icon, handlelevelLeft(item.ulevel), handlelevelTop(item.ulevel)]}
													defaultSource={require("../../assets/images/nopic.png")}
													source={require("../../assets/images/level.png")}
												/>
											</View>
										</View>
										<Text numberOfLines={2} style={styles.user_desc}>{item.desc}</Text>
									</View>
								</View>
							)
						})}
					</View>
				</View>}
				<View style={{ marginBottom: 100 }}></View>
			</ScrollView>}
			{tab == "vod" && <View style={styles.search_con}>
				{emptyimg.vod && <Image
					style={styles.emptyimg}
					resizeMode="contain"
					source={require("../../assets/images/empty/sr_blank.png")} />}
				{searchdata.vods && searchdata.vods.length > 0 && <View style={styles.item_list}>
					<FlashList
						data={searchdata.vods}
						renderItem={({ item }: any) => {
							return (
								<View style={styles.list_vod}>
									<View style={styles.vod_image_con}>
										{(item.murls && item.murls.length > 0) && <Image
											style={styles.vod_image}
											defaultSource={require("../../assets/images/nopic.png")}
											source={{ uri: ENV.image + item.murls[0].img + "!l" }}
											resizeMode="cover"
										/>}
										{((item.murls && item.murls.length == 0) || !item.murls) && <Image
											style={styles.vod_image}
											defaultSource={require("../../assets/images/nopic.png")}
											source={{ uri: item.vpicurl }}
											resizeMode="cover"
										/>}
										<Image style={styles.vod_triangle} source={require("../../assets/images/player/play.png")} />
									</View>
									<View style={styles.vod_title_con}>
										<Text style={styles.vod_main_title}>{item.main_title}</Text>
										<Text style={styles.vod_sub_title}>{item.sub_title}</Text>
									</View>
								</View>
							)
						}}
						estimatedItemSize={100}
						onEndReachedThreshold={0.1}
						onEndReached={loadMore}
						keyExtractor={(item: any) => item.viid}
						ListFooterComponent={<ListBottomTip noMore={noMore.vod} isShowTip={searchdata.vods.length > 0} />}
					/>
				</View>}
			</View>}
		</>
	)
})

function SearchResult({ navigation, route }: any): React.JSX.Element {
	// 参数
	const { shword, shtype, cid, holder } = route.params;
	// 控件

	// State变量
	const [tab, setTab] = React.useState<string>("item");
	const [searchword, setSearchword] = React.useState<string>(shword);

	// Ref变量

	React.useEffect(() => {
		if (shtype == "topicv2")
			setTab("social");
		else if (shtype == "wiki")
			setTab("wiki");
		else if (shtype == "mall")
			setTab("mall");
		else if (shtype == "collection")
			setTab("collection");
		init(searchword);
	}, []);

	const init = (val: string) => {
		if (val == "") return;
		searchService.addHistory(val);
		events.emit("nosetime_searchwordUpdated", { word: val, tab });
	}

	const Search = () => {
		if (shword == searchword) {
			return;
		}
		if (searchword != "") {
			init(searchword);
		}
	}

	return (
		<View style={styles.search_con}>
			<HeaderView
				data={{
					title: "",
					placeholder: holder,
					word: searchword,
					isShowSearch: true,
					isautoFocus: false
				}}
				method={{
					fun: () => { navigation.goBack() },
					setWord: (wordval: string) => {
						setSearchword(wordval);
					},
					Search,
					back: () => { navigation.goBack() },
				}} />
			<View style={styles.tabs_con}>
				{tabs && tabs.map((item: any, index: number) => {
					return (
						<Pressable key={item.key} onPress={() => {
							setTab(item.key);
							events.emit("nosetime_searchwordUpdated", { word: searchword, tab: item.key });
						}}>
							<View style={styles.tabs_text}>
								<Text style={[styles.tabs_title, tab == item.key ? styles.tabs_title_active : null]}>{item.title}</Text>
								{tab == item.key && <View style={styles.tabs_line}></View>}
							</View>
						</Pressable>
					)
				})}
			</View>
			<ItemView tab={tab} currentword={searchword} navigation={navigation} />
		</View>
	);
}

const styles = StyleSheet.create({
	item_flex: {
		flexDirection: "row",
		alignItems: "center",
	},
	search_con: {
		flex: 1,
		backgroundColor: theme.toolbarbg,
	},
	tabs_con: {
		width: "100%",
		flexDirection: "row",
		justifyContent: "space-around",
	},
	tabs_text: {
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	tabs_title: {
		color: theme.tit2,
		fontSize: 13
	},
	tabs_title_active: {
		color: "#757FE0",
	},
	tabs_line: {
		position: "absolute",
		bottom: 7,
		width: 20,
		height: 1,
		backgroundColor: "#757FE0"
	},
	emptyimg: {
		width: "100%",
		height: 500,
	},
	item_list: {
		flex: 1,
		backgroundColor: theme.toolbarbg
	},
	list_brand: {
		borderBottomWidth: 1,
		borderBottomColor: theme.bg,
		flexDirection: "row",
	},
	image_con: {
		width: 88,
		alignItems: "center",
		justifyContent: "center",
	},
	brand_image: {
		width: 66,
		height: 66,
		backgroundColor: theme.toolbarbg,
		objectFit: "contain",
	},
	item_con: {
		flex: 1,
		paddingVertical: 16,
		paddingLeft: 10,
		paddingRight: 13,
	},
	item_cnname: {
		width: "100%",
		justifyContent: "space-between",
	},
	cnname: {
		fontSize: 13,
		color: "#222"
	},
	item_enname: {
		fontSize: 12,
		color: theme.text2,
		marginVertical: 10
	},
	starimg: {
		width: 14,
		height: 14,
	},
	score_total: {
		color: theme.placeholder,
		fontSize: 13,
	},
	wiki_title: {
		fontSize: 14,
		fontWeight: "500",
		color: theme.tit2,
		marginTop: 18,
		marginBottom: 10,
	},
	wiki_list: {
		marginBottom: 10,
	},
	wiki_list_con: {
		width: "100%",
		paddingVertical: 10,
		borderBottomWidth: 0.5,
		borderBottomColor: theme.bg,
	},
	wiki_list_image: {
		width: 60,
		height: 60,
		borderRadius: 3,
		overflow: "hidden",
	},
	wiki_list_info: {
		flex: 1,
		marginLeft: 10,
	},
	wiki_list_title: {
		fontSize: 14,
		color: theme.tit2,
		marginBottom: 4
	},
	wiki_list_desc: {
		fontSize: 12,
		color: theme.placeholder,
		lineHeight: 20,
	},
	wiki_list_btmtip: {
		width: "100%",
		alignItems: "center",
	},
	btmtip_text: {
		width: 175,
		height: 30,
		lineHeight: 30,
		textAlign: "center",
		color: theme.text1,
		fontSize: 12,
		borderRadius: 3,
		backgroundColor: theme.bg,
	},
	list_vod: {
		padding: 10,
		borderBottomWidth: 1,
		borderBottomColor: theme.bg,
		flexDirection: "row",
	},
	vod_image_con: {
		width: 80,
		height: 80,
		borderRadius: 5,
		overflow: "hidden",
	},
	vod_image: {
		width: "100%",
		height: "100%",
		borderRadius: 5,
	},
	vod_triangle: {
		position: "absolute",
		right: 0,
		bottom: 0,
		width: 20,
		height: 20,
		zIndex: 9,
		marginRight: 8,
		marginBottom: 8,
	},
	vod_title_con: {
		flex: 1,
		marginLeft: 13,
	},
	vod_main_title: {
		fontSize: 14,
		color: theme.tit2
	},
	vod_sub_title: {
		fontSize: 13,
		color: theme.comment,
		marginTop: 10,
	},
	mall_list_con: {
		paddingVertical: 16,
		paddingHorizontal: 15,
	},
	mall_list_title: {
		fontSize: 14,
		color: theme.tit2,
	},
	mall_list_item: {
		flexDirection: "row",
		alignItems: "center",
		paddingVertical: 15
	},
	mall_list_image: {
		width: 63,
		height: 63,
		borderRadius: 3,
		overflow: "hidden",
	},
	mall_list_sale: {
		position: "absolute",
		top: -20,
		right: -5,
	},
	mall_list_info: {
		flex: 1,
		marginLeft: 14,
	},
	mall_list_info_title: {
		fontSize: 13,
		color: theme.tit2,
	},
	mall_list_info_desc: {
		fontSize: 12,
		color: theme.comment,
		marginTop: 13
	},
	mall_list_info_cnname_con: {
		width: width - 107,
		overflow: "hidden",
		justifyContent: "space-between",
	},
	mall_list_info_cnname: {
		fontSize: 13,
		color: theme.tit2,
	},
	mall_list_info_marketing: {
		backgroundColor: "#D77878",
		borderRadius: 20,
		paddingHorizontal: 7,
		fontSize: 10,
		transform: [{ scale: 0.86 }],
		marginLeft: 4.5,
		color: "#FFF"
	},
	mall_list_info_enname: {
		fontSize: 12,
		color: theme.text1,
		marginTop: 15,
	},
	mall_list_info_price: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 15,
		justifyContent: "space-between",
	},
	mall_list_info_price_text: {
		fontSize: 12,
		color: theme.comment,
	},
	mall_list_info_price_disprice: {
		color: "#CB5C61"
	},
	mall_list_info_price_icon: {
		flexDirection: "row",
		alignItems: "center",
	},
	social_list_con: {
		width: "100%",
		flexDirection: "row",
		paddingVertical: 15,
		borderBottomWidth: 0.5,
		borderBottomColor: theme.bg,
	},
	social_list_image: {
		width: 63,
		height: 63,
	},
	user_list_item: {
		paddingVertical: 10,
	},
	user_avatar: {
		borderRadius: 50,
	},
	user_desc: {
		fontSize: 12,
		color: theme.placeholder,
		marginTop: 10,
	},
});

export default SearchResult;
