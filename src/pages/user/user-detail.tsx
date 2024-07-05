import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, Image, FlatList } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderView from "../../components/headerview";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlestarLeft, toCamelCase } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";
import { ShadowedView } from "react-native-fast-shadow";
import reactNativeTextSize from "react-native-text-size";
import { ModalPortal } from "../../components/modals";
import PhotoPopover from "../../components/popover/photo-popover";
import ActionSheetCtrl from "../../components/actionsheetctrl";

const { width, height } = Dimensions.get("window");

const UserDetail = React.memo(({ navigation, route }: any) => {

	// 控件
	const classname = "UserDetailPage";
	const insets = useSafeAreaInsets();
	// 变量
	let uid = React.useRef<number>(0);
	let uface = React.useRef<number>(0);
	let avatar = React.useRef<string>("");
	let who = React.useRef<string>("");
	let topicTab = React.useRef<string>("");
	let colTab = React.useRef<string>("");
	let maxtotal = React.useRef<number>(0);
	const [curTab, setCurTab] = React.useState<string>("home");
	const [introcontent, setIntroContent] = React.useState<string>(""); // 简介数据
	// 数据
	let favTopics = React.useRef<any[]>([]);
	let usercol = React.useRef<any[]>([]);
	let favcol = React.useRef<any[]>([]);
	let commonfavs = React.useRef<any>({
		item: [], brand: [], perfumer: [], odor: [], article: []
	});
	let info = React.useRef<any>({
		care: "", fans: "", wanted: "", smelt: "", have: "", friend: "", uiid: 0, records: 0
	});
	let favcnt = React.useRef<number>(0);
	let commoncnt = React.useRef<number>(0);
	let aImages = React.useRef<any[]>([]);
	// 参数
	// 状态
	let isShowUsercol = React.useRef<boolean>(false);
	let isShowFavcol = React.useRef<boolean>(false);
	let isShowUserTopic = React.useRef<boolean>(false);
	let isShowFavTopic = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (route.params) {
			uid.current = route.params.uid;
			who.current = route.params.uid == us.user.uid ? "我" : "Ta";
		}
		init()
	}, []);

	// 获取用户数据
	const getUserData = () => {
		return new Promise((resolve, reject) => {
			cache.getItem(classname + uid.current).then((cacheobj) => {
				if (cacheobj) {
					setUserData(cacheobj);
					resolve(1);
				}
			}).catch(() => {
				http.post(ENV.user, { method: "getsocialinfo", id: uid.current, uid: us.user.uid }).then((resp_data: any) => {
					cache.saveItem(classname + uid.current, resp_data, 10);
					setUserData(resp_data);
					resolve(1);
				})
			});
		})
	}

	// 设置个人页面数据
	const setUserData = (data: any) => {
		if (!data) return;
		if (data.shorts) data.shorts = data.shorts.slice(0, 2);
		if (data.discusss) data.discusss = data.discusss.slice(0, 2);
		if (data.topics && data.topics.length > 0) isShowUserTopic.current = true;
		topicTab.current = isShowUserTopic.current ? who.current : "fav";
		data.friend = parseInt(data.care) + parseInt(data.fans);
		data.records = parseInt(data.wanted) + parseInt(data.smelt) + parseInt(data.have);
		data.udesc = data.udesc ? data.udesc.replace(/\n/g, "") : "";
		for (let i = 0; i < data.photos.length; i++) {
			aImages.current.push(ENV.image + "/uploads/" + data.photos[i] + ".jpg");
		}
		info.current = data;
		avatar.current = ENV.avatar + info.current.uid + ".jpg?" + info.current.uface;
		// this.getaddtiondata();
	}

	// 获取用户收藏话题数据
	const getFavTopic = () => {
		return new Promise((resolve, reject) => {
			http.post(ENV.shequ, { method: "getfavtopic", id: uid.current }).then((resp_data: any) => {
				favTopics.current = resp_data.slice(0, 2);
				if (resp_data.length > 0) isShowFavTopic.current = true;
				resolve(1);
			})
		})
	}

	// 获取用户收藏各类数据的数量
	const getFavCnt = () => {
		return new Promise((resolve, reject) => {
			http.post(ENV.user + "?uid=" + uid.current, { method: "getfavcnt", token: us.user.token }).then((resp_data: any) => {
				favcnt.current = 0;
				for (let i in resp_data) {
					if (i == "帖子") continue;
					favcnt.current += parseInt(resp_data[i]);
				}
				resolve(1);
			})
		})
	}

	// 获取用户自建香单数据
	const getUserCol = () => {
		return new Promise((resolve, reject) => {
			if (info.current.name == "[已注销] ") {
				resolve(0);
			} else {
				http.get(ENV.collection + "?method=getusercollections&uid=" + uid.current).then((resp_data: any) => {
					if (resp_data.length > 0) isShowUsercol.current = true;
					usercol.current = resp_data;
					resolve(1);
				})
			}
		})
	}

	// 获取用户收藏香单数据
	const getFavCol = () => {
		return new Promise((resolve, reject) => {
			if (info.current.name == "[已注销] ") {
				resolve(0);
			} else {
				http.get(ENV.collection + "?method=getfavcollections&uid=" + uid.current).then((resp_data: any) => {
					if (resp_data.length > 0) isShowFavcol.current = true;
					favcol.current = resp_data;
					resolve(1);
				});
			}
		})
	}

	// 获取共同喜好
	const getCompare = () => {
		return new Promise((resolve, reject) => {
			if (uid.current == us.user.uid) {
				resolve(0);
			} else {
				http.get(ENV.user + "?method=compare&uida=" + uid.current + "&uidb=" + us.user.uid).then((resp: any) => {
					commonfavs.current = resp;
					commoncnt.current = 0;
					for (var i in resp) {
						if (resp[i]) {
							commoncnt.current += resp[i].length;
						} else {
							resp[i] = [];
						}
					}
					resolve(1);
				})
			}
		})
	}

	// 初始化
	const init = () => {
		Promise.all([
			getUserData(),
			getFavTopic(),
			getFavCnt(),
			getUserCol(),
			getFavCol(),
			getCompare()
		]).then(() => {
			colTab.current = usercol.current.length == 0 && favcol.current.length > 0 ? "fav" : "user";
			setIsRender(val => !val);
		})
	}

	// 设置用户简介
	const setIntrodata = (e: any) => {
		reactNativeTextSize.measure({
			width: e.nativeEvent.layout.width,
			fontSize: 12,
			fontFamily: "monospace",
			fontWeight: "normal",
			text: info.current.udesc,
			lineInfoForLine: 5
		}).then((data: any) => {
			maxtotal.current = data.lineInfo.start - 4;
			setIntroContent(info.current.udesc.slice(0, maxtotal.current));
		}).catch(() => {
			maxtotal.current = info.current.udesc.length;
			setIntroContent(info.current.udesc.slice(0, maxtotal.current));
		});
	}

	// 切换香单类型
	const toggleCol = (type: string) => {
		if (colTab.current == type) return;
		colTab.current = type;
		setIsRender(val => !val);
	}

	// 切换话题类型
	const toggleTopic = (type: string) => {
		if (topicTab.current == type) return;
		topicTab.current = type;
		setIsRender(val => !val);
	}

	// 跳转页面
	const gotodetail = (page: string, item?: any) => {
		if (page == "user-fav") {
			navigation.navigate("Page", { screen: "UserFav", params: { id: 0, uid: uid.current } });
		} else if (page == "item-detail") {
			navigation.navigate("Page", { screen: "ItemDetail", params: { id: item.id } });
		} else {
			let screen = toCamelCase(page);
			navigation.navigate("Page", { screen: screen, params: { uid: uid.current } });
		}
	}

	// 查看相册大图
	const open_PhotoPopover = (slideimgindex: number) => {
		ModalPortal.show((
			<PhotoPopover modalparams={{
				key: "user_photo_popover",
				slideimgindex,
				slideimglist: aImages.current,
			}} />
		), {
			key: "user_photo_popover",
			width,
			height,
			rounded: false,
			useNativeDriver: true,
			onTouchOutside: () => {
				ModalPortal.dismiss("user_photo_popover");
			},
			onHardwareBackPress: () => {
				ModalPortal.dismiss("user_photo_popover");
				return true;
			},
			animationDuration: 300,
			modalStyle: { backgroundColor: "transparent" },
		})
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: "",
				isShowSearch: false,
				style: Globalstyles.absolute,
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				}
			}} method={{
				back: () => { navigation.goBack() },
			}} />
			<ScrollView showsVerticalScrollIndicator={false}>
				{avatar.current && <Image style={styles.header_bg} blurRadius={40} source={{ uri: avatar.current }} />}
				<View style={styles.user_info}>
					{avatar.current && <Image style={[styles.user_avatar, { marginTop: 41 + insets.top }]} source={{ uri: avatar.current }} />}
					<Text style={styles.user_name}>{info.current.uname}</Text>
					{info.current.udesc && <View style={styles.intro_con} onLayout={setIntrodata}>
						{introcontent && <>
							<Text numberOfLines={5} style={[styles.intro_text, { fontFamily: "monospace" }]}>{introcontent}</Text>
							{info.current.udesc.length > maxtotal.current && <View style={styles.intro_morebtn_con}>
								<Text style={styles.intro_text}>{"..."}</Text>
								<Icon name="btmarrow" style={styles.intro_icon} size={10} color={theme.toolbarbg} />
							</View>}
						</>}
					</View>}
					{info.current.name != "[已注销] " && <View style={styles.user_tabbar_con}>
						<Text style={styles.tabbar_text}><Text style={styles.tabbar_num}>{info.current.friend}</Text>{"\n友邻"}</Text>
						<Text style={styles.tabbar_text}><Text style={styles.tabbar_num}>{info.current.wanted}</Text>{"\n想要"}</Text>
						<Text style={styles.tabbar_text}><Text style={styles.tabbar_num}>{info.current.smelt}</Text>{"\n闻过"}</Text>
						<Text style={styles.tabbar_text}><Text style={styles.tabbar_num}>{info.current.have}</Text>{"\n拥有"}</Text>
						<Text style={styles.tabbar_text} onPress={() => { gotodetail("user-fav") }}><Text style={styles.tabbar_num}>{favcnt.current}</Text>{"\n喜好"}</Text>
					</View>}
				</View>
				{info.current.name != "[已注销] " && <View style={styles.page_tabbar_con}>
					<Pressable style={styles.page_tabbar} onPress={() => { setCurTab("home") }}>
						<Text style={[styles.tabtext, curTab == "home" && styles.activetab]}>{"个人主页"}</Text>
						{curTab == "home" && <Text style={styles.tabline}></Text>}
					</Pressable>
					<Pressable style={styles.page_tabbar} onPress={() => { setCurTab("gene") }}>
						<Text style={[styles.tabtext, curTab == "gene" && styles.activetab]}>{"嗅觉DNA"}</Text>
						{curTab == "gene" && <Text style={styles.tabline}></Text>}
					</Pressable>
				</View>}
				<View style={styles.page_container}>
					{info.current.name == "[已注销] " && <Image style={Globalstyles.emptyimg}
						source={require("../../assets/images/empty/ohomepage_blank.png")}
						resizeMode="contain"
					/>}
					{(info.current.name != "[已注销] " && curTab == "home") && <View>
						{(
							us.user.uid != uid &&
							info.current.uiid == 0 && info.current.photo == 0 && commoncnt.current == 0 &&
							info.current.short == 0 && info.current.discuss == 0 &&
							isShowUsercol.current && isShowFavcol.current && isShowFavTopic.current && isShowUserTopic.current
						) && <Image style={Globalstyles.emptyimg}
							source={require("../../assets/images/empty/ohomepage_blank.png")}
							resizeMode="contain" />
						}
						{(us.user.uid != uid.current && commoncnt.current > 0) && <View style={styles.item_padding}>
							<ShadowedView style={styles.commonfav_con}>
								<View style={styles.commonfav_avatar_con}>
									{avatar.current && <Image style={styles.commonfav_avatar} source={{ uri: avatar.current }} />}
									<Image style={[styles.commonfav_avatar, styles.commonfav_avatar2]} source={{ uri: ENV.avatar + us.user.uid + ".jpg?" + us.user.uface }} />
								</View>
								<View style={styles.commonfav_list}>
									<View style={styles.commonfav_tit_con}>
										<Text style={styles.commonfav_tit}>{"我们共同的喜好 " + commoncnt.current + "个"}</Text>
										<Icon name="advance" size={14} color={theme.tit2} style={{ marginLeft: 10 }} />
									</View>
									<Text style={styles.commonfav_text}>{
										"香水 " + commonfavs.current["item"].length + "  " +
										"气味 " + commonfavs.current["odor"].length + "  " +
										"品牌 " + commonfavs.current["brand"].length + "  " +
										"调香师 " + commonfavs.current["perfumer"].length + "  " +
										"文章 " + commonfavs.current["article"].length + "  "
									}</Text>
								</View>
							</ShadowedView>
						</View>}
						{info.current.uiid > 0 && <View style={styles.item_list}>
							<View style={styles.item_title}>
								<Text style={[styles.tit_text, { color: theme.tit2 }]}>{"签名香"}</Text>
							</View>
							<Pressable style={styles.mine_perfume} onPress={() => { gotodetail("item-detail", { id: info.current.uiid }) }}>
								<Image style={styles.mine_perfume_img} source={{ uri: ENV.image + "/perfume/" + info.current.uiid + ".jpg!m" }} resizeMode="contain" />
								<View>
									<Text style={styles.mine_perfume_name}>{info.current.uitem.cnname}</Text>
									<Text style={[styles.mine_perfume_name, { color: theme.text2 }]}>{info.current.uitem.enname}</Text>
								</View>
							</Pressable>
						</View>}
						{(isShowUsercol.current || isShowFavcol.current || us.user.uid == uid.current) && <View style={styles.item_list}>
							<View style={styles.item_title}>
								<View style={styles.item_flex_row}>
									{isShowUsercol.current && <Text style={[styles.tit_text, colTab.current == "user" && { color: theme.tit2 }]} onPress={() => { toggleCol("user") }}>{"自建香单"}</Text>}
									{(isShowUsercol.current && isShowFavcol.current) && <Text style={styles.tit_text}>|</Text>}
									{isShowFavcol.current && <Text style={[styles.tit_text, colTab.current == "fav" && { color: theme.tit2 }]} onPress={() => { toggleCol("fav") }}>{"收藏香单"}</Text>}
								</View>
								<Pressable hitSlop={10} style={styles.item_flex_row} onPress={() => { gotodetail("perfume-list") }}>
									<Text style={styles.col_btn}>{"全部"}</Text>
									<Icon name="advance" size={14} color={theme.color} />
								</Pressable>
							</View>
							<FlatList data={colTab.current == "user" ? usercol.current : favcol.current}
								horizontal={true}
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.item_padding}
								keyExtractor={(item: any) => item.cid}
								ListFooterComponent={
									<>
										{(uid.current == us.user.uid && usercol.current.length < 4 && colTab.current == "user") &&
											<Pressable style={styles.perfume_item} onPress={() => { gotodetail("perfume-list-edit") }}>
												<Image style={styles.item_image}
													source={require("../../assets/images/edit.png")}
												/>
												<Text numberOfLines={2} style={styles.item_cname}>{"新建香单"}</Text>
											</Pressable>
										}
									</>
								}
								renderItem={({ item }: any) => {
									return (
										<View style={styles.perfume_item}>
											<Image style={styles.item_image}
												source={{ uri: ENV.image + item.cpic + "!l" }}
											/>
											<Text numberOfLines={2} style={styles.item_cname}>{item.cname}</Text>
										</View>
									)
								}}
							/>
						</View>}
						{info.current.photo > 0 && <View style={styles.item_list}>
							<View style={styles.item_title}>
								<Text style={[styles.tit_text, { color: theme.tit2 }]}>{who.current + "的相册 (" + info.current.photo + ")"}</Text>
							</View>
							{(info.current.photos && info.current.photos.length > 0) && <FlatList data={info.current.photos}
								horizontal={true}
								showsHorizontalScrollIndicator={false}
								contentContainerStyle={styles.item_padding}
								keyExtractor={(item: any) => item}
								renderItem={({ item, index }: any) => {
									return (
										<Pressable onPress={() => { open_PhotoPopover(index) }}>
											<Image style={[styles.item_image, { marginRight: 13 }]}
												source={{ uri: ENV.image + "/uploads/" + item + ".jpg!l" }}
											/>
										</Pressable>
									)
								}}
							/>}
						</View>}
						{(isShowUserTopic.current || isShowFavTopic.current) && <View style={styles.item_list}>
							<View style={styles.item_title}>
								<View style={styles.item_flex_row}>
									{isShowUserTopic.current && <Text style={[styles.tit_text, topicTab.current == who.current && { color: theme.tit2 }]} onPress={() => { toggleTopic(who.current) }}>{who.current + "的话题"}</Text>}
									{(isShowUserTopic.current && isShowFavTopic.current) && <Text style={styles.tit_text}>|</Text>}
									{isShowFavTopic.current && <Text style={[styles.tit_text, topicTab.current == "fav" && { color: theme.tit2 }]} onPress={() => { toggleTopic("fav") }}>{"收藏话题"}</Text>}
								</View>
								<Icon name="advance" size={14} color={theme.color} />
							</View>
							{topicTab.current == who.current && info.current.topics.map((item: any) => {
								return (
									<View key={item.ctdlgid} style={[styles.item_padding, styles.item_flex_row, { borderBottomColor: theme.bg, borderBottomWidth: 1 }]}>
										{avatar.current && <Image style={styles.topic_avatar} source={{ uri: avatar.current }} />}
										<Text style={styles.topic_tit}>{item.cttitle}</Text>
									</View>
								)
							})}
							{topicTab.current == "fav" && favTopics.current.map((item: any) => {
								return (
									<View key={item.ctdlgid} style={[styles.item_padding, styles.item_flex_row, { borderBottomColor: theme.bg, borderBottomWidth: 1 }]}>
										{avatar.current && <Image style={styles.topic_avatar} source={{ uri: ENV.avatar + item.uid + ".jpg!l?" + item.uface }} />}
										<Text style={styles.topic_tit}>{item.cttitle}</Text>
									</View>
								)
							})}
						</View>}
						{info.current.short > 0 && <View style={styles.item_list}>
							<Pressable style={[styles.item_title, { paddingBottom: 15 }]}>
								<Text style={[styles.tit_text, { color: theme.tit2 }]}>{who.current + "的一句话香评 (" + info.current.short + ")"}</Text>
								<Icon name="advance" size={14} color={theme.color} />
							</Pressable>
							{(info.current.shorts && info.current.shorts.length > 0) && info.current.shorts.map((item: any) => {
								return (
									<View key={item.id} style={styles.item_padding}>
										<View style={{ flexDirection: "row" }}>
											<View style={styles.discuss_image_info}>
												<Image style={styles.discuss_img} source={{ uri: ENV.image + "/perfume/" + item.id + ".jpg!m" }} resizeMode="contain" />
												<View style={styles.img_traiangle}></View>
											</View>
											<View style={{ marginLeft: 10 }}>
												<Text style={styles.discuss_name}>{item.cnname}</Text>
												<Text style={[styles.discuss_name, { color: theme.text2 }]}>{item.enname}</Text>
											</View>
										</View>
										<View style={styles.discuss_info}>
											{item.score > 0 && <View style={Globalstyles.star}>
												<Image
													style={[Globalstyles.star_icon, handlestarLeft(item.score * 2)]}
													defaultSource={require("../../assets/images/nopic.png")}
													source={require("../../assets/images/star/star.png")}
												/>
											</View>}
											<Text numberOfLines={1} style={styles.discuss_desc}>{item.desc}</Text>
										</View>
									</View>
								)
							})}
						</View>}
						{info.current.discuss > 0 && <>
							<Pressable style={[styles.item_title, { paddingBottom: 15 }]}>
								<Text style={[styles.tit_text, { color: theme.tit2 }]}>{who.current + "的香水评论 (" + info.current.discuss + ")"}</Text>
								<Icon name="advance" size={14} color={theme.color} />
							</Pressable>
							{(info.current.discusss && info.current.discusss.length > 0) && info.current.discusss.map((item: any) => {
								return (
									<View key={item.id} style={styles.item_padding}>
										<View style={{ flexDirection: "row" }}>
											<View style={styles.discuss_image_info}>
												<Image style={styles.discuss_img} source={{ uri: ENV.image + "/perfume/" + item.id + ".jpg!m" }} resizeMode="contain" />
												<View style={styles.img_traiangle}></View>
											</View>
											<View style={{ marginLeft: 10 }}>
												<Text style={styles.discuss_name}>{item.cnname}</Text>
												<Text style={[styles.discuss_name, { color: theme.text2 }]}>{item.enname}</Text>
											</View>
										</View>
										<View style={styles.discuss_info}>
											{item.score > 0 && <View style={Globalstyles.star}>
												<Image
													style={[Globalstyles.star_icon, handlestarLeft(item.score * 2)]}
													defaultSource={require("../../assets/images/nopic.png")}
													source={require("../../assets/images/star/star.png")}
												/>
											</View>}
											<Text numberOfLines={4} style={styles.discuss_desc}>{item.desc}</Text>
										</View>
									</View>
								)
							})}
							<View style={{ alignItems: "center" }}>
								<Text style={styles.discuss_morebtn}>{"查看全部"}</Text>
							</View>
						</>}
					</View>}
					{(info.current.name != "[已注销] " && curTab == "gene") && <View style={styles.page_gene_con}>

					</View>}
				</View>
			</ScrollView >
		</View >
	);
})

