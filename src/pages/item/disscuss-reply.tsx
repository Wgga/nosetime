import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image, Animated, Keyboard } from "react-native";

import { Brightness } from "react-native-color-matrix-image-filters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

import ToastCtrl from "../../components/controller/toastctrl";
import HeaderView from "../../components/view/headerview";
import ListBottomTip from "../../components/listbottomtip";
import ReplyView from "../../components/view/replyview";
import ActionSheetCtrl from "../../components/controller/actionsheetctrl";
import FooterView from "../../components/view/footerview";
import ReportPopover from "../../components/popover/report-popover";
import { ModalPortal } from "../../components/modals";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlelevelLeft, handlelevelTop, handlestarLeft, toCamelCase, unitNumber } from "../../utils/globalmethod";

import Icon from "../../assets/iconfont";
import AlertCtrl from "../../components/controller/alertctrl";
import HandleDesc from "../../components/handledesc";

const { width, height } = Dimensions.get("window");

const DiscussReply = React.memo(({ navigation, route }: any) => {

	// 控件
	const classname = "DiscussReplyPage";
	const insets = useSafeAreaInsets();
	const inputref = React.useRef<any>(null);
	// 参数
	// 变量
	let id = React.useRef<number>(0);
	let uid = React.useRef<number>(0);
	let uid2 = React.useRef<number>(0);
	let udid = React.useRef<number>(0);
	let title = React.useRef<string>("");
	let urtype = React.useRef<string>("");
	let src = React.useRef<string>("");
	let discussitem = React.useRef<any>({});
	let curpage = React.useRef<number>(1);
	let replyinfo = React.useRef<any>({
		refuid: 0,
		refurid: 0,
		refuname: "",
		replytext: "",
		holder: "点击楼层评论，进行回复",
	});
	let footerMaskOpt = React.useRef(new Animated.Value(0)).current; // 底部遮罩透明度动画
	let footerMaskZ = React.useRef(new Animated.Value(-1)).current; // 底部遮罩层级动画
	// 数据
	let discuss = React.useRef<any>({});
	let like_ = React.useRef<any>({});
	let nolike_ = React.useRef<any>({});
	let replylist = React.useRef<any>([]);
	let replylike_ = React.useRef<any>({});
	// 状态
	let noMore = React.useRef<boolean>(false);
	let isemptydata = React.useRef<boolean>(false);
	const [showmenu, setShowMenu] = React.useState<boolean>(false); // 是否显示菜单
	const [isrender, setIsRender] = React.useState<boolean>(false);
	const [isfocus, setIsFocus] = React.useState(false); // 是否聚焦输入框

	// 进入页面触发
	React.useEffect(() => {
		if (route.params) {
			id.current = route.params.id ? route.params.id : 0;
			uid.current = route.params.uid ? route.params.uid : 0;
			uid2.current = route.params.uid2 ? route.params.uid2 : 0;
			udid.current = route.params.udid ? route.params.udid : 0;
			title.current = route.params.title ? route.params.title : "";
			urtype.current = route.params.urtype ? route.params.urtype : "";
			src.current = route.params.src ? route.params.src : "";
			discussitem.current = route.params.item ? route.params.item : {};
		}
		init();

		events.subscribe(classname + id.current + "isShowKeyboard", (val: boolean) => {
			if (!val) {
				replyinfo.current = {
					refuid: 0,
					refurid: 0,
					refuname: "",
					replytext: "",
					holder: "点击楼层评论，进行回复",
				};
			}
			showFooterMask(val);
		})

		cache.getItem(classname + "publish" + id.current).then((cacheobj) => {
			if (cacheobj && cacheobj.replytext != "") {
				replyinfo.current = cacheobj;
			}
		}).catch(() => { });

		return () => {
			events.unsubscribe(classname + id.current + "isShowKeyboard");
		}
	}, []);

	// 初始化
	const init = () => {
		http.get(ENV.item + "?method=maindiscuss&id=" + id.current +
			"&udid=" + udid.current +
			"&uid=" + uid.current +
			"&urtype=" + urtype.current +
			"&uid2=" + uid2.current
		).then((resp_data: any) => {
			Object.assign(resp_data, discussitem.current);
			setdiscuss(resp_data);
		});
	}

	// 设置香评数据
	const setdiscuss = (data: any) => {
		if (!data || !data.udid) {
			ToastCtrl.show({ message: "内容已被删除，无法查看", duration: 1000, viewstyle: "medium_toast", key: "content_empty_toast" });
			isemptydata.current = true;
			return;
		}
		discuss.current = data;
		if (data.udtime) discuss.current.udtime = data.udtime.split(" ")[0];
		if (!title.current) {
			title.current = (!discuss.current.udreplycnt || discuss.current.udreplycnt <= 0) ? "暂无回复" : discuss.current.udreplycnt + "条回复";
		}
		if (udid.current == 0) udid.current = data["udid"];
		islike_disucss([udid.current]);
		loadMore("init");
	}

	// 是否点赞香评
	const islike_disucss = (ids: any) => {
		if (!us.user.uid) return;
		Promise.all([
			http.post(ENV.item, { method: "islike_discuss", uid: us.user.uid, ids }),
			http.post(ENV.item, { method: "isnotlike_discuss", uid: us.user.uid, ids })
		]).then(([likedata, nolikedata]: any) => {
			for (var i in likedata) {
				like_.current[likedata[i]] = 1;
			}
			for (var i in nolikedata) {
				nolike_.current[nolikedata[i]] = 1;
			}
		})
	}

	// 加载香评回复
	const loadMore = (type: string) => {
		if (type == "init") {
			curpage.current = 1;
		} else {
			curpage.current++;
		}
		http.get(ENV.item + "?method=discussreplyv2&id=" + id.current +
			"&udid=" + udid.current +
			"&uid=" + uid.current +
			"&page=" + curpage.current
		).then((resp_data: any) => {
			replylist.current = curpage.current == 1 ? resp_data : replylist.current.concat(resp_data);

			islike_replydiscuss(resp_data);

			if (resp_data.length < 20) noMore.current = true;
		});
	}

	// 是否点赞香评回复
	const islike_replydiscuss = (resp: any) => {
		if (!us.user.uid) {
			setIsRender(val => !val);
			return;
		}
		let ids = [];
		for (let i in resp) {
			ids.push(String(resp[i].urid))
			if (resp[i].sub)
				for (let j in resp[i].sub)
					ids.push(String(resp[i].sub[j].urid))
		}
		http.post(ENV.item, { method: "islike_replydiscuss", uid: us.user.uid, ids }).then((resp_data: any) => {
			for (let i in resp_data) {
				replylike_.current[resp_data[i]] = 1;
			}
			setIsRender(val => !val);
		});
	}

	const gotodetail = (page: any, id: number) => {
		if (page == "user-detail") {
			navigation.push("Page", { screen: "UserDetail", params: { uid: id } });
		} else if (page == "item-detail") {
			navigation.push("Page", { screen: "ItemDetail", params: { id } });
		}
	}

	// 香评点赞
	const postdiscussup = (type: number) => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App香评详情页" } });
		}
		http.post(ENV.item + "?method=postdiscussup&id=" + id.current + "&uid=" + us.user.uid + "&did=" + us.did, {
			u: type, udid: discuss.current.udid, uduid: discuss.current.replyuid, token: us.user.token
		}).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				if (type > 0) {
					if (nolike_.current[discuss.current.udid]) nolike_.current[discuss.current.udid] = 0;
					if (!like_.current[discuss.current.udid]) like_.current[discuss.current.udid] = 1;
				}
				if (type < 0) {
					if (like_.current[discuss.current.udid]) like_.current[discuss.current.udid] = 0;
					if (!nolike_.current[discuss.current.udid]) nolike_.current[discuss.current.udid] = 1;
				}
			} else if (resp_data.msg == "REMOVE") {
				if (type > 0 && like_.current[discuss.current.udid]) like_.current[discuss.current.udid] = 0;
				if (type < 0 && nolike_.current[discuss.current.udid]) nolike_.current[discuss.current.udid] = 0;
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App香评详情页" } });
			}
			discuss.current.udup = resp_data.total;
			events.publish("itemDiscussLike", { udid: discuss.current.udid, islike: like_.current[discuss.current.udid], total: resp_data.total });
			setIsRender(val => !val);
		})
	}

	// 香评回复点赞
	const like_reply = (item: any) => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App香评详情页" } });
		}
		http.post(ENV.item + "?method=postreplydiscussup&id=" + id.current + "&uid=" + us.user.uid + "&did=" + us.did, {
			urid: item.urid, uduid: item.uid, token: us.user.token
		}).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				replylike_.current[item.urid] = 1;
			} else if (resp_data.msg == "REMOVE") {
				replylike_.current[item.urid] = 0;
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App香评详情页" } });
			}
			item.up = resp_data.total;
			events.publish("itemReplydiscussLike", { urid: item.urid, islikereply: replylike_.current[item.urid], total: resp_data.total });
			setIsRender(val => !val);
		})
	}

	// 显示回复弹窗
	const showReplyCtrl = (item: any, parentitem?: any, type?: string) => {
		let who = type == "hidereport" ? "my" : "follow";
		let buttons = [{
			text: "举报",
			handler: () => {
				ActionSheetCtrl.close("reply_action_sheet");
				report(item, parentitem);
			}
		}, {
			text: "回复",
			handler: () => {
				ActionSheetCtrl.close("reply_action_sheet");
				reply(item);
			}
		}, {
			text: "删除",
			handler: () => {
				ActionSheetCtrl.close("reply_action_sheet");
				delReply(item, who);
			}
		}, {
			text: "取消",
			style: { color: theme.tit },
			handler: () => {
				ActionSheetCtrl.close("reply_action_sheet");
			}
		}];
		if (type == "hidereport") {
			buttons = buttons.filter(item => item.text != "举报");
		} else if (type == "hidedel") {
			buttons = buttons.filter(item => item.text != "删除");
		}
		ActionSheetCtrl.show({
			key: "reply_action_sheet",
			textStyle: { color: theme.tit2 },
			buttons,
		})
	}

	// 点击评论回复右上角三点进行回复
	const reply_menu = (item: any, parentitem?: any) => {
		if (discuss.current.replyuid == us.user.uid && item.uid != us.user.uid) {
			showReplyCtrl(item, parentitem);
		} else if (item.uid == us.user.uid) {
			showReplyCtrl(item, parentitem, "hidereport");
		} else {
			showReplyCtrl(item, parentitem, "hidedel");
		}
	}

	// 删除评论
	const delReply = (item: any, who: string) => {
		AlertCtrl.show({
			header: "确认删除这条评论吗？",
			key: "del_reply_alert",
			buttons: [{
				text: "取消",
				handler: () => {
					AlertCtrl.close("del_reply_alert");
				}
			}, {
				text: "确定",
				handler: () => {
					AlertCtrl.close("del_reply_alert");
					http.post(ENV.item + "?method=removediscussreply&id=" + id.current + "&uid=" + us.user.uid, {
						token: us.user.token, urid: item.urid, udid: item.urudid, who
					}).then((resp_data: any) => {
						//20240229 shibo:处理token失效
						if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
							us.delUser();
							return navigation.navigate("Page", { screen: "Login", params: { src: "App香评详情页" } });
						}
						ToastCtrl.show({ message: "删除成功", duration: 1000, viewstyle: "short_toast", key: "del_success_toast" });
						loadMore("init");
					})
				}
			}],
		})
	}

	// 举报评论
	const report = (item?: any, parentitem?: any) => {
		let reportshequ: any = {};
		let reportuser: any = {};
		let reportpage: any = {};
		if (!item) {
			reportuser = null;
			reportpage = null;
			discuss.current["desc_html"] = discuss.current.content;
			discuss.current["uid"] = discuss.current.replyuid;
			reportshequ = discuss.current;
		} else {
			reportshequ = null;
			item["desc"] = item.urcontent;
			item["udiid"] = discuss.current.udiid;
			if (!parentitem) {
				reportuser = item;
				reportpage = null;
			} else {
				parentitem["desc"] = parentitem.urcontent;
				reportuser = item;
				reportpage = parentitem;
			}
		}
		let params: any = {
			modalkey: "discussreport_popover",
			id: id.current,
			reportshequ,
			reportuser,
			reportpage,
			classname,
		}
		ModalPortal.show((
			<ReportPopover modalparams={params} />
		), {
			key: "discussreport_popover",
			width,
			rounded: false,
			useNativeDriver: true,
			onTouchOutside: () => { ModalPortal.dismiss("discussreport_popover") },
			onHardwareBackPress: () => {
				ModalPortal.dismiss("discussreport_popover");
				return true;
			},
			animationDuration: 300,
			type: "bottomModal",
			modalStyle: { backgroundColor: "transparent" },
		})
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

	// 点击评论回复
	const reply = (item: any, type?: string) => {
		if (type == "first") {
			replyinfo.current.refuid = 0;
			replyinfo.current.refurid = 0;
			replyinfo.current.refuname = "";
			replyinfo.current.holder = "写跟帖";
		} else {
			replyinfo.current.refuid = item.uid;
			replyinfo.current.refurid = item.urid;
			replyinfo.current.refuname = item.uname;
			replyinfo.current.holder = "回复 " + item.uname;
			replyinfo.current.refuid = item.uid;
		}
		if (inputref.current) inputref.current.focus();
		setIsRender(val => !val);
	}

	// 发布香评回复
	const publish = () => {
		let replytext = replyinfo.current.replytext.trim();
		if (replytext == "") return;

		cache.saveItem(classname + "publish" + id.current, replyinfo.current, 30 * 24 * 3600);

		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App香评详情页" } });
		}

		http.post(ENV.item + "?method=postdiscussreplyv2&id=" + id.current + "&uid=" + us.user.uid, {
			token: us.user.token, content: replytext, udid: discuss.current.udid,
			uduid: discuss.current.replyuid, refuid: replyinfo.current.refuid, refurid: replyinfo.current.refurid
		}).then((resp_data: any) => {
			Keyboard.dismiss();
			if (resp_data.msg == "OK") {
				cache.removeItem("ItemDetailPage" + "publish" + id.current);
				cache.removeItem(classname + "publish" + id.current);
				ToastCtrl.show({ message: "发布成功", duration: 1000, viewstyle: "short_toast", key: "publish_success_toast" });
				replyinfo.current.replytext = "";
				loadMore("init");
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App香评详情页" } });
			} else {
				ToastCtrl.show({ message: "发布结果：" + resp_data.msg, duration: 1000, viewstyle: "medium_toast", key: "publish_err_toast" });
			}
		});
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: title.current,
				isShowSearch: false,
				showmenu: discuss.current.replyuid != us.user.uid ? showmenu : false,
				style: { zIndex: 0 },
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				}
			}} method={{
				back: () => { navigation.goBack() },
			}} MenuChildren={() => {
				return (
					discuss.current.replyuid != us.user.uid ? <>
						<Pressable style={Globalstyles.menu_icon_con} onPress={() => {
							postdiscussup(1);
							setShowMenu(false);
						}}>
							<Icon style={Globalstyles.menu_icon} name={like_.current[discuss.current.udid] ? "up-checked" : "up"} size={16}
								color={theme.comment} />
							<Text style={Globalstyles.menu_text}>{"点赞"}</Text>
						</Pressable>
						<Pressable style={[Globalstyles.menu_icon_con, Globalstyles.no_border_bottom]} onPress={() => {
							report();
							setShowMenu(false);
						}}>
							<Icon style={Globalstyles.menu_icon} name="report2" size={16} color={theme.comment} />
							<Text style={Globalstyles.menu_text}>{"举报"}</Text>
						</Pressable>
					</> : <></>
				)
			}}>
				<View style={[Globalstyles.header_bg, { height: 90 + insets.top }]}>
					<Brightness amount={0.85}>
						<Image style={{ width: "100%", height: "100%" }} blurRadius={5}
							source={{ uri: ENV.avatar + discuss.current.replyuid + ".jpg!l?" + discuss.current.uface }}
						/>
					</Brightness>
				</View>
				{(discuss.current.replyuid == us.user.uid) && <Icon
					name={like_.current[discuss.current.udid] ? "heart-checked" : "heart"}
					size={20} onPress={() => { postdiscussup(1) }}
					color={like_.current[discuss.current.udid] ? theme.redchecked : theme.toolbarbg}
					style={Globalstyles.title_icon} />}
				{(discuss.current.replyuid != us.user.uid && !isemptydata.current) && <Icon name="sandian"
					size={20} onPress={() => { setShowMenu(val => !val) }}
					color={theme.toolbarbg} style={Globalstyles.title_icon} />}
			</HeaderView>
			<View style={[Globalstyles.list_content, Globalstyles.container]}>
				<FlashList data={replylist.current}
					extraData={isrender}
					estimatedItemSize={100}
					onEndReached={() => {

					}}
					onEndReachedThreshold={0.1}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ backgroundColor: theme.toolbarbg }}
					keyExtractor={(item: any) => item.urid}
					ListHeaderComponent={<View style={styles.discuss_head_con}>
						<View style={{ flexDirection: "row" }}>
							{discuss.current.replyuid && <Pressable style={styles.user_avatar} onPress={() => { gotodetail("user-detail", discuss.current.replyuid) }}>
								<Image style={{ width: "100%", height: "100%" }} source={{ uri: ENV.avatar + discuss.current.replyuid + ".jpg!l?" + discuss.current.uface }} />
							</Pressable>}
							{discuss.current.score >= 0 && !discuss.current.replyuid && <Pressable style={styles.user_avatar} onPress={() => { gotodetail("item-detail", discuss.current.id) }}>
								<Image style={{ width: "100%", height: "100%" }} source={{ uri: ENV.image + "/perfume/" + discuss.current.id + ".jpg!l" }} />
							</Pressable>}
							<View style={{ marginLeft: 10, flex: 1 }}>
								{src.current != "user" && <View style={[Globalstyles.item_flex, { marginBottom: 5 }]}>
									<Text numberOfLines={1} style={styles.user_uname} onPress={() => { gotodetail("item-detail", discuss.current.replyuid) }}>{discuss.current.uname}</Text>
									{discuss.current.ulevel > 0 && <View style={Globalstyles.level}>
										<Image style={[Globalstyles.level_icon, handlelevelLeft(discuss.current.ulevel), handlelevelTop(discuss.current.ulevel)]}
											defaultSource={require("../../assets/images/nopic.png")}
											source={require("../../assets/images/level.png")}
										/>
									</View>}
								</View>}
								{src.current == "user" && <Text style={[styles.user_uname, { marginBottom: 5 }]} onPress={() => { gotodetail("item-detail", discuss.current.id) }}>{discuss.current.name}</Text>}
								{discuss.current.uwscore > 0 && <View style={Globalstyles.star}>
									<Image style={[Globalstyles.star_icon, handlestarLeft(discuss.current.uwscore * 2)]}
										defaultSource={require("../../assets/images/nopic.png")}
										source={require("../../assets/images/star/star.png")}
									/>
								</View>}
							</View>
						</View>
						{discuss.current.content && <Pressable onPress={() => { reply(discuss.current, "first") }}>
							<HandleDesc
								containerStyle={{ marginTop: 10 }}
								itemStyle={styles.discuss_desc_text}
								type="text"
								item={discuss.current}
								itemKey="content"
							/>
						</Pressable>}
						{discuss.current.udpichtml && <HandleDesc
							containerStyle={Globalstyles.desc_img_con}
							itemStyle={Globalstyles.desc_img}
							type="image"
							item={discuss.current}
							itemKey="udpichtml"
						/>}
						<View style={Globalstyles.item_flex_between}>
							<Text>{discuss.current.udtime}</Text>
							<View style={Globalstyles.item_flex}>
								<Pressable onPress={() => { postdiscussup(1) }} style={[Globalstyles.item_flex, { marginRight: 20 }]}>
									<Icon name={like_.current[discuss.current.udid] ? "up-checked" : "up"} size={16} color={theme.placeholder} />
									<Text style={styles.up_text}>{discuss.current.udup != "0" ? discuss.current.udup : ""}</Text>
								</Pressable>
								<Icon onPress={() => { postdiscussup(-1) }} name={nolike_.current[discuss.current.udid] ? "up-checked" : "up"} size={16}
									color={theme.placeholder} style={{ transform: [{ rotate: "180deg" }] }} />
							</View>
						</View>
					</View>}
					renderItem={({ item, index }: any) => {
						return (
							<ReplyView data={{
								contentkey: "urcontent",
								timekey: "urtime",
								idkey: "urid",
								item,
								likedata: replylike_.current
							}} method={{
								reply_menu,
								like_reply,
								reply
							}} />
						)
					}}
					ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={replylist.current.length > 0} />}
				/>
			</View>
			<Animated.View style={[Globalstyles.keyboardmask, { opacity: footerMaskOpt, zIndex: footerMaskZ }]}>
				<Pressable onPress={() => { Keyboard.dismiss(); }} style={{ flex: 1 }}></Pressable>
			</Animated.View>
			{id.current > 0 && <FooterView data={{
				placeholder: replyinfo.current.holder, replytext: replyinfo.current.replytext,
				inputref, classname: classname + id.current,
			}} method={{
				onChangeText: (val: string) => {
					replyinfo.current.replytext = val;
					setIsRender(val => !val);
				},
				publish,
			}}>
				{!isfocus && <View style={Globalstyles.footer_icon_con}>
					<View style={Globalstyles.footer_icon}>
						<Icon name="reply" size={16} color={theme.fav} />
						{discuss.current.udreplycnt > 0 && <Text style={Globalstyles.footer_text}>{unitNumber(discuss.current.udreplycnt, 1)}</Text>}
					</View>
					<Pressable style={[Globalstyles.footer_icon, { marginRight: 0 }]} onPress={() => { postdiscussup(1) }}>
						<Icon name={like_.current[discuss.current.udid] ? "up-checked" : "up"} size={16} color={theme.fav} />
						{discuss.current.udup > 0 && <Text style={Globalstyles.footer_text}>{unitNumber(discuss.current.udup, 1)}</Text>}
					</Pressable>
					{/* <Pressable onPress={showSharePopover} hitSlop={20}>
						<Icon name="share2" size={14} color={theme.fav} />
					</Pressable> */}
				</View>}
			</FooterView>}
		</View>
	);
})

const styles = StyleSheet.create({
	discuss_head_con: {
		paddingHorizontal: 20,
		paddingTop: 32,
		paddingBottom: 15,
		marginBottom: 10
	},
	user_avatar: {
		width: 40,
		height: 40,
		borderRadius: 50,
		overflow: "hidden",
	},
	user_uname: {
		fontSize: 14,
		fontFamily: "PingFang SC",
		fontWeight: "500",
		color: theme.color,
	},
	discuss_desc_text: {
		fontSize: 14,
		color: theme.text1,
		marginBottom: 14,
		lineHeight: 24,
	},
	up_text: {
		fontSize: 12,
		color: theme.placeholder,
		marginLeft: 5,
	},
});

export default DiscussReply;