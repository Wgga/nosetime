import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Animated as RNAnimated, Image } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, { runOnJS, runOnUI, useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import HeaderView from "../../components/view/headerview";
import ListBottomTip from "../../components/listbottomtip";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";
import { Globalstyles, toCamelCase } from "../../utils/globalmethod";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";
import Yimai from "../../assets/svg/itemdetail/yimai.svg";
import EmptyNose from "../../assets/svg/empty_nose.svg";
import AlertCtrl from "../../components/controller/alertctrl";
import ToastCtrl from "../../components/controller/toastctrl";
import LinearButton from "../../components/linearbutton";
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");

const ListItem = React.memo(({ item, index, isbuy, canbuy }: any) => {
	console.log("%c Line:33 🥛", "color:#42b983");
	return (
		<View style={[styles.col_item, index == 0 && styles.borderRadius]}>
			<View style={styles.item_order}>
				<Text style={styles.order_text}>{index + 1}</Text>
			</View>
			<Pressable style={styles.item_image}>
				<Image style={{ width: "100%", height: "100%" }} resizeMode="contain"
					defaultSource={require("../../assets/images/noxx.png")}
					source={{ uri: ENV.image + "/perfume/" + item.iid + ".jpg!l" }} />
			</Pressable>
			<View style={styles.item_info}>
				{item.cnname && <Text numberOfLines={1} style={styles.name_text}>{item.cnname}</Text>}
				{item.enname && <Text numberOfLines={1} style={[styles.name_text, { color: theme.text1 }]}>{item.enname}</Text>}
				<View style={styles.item_info_score}>
					<Pressable onPress={() => { }}>
						{item.total >= 10 && <Text style={styles.score_text}>{"评分:" + item.score + "分"}</Text>}
						{item.total < 10 && <Text style={styles.score_text}>{"评分过少"}</Text>}
					</Pressable>
					{/* {(isbuy && isbuy[item.iid]) && <Yimai width={16} height={16} style={{ marginLeft: 5 }} onPress={() => { }} />} */}
					{/* {(canbuy && canbuy[item.iid]) && !isbuy.cjurrent[item.iid] && <Icon name="shopcart" size={15} color={theme.placeholder2} style={{ marginLeft: 5 }} onPress={() => { }} />} */}
				</View>
				{item.udcontent && <Text numberOfLines={3} style={styles.item_info_desc}>{item.udcontent}</Text>}
			</View>
			<Pressable style={styles.item_btn}>
				<Icon name="sandian1" size={18} color={theme.fav} />
			</Pressable>
		</View>
	)
})

const PerfumeListDetail = React.memo(({ navigation, route }: any) => {

	// 控件
	const insets = useSafeAreaInsets();
	// 参数
	// 变量
	let id = React.useRef<number>(0);
	let allcnt = React.useRef<number>(0);
	let selcnt = React.useRef<number>(0);
	let pagesize = React.useRef<number>(0);
	const [title, setTitle] = React.useState<string>("香单");
	let colname = useSharedValue<string>("");
	let scrollY = useSharedValue<number>(0); // 顶部滚动动画
	let headerT = useSharedValue<number>(0);
	let headerH = React.useRef<number>(0);
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
	let isSelAll = React.useRef<boolean>(false);
	const [showmenu, setShowMenu] = React.useState<boolean>(false); // 是否显示菜单
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	React.useEffect(() => {
		if (route.params) {
			id.current = route.params.id ? route.params.id : 0;
		}
		init()
	}, [])

	// 初始化
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
			colname.value = resp_data.cname;
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

	// 跳转页面
	const gotodetail = (page: string, item?: any) => {
		const pages = ["perfume-list-edit", "perfume-list-intro", "perfume-list-discuss"];
		if (page == "user-detail") {
			navigation.push("Page", { screen: "UserDetail", params: { uid: item.cuid } });
		} else if (pages.includes(page)) {
			let screen = toCamelCase(page);
			navigation.navigate("Page", { screen, params: { collection: collection.current } });
		}
	}

	// 检测当前是否显示默认封面图
	const is_default_img = () => {
		if (us.user.uid != collection.current.cuid) return false;//不是自己的香单，不显示
		if (!collection.current.cpic) return true;//没封面图片显示上传
		return collection.current.cpic.includes("default");
	}

	// 收藏香单
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

	// 切换在售商品
	const togglecanbuy = () => {
		iscanbuy.current = !iscanbuy.current;
		if (iscanbuy.current) {
			http.get(ENV.collection + "?method=getcollectioncanbuy&id=" + id.current).then((resp_data: any) => {
				items.current = resp_data;
				noMore.current = false;
				nocanbuy.current = (items.current.length == 0);
				like_buys("nolike");
			})
		} else {
			items.current = collection.current.cdata;
			noMore.current = true;
			setIsRender(val => !val);
		}
	}

	const delete_col = () => {
		setShowMenu(false);
		AlertCtrl.show({
			header: "确认删除这个香单吗？",
			key: "del_col_alert",
			message: "",
			buttons: [{
				text: "取消",
				handler: () => {
					AlertCtrl.close("del_col_alert");
				}
			}, {
				text: "确定",
				handler: () => {
					AlertCtrl.close("del_col_alert");
					http.post(ENV.collection + "?uid=" + us.user.uid, {
						method: "delcollection", token: us.user.token, id: id.current
					}).then((resp_data: any) => {
						if (resp_data.msg == "OK") {
							ToastCtrl.show({ message: "已删除", duration: 1000, viewstyle: "short_toast", key: "del_success_toast" });
							//20200215直接通过事件传递删除的编号，避免刷新延迟，减少请求
							events.publish("collectionDeleted", id.current);
							cache.removeItem("usercollections" + us.user.uid);
							navigation.goBack();
						} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
							us.delUser();
							return navigation.navigate("Page", { screen: "Login", params: { src: "App香单详情页面" } });
						} else {
							ToastCtrl.show({ message: resp_data.msg, duration: 1000, viewstyle: "medium_toast", key: "del_err_toast" });
						}
					})
				}
			}],
		})
	}

	const handlerScroll = useAnimatedScrollHandler((event) => {
		"worklet";
		scrollY.value = event.contentOffset.y;
		console.log("%c Line:224 🥒 scrollY.value", "color:#33a5ff", scrollY.value);
		if (event.contentOffset.y > 46) {
			if (title == colname.value) return;
			runOnJS(setTitle)(colname.value)
		} else {
			if (title == "香单") return;
			runOnJS(setTitle)("香单")
		}
	})

	const showMenu = React.useCallback(() => {
		setShowMenu(val => !val)
	}, [])

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title,
				isShowSearch: false,
				showmenu: collection.current.cuid == us.user.uid ? showmenu : false,
				style: { zIndex: 1, backgroundColor: "transparent", overflow: "hidden", },
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				}
			}} method={{ back: () => { navigation.goBack() } }} MenuChildren={() => {
				return (
					collection.current.cuid == us.user.uid ? <>
						{/* <Pressable style={Globalstyles.menu_icon_con} onPress={() => { setShowMenu(false) }}>
							<Icon style={Globalstyles.menu_icon} name="share2" size={13} color={theme.comment} />
							<Text style={[Globalstyles.menu_text, { color: theme.text1 }]}>{"分享"}</Text>
						</Pressable> */}
						<Pressable style={Globalstyles.menu_icon_con} onPress={() => {
							gotodetail("perfume-list-edit");
							setShowMenu(false);
						}}>
							<Icon style={Globalstyles.menu_icon} name="edit" size={14} color={theme.text1} />
							<Text style={[Globalstyles.menu_text, { color: theme.text1 }]}>{"编辑香单"}</Text>
						</Pressable>
						<Pressable style={[Globalstyles.menu_icon_con, Globalstyles.no_border_bottom]} onPress={delete_col}>
							<Icon style={Globalstyles.menu_icon} name="del2" size={16} color={theme.text1} />
							<Text style={[Globalstyles.menu_text, { color: theme.text1 }]}>{"删除香单"}</Text>
						</Pressable>
					</> : <></>
				)
			}}>
				<Animated.View style={[
					Globalstyles.header_bg_con,
					useAnimatedStyle(() => ({ transform: [{ translateY: scrollY.value > 163 ? -163 : 0 - scrollY.value }] })),
					{ height: 300 }
				]}>
					<View style={Globalstyles.header_bg_msk}></View>
					<Image source={{ uri: ENV.image + collection.current.cpic + "!s" }} blurRadius={5} style={Globalstyles.header_bg_img} />
				</Animated.View>
				{/* {(collection.current.cuid != us.user.uid) && <Icon name="share2" size={16}
					onPress={() => { }} color={theme.toolbarbg} style={Globalstyles.title_icon} />} */}
				{collection.current.cuid == us.user.uid && <Icon name="sandian"
					size={18} onPress={showMenu}
					color={theme.toolbarbg} style={Globalstyles.title_icon} />}
			</HeaderView>
			<View style={[Globalstyles.header_bg_con, { height: 300 }]}>
				<View style={Globalstyles.header_bg_msk}></View>
				<Image source={{ uri: ENV.image + collection.current.cpic + "!s" }} blurRadius={5} style={Globalstyles.header_bg_img} />
			</View>
			<View style={[{ flex: 1, zIndex: 0 }, styles.borderRadius]}>
				<Animated.View style={[styles.list_head_con, styles.borderRadius, useAnimatedStyle(() => ({
					top: withTiming(headerT.value ? 0 : (71 + insets.top)),
					opacity: withTiming(headerT.value),
					zIndex: withTiming(headerT.value ? 1 : -1),
				}))]}>
					<View style={styles.list_btn_con}>
						<View style={Globalstyles.item_flex}>
							<Icon name={isSelAll.current ? "radio1" : "radio1-outline"} size={25} color={theme.primary} />
							<Text style={[styles.list_btn_text, { marginLeft: 5 }]}>{"全选"}</Text>
						</View>
						<Text style={styles.list_btn_text} onPress={() => { headerT.value = 0 }}>{"关闭"}</Text>
					</View>
					<View style={styles.list_cnt_con}>
						<Text>{"共" + allcnt.current + "款"}</Text>
						<Text>{"已选择" + selcnt.current + "款"}</Text>
					</View>
				</Animated.View>
				<Animated.FlatList data={items.current}
					onEndReachedThreshold={0.1}
					onEndReached={() => { }}
					keyExtractor={(item: any) => item.iid}
					onScroll={handlerScroll}
					ListEmptyComponent={() => {
						return (
							<View style={[styles.empty_con, styles.borderRadius]}>
								<EmptyNose width={35} height={35} color={theme.fav} style={{ marginBottom: 10 }} />
								<Text style={styles.empty_tip}>{"是我眼花了吗？\n这里没有香水啊！"}</Text>
							</View>
						)
					}}
					style={[styles.list_con, useAnimatedStyle(() => ({
						top: withTiming(headerT.value ? -(72 + insets.top) : 0),
					}))]}
					ListHeaderComponent={() => {
						return (
							<>
								<View style={styles.info_con}>
									<Pressable style={styles.info_image} onPress={() => { gotodetail("perfume-list-intro", collection.current) }}>
										<Image style={{ width: "100%", height: "100%" }} source={{ uri: ENV.image + collection.current.cpic + "!l" }} />
										{is_default_img() && <View style={Globalstyles.info_image_msk}>
											<Text style={Globalstyles.msk_text}>{"上传封面"}</Text>
											<Text style={Globalstyles.msk_text}>{"入住香单广场"}</Text>
										</View>}
									</Pressable>
									<View style={styles.info_msg}>
										<Text numberOfLines={2} style={styles.info_name} onPress={() => { gotodetail("perfume-list-intro", collection.current) }}>{collection.current.cname}</Text>
										<Pressable style={styles.info_flex} onPress={() => { gotodetail("perfume-list-intro", collection.current) }}>
											{collection.current.cdesc && <Text numberOfLines={1} style={styles.desc_text}>{collection.current.cdesc}</Text>}
											{(!collection.current.cdesc && collection.current.cuid == us.user.uid) && <Text style={styles.desc_text}>{"编辑香单"}</Text>}
											{(!collection.current.cdesc && collection.current.cuid != us.user.uid) && <Text style={styles.desc_text}>{"简介无"}</Text>}
											<Icon name="advance" size={13} color={theme.toolbarbg} style={{ marginLeft: 5 }} />
										</Pressable>
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
									<Pressable style={styles.btn_con} onPress={() => { headerT.value = 1 }}>
										<Icon name="checkbox" size={14} color={theme.toolbarbg} />
										<Text style={styles.btn_text}>{"多选"}</Text>
									</Pressable>
									<Pressable style={styles.btn_con} onPress={togglecanbuy}>
										<Icon name={iscanbuy.current ? "shopcart-checked" : "shopcart"} size={15} color={iscanbuy.current ? "#EFB946" : theme.toolbarbg} />
										<Text style={[styles.btn_text, iscanbuy.current && { color: "#EFB946" }]}>{"在售"}</Text>
									</Pressable>
								</View>
							</>
						)
					}}
					renderItem={({ item, index }: any) => {
						return (
							<ListItem item={item} index={index} isbuy={isbuy_.current} canbuy={canbuy_.current} />
						);
					}}
					ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={items.current.length > 0} />}
				/>
				<Animated.View style={[styles.footer_btn, useAnimatedStyle(() => ({
					opacity: withTiming(headerT.value),
					zIndex: withTiming(headerT.value ? 0 : -1),
				}))]}>
					<LinearButton text={"添加"} colors2={["#81B4EC", "#9BA6F5"]}
						isShowColor={false} isRadius={false}
						onPress={() => { console.log("添加") }} />
				</Animated.View>
			</View>
		</View>
	);
})

