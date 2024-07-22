import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image, Keyboard, ScrollView, Animated } from "react-native";

import { Brightness } from "react-native-color-matrix-image-filters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { ShadowedView } from "react-native-fast-shadow";

import HeaderView from "../../components/view/headerview";
import ToastCtrl from "../../components/controller/toastctrl";
import ListBottomTip from "../../components/listbottomtip";
import FooterView from "../../components/view/footerview";
import { ModalPortal } from "../../components/modals";
import PhotoPopover from "../../components/popover/photo-popover";
import AutoSizeImage from "../../components/autosizeimage";
import ReplyView from "../../components/view/replyview";
import ActionSheetCtrl from "../../components/controller/actionsheetctrl";
import ReportPopover from "../../components/popover/report-popover";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlelevelLeft, handlelevelTop, unitNumber } from "../../utils/globalmethod";

import Icon from "../../assets/iconfont";
import AlertCtrl from "../../components/controller/alertctrl";

const { width, height } = Dimensions.get("window");

const SocialShequDetail = React.memo(({ navigation, route }: any) => {

	// 控件
	const insets = useSafeAreaInsets();
	const classname = "SocialShequDetailPage";
	const inputref = React.useRef<any>(null); // 评论输入框 Ref
	// 参数
	// 变量
	let fromid = React.useRef<number>(0);
	let id = React.useRef<number>(0);
	//2020-3-20yak当前时间戳，24点时间戳，三天，两天，一天秒数，当前回复对象，回复时间与当前时间戳差
	let ctime = React.useRef<number>(0);
	let ntime = React.useRef<number>(0);
	let tday = React.useRef<number>(0);
	let sday = React.useRef<number>(0);
	let oday = React.useRef<number>(0);
	let cur_obj = React.useRef<number>(0);
	let tdiff = React.useRef<number>(0);
	let replyinfo = React.useRef<any>({ replytext: "", refid: 0, refuname: "", holder: "点击楼层文字，回复层主" });
	let footerMaskOpt = React.useRef(new Animated.Value(0)).current; // 底部遮罩透明度动画
	let footerMaskZ = React.useRef(new Animated.Value(-1)).current; // 底部遮罩层级动画
	// 数据
	let pages = React.useRef<any>({
		page: 1, items: [], loaded: 0, full: 0,
	});
	let slideimglist = React.useRef<any[]>([]);
	let item0 = React.useRef<any>({ uid: 0, desc: "" });
	let items_top = React.useRef<any[]>([]);
	let pagecnt = React.useRef<number>(0);
	let pagenum = React.useRef<any>([]);
	let curpage = React.useRef<number>(1);
	let like_ = React.useRef<any>({}); // 用户喜欢的数据ID列表
	// 状态
	let noMore = React.useRef<boolean>(false);
	let isemptydata = React.useRef<boolean>(false);
	const [loading, setLoading] = React.useState<boolean>(true); // 是否加载中
	const [isfocus, setIsFocus] = React.useState<boolean>(false); // 是否获取焦点
	const [showmenu, setShowMenu] = React.useState<boolean>(false); // 是否显示菜单
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据
	const [showPage, setShowPage] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (route.params) {
			fromid.current = route.params.id ? route.params.id : 0;
			id.current = route.params.ctdlgid ? route.params.ctdlgid : 0;
		}

		init()
		events.subscribe(classname + id.current + "isShowKeyboard", (val: boolean) => {
			if (!val) {
				replyinfo.current = {
					refid: 0,
					refuname: "",
					replytext: "",
					holder: "点击楼层文字，回复层主",
				};
			}
			showFooterMask(val);
		})
		return () => {
			events.unsubscribe(classname + id.current + "isShowKeyboard");
		}
	}, [])

	const init = () => {
		pages.current = { page: 1, items: [], loaded: 0, full: 0 };
		load("init");
		if (fromid.current && fromid.current > 0) {
			http.get(ENV.shequ + "?method=getshequdetailpage&dlgid=" + id.current + "&fromid=" + fromid.current).then((resp_data: any) => {
				//当页面大于1执行。。
				setTimeout(() => {
					if (resp_data.page > 1) {
						go(resp_data.page);
					}
					// this.loop = 0;
					// this.scrolltoid("id" + this.fromid);
				}, 2000);
			});
		}
	}

	const load = (type: string) => {
		if (type == "loadMore") pages.current.page++;
		if (noMore.current) return;
		http.get(ENV.shequ + "?method=getshequdetailv3&dlgid=" + id.current + "&page=" + pages.current.page).then((resp_data: any) => {
			if (!resp_data) {
				ToastCtrl.show({ message: "内容已被删除，无法查看", duration: 2000, viewstyle: "medium_toast", key: "empty_toast" });
				isemptydata.current = true;
				setIsRender(val => !val);
				return;
			}
			format_time(resp_data);

			if (pages.current.page == 1 && resp_data.items_top) items_top.current = resp_data.items_top;
			if (pages.current.page == 1 && item0.current.uid == 0) {
				slideimglist.current = [];
				let imagelist = resp_data.item0.desc.match(/\[img\]([^\[]*)\[\/img\]/g);
				if (imagelist && imagelist.length > 0) {
					imagelist.forEach((item: any) => {
						slideimglist.current.push(ENV.image + item.replace(/\[img\]|\[\/img\]/g, ""))
					});
				}
				item0.current = resp_data.item0;
				setTimeout(() => { setLoading(false) }, 1000);
			}

			if (resp_data.page > 1) {
				pagecnt.current = resp_data.page;
				generate_pagenum();
			}

			if (pages.current.page == 1)
				pages.current.items = resp_data.items;
			else
				pages.current.items = pages.current.items.concat(resp_data.items);

			noMore.current = !(pages.current.page < pagecnt.current);

			/* if (resp_data.items.length == resp_data.perpage || (resp_data.items.length == resp_data.perpage - 1 && pages.current.page == 1)) {
				pages.current.full = 1;
				cache.saveItem(classname + "-" + id.current + "-" + pages.current.page, resp_data, 1800);
			} else {
				pages.current.full = 0;
				cache.saveItem(classname + "-" + id.current + "-" + pages.current.page, resp_data, 30);
			} */

			let ids = [];
			if (resp_data.item0)
				ids.push(resp_data.item0.id);
			for (let i in resp_data.items_top)
				ids.push(resp_data.items_top[i].id);
			for (let i in resp_data.items) {
				ids.push(resp_data.items[i].id);
				if (resp_data.items[i].sub) {
					for (let j in resp_data.items[i].sub) {
						ids.push(resp_data.items[i].sub[j].id)
					}
				}
			}
			islike(ids);
		})
	}

	const islike = (ids: any) => {
		if (!us.user.uid) {
			setIsRender(val => !val);
			return;
		}
		http.post(ENV.api + ENV.shequ, { method: "islike", uid: us.user.uid, ids: ids }).then((resp_data: any) => {
			for (var i in resp_data) {
				like_.current[resp_data[i]] = 1;
			}
			setIsRender(val => !val);
		});
	}

	const generate_pagenum = () => {
		let i = 0;
		for (i = pagenum.current.length + 1; i <= pagecnt.current; i++) {
			pagenum.current.push(i);
		}
	}

	//计算回帖时间与当前时间戳的差值2020-3-20yak
	const cal_diff = (obj: any) => {
		cur_obj.current = new Date(obj.cttime.replace(/-/g, "/")).getTime() / 1000;
		if (ntime.current - cur_obj.current > 0)
			tdiff.current = ntime.current - cur_obj.current;
		else
			tdiff.current = cur_obj.current - ctime.current;
		cal_time(tdiff.current, obj);
	}

	const format_time = (resp: any) => {
		//用this赋值避免重复定义变量，节省内存
		ctime.current = new Date().getTime() / 1000;
		ntime.current = new Date(new Date().toDateString()).getTime() / 1000;
		tday.current = 3 * 24 * 3600;
		sday.current = 2 * 24 * 3600;
		oday.current = 12 * 3600;
		if (resp.item0 && resp.item0.cttime) {
			cal_diff(resp.item0)
		}
		for (var i in resp.items) {
			cal_diff(resp.items[i])
			// let ctime = new Date(resp.items[i].cttime);
			if (resp.items[i].sub && resp.items[i].sub.length > 0) {
				for (var j in resp.items[i].sub) {
					cal_diff(resp.items[i].sub[j]);
				}
			}
		}
	}

	//根据差值来显示时间2020-3-20yak
	const cal_time = (tdiff: number, resp: any) => {
		//console.log(resp,-1*tdiff,-1*tdiff/3600);
		if (tdiff < 0) {
			if (-1 * tdiff > 3600 && -1 * tdiff < 12 * 3600)
				resp.cttime = Math.round(-1 * tdiff / 3600) + " 小时前";
			else if (-1 * tdiff > 12 * 3600)
				resp.cttime = "一天前";
			else
				resp.cttime = "刚刚";
		} else {
			if (tdiff > tday.current)
				resp.cttime = resp.cttime.split(" ")[0];
			else if (tdiff < tday.current && tdiff > sday.current)
				resp.cttime = "三天前";
			else if (tdiff < sday.current && tdiff > oday.current)
				resp.cttime = "两天前";
			else if (tdiff < oday.current)
				resp.cttime = "一天前";
		}
	}

	const open_PhotoPopover = (slideimgindex: number) => {
		ModalPortal.show((
			<PhotoPopover modalparams={{
				key: "social_photo_popover",
				slideimgindex,
				slideimglist: slideimglist.current
			}} />
		), {
			key: "social_photo_popover",
			width,
			height,
			rounded: false,
			useNativeDriver: true,
			onTouchOutside: () => {
				ModalPortal.dismiss("social_photo_popover");
			},
			onHardwareBackPress: () => {
				ModalPortal.dismiss("social_photo_popover");
				return true;
			},
			animationDuration: 300,
			modalStyle: { backgroundColor: "transparent" },
		})
	}

	const handledesc = (desc: string) => {
		let sz: any[] = [];
		sz = desc.split(/\[img\]|\[\/img\]/g).map((part: string, index: number) => {
			if (part.includes(".jpg")) {
				return (
					<Pressable key={"img" + index} onPress={() => {
						let slideimgindex = slideimglist.current.findIndex((item: any) => {
							return item == ENV.image + part;
						})
						open_PhotoPopover(slideimgindex);
					}}>
						<AutoSizeImage style={styles.reply_image} uri={ENV.image + part} />
					</Pressable>
				)
			} else if (part) {
				return <Text key={"text" + index} style={styles.reply_text}>{part}</Text>;
			}
		});
		return sz;
	}

	const go = (page: number) => {

	}

	const goPage = (page: number) => {
		curpage.current = page;
		setShowPage(false);
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
				delReply(item);
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
		if (item0.current.uid == us.user.uid && item.uid != us.user.uid) {
			showReplyCtrl(item, parentitem);
		} else if (item.uid == us.user.uid) {
			showReplyCtrl(item, parentitem, "hidereport");
		} else {
			showReplyCtrl(item, parentitem, "hidedel");
		}
	}

	// 举报评论
	const report = (item: any, parentitem?: any) => {
		let reportshequ: any = {};
		let reportuser: any = {};
		let reportpage: any = {};
		if (!item) {
			reportuser = null;
			reportpage = null;
			reportshequ = item0.current;
		} else {
			reportshequ = null;
			if (!parentitem) {
				reportuser = item;
				reportpage = null;
			} else {
				reportuser = item;
				reportpage = parentitem;
			}
		}
		let params: any = {
			modalkey: "shequreport_popover",
			id: id.current,
			curpage: curpage.current,
			reportshequ,
			reportuser,
			reportpage,
			classname,
		}
		ModalPortal.show((
			<ReportPopover modalparams={params} />
		), {
			key: "shequreport_popover",
			width,
			rounded: false,
			useNativeDriver: true,
			onTouchOutside: () => { ModalPortal.dismiss("shequreport_popover") },
			onHardwareBackPress: () => {
				ModalPortal.dismiss("shequreport_popover");
				return true;
			},
			animationDuration: 300,
			type: "bottomModal",
			modalStyle: { backgroundColor: "transparent" },
		})
	}

	const reply = (item: any, type?: any) => {
		if (type == "first") {
			replyinfo.current.refid = 0;
			replyinfo.current.refuname = "";
			replyinfo.current.holder = "写跟帖";
		} else {
			replyinfo.current.refid = item.id;
			replyinfo.current.refuname = item.uname;
			replyinfo.current.holder = "回复 " + item.uname;
		}
		if (inputref.current) inputref.current.focus();
		setIsRender(val => !val);
	}

	const delReply = (item: any) => {
		AlertCtrl.show({
			header: "确认删除这条回复吗？",
			key: "del_reply_alert",
			message: "",
			buttons: [{
				text: "取消",
				handler: () => {
					AlertCtrl.close("del_reply_alert");
				}
			}, {
				text: "确定",
				handler: () => {
					AlertCtrl.close("del_reply_alert");
					http.post(ENV.shequ + "?method=removetopic&fid=1&id=" + id.current + "&uid=" + us.user.uid, { token: us.user.token, ctid: item.id }).then((resp_data: any) => {
						if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
							us.delUser();
							return navigation.navigate("Page", { screen: "Login", params: { src: "App帖子详情页" } });
						}
						ToastCtrl.show({ message: "删除成功", duration: 1000, viewstyle: "short_toast", key: "del_success_toast" });

						load("init");
					})
				}
			}],
		})
	}

	const publish = () => {
		let replytext = replyinfo.current.replytext.trim();
		if (replytext == "") return;

		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App帖子详情页" } });
		}

		http.post(ENV.api + ENV.shequ + "?method=post&id=" + id.current + "&uid=" + us.user.uid, {
			refid: replyinfo.current.refid, token: us.user.token, content: replytext
		}).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				replyinfo.current.replytext = "";
				ToastCtrl.show({ message: "发布成功", duration: 1000, viewstyle: "short_toast", key: "publish_success_toast" });
				load("init");
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App帖子详情页" } });
			} else {
				ToastCtrl.show({ message: resp_data.msg, duration: 1000, viewstyle: "medium_toast", key: "publish_err_toast" });
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

	const like_reply = () => {

	}

	return (
		<View style={Globalstyles.container}>
			{loading && <View style={Globalstyles.loading_con}>
				<Image style={Globalstyles.loading_img} source={require("../../assets/images/loading.gif")} />
			</View>}
			<HeaderView data={{
				title: item0.current.title,
				isShowSearch: false,
				showmenu,
				style: { zIndex: 0 },
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				}
			}} method={{
				back: () => { navigation.goBack() },
			}} MenuChildren={() => {
				return (
					<>
						<Pressable style={Globalstyles.menu_icon_con} onPress={() => {
							setShowMenu(false);
						}}>
							<Icon style={Globalstyles.menu_icon} name={like_.current[item0.current.id] ? "heart-checked" : "heart"} size={17}
								color={like_.current[item0.current.id] ? theme.redchecked : theme.comment} />
							<Text style={Globalstyles.menu_text}>{"收藏"}</Text>
						</Pressable>
						<Pressable style={[Globalstyles.menu_icon_con, Globalstyles.no_border_bottom]} onPress={() => {
							setShowMenu(false);
						}}>
							<Icon style={Globalstyles.menu_icon} name="report2" size={16} color={theme.comment} />
							<Text style={Globalstyles.menu_text}>{"举报"}</Text>
						</Pressable>
					</>
				)
			}}>
				<View style={[Globalstyles.header_bg, { height: 90 + insets.top }]}>
					<Brightness amount={0.85}>
						<Image style={{ width: "100%", height: "100%" }} blurRadius={40}
							source={{ uri: ENV.avatar + item0.current.uid + ".jpg?!l" + item0.current.uface }}
						/>
					</Brightness>
				</View>
				<Icon name="sandian" size={20} onPress={() => { setShowMenu(val => !val) }} color={theme.toolbarbg}
					style={[Globalstyles.title_icon, { zIndex: 1 }]} />
			</HeaderView>
			{pagecnt.current > 3 && <>
				{showPage && <Pressable style={styles.pagemask} onPress={() => { setShowPage(false); }}></Pressable>}
				<View style={[styles.select_page_con, { bottom: 77 + insets.bottom }]}>
					{!showPage && <Pressable style={styles.page_btn} onPress={() => {
						setShowPage(true);
					}}>
						<Text style={styles.currentpage}>{curpage.current}</Text>
						<Text style={styles.allpage}>{"/" + pagecnt.current + "页"}</Text>
					</Pressable>}
					{showPage && <ShadowedView style={styles.gopage_btn_con}>
						<View style={styles.gopage_title}>
							<Pressable style={[styles.page_btn_con, { alignItems: "flex-start" }]}
								onPress={() => {
									goPage(1);
								}}>
								<Text style={[styles.btn_text, { color: theme.num }]}>首页</Text>
							</Pressable>
							<View style={styles.page_btn_con}>
								<Text style={styles.btn_text}>翻页</Text>
							</View>
							<Pressable style={[styles.page_btn_con, { alignItems: "flex-end" }]}
								onPress={() => {
									goPage(pagecnt.current);
								}}>
								<Text style={[styles.btn_text, { color: theme.num }]}>末页</Text>
							</Pressable>
						</View>
						<ScrollView contentContainerStyle={styles.gopage_btn} showsVerticalScrollIndicator={false}>
							{pagenum.current.map((item: any, index: number) => {
								return (
									<Pressable key={item} style={styles.page_item} onPress={() => {
										goPage(item);
									}}>
										<Text style={[styles.page_item_text, curpage.current == item && styles.active_page]}>{item}</Text>
									</Pressable>
								)
							})}
						</ScrollView>
					</ShadowedView>}
				</View>
			</>}
			<View style={[Globalstyles.list_content, Globalstyles.container]}>
				<FlashList data={pages.current.items}
					extraData={isrender}
					estimatedItemSize={100}
					onEndReached={() => {
						if (pages.current.items.length > 0) {
							load("loadMore")
						}
					}}
					onEndReachedThreshold={0.1}
					showsVerticalScrollIndicator={false}
					contentContainerStyle={{ backgroundColor: theme.toolbarbg }}
					keyExtractor={(item: any) => item.id}
					ListHeaderComponent={<>
						<View style={styles.item_main_con}>
							<Text style={styles.main_title}>{item0.current.title}</Text>
							<View style={styles.main_info}>
								<Image style={styles.info_image}
									source={{ uri: ENV.avatar + item0.current.uid + ".jpg?!l" + item0.current.uface }}
								/>
								<View style={styles.info_name_con}>
									<Text style={styles.info_name}>{item0.current.uname}</Text>
									{item0.current.ulevel > 0 && <View style={Globalstyles.level}>
										<Image style={[Globalstyles.level_icon, handlelevelLeft(item0.current.ulevel), handlelevelTop(item0.current.ulevel)]}
											defaultSource={require("../../assets/images/nopic.png")}
											source={require("../../assets/images/level.png")}
										/>
									</View>}
								</View>
							</View>
							<View style={styles.main_desc}>
								{handledesc(item0.current.desc)}
							</View>
							<Text style={styles.main_time}>{item0.current.cttime}</Text>
						</View>
						{items_top.current.length > 0 && <View style={styles.item_hot_con}>
							<Text style={styles.item_title}>{"最赞回复"}</Text>
							<View style={styles.hot_list_con}>
								{items_top.current.map((hot: any, index: number) => {
									return (
										<View key={hot.id}>
											<ReplyView data={{
												contentkey: "desc",
												timekey: "cttime",
												idkey: "id",
												item: hot,
												likedata: like_.current,
												isShowSub: false,
											}} />
										</View>

									)
								})}
							</View>
						</View>}
						{pages.current.items.length > 0 && <Text style={styles.item_title}>{"全部回复"}</Text>}
					</>}
					renderItem={({ item, index }: any) => {
						return (
							<ReplyView data={{
								contentkey: "desc",
								timekey: "cttime",
								idkey: "id",
								item,
								likedata: like_.current
							}} method={{
								reply_menu,
								like_reply,
								reply
							}} />
						)
					}}
					ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={pages.current.items.length > 0} />}
				/>
			</View>
			{isfocus && <Pressable style={Globalstyles.keyboardmask} onPress={() => { Keyboard.dismiss(); }}></Pressable>}
			<Animated.View style={[Globalstyles.keyboardmask, { opacity: footerMaskOpt, zIndex: footerMaskZ }]}>
				<Pressable onPress={() => { Keyboard.dismiss(); }} style={{ flex: 1 }}></Pressable>
			</Animated.View>
			<FooterView data={{
				placeholder: replyinfo.current.holder, replytext: replyinfo.current.replytext,
				inputref, classname: classname + id.current
			}} method={{
				onChangeText: (val: string) => {
					replyinfo.current.replytext = val;
					setIsRender(val => !val);
				},
				publish,
			}}>
				{!isfocus && <View style={styles.footer_flex}>
					<View style={[styles.footer_flex, { marginRight: 20 }]}>
						<Icon name="reply" size={16} color={theme.fav} />
						{item0.current.replycnt > 0 && <Text style={styles.footer_text}>{unitNumber(item0.current.replycnt, 1)}</Text>}
					</View>
					<View style={styles.footer_flex}>
						<Icon name={like_.current[item0.current.id] ? "heart-checked" : "heart"}
							size={16} color={like_.current[item0.current.id] ? theme.redchecked : theme.fav}
						/>
						{item0.current.up > 0 && <Text style={styles.footer_text}>{unitNumber(item0.current.up, 1)}</Text>}
					</View>
				</View>}
			</FooterView>
		</View>
	);
})

