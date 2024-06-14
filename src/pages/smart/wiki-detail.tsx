import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image } from "react-native";

import { FlashList } from "@shopify/flash-list";
import FastImage from "react-native-fast-image";

import HeaderView from "../../components/headerview";
import ListBottomTip from "../../components/listbottomtip";
import RnImage from "../../components/RnImage";
import StarImage from "../../components/starimage";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function WikiDetail({ navigation, route }: any): React.JSX.Element {

	// 控件
	const classname = "WikiDetailPage";
	// 参数
	const id = route.params && route.params.id ? route.params.id : 0;
	// 变量
	let type = React.useRef<string>("");
	const tabs = [
		{ text: "热门", orderBy: "hot" },
		{ text: "评分", orderBy: "star" },
		{ text: "年代", orderBy: "year" },
		{ text: "品牌", orderBy: "brand", condition: type.current !== "brand" },
	]
	let page = React.useRef<number>(1);
	let orderby = React.useRef<string>("hot");
	let desc = React.useRef<any>({ hot: "-", star: "-", brand: false, year: "-" });
	let cnt = React.useRef<number>(0);
	let canbuy = React.useRef<number>(0);
	// 数据
	let like_ = React.useRef<any[]>([]);
	let canbuy_ = React.useRef<any[]>([]);
	let wikidata = React.useRef<any>({});
	let items = React.useRef<any[]>([]);
	let intro = React.useRef<any>(null);
	// 状态
	let checked = React.useRef<boolean>(false);
	let noMore = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	// 初始化
	React.useEffect(() => {
		if (id >= 10000000 && id <= 10099999) type.current = "brand";
		else if (id >= 11000000 && id <= 11099999) type.current = "odor";
		else if (id >= 14000000 && id <= 14099999) type.current = "fragrance";
		else if (id >= 12000000 && id <= 12099999) type.current = "perfumer";
		init();
	}, [])

	const init = () => {
		cache.getItem(classname + id).then((cacheobj: any) => {
			if (cacheobj) {
				setwikidata(cacheobj);
			}
		}).catch(() => {
			http.post(ENV.wiki + "?type=" + type.current + "&id=" + id, { uid: us.user.uid, did: us.did }).then((resp_data: any) => {
				cache.saveItem(classname + id, resp_data, 600);
				setwikidata(resp_data);
			});
		});
	}

	// 设置百科详情数据
	const setwikidata = (data: any) => {
		data.title = data.name;
		if (data.name != data.oriname) {
			data.title += " " + data.oriname;
		}
		wikidata.current = data;
		intro.current = changeurl(data.desc);
		islike([id]);
		page.current = 1;
		loadMore();
	}

	// 把html标签转化为RN可使用的标签
	const changeurl = (sz: string) => {
		if (sz == null) return "";
		sz = sz.replace(/\n/g, "<p>").replace(/<p><p>/g, "<p>").replace(/<\/p>/g, "");
		let sz_data = sz.split(/<p>/g).map((item: any, index: number) => {
			if (item.startsWith("<b>")) {
				return (<Text key={index} style={[styles.intro_text, { fontWeight: "700" }]}>&emsp;&emsp;{item.replace(/<b>|<\/b>/g, "")}</Text>)
			} else if (item.startsWith("<a")) {
				const linkText = item.match(/>(.*?)</)[1];
				const linkUrl = item.match(/href="(.*?)"/)[1];
				let id = 0;
				let pos = linkUrl.indexOf("/xiangshui/");
				if (pos >= 0) {
					id = parseInt(linkUrl.substr(pos + 11, 6));
				}
				return (
					<Pressable key={index} onPress={() => {
						navigation.navigate("Page", { screen: "ItemDetail", params: { id, src: "APP发现百科页" } });
					}}>
						<Text style={[styles.intro_text, { color: theme.tit }]}>&emsp;&emsp;{linkText}</Text>
					</Pressable>
				);
			} else {
				return <Text key={index} style={styles.intro_text}>&emsp;&emsp;{item}</Text>;
			}
		});
		return sz_data;
	};

	// 筛选类型
	const setOrderby = (order: string) => {
		var orderchange = false;
		if (["brand", "year"].indexOf(order) >= 0) {
			orderchange = true;
			if (desc.current[order] == undefined || desc.current[order] == "-") {
				if (order == "brand")
					desc.current[order] = false;
				else
					desc.current[order] = true;
			} else if (orderby.current == order) {
				desc.current[order] = !desc.current[order];
			}
		}
		if (orderby.current != order) {
			orderchange = true;
			orderby.current = order;
		}
		if (orderchange) {
			page.current = 1;
			loadMore();
		}
	}

	// 加载更多数据
	const loadMore = () => {
		var url = "";
		if (type.current == "brand") {
			url = ENV.search + "?type=item&in=" + type.current + "id&word=" + id + "&page=" + page.current + "&orderby=" + orderby.current + "&desc=" + desc.current[orderby.current] + "&canbuy=" + canbuy.current;
		} else {
			url = ENV.search + "?type=item&in=" + type.current + "&word=" + wikidata.current.name + "&page=" + page.current + "&orderby=" + orderby.current + "&desc=" + desc.current[orderby.current] + "&canbuy=" + canbuy.current;
		}
		http.get(url).then((resp_data: any) => {
			if (items.current.length != 0 && items.current.length > cnt.current) {
				if (items.current[items.current.length - 1].id == resp_data.item.data[resp_data.item.data.length - 1].id) {
					noMore.current = true;
					page.current++;
					return;
				}
			}

			cnt.current = resp_data.item.cnt;
			if (page.current == 1)
				items.current = resp_data.item.data;
			else
				items.current = items.current.concat(resp_data.item.data);

			if (resp_data.item.data.length < 10) {
				noMore.current = true;
			} else {
				noMore.current = false;
			}
			page.current++;
			buys(resp_data.item.data);
		});
	}

	// 切换在售商品
	const togglecanbuy = () => {
		checked.current = !checked.current
		canbuy.current = checked.current ? 1 : 0;
		page.current = 1;
		loadMore();
	}

	// 当前商品是否在售
	const buys = (resp: any) => {
		let ids = [];
		for (let i in resp) ids.push(resp[i].id);
		http.post(ENV.api + ENV.mall, { method: "canbuy", uid: us.user.uid, ids: ids }).then((resp_data: any) => {
			for (let i in resp_data) canbuy_.current[resp_data[i]] = 1;
			setIsRender(val => !val);
		});
	}

	// 当前百科是否收藏
	const islike = (ids: any) => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App百科详情页" } });
		}
		http.post(ENV.api + ENV.wiki, { method: "islike", uid: us.user.uid, ids: ids }).then((resp_data: any) => {
			for (var i in resp_data) {
				like_.current[resp_data[i]] = 1;
			}
		});
	}

	// 收藏百科
	const favwiki = () => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "APP发现百科页" } });
		}
		http.post(ENV.wiki + "?uid=" + us.user.uid, {
			method: "togglefav", wid: wikidata.current.id, token: us.user.token
		}).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				like_.current[wikidata.current.id] = true;
			} else if (resp_data.msg == "REMOVE") {
				like_.current[wikidata.current.id] = false;
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "APP发现百科页" } });
			}
			setIsRender(val => !val);
		});
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: wikidata.current.name,
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}}>
				<Pressable style={Globalstyles.title_text_con} onPress={favwiki}>
					<Icon name={like_.current[id] ? "fav" : "fav-outline"} size={22} color={like_.current[id] ? theme.redchecked : theme.tit2} />
				</Pressable>
			</HeaderView>
			<FlashList data={items.current}
				extraData={isrender}
				estimatedItemSize={100}
				onEndReached={loadMore}
				onEndReachedThreshold={0.1}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ backgroundColor: theme.toolbarbg, paddingTop: 20, }}
				keyExtractor={(item: any) => item.id}
				ListHeaderComponent={<>
					<View style={styles.wiki_header_con}>
						<View style={styles.wiki_image}>
							{type.current == "brand" && <Image style={{ width: "100%", height: "100%" }}
								defaultSource={require("../../assets/images/nopic.png")}
								source={{ uri: ENV.image + "/brand/" + (wikidata.current.id % 100000) + ".jpg" }}
								resizeMode="contain"
							/>}
							{type.current == "odor" && <Image style={{ width: "100%", height: "100%" }}
								defaultSource={require("../../assets/images/nopic.png")}
								source={{ uri: ENV.image + "/odor/" + (wikidata.current.id % 100000) + ".jpg" }}
								resizeMode="contain"
							/>}
							{type.current == "perfumer" && <RnImage style={{ width: "100%", height: "100%" }}
								source={{ uri: ENV.image + "/nosevi/" + wikidata.current.id + ".jpg" }}
								resizeMode="contain"
							/>}
							{(type.current == "fragrance" && ((wikidata.current.id >= 14000001 && wikidata.current.id <= 14000012) || wikidata.current.id == 14000021)) && <Image style={{ width: "100%", height: "100%" }}
								defaultSource={require("../../assets/images/nopic.png")}
								source={{ uri: ENV.image + "/fragrance/" + wikidata.current.id + ".jpg" }}
								resizeMode="contain"
							/>}
						</View>
						<Text style={styles.wiki_title}>{wikidata.current.title}</Text>
					</View>
					{intro.current && <View style={{ paddingHorizontal: 15 }}>
						{intro.current}
					</View>}
					<View style={styles.wikilist_title_con}>
						{type.current == "brand" && <Text style={styles.list_title}>{"该品牌共有" + cnt.current + "款香水："}</Text>}
						{type.current == "odor" && <Text style={styles.list_title}>{"全部含有" + wikidata.current.name + "的香水："}</Text>}
						{type.current == "perfumer" && <Text style={styles.list_title}>{wikidata.current.name + "的全部作品："}</Text>}
						{type.current == "fragrance" && <Text style={styles.list_title}>{"全部" + wikidata.current.name + "的香水："}</Text>}
						<Pressable style={styles.canbuy_con} onPress={togglecanbuy}>
							{checked.current && <Icon name="shopcart-checked" size={14} color={theme.tit} />}
							{!checked.current && <Icon name="shopcart" size={14} color={theme.text2} />}
							<Text style={[styles.canbuy_text, checked.current && { color: theme.tit }]}>{"在售"}</Text>
						</Pressable>
					</View>
					{items.current.length > 0 && <View style={styles.wikilist_tabbar_con}>
						{tabs.map((item: any, index: number) => {
							return (
								item.condition !== false && (<Pressable key={item.orderBy} style={styles.tabbar_con}
									onPress={() => { setOrderby(item.orderBy) }}>
									<Text style={[styles.tabbar_text, orderby.current === item.orderBy && { color: theme.tit }]}>
										{item.text}
									</Text>
								</Pressable>)
							)
						})}
					</View>}
					{(items.current.length == 0 && checked.current) && <Image style={Globalstyles.emptyimg}
						resizeMode="contain"
						source={require("../../assets/images/empty/favcanbuy_blank.png")} />}
				</>}
				renderItem={({ item, index }: any) => {
					return (
						<Pressable onPress={() => {
							navigation.navigate("Page", { screen: "ItemDetail", params: { id: item.id, src: "APP发现百科页" } });
						}} style={styles.wikilist_item_con}>
							<FastImage style={styles.item_image}
								defaultSource={require("../../assets/images/noxx.png")}
								source={{ uri: ENV.image + "/perfume/" + item.id + ".jpg!l" }}
								resizeMode="contain"
							/>
							<View style={styles.item_con}>
								<View style={styles.item_cnname}>
									<Text style={styles.item_name_text}>{item.cnname}</Text>
									{canbuy_.current[item.id] && <Icon name="shopcart" size={16} color={theme.placeholder} />}
								</View>
								<Text style={[styles.item_name_text, { marginBottom: 5 }]}>{item.enname}</Text>
								<StarImage item={{
									istotal: item.istotal,
									s0: item.s0,
									s1: item.s1,
									isscore: item.isscore,
								}} />
								<Text numberOfLines={3} style={styles.item_desc}>{item.desc}</Text>
							</View>
						</Pressable>
					)
				}}
				ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={items.current.length > 0} />}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	wiki_header_con: {
		alignItems: "center",
	},
	wiki_image: {
		width: width * 0.25,
		height: width * 0.25,
	},
	wiki_title: {
		fontSize: 17,
		fontWeight: "bold",
		marginTop: 16,
		marginBottom: 10,
		color: theme.text2,
		fontFamily: "PingFang SC",
	},
	intro_text: {
		color: theme.comment,
		fontSize: 13,
		lineHeight: 20,
		marginTop: 13,
		fontFamily: "PingFang SC",
	},
	wikilist_title_con: {
		paddingLeft: 10,
		paddingRight: 15,
		marginTop: 22,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	list_title: {
		fontSize: 14,
		color: theme.tit2,
	},
	canbuy_con: {
		flexDirection: "row",
		alignItems: "center",
	},
	canbuy_text: {
		marginLeft: 5,
		fontSize: 12,
		color: theme.text2,
	},
	wikilist_tabbar_con: {
		marginTop: 15,
		borderTopColor: theme.bg,
		borderTopWidth: 1,
		borderBottomColor: theme.bg,
		borderBottomWidth: 0.5,
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	tabbar_con: {
		flex: 1,
		height: 44,
		alignItems: "center",
		justifyContent: "center",
	},
	tabbar_text: {
		fontSize: 13,
		color: theme.placeholder,
	},
	wikilist_item_con: {
		padding: 15,
		flexDirection: "row",
	},
	item_image: {
		width: 60,
		height: 80,
	},
	item_con: {
		flex: 1,
		marginLeft: 9,
	},
	item_cnname: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 5,
	},
	item_name_text: {
		fontSize: 14,
		color: theme.tit2,
	},
	item_desc: {
		fontSize: 12,
		color: theme.comment,
		lineHeight: 20,
		marginTop: 8,
		marginRight: 6,
	}
});

export default WikiDetail;