const styles = StyleSheet.create({
	list_head_con: {
		paddingTop: 12,
		paddingLeft: 27,
		paddingRight: 29,
		backgroundColor: theme.toolbarbg,
		zIndex: 1,
	},
	list_btn_text: {
		fontSize: 15,
		color: theme.tit2
	},
	list_btn_con: {
		...Globalstyles.item_flex_between,
		height: 40
	},
	list_cnt_con: {
		...Globalstyles.item_flex_between,
		height: 30
	},
	list_con: {
		position: "absolute",
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		zIndex: 0,
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
	info_msg: {
		flex: 1,
		marginLeft: 14,
	},
	info_name: {
		fontSize: 15,
		minHeight: 36,
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
	empty_con: {
		height: 300,
		backgroundColor: theme.toolbarbg,
		alignItems: "center",
		justifyContent: "center"
	},
	empty_tip: {
		textAlign: "center",
		fontSize: 14,
		color: theme.fav,
	},
	col_item: {
		minHeight: 120,
		flexDirection: "row",
		paddingHorizontal: 9,
		backgroundColor: theme.toolbarbg,
	},
	borderRadius: {
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		overflow: "hidden",
	},
	item_order: {
		width: 33,
		height: 120,
		alignItems: "center",
		justifyContent: "center",
		marginLeft: 5,
	},
	order_text: {
		fontSize: 16,
		color: theme.fav,
	},
	item_image: {
		width: 60,
		height: 60,
		marginVertical: 30,
	},
	item_info: {
		marginTop: 25,
		marginLeft: 10,
		flex: 1
	},
	name_text: {
		fontSize: 13,
		color: theme.tit2,
		lineHeight: 22
	},
	item_info_score: {
		...Globalstyles.item_flex,
		marginTop: 6,
	},
	score_text: {
		fontSize: 12,
		color: theme.comment,
	},
	item_info_desc: {
		marginTop: 10,
		marginBottom: 20,
		fontSize: 12,
		color: theme.comment,
	},
	item_btn: {
		width: 50,
		alignItems: "center",
		justifyContent: "center",
	},
	footer_btn: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
	}
});

export default PerfumeListDetail;