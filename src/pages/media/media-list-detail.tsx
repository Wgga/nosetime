import React from "react";

import { View, Text, StyleSheet, Pressable, Image, FlatList, Keyboard, Animated } from "react-native";

import { FlashList } from "@shopify/flash-list";
import FastImage from "react-native-fast-image";

import HeaderView from "../../components/headerview";
import ListBottomTip from "../../components/listbottomtip";
import VideoPlayer from "../../components/videoplayer";
import StarImage from "../../components/starimage";
import FooterView from "../../components/footerview";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, toCamelCase, display } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";
import ReplyView from "../../components/replyview";
import ActionSheetCtrl from "../../components/actionsheetctrl";
import ToastCtrl from "../../components/toastctrl";


const MediaListDetail = React.memo(({ navigation, route }: any) => {
	// 控件
	const classname = "MediaListDetailPage";
	const inputref = React.useRef<any>(null);
	const listref = React.useRef<any>(null);
	const videoRef = React.useRef<any>(null);
	// 参数
	// 变量
	let id = React.useRef<number>(0);
	let mid = React.useRef<number>(0);
	let replyinfo = React.useRef<any>({
		refid: 0,
		replytext: "",
		refuname: "",
		holder: "我此刻的想法是...",
	});
	let info = React.useRef<any>({
		mid: 0,
		iid: 0,
		cotnet: "",
	});
	let itemdata = React.useRef<any>({});
	let mediadata = React.useRef<any>({});
	let statdata = React.useRef<any>({});
	let like_ = React.useRef<any>({});
	let curpage = React.useRef<number>(1);
	let replydata = React.useRef<any[]>([]);
	let moremediadata = React.useRef<any[]>([]);
	let footerMaskOpt = React.useRef(new Animated.Value(0)).current; // 底部遮罩透明度动画
	let footerMaskZ = React.useRef(new Animated.Value(-1)).current; // 底部遮罩层级动画
	// 数据
	// 状态
	let noMore = React.useRef<boolean>(false);
	let loading = React.useRef<boolean>(true);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染
	const [isfocus, setIsFocus] = React.useState(false); // 是否聚焦输入框

	React.useEffect(() => {
		if (route.params) {
			id.current = route.params.id ? route.params.id : 0;
			mid.current = route.params.mid ? route.params.mid : 0;
		}
		init();

		events.subscribe(classname + id.current + "isShowKeyboard", (val: boolean) => {
			if (!val) {
				replyinfo.current = {
					refid: 0,
					replytext: "",
					refuname: "",
					holder: "我此刻的想法是...",
				};
			}
			showFooterMask(val);
		})

		return () => {
			events.unsubscribe(classname + id.current + "isShowKeyboard");
		}
	}, []);

	// 获取单品页数据
	const getItemData = () => {
		return new Promise((resolve, reject) => {
			http.get(ENV.item + "?id=" + id.current).then((resp_data: any) => {
				itemdata.current = resp_data;
				resolve(1);
			})
		})
	}

	// 获取视频详情数据
	const getMediaDetail = () => {
		return new Promise((resolve, reject) => {
			cache.getItem(classname + mid.current + "medialist").then((cacheobj: any) => {
				if (cacheobj) {
					setmediadata(cacheobj);
					resolve(1);
				}
			}).catch(() => {
				http.get(ENV.item + "?method=mediadetail&id=" + id.current + "&mid=" + mid.current).then((resp_data: any) => {
					cache.saveItem(classname + mid.current + "medialist", resp_data, 600);
					setmediadata(resp_data);
					resolve(1);
				})
			})
		})
	}
	// 设置视频数据
	const setmediadata = (data: any) => {
		data.newvname = data.vname.replace(/\d{6}|.mp4/g, "").trim();
		data.mainvname = data.newvname.split(/:|：/)[0];
		data.subvname = data.newvname.split(/:|：/)[1];
		data.time = data.tm.slice(0, 10);

		mediadata.current = data;
	}

	// 获取统计数据
	const getStatData = () => {
		return new Promise((resolve, reject) => {
			http.get(ENV.pic + "?method=getstat&mid=" + mid.current + "&t=" + (new Date).getTime()).then((resp_data: any) => {
				statdata.current = resp_data;
				resolve(1);
			});
		})
	}
	// 是否喜好
	const islike = () => {
		if (!us.user.uid) {
			return;
		}
		http.post(ENV.pic, { method: "islike", uid: us.user.uid, mid: mid.current }).then((resp_data: any) => {
			if (resp_data == "1") {
				like_.current[mid.current] = 1;
			} else {
				like_.current[mid.current] = 0;
			}
		});
	}
	// 获取评论数据
	const getReplyData = (page: number) => {
		http.get(ENV.pic + "?method=getreply&mid=" + mid.current + "&page=" + curpage.current + "&t=" + (new Date).getTime()).then((resp_data: any) => {
			replydata.current = resp_data.items
			if (resp_data.items.length < 50) noMore.current = true;
			curpage.current = page;
			favs(resp_data)
		})
	}

	// 获取更多影像数据
	const getMoreMediaData = () => {
		http.get(ENV.pic + "?method=getmorevod&iid=" + id.current).then((resp_data: any) => {
			for (let i in resp_data) {
				resp_data[i].maintit = resp_data[i].name.split("：")[0];
				resp_data[i].subtit = resp_data[i].name.split("：")[1];
			}
			moremediadata.current = resp_data;
		});
	}

	//获取用户曾点过的赞
	const favs = (resp: any) => {
		if (!us.user.uid) {
			loading.current = false;
			setIsRender(val => !val);
			return;
		}
		let favsid = []
		for (let i in resp.items) {
			favsid.push(resp.items[i].id)
			if (resp.items[i].sub) {
				for (let j in resp.items[i].sub) {
					favsid.push(resp.items[i].sub[j].id)
				}
			}
		}
		http.post(ENV.pic, { method: "islikecomment", uid: us.user.uid, ids: favsid }).then((resp_data: any) => {
			for (var i in resp_data) {
				like_.current[resp_data[i]] = 1;
			}
			loading.current = false;
			setIsRender(val => !val);
		});
	}

	// 初始化
	const init = () => {
		Promise.all([getItemData(), getMediaDetail(), getStatData(), getMoreMediaData()]).then((data: any) => {
			islike();
			getReplyData(1);
		})
	}

	// 收藏视频
	const fav = () => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App单品视频页" } });
		}
		http.post(ENV.pic + "?uid=" + us.user.uid, { method: "togglefav", mid: mid.current, token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				like_.current[mid.current] = true;
				statdata.current.fav = parseInt(statdata.current.fav) + 1;
			} else if (resp_data.msg == "REMOVE") {
				like_.current[mid.current] = false;
				statdata.current.fav = parseInt(statdata.current.fav) - 1;
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App单品视频页" } });
			}
			setIsRender(val => !val);
		})
	}

	// 发布评论
	const publish = () => {
		var replytext = "";
		if (replyinfo.current.replytext) replytext = replyinfo.current.replytext.trim();
		if (replytext == "") return;
		info.current.mid = mid.current;
		info.current.iid = id.current;
		info.current.content = replytext;

		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App单品视频页" } });
		}
		http.post(ENV.pic + "?uid=" + us.user.uid, { method: "replymedia", token: us.user.token, refid: replyinfo.current.refid, info: info.current }).then((resp_data: any) => {
			Keyboard.dismiss();
			if (resp_data.msg == "OK") {
				replyinfo.current.replytext = "";
				getReplyData(1);
				ToastCtrl.show({ message: "发布成功", duration: 1000, viewstyle: "short_toast", key: "publish_success_toast" });
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App单品视频页" } });
			} else {
				ToastCtrl.show({ message: resp_data.msg, duration: 1000, viewstyle: "short_toast", key: "publish_error_toast" });
			}
		});
	}

	// 动态修改底部输入框遮罩透明度和层级
	const showFooterMask = (bol: boolean) => {
		if (bol) {
			Animated.timing(footerMaskOpt, {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}).start();
			Animated.timing(footerMaskZ, {
				toValue: 1,
				duration: 100,
				useNativeDriver: true,
			}).start();
		} else {
			Animated.timing(footerMaskOpt, {
				toValue: 0,
				duration: 100,
				useNativeDriver: true,
			}).start();
			Animated.timing(footerMaskZ, {
				toValue: -1,
				duration: 100,
				useNativeDriver: true,
			}).start();
		}
		setIsFocus(bol);
	}

	// 跳转详情
	const gotodetail = (page: any, item: any) => {
		if (videoRef) videoRef.current.state.ref.pause();
		let screen = toCamelCase(page);
		if (screen == "MediaListDetail") {
			navigation.push("Page", { screen: "MediaListDetail", params: { mid: item.mid, id: item.url.substring(0, 6) } });
		} else {
			navigation.push("Page", { screen, params: { id: item.id, src: "App单品视频页" } });
		}
	}

	// 打开评论回复菜单
	const reply_menu = (item: any) => {
		ActionSheetCtrl.show({
			key: "reply_action_sheet",
			buttons: [{
				text: "回复",
				style: { color: theme.tit2 },
				handler: () => {
					ActionSheetCtrl.close("reply_action_sheet");
					replyinfo.current.refid = item.id;
					replyinfo.current.refuname = item.uname;
					replyinfo.current.holder = "回复 " + item.uname;
					if (inputref.current) inputref.current.focus();
					setIsRender(val => !val);
				}
			}, {
				text: "取消",
				style: { color: theme.tit },
				handler: () => {
					ActionSheetCtrl.close("reply_action_sheet");
				}
			}],
		})
	}

	// 点赞评论
	const like_reply = (item: any) => {
		if (!us.user.uid) {
			return navigation.push("Page", { screen: "Login", params: { src: "App单品视频页" } });
		}
		http.post(ENV.pic + "?uid=" + us.user.uid, { method: "togglefavcomment", mcid: item.id, token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				like_.current[item.id] = 1;
				item.up = parseInt(item.up) + 1;
			} else if (resp_data.msg == "REMOVE") {
				like_.current[item.id] = 0;
				item.up = parseInt(item.up) - 1;
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.push("Page", { screen: "Login", params: { src: "App单品视频页" } });
			}
			setIsRender(val => !val);
		})
	}

	// 点击评论回复
	const reply = (refid: number, refuname: string) => {
		if (refid == replyinfo.current.refid) {
			replyinfo.current.refid = 0;
			replyinfo.current.refuname = "";
			replyinfo.current.holder = "写跟帖";
		} else {
			replyinfo.current.refid = refid;
			replyinfo.current.refuname = refuname;
			replyinfo.current.holder = "回复 " + refuname;
		}
		if (inputref.current) inputref.current.focus();
		setIsRender(val => !val);
	}

	return (
		<View style={Globalstyles.container}>
			{loading.current && <View style={Globalstyles.loading_con}>
				<Image style={Globalstyles.loading_img} source={require("../../assets/images/loading.gif")} />
			</View>}
			<HeaderView data={{
				title: itemdata.current.title,
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg },
				childrenstyle: {
					headercolor: { color: theme.text2 },
					headertitle: { opacity: 1 },
				}
			}} method={{
				back: () => { navigation.goBack(); },
			}} />
			<FlashList data={replydata.current}
				ref={listref}
				keyExtractor={(item: any, index: number) => item.id}
				extraData={isrender}
				estimatedItemSize={100}
				onEndReachedThreshold={0.1}
				onEndReached={() => {
					if (replydata.current && replydata.current.length > 0) {

					}
				}}
				ListHeaderComponent={<>
					{mediadata.current.mp4URL && <VideoPlayer
						ref={videoRef}
						source={mediadata.current.mp4URL}
						poster={mediadata.current.vpicurl}
						classname={classname + mid.current}
						showPoster={false}
						isPlaying={true} />}
					<View style={styles.media_info}>
						{mediadata.current.mainvname && <Text style={styles.main_name}>{mediadata.current.mainvname}</Text>}
						{mediadata.current.subvname && <Text style={styles.sub_name}>{mediadata.current.subvname}</Text>}
						{mediadata.current.vdesc && <Text style={styles.media_desc}>{mediadata.current.vdesc}</Text>}
						{itemdata.current.fragrance && <View style={styles.fragrance_con}>
							<Text style={styles.fragrance_title}>{"香调："}</Text>
							<Text style={styles.fragrance_text}>{itemdata.current.fragrance}</Text>
						</View>}
						<View style={styles.fragrance_list}>
							{(itemdata.current.top && itemdata.current.top.length > 0) && <View style={[styles.fragrance_con, styles.list_con]}>
								<Text style={styles.fragrance_title}>{"前调："}</Text>
								{itemdata.current.top.map((item: any) =>
									<Text key={item} style={[styles.fragrance_text, { marginRight: 8 }]}>{item}</Text>
								)}
							</View>}
							{(itemdata.current.middle && itemdata.current.middle.length > 0) && <View style={[styles.fragrance_con, styles.list_con]}>
								<Text style={styles.fragrance_title}>{"中调："}</Text>
								{itemdata.current.middle.map((item: any) =>
									<Text key={item} style={[styles.fragrance_text, { marginRight: 8 }]}>{item}</Text>
								)}
							</View>}
							{(itemdata.current.base && itemdata.current.base.length > 0) && <View style={[styles.fragrance_con, styles.list_con]}>
								<Text style={styles.fragrance_title}>{"后调："}</Text>
								{itemdata.current.base.map((item: any) =>
									<Text key={item} style={[styles.fragrance_text, { marginRight: 8 }]}>{item}</Text>
								)}
							</View>}
						</View>
						<View style={styles.media_btn}>
							<View style={styles.btn_con}>
								{mediadata.current.time && <>
									<Icon name="time1" size={16} color={"#808080"} />
									<Text style={styles.btn_text}>{mediadata.current.time}</Text>
								</>}
								{statdata.current.click && <>
									<Icon name="play" size={16} color={"#808080"} />
									<Text style={styles.btn_text}>{statdata.current.click}</Text>
								</>}
							</View>
							<View style={styles.btn_con}>
								<>
									<Icon name={like_.current[mid.current] ? "heart-checked" : "heart"} size={16}
										color={like_.current[mid.current] ? theme.redchecked : "#808080"}
										onPress={fav}
									/>
									{statdata.current.fav && <Text style={styles.btn_text}>{statdata.current.fav}</Text>}
								</>
								<>
									<Icon name="message" size={16} color={"#808080"}
										onPress={() => {
											if (listref.current && replydata.current.length > 0) {
												listref.current.scrollToIndex({
													index: 0,
													animated: true,
													viewOffset: 50,
													viewPosition: 0,
												})
											}
										}}
									/>
									{replydata.current.length > 0 && <Text style={[styles.btn_text, { marginRight: 0 }]}>{replydata.current.length}</Text>}
								</>
								{/* <Icon name="share2" size={16} color={"#808080"} /> */}
							</View>
						</View>
						<View style={styles.item_con}>
							<Pressable onPress={() => { gotodetail("item-detail", itemdata.current) }}>
								<Image source={{ uri: ENV.image + "/perfume/" + itemdata.current.id + ".jpg" }}
									resizeMode="contain"
									style={styles.item_img} />
							</Pressable>
							<View style={{ flex: 1 }}>
								<View style={styles.item_name_con}>
									<Text numberOfLines={1} style={styles.item_cnname}
										onPress={() => { gotodetail("item-detail", itemdata.current) }}>{itemdata.current.cnname}</Text>
									{itemdata.current.onsale && <Icon name="shopcart" size={16}
										color={theme.placeholder} style={{ marginLeft: 8 }}
										onPress={() => { gotodetail("mall-item", itemdata.current) }}
									/>}
								</View>
								<Text numberOfLines={1} style={styles.item_enname} onPress={() => { gotodetail("item-detail", itemdata.current) }}>{itemdata.current.enname}</Text>
								<View style={styles.star_con}>
									<StarImage
										item={{
											istotal: itemdata.current.istotal, isscore: itemdata.current.isscore,
											s0: itemdata.current.s0, s1: itemdata.current.s1,
										}}
									/>
									<Text style={styles.item_score}>{itemdata.current.isscore + "分"}</Text>
								</View>
							</View>
						</View>
					</View>
					{(moremediadata.current && moremediadata.current.length > 0) && <View style={styles.more_media_con}>
						<Text style={styles.more_media_title}>{"更多影像"}</Text>
						<FlatList data={moremediadata.current}
							horizontal={true}
							showsHorizontalScrollIndicator={false}
							contentContainerStyle={{ paddingRight: 15, marginTop: 10 }}
							keyExtractor={(item: any) => item.mid}
							renderItem={({ item, index }: any) => {
								return (
									<View style={styles.more_item_con}>
										<Pressable onPress={() => { gotodetail("media-list-detail", item) }}>
											<View style={styles.more_item_img}>
												<FastImage style={{ width: "100%", height: "100%" }}
													source={{ uri: item.picurl }} />
												<Image style={styles.triangle} source={require("../../assets/images/player/play.png")} resizeMode="contain" />
											</View>
											<Text numberOfLines={1} style={styles.more_item_mtit}>{item.maintit}</Text>
											<Text numberOfLines={1} style={styles.more_item_stit}>{item.subtit}</Text>
										</Pressable>
									</View>
								)
							}}
						/>
					</View>}
					<View style={styles.reply_con}>
						<Text style={styles.reply_title}>{"评论（" + replydata.current.length + "）"}</Text>
					</View>
				</>}
				ListEmptyComponent={<Text style={styles.reply_empty_con}>{"评论暂缺，快来写第一个评论吧！"}</Text>}
				renderItem={({ item, index }: any) => {
					return (
						<ReplyView data={{
							contentkey: "content",
							timekey: "mctime",
							item,
							likedata: like_.current
						}} method={{
							reply_menu,
							like_reply,
							reply,
						}} />
					)
				}}
				ListFooterComponent={< ListBottomTip noMore={noMore.current} isShowTip={replydata.current && replydata.current.length > 0} />}
			/>
			<Animated.View style={[Globalstyles.keyboardmask, { opacity: footerMaskOpt, zIndex: footerMaskZ }]}>
				<Pressable onPress={() => { Keyboard.dismiss(); }} style={{ flex: 1 }}></Pressable>
			</Animated.View>
			{id.current > 0 && <FooterView data={{
				placeholder: replyinfo.current.holder, replytext: replyinfo.current.replytext,
				inputref, classname: classname + id.current,
				showBtn: true
			}} method={{
				onChangeText: (val: string) => {
					replyinfo.current.replytext = val;
					setIsRender(val => !val);
				},
				publish,
			}} />}
		</View>
	);
})

