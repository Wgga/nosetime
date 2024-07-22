import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Animated, Image, FlatList } from "react-native";

import { FlashList } from "@shopify/flash-list";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderView from "../../components/view/headerview";
import ListBottomTip from "../../components/listbottomtip";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";
import { Globalstyles } from "../../utils/globalmethod";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

const PerfumeListDetail = React.memo(({ navigation, route }: any) => {

	// 控件
	const insets = useSafeAreaInsets();
	// 参数
	// 变量
	let id = React.useRef<number>(0);
	let allcnt = React.useRef<number>(0);
	let pagesize = React.useRef<number>(0);
	let headerOpt = React.useRef(new Animated.Value(0)).current; // 头部透明度动画
	// 数据
	let collection = React.useRef<any>({ cdata: [], cuid: "", cid: "" });
	let items = React.useRef<any>([]);
	let isbuy_ = React.useRef<any>({});
	let canbuy_ = React.useRef<any>({});
	let like_ = React.useRef<any>({});
	// 状态
	let noMore = React.useRef<boolean>(false);
	let isempty = React.useRef<boolean>(false);
	let showaddbtn = React.useRef<boolean>(false);
	let iscanbuy = React.useRef<boolean>(false);
	let nocanbuy = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	React.useEffect(() => {
		if (route.params) {
			id.current = route.params.id ? route.params.id : 0;
		}
		init()
	}, [])

	const init = () => {
		http.get(ENV.collection + "?method=getcollectiondetail&id=" + id.current + "&v=2").then((resp_data: any) => {
			for (var i in resp_data["cdata"]) {
				if (resp_data["cdata"][i].udcontent && resp_data["cdata"][i].udcontent[0] != "“") {
					if (resp_data["cdata"][i].udcontent.length > 50) {
						resp_data["cdata"][i].udcontent = "“" + resp_data["cdata"][i].udcontent.slice(0, 52) + "...”";
					} else {
						resp_data["cdata"][i].udcontent = "“" + resp_data["cdata"][i].udcontent + "”";
					}
				}
			}
			allcnt.current = resp_data.cnt;
			pagesize.current = Math.ceil(resp_data.cnt / 50);
			collection.current = resp_data;
			items.current = resp_data.cdata;
			if (pagesize.current == 1) {
				noMore.current = true;
			}
			//有可能cdata是空数组也有可能是null;
			isempty.current = (!collection.current.cdata || collection.current.cdata.length == 0);
			//不是自己的香单，不显示添加按钮
			if (us.user.uid == collection.current.cuid) {
				if (collection.current.cdata.length <= 3) showaddbtn.current = true;
			}
			like_buys();
		});
	}

	// 查看当前香水是否购买过、可购买、收藏
	const like_buys = (type?: string) => {
		if (!us.user.uid) return;

		let ids = [];
		for (let i in items.current) {
			ids.push(items.current[i].iid)
		}
		Promise.all([
			http.post(ENV.item, { method: "isbuyv2", uid: us.user.uid, ids }),
			http.post(ENV.mall, { method: "canbuy", uid: us.user.uid, ids }),
		]).then(([isbuy, canbuy,]: any) => {
			for (let i in isbuy) isbuy_.current[isbuy[i]] = 1;
			for (let i in canbuy) canbuy_.current[canbuy[i]] = 1;
			if (type != "nolike") {
				http.post(ENV.collection, { method: "islike", uid: us.user.uid, ids: [id.current] }).then((islike: any) => {
					for (let i in islike) like_.current[islike[i]] = 1;
					setIsRender(val => !val);
				})
			} else {
				setIsRender(val => !val);
			}
		})
	}

	const gotodetail = (page: string, item?: any) => {
		if (page == "user-detail") {
			navigation.push("Page", { screen: "UserDetail", params: { uid: item.cuid } });
		}
	}

	const is_default_img = () => {
		if (us.user.uid != collection.current.cuid) return false;//不是自己的香单，不显示
		if (!collection.current.cpic) return true;//没封面图片显示上传
		return collection.current.cpic.includes("default");
	}

	const fav = () => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App香单详情页面" } });
		}
		http.post(ENV.collection + "?uid=" + us.user.uid, {
			method: "togglefav", cid: collection.current.cid, token: us.user.token
		}).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				like_.current[collection.current.cid] = 1;
				collection.current.favcnt = parseInt(collection.current.favcnt) + 1;
			} else if (resp_data.msg == "REMOVE") {
				like_.current[collection.current.cid] = 0;
				collection.current.favcnt = parseInt(collection.current.favcnt) - 1;
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App香单详情页面" } });
			}
			setIsRender(val => !val);
			events.publish("user_getfavcollections");
		})
	}

	const togglecanbuy = () => {
		iscanbuy.current = !iscanbuy.current;
		if (iscanbuy.current) {
			http.get(ENV.collection + "?method=getcollectioncanbuy&id=" + id.current).then((resp_data: any) => {
				items.current = resp_data;
				like_buys("nolike");
				noMore.current = false;
			})
		} else {
			items.current = collection.current.cdata;
			noMore.current = true;
		}
		nocanbuy.current = (items.current.length == 0);
	}

	return (
		<View style={Globalstyles.container}>
			<Animated.View style={[Globalstyles.header_bg_con, { height: 300 }]}>
				<View style={Globalstyles.header_bg_msk}></View>
				<Image source={{ uri: ENV.image + collection.current.cpic + "!s" }} blurRadius={40} style={Globalstyles.header_bg_img} />
			</Animated.View>
			<HeaderView data={{
				title: "香单",
				isShowSearch: false,
				style: [
					Globalstyles.absolute
				],
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				}
			}} method={{ back: () => { navigation.goBack() } }}></HeaderView>
			<View style={[styles.perfume_info_con, { marginTop: 44 + insets.top }]}>
				<View style={styles.info_con}>
					<Pressable style={styles.info_image} onPress={() => { gotodetail("perfume-list-intro", collection.current) }}>
						<Image style={{ width: "100%", height: "100%" }} source={{ uri: ENV.image + collection.current.cpic + "!l" }} />
						{is_default_img() && <View style={styles.info_image_msk}>
							<Text style={styles.msk_text}>{"上传封面"}</Text>
							<Text style={styles.msk_text}>{"入住香单广场"}</Text>
						</View>}
					</Pressable>
					<View style={styles.info_msg}>
						<Text numberOfLines={2} style={styles.info_name}>{collection.current.cname}</Text>
						<View style={styles.info_flex}>
							{collection.current.cdesc && <Text numberOfLines={1} style={styles.desc_text}>{collection.current.cdesc}</Text>}
							{(!collection.current.cdesc && collection.current.cuid == us.user.uid) && <Text style={styles.desc_text}>{"编辑香单"}</Text>}
							{(!collection.current.cdesc && collection.current.cuid != us.user.uid) && <Text style={styles.desc_text}>{"简介无"}</Text>}
							<Icon name="advance" size={13} color={theme.toolbarbg} style={{ marginLeft: 5 }} />
						</View>
						<View style={styles.info_flex}>
							<Pressable style={styles.user_image} onPress={() => { gotodetail("user-detail", collection.current) }}>
								<Image style={{ width: "100%", height: "100%" }} source={{ uri: ENV.avatar + collection.current.cuid + ".jpg!m?" + collection.current.uface }} />
							</Pressable>
							<Text numberOfLines={1} style={styles.user_name} onPress={() => { gotodetail("user-detail", collection.current) }}>{collection.current.uname}</Text>
						</View>
					</View>
				</View>
				<View style={[Globalstyles.item_flex, { marginTop: 5 }]}>
					<Pressable style={styles.btn_con} onPress={() => { gotodetail("perfume-list-discuss", collection.current) }}>
						<Icon name="message" size={15} color={theme.toolbarbg} />
						<Text style={styles.btn_text}>{collection.current.discusscnt}</Text>
					</Pressable>
					<Pressable style={styles.btn_con} onPress={fav}>
						<Icon name={like_.current[collection.current.cid] ? "heart1-checked" : "heart1"} size={15} color={theme.toolbarbg} />
						<Text style={styles.btn_text}>{collection.current.favcnt}</Text>
					</Pressable>
					<Pressable style={styles.btn_con}>
						<Icon name="checkbox" size={14} color={theme.toolbarbg} />
						<Text style={styles.btn_text}>{"多选"}</Text>
					</Pressable>
					<Pressable style={styles.btn_con} onPress={togglecanbuy}>
						<Icon name={iscanbuy.current ? "shopcart-checked" : "shopcart"} size={15} color={theme.toolbarbg} />
						<Text style={styles.btn_text}>{"在售"}</Text>
					</Pressable>
				</View>
			</View>
			<FlatList data={items.current}
				// estimatedItemSize={100}
				onEndReachedThreshold={0.1}
				onEndReached={() => { }}
				keyExtractor={(item: any) => item.iid}
				ListHeaderComponent={() => {
					return (
						<>

						</>
					)
				}}
				contentContainerStyle={{ backgroundColor: "red" }}
				renderItem={({ item }: any) => {
					return (
						<View style={styles.col_item}>
							<View style={styles.item_order}>

							</View>
						</View>
					)
				}}
				ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={items.current.length > 0} />}
			/>
		</View>
	);
})

