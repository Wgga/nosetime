import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image } from "react-native";

import { FlashList } from "@shopify/flash-list";

import HeaderView from "../../components/view/headerview";
import ListBottomTip from "../../components/listbottomtip";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlestarLeft } from "../../utils/globalmethod";

import Icon from "../../assets/iconfont";
import Yimai from "../../assets/svg/itemdetail/yimai.svg";
import AlertCtrl from "../../components/controller/alertctrl";
import HandleDesc from "../../components/handledesc";

const { width, height } = Dimensions.get("window");

const UserDiscuss = React.memo(({ navigation, route }: any) => {

	// 控件
	// 参数
	const title: any = { discuss: "的香评", short: "的一句话香评", wanted: "的想要", smelt: "的闻过", have: "的拥有" };
	const nodatastr: any = { discuss: "暂时还没有发布过香评", short: "暂时还没有发布过香评", wanted: "暂时还没有想要的香水", smelt: "暂时还没有闻过的香水", have: "暂时还没有拥有的香水" };
	const wantedstr: any = { wanted: "想要", smelt: "闻过", have: "拥有" };
	// 变量
	let type = React.useRef<string>("");
	let uid = React.useRef<number>(0);
	let cnt = React.useRef<number>(0);
	let name = React.useRef<string>("");
	let orderby = React.useRef<string>("new");
	let curpage = React.useRef<number>(1);
	let desc = React.useRef<any>({
		new: "-",
		hot: "-",
		agree: "-",
		star: "-",
		brand: false,
		year: "-",
	});
	// 数据
	let items = React.useRef<any[]>([]);
	let isbuy_ = React.useRef<any>({});
	let canbuy_ = React.useRef<any>({});
	let like_ = React.useRef<any>({});
	// 状态
	let canbuy = React.useRef<number>(0);
	let isempty = React.useRef<boolean>(false);
	let isemptyo = React.useRef<boolean>(false);
	let loading = React.useRef<boolean>(true);
	const [isrender, setIsRender] = React.useState<boolean>(false);
	let nocanbuy = React.useRef<boolean>(false);
	let noMore = React.useRef<boolean>(false);

	React.useEffect(() => {
		if (route.params) {
			type.current = route.params.type ? route.params.type : "";
			uid.current = route.params.uid ? route.params.uid : 0;
			cnt.current = route.params.cnt ? route.params.cnt : 0;
			name.current = route.params.name ? route.params.name : "";
		}
		if (["discuss", "short", "wanted", "smelt", "have"].indexOf(type.current) < 0) type.current = "discuss";
		init()
	}, [])

	const init = () => {
		curpage.current = 1;
		loadMore("init");
	}

	const loadMore = (src: string) => {
		if (src == "loadMore") curpage.current++;
		http.post(ENV.user, {
			method: "get" + type.current,
			id: uid.current, uid: us.user.uid,
			orderby: orderby.current, desc: desc.current[orderby.current],
			page: curpage.current, canbuy: canbuy.current
		}).then((resp_data: any) => {
			items.current = curpage.current == 1 ? resp_data : items.current.concat(resp_data);
			if (curpage.current == 1) {
				isempty.current = items.current.length == 0 && uid.current == us.user.uid && canbuy.current == 0
				isemptyo.current = items.current.length == 0 && uid.current != us.user.uid && canbuy.current == 0
				nocanbuy.current = items.current.length == 0 && canbuy.current == 1;
			}
			if (type.current == "discuss" || type.current == "short") {
				let ids = [];
				for (let i in resp_data) {
					ids.push(resp_data[i].udid);
				}
				islike(ids);
			}
			buys(resp_data);

			if (resp_data.length < 20) noMore.current = true;
		});
	}

	const islike = (ids: any[]) => {
		if (!us.user.uid) return;
		http.post(ENV.api + ENV.item, { method: "islike_discuss", uid: us.user.uid, ids }).then((resp_data: any) => {
			for (var i in resp_data) {
				like_.current[resp_data[i]] = 1;
			}
		});
	}

	const buys = (resp: any[]) => {
		let ids = [];
		for (let i in resp) ids.push(resp[i].id);
		Promise.all([
			http.post(ENV.item, { method: "isbuyv2", uid: us.user.uid, ids }),
			http.post(ENV.mall, { method: "canbuy", uid: us.user.uid, ids })
		]).then(([isbuy, canbuy]: any) => {
			for (let i in isbuy) isbuy_.current[isbuy[i]] = 1;
			for (let i in canbuy) canbuy_.current[canbuy[i]] = 1;
			loading.current = false;
			setIsRender(val => !val);
		});
	}

	const setorder = (tab: string) => {
		let orderchange = false;
		if (["new", "agree", "star", "brand", "year", "hot"].indexOf(tab) >= 0) {
			orderchange = true;
			if (desc.current[tab] == undefined || desc.current[tab] == "-") {
				if (tab == "brand")
					desc.current[tab] = false;
				else
					desc.current[tab] = true;
			} else if (orderby.current == tab) {
				desc.current[tab] = !desc.current[tab];
			}
		}
		if (orderby.current != tab) {
			orderchange = true;
			orderby.current = tab;
		}
		if (orderchange) init();
	}

	const gotodetail = (page: string, item: any) => {
		if (page == "item-detail") {
			navigation.navigate("Page", { screen: "ItemDetail", params: { id: item.id } });
		} else if (page == "mall-item") {
			navigation.navigate("Page", { screen: "MallItem", params: { id: item.id } });
		} else if (page == "item-vote") {
			let type = item.uwtype == "1" ? "wanted" : item.uwtype == "2" ? "have" : "smelt";
			navigation.push("Page", {
				screen: "ItemVote",
				params: { type, optionaltype: type, id: item.id, name: item.cnname, enname: item.enname, }
			});
		} else if (page == "discuss-reply") {
			item["udiid"] = item.id;
			navigation.navigate("Page", { screen: "DiscussReply", params: { item, id: item.id, udid: item.udid, title: name.current + title["discuss"], src: "user" } });
		}
	}

	const delwanted = (iid: number) => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App个人香评页" } });
		}
		AlertCtrl.show({
			header: "确定要删除吗？",
			key: "del_discuss_alert",
			buttons: [{
				text: "取消",
				handler: () => {
					AlertCtrl.close("del_discuss_alert");
				}
			}, {
				text: "确定",
				handler: () => {
					AlertCtrl.close("del_discuss_alert");
					_delwanted(iid);
				}
			}],
		})
	}

	const _delwanted = (iid: number) => {
		http.post(ENV.user, { method: "delwanted", id: us.user.uid, iid, token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "DEL") {
				cnt.current--;
				cache.removeItem("user" + us.user.uid);
				cache.removeItem("user-discuss" + type.current + us.user.uid);
				events.publish("user_del_note");
				var arr = [];
				for (var key in items.current) {
					let obj = items.current[key];
					if (obj["id"] != iid) arr.push(obj);
				}
				items.current = arr;
				setIsRender(val => !val);
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App个人香评页" } });
			}
		});
	}

	const togglecanbuy = () => {
		canbuy.current = canbuy.current == 0 ? 1 : 0;
		noMore.current = false;
		init();
	}

	const postdiscussup = (item: any) => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App个人香评页" } });
		}
		http.post(ENV.item + "?method=postdiscussup&id=" + item.id + "&uid=" + us.user.uid + "&did=" + us.did,
			{ udid: item.udid, uduid: item.replyuid, token: us.user.token }
		).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				like_.current[item.udid] = 1;
			} else if (resp_data.msg == "REMOVE") {
				like_.current[item.udid] = 0;
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App个人香评页" } });
			}
			item.udup = resp_data.total;
			setIsRender(val => !val);
		});
	}

	const handledescimg = (desc: string) => {
		let regex = /<img[^>]+src="([^"]+)">/g;
		let match, sz: any = [];
		while (match = regex.exec(desc)) {
			sz.push(<Image key={match[1]} style={Globalstyles.desc_img} source={{ uri: match[1] }} />);
		}
		return sz;
	}

	const open_PhotoPopover = (slideimgindex: number) => {
		// ModalPortal.show((
		// 	<PhotoPopover modalparams={{
		// 		key: "user_photo_popover",
		// 		slideimgindex,
		// 		slideimglist: aImages.current,
		// 	}} />
		// ), {
		// 	key: "user_photo_popover",
		// 	width,
		// 	height,
		// 	rounded: false,
		// 	useNativeDriver: true,
		// 	onTouchOutside: () => {
		// 		ModalPortal.dismiss("user_photo_popover");
		// 	},
		// 	onHardwareBackPress: () => {
		// 		ModalPortal.dismiss("user_photo_popover");
		// 		return true;
		// 	},
		// 	animationDuration: 300,
		// 	modalStyle: { backgroundColor: "transparent" },
		// })
	}

	return (
		<View style={Globalstyles.container}>
			{loading.current && <View style={Globalstyles.loading_con}>
				<Image style={Globalstyles.loading_img} source={require("../../assets/images/loading.gif")} />
			</View>}
			<HeaderView data={{
				title: name.current + title[type.current],
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}}>
				<Pressable style={styles.title_icon} onPress={togglecanbuy}>
					<Icon name={canbuy.current == 0 ? "shopcart" : "shopcart-checked"} size={14} color={canbuy.current == 0 ? theme.text2 : theme.tit} />
					<Text style={[styles.title_text, { color: canbuy.current == 0 ? theme.text2 : theme.tit }]}>{"在售"}</Text>
				</Pressable>
			</HeaderView>
			<View style={styles.tabbar_con}>
				<Text style={[styles.tabbar_text, orderby.current == "new" && { color: theme.tit }]} onPress={() => { setorder("new") }}>{"最新"}</Text>
				{type.current == "wanted" && <Text style={[styles.tabbar_text, orderby.current == "hot" && { color: theme.tit }]} onPress={() => { setorder("hot") }}>{"热门"}</Text>}
				{type.current != "wanted" && <>
					<Text style={[styles.tabbar_text, orderby.current == "agree" && { color: theme.tit }]} onPress={() => { setorder("agree") }}>{"赞同"}</Text>
					<Text style={[styles.tabbar_text, orderby.current == "star" && { color: theme.tit }]} onPress={() => { setorder("star") }}>{"评星"}</Text>
				</>}
				<Text style={[styles.tabbar_text, orderby.current == "brand" && { color: theme.tit }]} onPress={() => { setorder("brand") }}>{"品牌"}</Text>
				<Text style={[styles.tabbar_text, orderby.current == "year" && { color: theme.tit }]} onPress={() => { setorder("year") }}>{"年代"}</Text>
			</View>
			<FlashList data={items.current}
				extraData={isrender}
				estimatedItemSize={100}
				onEndReached={() => { }}
				onEndReachedThreshold={0.1}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ backgroundColor: theme.toolbarbg }}
				keyExtractor={(item: any) => item.id}
				ListEmptyComponent={<View>
					{isempty && <Image style={Globalstyles.emptyimg}
						resizeMode="contain"
						source={require("../../assets/images/empty/want_blank.png")} />}
					{isemptyo && <Image style={Globalstyles.emptyimg}
						resizeMode="contain"
						source={require("../../assets/images/empty/owant_blank.png")} />}
					{nocanbuy && <Image style={Globalstyles.emptyimg}
						resizeMode="contain"
						source={require("../../assets/images/empty/favcanbuy_blank.png")} />}
				</View>}
				renderItem={({ item, index }: any) => {
					return (
						<View style={styles.discuss_item}>
							<View style={styles.item_con}>
								<Pressable style={styles.item_img} onPress={() => { gotodetail("item-detail", item) }}>
									<Image style={{ width: "100%", height: "100%" }} source={{ uri: ENV.image + "/perfume/" + item.id + ".jpg!m" }} resizeMode="contain" />
								</Pressable>
								<View style={styles.item_info}>
									<View style={Globalstyles.item_flex_between}>
										<Text numberOfLines={1} style={styles.item_name} onPress={() => { gotodetail("item-detail", item) }}>{item.cnname}</Text>
										<Pressable onPress={() => { gotodetail("mall-item", item) }}>
											{isbuy_.current[item.id] && <Yimai width={15} height={15} />}
											{(canbuy_.current[item.id] && !isbuy_.current[item.id]) && <Icon name="shopcart" size={14} color={theme.placeholder2} />}
										</Pressable>
									</View>
									<Text numberOfLines={2} style={styles.item_enname} onPress={() => { gotodetail("item-detail", item) }}>{item.enname}</Text>
									{item.score > 0 && <View style={Globalstyles.star}>
										<Image style={[Globalstyles.star_icon, handlestarLeft(item.score * 2)]}
											defaultSource={require("../../assets/images/nopic.png")}
											source={require("../../assets/images/star/star.png")}
										/>
									</View>}
								</View>
							</View>
							<View style={type.current != "discuss" && { marginLeft: 60 }}>
								{item.content && <HandleDesc
									containerStyle={{ marginTop: 23 }}
									itemStyle={styles.item_desc}
									type="text"
									item={item}
									itemKey="content"
								/>}
								{(type.current == "discuss" && item.udpichtml) && <HandleDesc
									containerStyle={Globalstyles.desc_img_con}
									itemStyle={Globalstyles.desc_img}
									type="image"
									item={item}
									itemKey="udpichtml"
								/>}
								<View style={styles.item_btn}>
									<Text style={styles.item_time}>{item.time}</Text>
									{us.user.uid == uid.current && <>
										<Pressable style={styles.btn_con} onPress={() => { gotodetail("item-vote", item) }}>
											<Icon name="edit4" size={18} color={theme.placeholder} />
											<Text style={styles.btn_text}>{"编辑"}</Text>
										</Pressable>
										{(type.current == "wanted" || type.current == "smelt" || type.current == "have") && <Pressable style={styles.btn_con} onPress={() => { delwanted(item.id) }}>
											<Icon name="del1" size={20} color={theme.placeholder} />
											<Text style={styles.btn_text}>{"删除"}</Text>
										</Pressable>}
									</>}
									{(type.current == "short" || type.current == "discuss") && <View style={styles.item_right_btn}>
										<Pressable style={[Globalstyles.item_flex, { marginRight: 20 }]} onPress={() => { gotodetail("discuss-reply", item) }}>
											<Icon name="reply" size={15} color={theme.placeholder} />
											<Text style={styles.right_btn_text}>{(item.udreplycnt != "" && item.udreplycnt != "0") ? item.udreplycnt : ""}</Text>
										</Pressable>
										<Pressable style={Globalstyles.item_flex} onPress={() => { postdiscussup(item) }}>
											<Icon name={!like_.current[item.udid] ? "up" : "up-checked"} size={15} color={theme.placeholder} />
											<Text style={styles.right_btn_text}>{item.udup != "0" ? item.udup : ""}</Text>
										</Pressable>
									</View>}
								</View>
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
	title_icon: {
		height: 44,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginRight: 15,
	},
	title_text: {
		fontSize: 12,
		marginLeft: 5
	},
	tabbar_con: {
		height: 45,
		backgroundColor: theme.toolbarbg,
		flexDirection: "row",
		borderBottomColor: theme.border,
		borderBottomWidth: 0.33,
	},
	tabbar_text: {
		lineHeight: 45,
		textAlign: "center",
		flexGrow: 1,
		flexBasis: 0,
	},
	discuss_item: {
		padding: 15,
		borderBottomColor: theme.bg,
		borderBottomWidth: 1,
	},
	item_con: {
		flexDirection: "row"
	},
	item_img: {
		width: 50,
		height: 50,
	},
	item_info: {
		flex: 1,
		marginLeft: 10,
	},
	item_name: {
		flexShrink: 1,
		fontSize: 14,
		color: theme.tit2,
		marginRight: 10,
	},
	item_enname: {
		marginVertical: 5,
		color: theme.text2,
		fontSize: 14,
	},
	item_desc: {
		marginBottom: 14,
		fontSize: 14,
		color: theme.comment
	},
	item_btn: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 9,
	},
	item_time: {
		fontSize: 13,
		color: theme.placeholder
	},
	btn_con: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 10
	},
	btn_text: {
		fontSize: 12,
		color: theme.placeholder
	},
	item_right_btn: {
		position: "absolute",
		right: 0,
		flexDirection: "row",
		alignItems: "center",
	},
	right_btn_text: {
		fontSize: 14,
		color: theme.placeholder,
		marginLeft: 5,
	}
});

export default UserDiscuss;