const styles = StyleSheet.create({
	media_info: {
		paddingVertical: 24,
		paddingHorizontal: 19,
		backgroundColor: theme.toolbarbg,
	},
	main_name: {
		fontSize: 20,
		color: theme.tit2,
		fontWeight: "500",
		fontFamily: "PingFang SC",
	},
	sub_name: {
		fontSize: 14,
		color: theme.text2,
		marginTop: 5
	},
	media_desc: {
		marginTop: 10,
		color: theme.comment,
		fontSize: 15,
	},
	fragrance_con: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 11
	},
	fragrance_title: {
		fontSize: 14,
		color: theme.text2,
	},
	fragrance_text: {
		fontSize: 14,
		color: "#808080"
	},
	list_con: {
		marginTop: 5,
		marginRight: 10,
	},
	fragrance_list: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	media_btn: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: 14,
	},
	btn_con: {
		flexDirection: "row",
		alignItems: "center",
	},
	btn_text: {
		fontSize: 13,
		color: "#808080",
		marginLeft: 5,
		marginRight: 15,
	},
	item_con: {
		paddingVertical: 10,
		paddingHorizontal: 7,
		marginTop: 26,
		backgroundColor: theme.bg,
		borderRadius: 6.7,
		overflow: "hidden",
		flexDirection: "row"
	},
	item_img: {
		width: 68,
		height: 68,
		backgroundColor: theme.toolbarbg,
		borderRadius: 6.7,
		overflow: "hidden",
		paddingVertical: 5,
		marginRight: 12,
	},
	item_name_con: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between"
	},
	item_cnname: {
		flex: 1,
		fontSize: 14,
		color: theme.tit2,
		fontFamily: "PingFang SC",
		fontWeight: "500",
	},
	item_enname: {
		fontSize: 13,
		color: theme.comment,
		marginTop: 4,
	},
	star_con: {
		marginTop: 6,
		flexDirection: "row",
		alignItems: "center",
	},
	item_score: {
		color: "#FEB73D",
		fontSize: 16,
		marginLeft: 8,
		fontWeight: "500",
		fontFamily: "PingFang SC",
	},
	more_media_con: {
		borderTopColor: theme.bg,
		borderTopWidth: 8,
		paddingTop: 15,
		paddingBottom: 20,
		backgroundColor: theme.toolbarbg,
	},
	more_media_title: {
		fontSize: 16,
		color: theme.tit2,
		marginLeft: 15,
	},
	more_item_con: {
		width: 155,
		marginLeft: 15,
	},
	more_item_img: {
		width: "100%",
		aspectRatio: 1728 / 1080,
		borderRadius: 6,
		overflow: "hidden",
	},
	triangle: {
		position: "absolute",
		right: 0,
		bottom: 0,
		width: 30,
		height: 30,
		zIndex: 9,
		marginRight: 10,
		marginBottom: 10,
	},
	more_item_mtit: {
		marginTop: 10,
		fontSize: 14,
		color: theme.tit2,
	},
	more_item_stit: {
		marginTop: 5,
		fontSize: 14,
		color: theme.comment,
	},
	reply_con: {
		borderTopColor: theme.bg,
		borderTopWidth: 8,
	},
	reply_title: {
		paddingHorizontal: 15,
		paddingVertical: 10,
		fontSize: 16,
		color: theme.tit2
	},
	reply_empty_con: {
		paddingVertical: 12,
		paddingHorizontal: 16,
		fontSize: 14,
		color: theme.placeholder,
		textAlign: "center"
	},
	list_item: {
		paddingHorizontal: 5,
		borderBottomColor: theme.bg,
		borderBottomWidth: 1,
	},
	footer_con: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: theme.toolbarbg,
		borderTopWidth: 1,
		borderTopColor: theme.bg,
		paddingTop: 15,
		paddingHorizontal: 24,
	},
	footer_radius: {
		borderTopRightRadius: 20,
		borderTopLeftRadius: 20,
		borderTopWidth: 0,
		overflow: "hidden",
		alignItems: "flex-end",
	},
	footer_con_left: {
		flex: 1,
		backgroundColor: theme.bg,
		borderRadius: 20,
		paddingLeft: 12,
		paddingRight: 5,
	},
	footer_input: {
		padding: 0,
		minHeight: 38,
		maxHeight: 70,
	},
	footer_con_right: {
		marginLeft: 20,
	},
	footer_publish: {
		paddingHorizontal: 16,
		height: 29,
		borderRadius: 20,
		marginBottom: 4,
		justifyContent: "center",
	},
	publish_text: {
		fontSize: 14,
		color: theme.toolbarbg,
	},
});

export default MediaListDetail;