const styles = StyleSheet.create({
	perfume_info_con: {

	},
	info_con: {
		flexDirection: "row",
		marginLeft: 30,
		marginTop: 10,
		marginRight: 20
	},
	info_image: {
		width: 100,
		height: 100,
		borderRadius: 5,
		overflow: "hidden",
	},
	info_image_msk: {
		...StyleSheet.absoluteFillObject,
		backgroundColor: "rgba(0,0,0,0.4)",
		alignItems: "center",
		justifyContent: "center",
		zIndex: 1,
	},
	msk_text: {
		fontSize: 12,
		color: theme.toolbarbg,
	},
	info_msg: {
		flex: 1,
		marginLeft: 14,
	},
	info_name: {
		fontSize: 15,
		height: 36,
		color: theme.toolbarbg,
	},
	info_flex: {
		...Globalstyles.item_flex,
		marginTop: 8,
	},
	desc_text: {
		flex: 1,
		fontSize: 13,
		color: theme.toolbarbg,
	},
	user_image: {
		width: 24,
		height: 24,
		borderRadius: 50,
		overflow: "hidden",
	},
	user_name: {
		fontSize: 12,
		lineHeight: 27,
		color: theme.toolbarbg,
		marginLeft: 12
	},
	btn_con: {
		...Globalstyles.item_flex,
		justifyContent: "center",
		height: 50,
		flexGrow: 1,
		flexBasis: 0,
	},
	btn_text: {
		fontSize: 12,
		color: theme.toolbarbg,
		marginLeft: 7,
	},
	col_item: {
		paddingHorizontal: 9
	},
	item_order: {
		width: 33,
		height: 120,
	},
});

export default PerfumeListDetail;