const styles = StyleSheet.create({
	pagemask: {
		...StyleSheet.absoluteFillObject,
		zIndex: 99,
	},
	select_page_con: {
		position: "absolute",
		// left: 20,
		right: 20,
		zIndex: 99,
		alignItems: "flex-end",
	},
	page_btn: {
		width: 90,
		height: 35,
		borderColor: theme.border,
		borderWidth: 1,
		backgroundColor: theme.toolbarbg,
		borderRadius: 35,
		overflow: "hidden",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	currentpage: {
		fontSize: 16,
		color: theme.num,
	},
	allpage: {
		fontSize: 16,
		color: theme.placeholder,
	},
	gopage_btn_con: {
		width: width - 40,
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: "#FAFAFA",
		shadowOpacity: 0.6,
		shadowRadius: 20,
		shadowOffset: {
			width: 0,
			height: 0,
		},
		borderRadius: 12,
		overflow: "hidden",
	},
	gopage_title: {
		height: 50,
		flexDirection: "row",
		alignItems: "center",
		borderBottomColor: theme.border,
		borderBottomWidth: 1,
	},
	page_btn_con: {
		flex: 1,
		height: 50,
		alignItems: "center",
		justifyContent: "center",
	},
	btn_text: {
		fontSize: 16,
		color: theme.text1,
	},
	gopage_btn: {
		maxHeight: 300,
		flexDirection: "row",
		flexWrap: "wrap",
	},
	page_item: {
		flexBasis: "20%",
		alignItems: "center",
		justifyContent: "center",
	},
	page_item_text: {
		width: 35,
		height: 35,
		marginTop: 15,
		textAlign: "center",
		lineHeight: 35,
		borderRadius: 50,
		overflow: "hidden",
		color: theme.text1,
	},
	active_page: {
		backgroundColor: theme.others,
		color: theme.toolbarbg
	},
	item_main_con: {
		paddingTop: 21,
		paddingBottom: 16,
		paddingHorizontal: 20,
		alignItems: "flex-start",
		borderBottomColor: theme.bg,
		borderBottomWidth: 1,
	},
	main_title: {
		fontSize: 18,
		color: theme.tit2,
		fontFamily: "PingFang SC",
		fontWeight: "500",
		marginVertical: 11,
	},
	main_info: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 11,
	},
	info_image: {
		width: 35,
		height: 35,
		borderRadius: 50,
	},
	info_name_con: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 8,
	},
	info_name: {
		fontSize: 14,
		color: theme.tit2,
		fontFamily: "PingFang SC",
		fontWeight: "500",
	},
	main_desc: {
		width: "100%",
		marginTop: 13,
	},
	reply_image: {
		marginBottom: 13,
		width: width - 40
	},
	reply_text: {
		fontSize: 13,
		color: theme.text2,
		lineHeight: 20,
		marginBottom: 13
	},
	main_time: {
		color: theme.placeholder2,
		fontSize: 12,
	},
	item_hot_con: {
		paddingVertical: 6,
	},
	item_title: {
		fontSize: 14,
		color: theme.tit2,
		marginTop: 15,
		marginBottom: 5,
		marginHorizontal: 20,
	},
	hot_list_con: {
		margin: 20,
		backgroundColor: theme.bg,
		borderRadius: 8,
		overflow: "hidden",
	},
	footer_flex: {
		flexDirection: "row",
		alignItems: "center",
	},
	footer_text: {
		marginLeft: 5,
	},
});

export default SocialShequDetail;