const styles = StyleSheet.create({
	header_bg: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 400,
	},
	user_info: {
		alignItems: "center",
	},
	user_avatar: {
		width: 60,
		height: 60,
		borderRadius: 30,
		borderColor: theme.toolbarbg,
		borderWidth: 1,
	},
	user_name: {
		marginTop: 6,
		fontSize: 18,
		color: theme.toolbarbg,
	},
	intro_con: {
		width: width - 40,
		marginHorizontal: 20,
		marginTop: 14,
	},
	intro_text: {
		fontSize: 12,
		lineHeight: 20,
		color: theme.toolbarbg,
	},
	intro_morebtn_con: {
		flexDirection: "row",
		alignItems: "center",
		position: "absolute",
		right: 0,
		bottom: 0,
	},
	intro_icon: {
		width: 16,
		height: 16,
		textAlign: "center",
		lineHeight: 16,
		backgroundColor: "rgba(0,0,0,0.1)",
		borderRadius: 50,
		marginLeft: 4,
	},
	user_tabbar_con: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 12,
		marginBottom: 4,
	},
	tabbar_text: {
		fontSize: 12,
		color: theme.toolbarbg,
		textAlign: "center",
		padding: 5,
		flexGrow: 1,
	},
	tabbar_num: {
		fontSize: 11,
	},
	page_tabbar_con: {
		backgroundColor: theme.toolbarbg,
		flexDirection: "row",
		alignItems: "center",
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
	},
	page_tabbar: {
		height: 60,
		flexGrow: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	tabtext: {
		fontSize: 14,
		color: theme.text2
	},
	activetab: {
		color: theme.tit
	},
	tabline: {
		position: "absolute",
		bottom: 10,
		width: 20,
		height: 1.5,
		backgroundColor: theme.tit
	},
	page_container: {
		backgroundColor: theme.toolbarbg
	},
	item_padding: {
		paddingVertical: 15,
		paddingHorizontal: 13
	},
	commonfav_con: {
		flexDirection: "row",
		paddingHorizontal: 10,
		paddingVertical: 20,
		shadowOpacity: 0.1,
		shadowRadius: 10,
		shadowOffset: {
			width: 0,
			height: 0,
		},
		borderRadius: 8,
		backgroundColor: theme.toolbarbg
	},
	commonfav_avatar_con: {
		width: 65,
	},
	commonfav_avatar: {
		width: 40,
		height: 40,
		borderRadius: 50,
		borderColor: theme.toolbarbg,
		borderWidth: 1,
	},
	commonfav_avatar2: {
		position: "absolute",
		left: 25,
	},
	commonfav_list: {
		marginLeft: 10,
	},
	commonfav_tit_con: {
		flexDirection: "row",
		alignItems: "center",
	},
	commonfav_tit: {
		fontSize: 14,
		color: theme.tit2
	},
	commonfav_text: {
		fontSize: 12,
		color: theme.text2,
		marginTop: 5,
	},
	item_list: {
		borderBottomWidth: 8,
		borderBottomColor: theme.bg,
	},
	item_title: {
		paddingTop: 15,
		paddingHorizontal: 13,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	mine_perfume: {
		flexDirection: "row",
		marginTop: 20,
		marginLeft: 13,
		marginBottom: 15,
	},
	mine_perfume_img: {
		width: 50,
		height: 50,
	},
	mine_perfume_name: {
		fontSize: 14,
		color: theme.text1,
		marginBottom: 10,
		marginLeft: 6,
	},
	item_flex_row: {
		flexDirection: "row",
		alignItems: "center",
	},
	tit_text: {
		fontSize: 15,
		color: theme.placeholder2,
		marginRight: 10,
	},
	col_btn: {
		fontSize: 13,
		color: theme.tit2,
		marginRight: 5,
	},
	perfume_item: {
		width: 80,
		marginRight: 15,
	},
	item_image: {
		width: 80,
		height: 80,
		borderRadius: 5,
		borderColor: theme.bg,
		borderWidth: 0.5,
	},
	item_cname: {
		fontSize: 12,
		color: theme.text2,
		marginTop: 12,
		textAlign: "center",
		height: 32,
	},
	topic_avatar: {
		width: 30,
		height: 30,
		borderRadius: 50,
	},
	topic_tit: {
		fontSize: 13,
		color: theme.tit2,
		marginLeft: 10,
	},
	discuss_image_info: {
		alignItems: "center",
		height: 80,
	},
	discuss_img: {
		width: 50,
		height: 60,
	},
	discuss_name: {
		fontSize: 14,
		marginTop: 5,
		color: theme.tit2,
		lineHeight: 20,
	},
	img_traiangle: {
		position: "absolute",
		bottom: 0,
		width: 0,
		height: 0,
		borderTopColor: "transparent",
		borderBottomColor: "#F7F7F7",
		borderRightColor: "transparent",
		borderLeftColor: "transparent",
		borderWidth: 10,
	},
	discuss_info: {
		paddingVertical: 10,
		paddingHorizontal: 13,
		backgroundColor: "#F7F7F7",
		borderRadius: 5,
		overflow: "hidden",
	},
	discuss_desc: {
		fontSize: 14,
		color: theme.comment,
		marginVertical: 5,
	},
	discuss_morebtn: {
		width: 175,
		height: 34,
		textAlign: "center",
		lineHeight: 34,
		fontSize: 12,
		letterSpacing: 2,
		color: theme.comment,
		borderRadius: 3,
		overflow: "hidden",
		marginVertical: 15,
		backgroundColor: theme.bg,
	},
	page_gene_con: {

	},
});

export default UserDetail;