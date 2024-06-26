import React from "react";
import { View, Text, StatusBar, Pressable, StyleSheet, Image, FlatList, Keyboard, useWindowDimensions, Animated, ScrollView } from "react-native";

import { FlashList } from "@shopify/flash-list";
import Orientation from "react-native-orientation-locker";
import FastImage from "react-native-fast-image";
import { useFocusEffect } from "@react-navigation/native";

import HeaderView from "../../components/headerview";
import FooterView from "../../components/footerview";
import VideoPlayer from "../../components/videoplayer";
import ListBottomTip from "../../components/listbottomtip";
import ToastCtrl from "../../components/toastctrl";
import SharePopover from "../../components/popover/share-popover";
import { ModalPortal, SlideAnimation } from "../../components/modals";
import AutoHeightWebView from "../../components/autoHeightWebview";
import AlertCtrl from "../../components/alertctrl";

import us from "../../services/user-service/user-service";
import articleService from "../../services/article-service/article-service";

import events from "../../hooks/events";
import cache from "../../hooks/storage";

import http from "../../utils/api/http";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { articlestyle } from "../../configs/articlestyle";
import { Globalstyles, handlelevelLeft, handlelevelTop, show_items, display, setContentFold } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";


const ArticleDetail = React.memo(({ navigation, route }: any) => {
	// 参数
	const { id } = route.params;
	const classname = "ArticleDetail";
	// 控件
	const windowD = useWindowDimensions();
	const webviewref = React.useRef<any>(null); // webview Ref
	const inputref = React.useRef<any>(null); // 评论输入框 Ref
	const listref = React.useRef<any>(null); // 评论列表 Ref
	// 变量
	let headerOpt = React.useRef(new Animated.Value(0)).current; // 头部透明度动画
	let footerOpt = React.useRef(new Animated.Value(0)).current; // 底部透明度动画
	let footerZ = React.useRef(new Animated.Value(-1)).current; // 底部层级动画
	let footerMaskOpt = React.useRef(new Animated.Value(0)).current; // 底部遮罩透明度动画
	let footerMaskZ = React.useRef(new Animated.Value(-1)).current; // 底部遮罩层级动画
	let page = React.useRef<number>(1); // 当前页数
	// 数据
	let info = React.useRef<any>({
		refid: 0,
		refuid: 0,
		parentid: 0,
		refuname: "",
		holder: "快快告诉我，你在想什么",
		replytext: "",
		refcontent: "",
	});
	let acidtoname = React.useRef<any>({});
	let articledata = React.useRef<any>({}); // 文章数据
	let votelist = React.useRef<any>([]);
	let hotarticle = React.useRef<any>([]); // 热门文章
	let replydata = React.useRef<any>({}); // 评论数据
	let likelist = React.useRef<any>({}); // 是否收藏文章
	let likefavs = React.useRef<any>({}); // 点赞列表
	// 状态
	const [loading, setLoading] = React.useState<boolean>(true); // 是否加载中
	const [isfull, setIsfull] = React.useState<boolean>(false); // 是否全屏显示
	const [showmenu, setShowMenu] = React.useState<boolean>(false); // 是否显示菜单
	const [isfocus, setIsFocus] = React.useState<boolean>(false); // 是否获取焦点
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据
	let isShowHeader = React.useRef<boolean>(false); // 是否显示头部
	let isShowFooter = React.useRef<boolean>(false); // 是否显示底部
	let noMore = React.useRef<boolean>(false); // 是否有更多数据

	useFocusEffect(
		React.useCallback(() => {
			// 根据文章内容判断状态栏颜色
			setTimeout(() => {
				if (articledata.current && articledata.current.mp4URL) {
					StatusBar.setBarStyle("dark-content", true);
				} else {
					StatusBar.setBarStyle("default", true);
				}
			}, 500);
		}, [])
	)

	// 初始化数据
	React.useEffect(() => {
		articleService.fetchArticleData(classname, id);
		// 监听文章内视频是否全屏显示
		events.subscribe(classname + id + "fullScreenChange", (fullval: boolean) => {
			setIsfull(fullval);
		})

		events.subscribe(classname + id + "ArticleData", (data) => {
			articledata.current = articleService.getArticleData(classname, id);
			votelist.current = articleService.getVoteData(classname, id);
			articleService.fetchHotArticle(articledata.current.tag);
		})

		events.subscribe(classname + id + "HotArticle", (data) => {
			hotarticle.current = data;
			// 获取文章评论数据
			getArticleReply();

			islike([id]);
			// 统计商城UV，不要删
			http.post(ENV.mall + "?uid=" + us.user.uid, {
				token: us.user.token, method: "getarticle", did: us.did, page: "article", code: id
			}).then(() => { }).catch(() => { });
		})

		Keyboard.addListener("keyboardDidShow", () => { showFooterMask(true); })
		Keyboard.addListener("keyboardDidHide", () => {
			if (inputref.current) inputref.current.blur();
			info.current = {
				refid: 0,
				refuid: 0,
				parentid: 0,
				refuname: "",
				holder: "快快告诉我，你在想什么",
				replytext: "",
				refcontent: "",
			};
			showFooterMask(false);
		})

		return () => {
			events.unsubscribe(classname + id + "fullScreenChange");
			events.unsubscribe(classname + id + "ArticleData");
			events.unsubscribe(classname + id + "HotArticle");
		}
	}, []);

	// 获取文章评论数据
	const getArticleReply = () => {
		if (noMore.current) return;
		http.post(ENV.article, { method: "getreplyv2", aid: id, pagesize: 50, page: page.current, from: 1 }).then((resp_data: any) => {
			// 设置展开收起文本
			if (resp_data.items && resp_data.items.length > 0) {
				resp_data.items.forEach((item: any) => {
					item["content2"] = "";
					item["isopen"] = true;
					if (item.content.length > 0) {
						setContentFold({
							item, // 列表数据
							key: "content", // 需要展开收起的字段
							src: "article", // 来源
							width: windowD.width - 89, // 列表项的宽度
							fontSize: 13, // 列表项的字体大小
							lineInfoForLine: 5, // 收起时显示的行数
							moreTextLen: 5, // 展开收起按钮长度
						})
					}
					if (item.sub && item.sub.length > 0) {
						item.sub.forEach((subitem: any) => {
							subitem["content2"] = "";
							subitem["isopen"] = true;
							if (item.content.length > 0) {
								setContentFold({
									item: subitem, // 列表数据
									key: "content", // 需要展开收起的字段
									src: "article", // 来源
									width: windowD.width - 128, // 列表项的宽度
									fontSize: 13, // 列表项的字体大小
									lineInfoForLine: 5, // 收起时显示的行数
									moreTextLen: 5, // 展开收起按钮长度
								})
							}
						})
					}
				});
			}
			if (page.current == 1) {
				replydata.current = resp_data;
			} else {
				replydata.current.items = replydata.current.items.concat(resp_data.items);
			}
			if (resp_data.items.length < 50) noMore.current = true;
			setrefuname(replydata.current.items);
			favs(resp_data);
			if (page.current == 1) {
				events.publish(classname + id + "setArticleData", articledata.current);
				setTimeout(() => { setLoading(false) }, 1000);
			}
			setTimeout(() => { setIsRender(val => !val) }, 100);
		});
	};

	// 设置三级回复人
	const setrefuname = (items: any) => {
		for (var i in items) {
			acidtoname.current[items[i]["acid"]] = items[i]["uname"];
			items[i].content = items[i].content.replace(/\n/g, "<br>");
			if (items[i]["acrefid"] > 0)
				items[i]["refuname"] = acidtoname.current[items[i]["acrefid"]];
		}
	}

	//获取用户曾点过的赞
	const favs = (resp: any) => {
		if (!us.user.uid) return;
		let favsid: any[] = [];
		for (let i in resp.items) {
			favsid.push(resp.items[i].id)
			if (resp.items[i].sub) {
				for (let j in resp.items[i].sub) {
					favsid.push(resp.items[i].sub[j].id)
				}
			}
		}
		http.post(ENV.article, { method: "islikecomment", uid: us.user.uid, ids: favsid }).then((resp_data: any) => {
			for (var i in resp_data) {
				if (resp_data[i]) likefavs.current[resp_data[i]] = true;
			}
		});
	}

	//文章评论点赞功能
	const like_reply = (item: any) => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App文章页" } });
		}
		http.post(ENV.api + ENV.article + "?uid=" + us.user.uid, { method: "togglefavcomment", acid: item.id, token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				likefavs.current[item.id] = true;
				item.up += 1;
			} else if (resp_data.msg == "REMOVE") {
				likefavs.current[item.id] = false;
				item.up -= 1;
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App文章页" } });
			}
			setIsRender(val => !val);
		})
	}

	// 获取用户是否收藏当前文章
	const islike = (ids: any[]) => {
		if (!us.user.uid) return;
		http.post(ENV.article, { method: "islike", uid: us.user.uid, ids: ids }).then((resp_data: any) => {
			for (let i in resp_data) {
				if (resp_data[i]) likelist.current[resp_data[i]] = true;
			}
		})
	}

	// 动态修改顶部导航栏透明度
	const showHeaderView = (e: any) => {
		if (articledata.current.mp4URL) return;
		if (e.nativeEvent.contentOffset.y > articledata.current.tempH - 71) {
			if (isShowHeader.current) return;
			isShowHeader.current = true;
			Animated.timing(headerOpt, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
		} else {
			if (!isShowHeader.current) return;
			isShowHeader.current = false;
			Animated.timing(headerOpt, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start();
		}
	}
	// 动态修改底部输入框透明度和层级
	const showFooterView = (e: any) => {
		if (e.nativeEvent.contentOffset.y > 44) {
			if (isShowFooter.current) return;
			isShowFooter.current = true;
			Animated.timing(footerOpt, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
			Animated.timing(footerZ, {
				toValue: 1,
				duration: 200,
				useNativeDriver: true,
			}).start();
		} else {
			if (!isShowFooter.current) return;
			isShowFooter.current = false;
			Animated.timing(footerOpt, {
				toValue: 0,
				duration: 200,
				useNativeDriver: true,
			}).start();
			Animated.timing(footerZ, {
				toValue: -1,
				duration: 200,
				useNativeDriver: true,
			}).start();
		}
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

	// 收藏文章
	const favarticle = () => {
		if (showmenu) setShowMenu(false);
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App文章页" } });
		}
		http.post(ENV.article + "?uid=" + us.user.uid, {
			method: "togglefav", aid: id, token: us.user.token
		}).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				likelist.current[id] = true;
				ToastCtrl.show({ message: "收藏成功", duration: 1000, viewstyle: "short_toast", key: "fav_add_toast" });
			} else if (resp_data.msg == "REMOVE") {
				likelist.current[id] = false;
				ToastCtrl.show({ message: "已取消收藏", duration: 1000, viewstyle: "short_toast", key: "fav_remove_toast" });
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App文章页" } });
			}
			articledata.current.favcnt = resp_data.favcnt;
			setIsRender(val => !val);
		});
	}

	// 处理评论数
	const unitNumber = (number: number) => {
		return articleService.unitNumber(number, 1);
	}

	// 处理webview中的链接与RN通信
	const INJECTED_JAVASCRIPT = `(function () {
		let allLinks = document.querySelectorAll("a");
		allLinks.forEach((link)=>{
			link.addEventListener("click", (ev)=>{
				ev.preventDefault();
				let e = ev.srcElement || ev.target;
				for (let i = 0; i < 3; ++i) {
					if (e.nodeName == "A")
						break;
					else
						e = e.parentNode;
				}
				if (e.nodeName != "A") return;
				let href = e.getAttribute("href");
				let obj = href.substr(href.indexOf("?") + 1).replace(/%22/g, '"');
				window.ReactNativeWebView.postMessage(JSON.stringify({ data: obj, type: "link" }));
			});
		})
		let sel_btn = document.querySelectorAll(".sel_btn");
		if (sel_btn && sel_btn.length > 0) {
			sel_btn.forEach((btnlink) => {
				btnlink.addEventListener("click", (ev) => {
					let e = ev.srcElement || ev.target;
					for (let i = 0; i < 3; ++i) {
						if (e.nodeName == "DIV" && e.id)
							break;
						else
							e = e.parentNode;
					}
					window.ReactNativeWebView.postMessage(JSON.stringify({ id: e.id, type: "sel" }));
					let voteitem = document.getElementById(e.id);
					if (voteitem && voteitem.querySelector(".radio").className.indexOf("radio_checked") == -1) {
						document.querySelectorAll(".radio").forEach((radio)=>{ radio.classList.remove("radio_checked"); });
						voteitem.querySelector(".radio").classList.add("radio_checked");
					}
				})
			})
		}
		let vote_btn = document.querySelector(".vote_btn");
		if (vote_btn) {
			vote_btn.addEventListener("click", (ev) => {
				let e = ev.srcElement || ev.target;
				if (e.innerText == "投票") {
					window.ReactNativeWebView.postMessage(JSON.stringify({ id: e.id, type: "vote" }));
				}
			})
		}
		function toPage(ele) {
			ele.addEventListener("click", (ev) => {
				let e = ev.srcElement || ev.target;
				for (let i = 0; i < 4; ++i) {
					if (e.nodeName == "DIV" && e.id)
						break;
					else
						e = e.parentNode;
				}
				window.ReactNativeWebView.postMessage(JSON.stringify({ id: e.id, type: "topage" }));
			})
		}
		let vote_item = document.querySelectorAll(".vote_item");
		if (vote_item && vote_item.length > 0) {
			vote_item.forEach((itemlink) => {
				toPage(itemlink.querySelector(".item_cname"))
				toPage(itemlink.querySelector(".item_ename"))
				toPage(itemlink.querySelector(".voteitemimg"))
			})
		}
	})();`;

	// 监听webview内容并获取其高度和处理webview内点击事件
	const handleMessage = (event: any) => {
		if (!event.nativeEvent.data) return;
		let data = JSON.parse(event.nativeEvent.data);
		if (data) {
			if (data.type == "link") {
				let linkdata = JSON.parse(data.data);
				if (linkdata.page && linkdata.page.length > 3) {
					gotodetail(linkdata.page, linkdata.id);
					let params = { token: us.user.token, method: "clickarticle", did: us.user.did, page: linkdata.page, code: linkdata.id };
					http.post(ENV.mall + "?uid=" + us.user.uid, params);
				}
			} else if (data.type == "sel") {
				sel_vote_item(data.id);
			} else if (data.type == "vote") {
				vote(data.id);
			} else if (data.type == "topage") {
				let id = data.id.split("_")[2];
				gotodetail("mall-item", id);
			}
		}
	};

	const sel_vote_item = (id: string) => {
		let ids = id.split("_");
		let voteid = ids[0], itemid = ids[1], iteminfo = ids[2];
		let voteindex = votelist.current.findIndex((item: any) => item.id == voteid);
		let votedata = votelist.current[voteindex];
		let itemindex = votedata.list.findIndex((item: any) => (item.id == itemid && item.info == iteminfo));
		let itemdata = votedata.list[itemindex];
		if (votedata.choose_classify == "单选") {
			votedata.list.forEach((item: any) => { item.ischecked = false });
			itemdata.ischecked = true;
		} else {
			itemdata.ischecked = !itemdata.ischecked;
		}
	}

	const vote = (voteid: string) => {
		let id = voteid.replace("vote_", "");
		let index = votelist.current.findIndex((item: any) => item.id == id);
		let votedata = votelist.current[index];
		if (!us.user.uid) {
			navigation.navigate("Page", { screen: "Login", params: { src: "App文章页" } });
			return;
		}
		let selvoteitem: any = {};
		votedata.list.forEach((item: any) => { if (item.ischecked) selvoteitem[item.id] = 1; });
		if (Object.keys(selvoteitem).length == 0) {
			AlertCtrl.show({
				header: "请先选择投票内容",
				key: "empty_vitecon_alert",
				message: "",
				buttons: [{
					text: "确定",
					handler: () => {
						AlertCtrl.close("empty_vitecon_alert")
					}
				}]
			});
			return
		}
		http.post(ENV.api + ENV.vote, { method: "to_vote", uid: us.user.uid, data: votedata, token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				events.publish("update_votedata", { type: "to_vote", data: resp_data.data });
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App文章页" } });
			} else {
				return ToastCtrl.show({ message: resp_data.msg, duration: 1000, viewstyle: "medium_toast", key: "vote_error_toast" });
			}
		});
	}

	// 跳转页面
	const gotodetail = (page: any, id: number) => {
		let screen = "";
		let pages = ["item-detail", "mall-item", "mall-heji", "wiki-detail"];
		switch (page) {
			case "item-detail":
				screen = "ItemDetail";
				break;
			case "mall-item":
				screen = "MallItem";
				break;
			case "mall-heji":
				screen = "MallHeji";
				break;
			case "wiki-detail":
				screen = "WikiDetail";
				break;
			default:
				break;
		}
		if (pages.includes(page)) {
			navigation.navigate("Page", { screen, params: { id, src: "APP文章:" + id } });
		} else if (page == "mall-group") {
			navigation.navigate("Page", { screen: "MallGroup", params: { id, src: "APP文章:" + id, word: 1 } });
		} else if (page == "article-detail") {
			navigation.push("Page", { screen: "ArticleDetail", params: { id } });
		}
	}

	// 分享弹窗
	const showSharePopover = () => {
		if (showmenu) setShowMenu(false);
		ModalPortal.show((
			<SharePopover />
		), {
			key: "share_popover",
			width: windowD.width,
			height: 200,
			rounded: false,
			useNativeDriver: true,
			modalAnimation: new SlideAnimation({
				initialValue: 0,
				slideFrom: "bottom",
				useNativeDriver: true,
			}),
			onTouchOutside: () => {
				ModalPortal.dismiss("share_popover");
			},
			swipeDirection: "down",
			animationDuration: 300,
			type: "bottomModal",
			modalStyle: { borderTopLeftRadius: 30, borderTopRightRadius: 30 },
		})
	}

	// 点击选择回复
	const reply = (item: any, type: string, parentitem: any = null) => {
		info.current.refid = item.id;
		info.current.parentid = (type == "main" || type == "wx") ? item.id : parentitem.id;
		info.current.refuid = item.uid;
		info.current.refuname = (type == "main" || type == "sub") ? item.uname : type == "wx" ? item.wxnick : "";
		info.current.holder = "回复 " + info.current.refuname;
		info.current.refcontent = item.content;
		if (inputref.current) inputref.current.focus();
		setIsRender(val => !val);
	};

	// 设置回复后的模拟数据
	const setreply = () => {
		let data: any = {
			id: new Date().getTime(),
			uid: us.user.uid,
			uface: us.user.uface,
			ulevel: us.user.ulevel,
			uname: us.user.uname,
			actime: "刚刚",
			content: info.current.replytext,
			up: 0
		};
		if (info.current.refid == 0 && info.current.parentid == 0) {
			replydata.current.items.push(data);
		} else {
			//20240523 shibo: 增加判断，避免出错
			let replyitems = replydata.current.items.filter((item: any) => { return item.id == info.current.parentid })[0];
			if (!replyitems.sub) replyitems["sub"] = [];
			if (info.current.refid == info.current.parentid) {
				replyitems.sub.push(data);
			} else {
				data["refuname"] = info.current.refuname;
				data["refuid"] = info.current.refuid;
				data["refcontent"] = info.current.refcontent;
				replyitems.sub.push(data);
			}
		}
		setIsRender(val => !val);
		Keyboard.dismiss();
	}

	const publish = () => {
		var replytext = "";
		if (info.current.replytext)
			replytext = info.current.replytext.trim();
		if (replytext == "") return;

		cache.saveItem(classname + "publish" + id, info.current, 24 * 3600);
		if (!us.user.uid) {
			if (Keyboard.isVisible()) Keyboard.dismiss();
			setTimeout(() => {
				return navigation.navigate("Page", { screen: "Login", params: { src: "App文章页" } });
			}, 500);
			return;
		}
		http.post(ENV.reply + "?method=post&type=article&id=" + id + "&uid=" + us.user.uid + "&refid=" + info.current.refid, {
			token: us.user.token, content: replytext
		}).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				cache.removeItem(classname + "publish" + id);
				setreply();
				ToastCtrl.show({ message: "发布成功", duration: 1000, viewstyle: "short_toast", key: "publish_success_toast" });
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				//登录失效，转到登录界面，登录后直接进行发布并转到打分页面
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App文章页" } });
			} else {
				ToastCtrl.show({ message: "发布结果：" + resp_data.msg, duration: 1000, viewstyle: "short_toast", key: "publish_error_toast" });
			}
		});
	};

	return (
		<>
			{loading && <View style={[Globalstyles.loading_con, isfull && styles.hide_view]}>
				<Image style={Globalstyles.loading_img} source={require("../../assets/images/loading.gif")} />
			</View>}
			<HeaderView data={{
				title: !articledata.current.mp4URL ? articledata.current.title2 : articledata.current.title,
				isShowSearch: false,
				// showmenu,
				style: [
					isfull && styles.hide_view,
					!articledata.current.mp4URL && styles.notmp4
				],
				childrenstyle: {
					headercolor: { color: !articledata.current.mp4URL ? theme.toolbarbg : theme.text2 },
					headertitle: { opacity: !articledata.current.mp4URL ? headerOpt : 1 },
				}
			}} method={{
				back: () => {
					navigation.goBack();
					Orientation.getOrientation((orientation: any) => {
						if (orientation == "LANDSCAPE") {
							Orientation.lockToPortrait();
						}
					})
				},
			}}
			// MenuChildren={() => {
			// 	return (
			// 		<>
			// 			{/* <Pressable style={Globalstyles.menu_icon_con} onPress={showSharePopover}>
			// 				<Icon style={Globalstyles.menu_icon} name="share2" size={14} color={theme.text1} />
			// 				<Text style={Globalstyles.menu_text}>{"分享"}</Text>
			// 			</Pressable> */}
			// 			<Pressable style={[Globalstyles.menu_icon_con, Globalstyles.no_border_bottom]} onPress={favarticle}>
			// 				<Icon style={Globalstyles.menu_icon} name={likelist.current[id] ? "heart-checked" : "heart"} size={16}
			// 					color={likelist.current[id] ? theme.redchecked : theme.text1} />
			// 				<Text style={Globalstyles.menu_text}>{"收藏"}</Text>
			// 			</Pressable>
			// 		</>
			// 	)
			// }}
			>
				{!articledata.current.mp4URL && <Animated.View style={[styles.coverimg_con, { opacity: headerOpt }]}>
					<View style={styles.coverimg_msk}></View>
					<Image source={{ uri: ENV.image + articledata.current.coverimg, cache: "force-cache" }} style={styles.coverimg} resizeMode="cover" />
				</Animated.View>}
				<Pressable onPress={favarticle}>
					<Icon style={styles.title_icon} name={likelist.current[id] ? "heart-checked" : "heart"} size={20}
						color={likelist.current[id] ? theme.redchecked : !articledata.current.mp4URL ? theme.toolbarbg : theme.text2} />
				</Pressable>
				{/* <Pressable style={{ zIndex: 1 }} onPress={() => { setShowMenu(val => !val) }}>
					<Icon name="sandian" size={20} color={!articledata.current.mp4URL ? theme.toolbarbg : theme.text2} style={styles.title_icon} />
				</Pressable> */}
			</HeaderView>
			<FlashList ref={listref} data={replydata.current.items}
				onScroll={(e) => {
					showHeaderView(e);
					showFooterView(e);
				}}
				keyExtractor={(item: any, index: number) => item.id}
				extraData={isrender}
				estimatedItemSize={100}
				onEndReachedThreshold={0.1}
				onEndReached={() => {
					if (replydata.current.items) {
						page.current++;
						getArticleReply();
					}
				}}
				ListHeaderComponent={<>
					{articledata.current.mp4URL && <VideoPlayer
						source={articledata.current.mp4URL}
						poster={articledata.current.picURL}
						classname={classname + id}>
					</VideoPlayer>}
					<View style={[styles.scrollview_con, isfull && styles.hide_view]}>
						<View>
							{!articledata.current.mp4URL && <View style={styles.content_img}>
								<Image source={{ uri: ENV.image + articledata.current.coverimg }}
									style={{ width: windowD.width, height: articledata.current.tempH }}
								/>
							</View>}
							<View style={styles.webview_con}>
								<AutoHeightWebView style={{ width: windowD.width - 48 }}
									ref={webviewref}
									originWhitelist={["*"]}
									scrollEnabled={false}
									scalesPageToFit={false}
									nestedScrollEnabled={false}
									setBuiltInZoomControls={false}
									showsHorizontalScrollIndicator={false}
									showsVerticalScrollIndicator={false}
									customScript={INJECTED_JAVASCRIPT}
									onMessage={handleMessage}
									customStyle={articlestyle.style}
									source={{ html: articledata.current.html }}
								/>
							</View>
							<View style={styles.btn_container}>
								<View style={[styles.btn_content, styles.btn_margin]}>
									<Icon name="time" size={16} color={theme.placeholder} />
									<Text style={styles.btn_text}>{articledata.current.tm}</Text>
								</View>
								<View style={styles.btn_content}>
									<Icon name="look" size={16} color={theme.placeholder} />
									<Text style={styles.btn_text}>{articledata.current.view}</Text>
								</View>
								{/* <Pressable onPress={showSharePopover} hitSlop={20} style={styles.btn_content}>
									<Icon name="share3" size={16} color={theme.placeholder} />
								</Pressable> */}
							</View>
							<>
								<Text style={styles.title}>热门文章</Text>
								{(hotarticle.current && hotarticle.current.length > 0) && <FlatList
									data={hotarticle.current}
									horizontal={true}
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={styles.contentContainer}
									keyExtractor={(item: any, index: number) => item.id}
									renderItem={({ item, index }: any) => {
										return (
											<Pressable style={styles.itemContainer} onPress={() => {
												gotodetail("article-detail", item.id);
											}}>
												<FastImage style={{ width: "100%", height: "100%", }} source={{ uri: ENV.image + item.pic }} />
												<Text style={styles.item_tit}>{item.title}</Text>
											</Pressable>
										)
									}}
								/>}
							</>
						</View>
						<View style={styles.reply_con}>
							<Text style={styles.title}>热门评论</Text>
						</View>
					</View>
				</>}
				contentContainerStyle={styles.flatlist_con}
				renderItem={({ item, index }: any) => {
					return (
						<View style={[
							styles.replyitem_con,
							isfull && styles.hide_view,
							{ borderBottomColor: index == replydata.current.items.length - 1 ? "transparent" : theme.bg }
						]}>
							{item.uid > 0 && <Image source={{ uri: ENV.avatar + item.uid + ".jpg!l?" + item.uface }} style={styles.replyitem_img} resizeMode="cover" />}
							{!(item.uid > 0) && <Image source={{ uri: "https:" + item.wxavatar }} style={styles.replyitem_img} resizeMode="cover" />}
							{item.uid > 0 && <View style={styles.replyitem_uname_con}>
								<Text style={styles.replyitem_uname}>{item.uname}</Text>
								<View style={Globalstyles.level}>
									<Image
										style={[Globalstyles.level_icon, handlelevelLeft(item.ulevel), handlelevelTop(item.ulevel)]}
										defaultSource={require("../../assets/images/nopic.png")}
										source={require("../../assets/images/level.png")}
									/>
								</View>
							</View>}
							{!(item.uid > 0) && <View style={styles.replyitem_uname_con}>
								<Text style={styles.replyitem_uname}>{item.wxnick}</Text>
							</View>}
							{item.content && <Pressable style={styles.replyitem_text_con} onPress={() => {
								if (item.content2) {
									item.isopen = !item.isopen;
									setIsRender(val => !val);
								}
							}}>
								{item.isopen && <Text style={[styles.replyitem_text, { fontFamily: "monospace" }]}>{item.content}</Text>}
								{!item.isopen && <Text style={[styles.replyitem_text, { fontFamily: "monospace" }]}>{item.content2}</Text>}
								{item.content2 && <View style={[Globalstyles.morebtn_con, item.isopen && Globalstyles.open_morebtn]}>
									{!item.isopen && <Text style={[Globalstyles.ellipsis_text, { color: theme.text2 }]}>{"..."}</Text>}
									{!item.isopen && <Text style={[Globalstyles.morebtn_text, { fontSize: 13, color: theme.placeholder }]}>{"展开"}</Text>}
									{item.isopen && <Text style={[Globalstyles.morebtn_text, { fontSize: 13, color: theme.placeholder }]}>{"收起"}</Text>}
									<Icon name={item.isopen ? "toparrow" : "btmarrow"} size={14} color={theme.placeholder} style={{ transform: [{ scale: 1.5 }] }} />
								</View>}
							</Pressable>}
							<View style={styles.replyitem_btn_con}>
								<Text style={styles.replyitem_time}>{item.actime}</Text>
								<View style={styles.replyitem_btn}>
									<Pressable onPress={() => {
										if (item.uid > 0) {
											reply(item, "main")
										} else if (!(item.uid > 0)) {
											reply(item, "wx")
										}
									}} hitSlop={20}>
										<Icon name="reply" size={15} color={theme.placeholder2} />
									</Pressable>
									<Pressable style={styles.replyitem_upbtn} onPress={() => {
										like_reply(item)
									}}>
										<Icon name={likefavs.current[item.id] ? "up-checked" : "up"} size={15} color={theme.placeholder2} />
										{item.up > 0 && <Text style={styles.replyitem_uptext}>{item.up}</Text>}
									</Pressable>
								</View>
							</View>
							{(item.sub && item.sub.length > 0) && <View style={styles.replysub_con}>
								{item.sub.map((sub: any, subindex: number) => {
									return (
										<View key={sub.id}>
											{show_items(item.sub, subindex) && <>
												{sub.uid > 0 && <Image source={{ uri: ENV.avatar + sub.uid + ".jpg!l?" + sub.uface }} style={styles.replysub_img} />}
												<View style={[styles.replysub_text_con, subindex == 0 ? styles.first_replysub_text_con : null]}>
													<View style={styles.replysub_uname_con}>
														<Text style={styles.replysub_uname}>{sub.uname}</Text>
														<View style={Globalstyles.level}>
															<Image
																style={[Globalstyles.level_icon, handlelevelLeft(sub.ulevel), handlelevelTop(sub.ulevel)]}
																defaultSource={require("../../assets/images/nopic.png")}
																source={require("../../assets/images/level.png")}
															/>
														</View>
													</View>
													{(sub.refuid || sub.refuname) && <View style={styles.replysub_refuname}>
														<Text style={styles.replyitem_text}>{"回复"}</Text>
														<Text style={[styles.replyitem_text, { fontWeight: "600", fontFamily: "PingFang SC", marginHorizontal: 3 }]}>{sub.refuname}</Text>
														<Text style={styles.replyitem_text}>{":"}</Text>
													</View>}
													{sub.content && <Pressable style={{ marginTop: 6 }} onPress={() => {
														if (sub.content2) {
															sub.isopen = !sub.isopen;
															setIsRender(val => !val);
														}
													}}>
														{sub.isopen && <Text style={[styles.replyitem_text, { fontFamily: "monospace" }]}>{sub.content}</Text>}
														{!sub.isopen && <Text style={[styles.replyitem_text, { fontFamily: "monospace" }]}>{sub.content2}</Text>}
														{sub.content2 && <View style={[Globalstyles.morebtn_con, sub.isopen && Globalstyles.open_morebtn]}>
															{!sub.isopen && <Text style={[Globalstyles.ellipsis_text, { color: theme.text2 }]}>{"..."}</Text>}
															{!sub.isopen && <Text style={[Globalstyles.morebtn_text, { fontSize: 13, color: theme.placeholder }]}>{"展开"}</Text>}
															{sub.isopen && <Text style={[Globalstyles.morebtn_text, { fontSize: 13, color: theme.placeholder }]}>{"收起"}</Text>}
															<Icon name={sub.isopen ? "toparrow" : "btmarrow"} size={14} color={theme.placeholder} style={{ transform: [{ scale: 1.5 }] }} />
														</View>}
													</Pressable>}
													<View style={[styles.replyitem_btn_con, { marginTop: 8, marginLeft: 0, }]}>
														<Text style={styles.replyitem_time}>{sub.actime}</Text>
														<View style={styles.replyitem_btn}>
															<Pressable onPress={() => {
																reply(sub, "sub", item)
															}} hitSlop={20}>
																<Icon name="reply" size={15} color={theme.placeholder2} />
															</Pressable>
															<Pressable style={styles.replyitem_upbtn} onPress={() => {
																like_reply(sub)
															}}>
																<Icon name={likefavs.current[sub.id] ? "up-checked" : "up"} size={15} color={theme.placeholder2} />
																{sub.up > 0 && <Text style={styles.replyitem_uptext}>{sub.up}</Text>}
															</Pressable>
														</View>
													</View>
												</View>
											</>}
										</View>
									)
								})}
								{show_items(item.sub, -1) && <Pressable onPress={() => {
									display(item.sub);
									setIsRender(val => !val);
								}} style={[Globalstyles.more_reply, { marginLeft: 30 }]}>
									{!item.sub.show && <Text style={Globalstyles.more_reply_text}>{"共" + item.sub.length + "条回复"}</Text>}
									{item.sub.show && <Text style={Globalstyles.more_reply_text}>{"收起回复"}</Text>}
									<Icon name={item.sub.show ? "toparrow" : "btmarrow"} size={16} color={theme.tit} />
								</Pressable>}
							</View>}
						</View>
					)
				}}
				ListFooterComponent={<ListBottomTip noMore={noMore.current}
					isShowTip={replydata.current.items && replydata.current.items.length > 0}
					style={isfull && styles.hide_view}
				/>}
			/>
			<Animated.View style={[Globalstyles.keyboardmask, { opacity: footerMaskOpt, zIndex: footerMaskZ }]}>
				<Pressable onPress={() => { Keyboard.dismiss(); }} style={{ flex: 1 }}></Pressable>
			</Animated.View>
			<FooterView data={{
				placeholder: info.current.holder, replytext: info.current.replytext,
				inputref,
				opacity: footerOpt, zIndex: !isfocus ? footerZ : 13,
				style: isfull && styles.hide_view
			}} method={{
				onChangeText: (val: string) => {
					info.current.replytext = val;
					setIsRender(val => !val);
				},
				publish,
			}}>
				{!isfocus && <View style={styles.footer_icon_con}>
					<Pressable style={styles.footer_icon} onPress={() => {
						if (listref.current) {
							listref.current.scrollToIndex({
								index: 0,
								animated: true,
								viewOffset: articledata.current.mp4URL ? 50 : 120,
								viewPosition: 0,
							})
						}
					}}>
						<Icon name="reply" size={16} color={theme.fav} />
						{articledata.current.replycnt > 0 && <Text style={styles.footer_text}>{unitNumber(articledata.current.replycnt)}</Text>}
					</Pressable>
					<Pressable style={[styles.footer_icon, { marginRight: 0 }]} onPress={favarticle}>
						<Icon name={likelist.current[id] ? "heart-checked" : "heart"}
							size={16} color={likelist.current[id] ? theme.redchecked : theme.fav}
						/>
						{articledata.current.favcnt > 0 && <Text style={styles.footer_text}>{unitNumber(articledata.current.favcnt)}</Text>}
					</Pressable>
					{/* <Pressable onPress={showSharePopover} hitSlop={20}>
						<Icon name="share2" size={14} color={theme.fav} />
					</Pressable> */}
				</View>}
			</FooterView>
		</>
	);
})

const styles = StyleSheet.create({
	p: {
		paddingVertical: 4,
		margin: 0,
	},
	ptext: {
		fontSize: 15,
		color: theme.text1,
		lineHeight: 29,
		fontFamily: "PingFang SC"
	},
	strong: {
		fontSize: 15,
		color: theme.text1,
		lineHeight: 29,
		fontWeight: "bold",
		fontFamily: "PingFang SC"
	},
	textline: {
		textDecorationLine: "underline"
	},
	notmp4: {
		backgroundColor: "transparent",
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
	},
	scrollview_con: {
		width: "100%",
		height: "auto",
		backgroundColor: theme.toolbarbg,
	},
	video_ripple: {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		zIndex: 0,
		backgroundColor: "rgba(255,255,255,.6)",
		borderRadius: 100
	},
	hide_view: {
		display: "none"
	},
	content_img: {
		width: "100%",
	},
	webview_con: {
		width: "100%",
		flex: 1,
		paddingLeft: 24,
		paddingRight: 24,
		backgroundColor: theme.toolbarbg,
	},
	btn_container: {
		flexDirection: "row",
		justifyContent: "flex-end",
		marginVertical: 16,
		paddingRight: 30,
	},
	btn_margin: {
		marginRight: 30,
	},
	btn_content: {
		alignItems: "center",
		flexDirection: "row",
	},
	btn_text: {
		fontSize: 13,
		color: theme.placeholder,
		marginLeft: 4,
	},
	title: {
		color: theme.tit2,
		fontFamily: "PingFang SC",
		fontSize: 14,
		marginLeft: 24,
		marginTop: 15,
		marginBottom: 10,
	},
	contentContainer: {
		paddingLeft: 9,
		paddingRight: 24,
		marginBottom: 24,
		height: 120,
	},
	itemContainer: {
		width: 200,
		aspectRatio: 200 / 120,
		marginLeft: 15,
		borderRadius: 10,
		overflow: "hidden",
		backgroundColor: theme.bg,
		alignItems: "center",
		justifyContent: "center",
	},
	item_tit: {
		position: "absolute",
		paddingHorizontal: 15,
		color: theme.toolbarbg,
		textAlign: "center",
		fontSize: 14,
	},
	reply_con: {
		borderTopWidth: 6,
		borderTopColor: theme.bg,
		backgroundColor: "#FCFCFC",
	},
	flatlist_con: {
		backgroundColor: "#FCFCFC",
	},
	replyitem_con: {
		paddingHorizontal: 24,
		paddingVertical: 13,
		backgroundColor: "#FCFCFC",
		borderBottomWidth: 1,
	},
	replyitem_img: {
		width: 30,
		height: 30,
		borderRadius: 50,
		position: "absolute",
		left: 24,
		top: 13,
	},
	replyitem_uname_con: {
		flexDirection: "row",
		marginLeft: 40
	},
	replyitem_uname: {
		fontSize: 13,
		fontFamily: "PingFang SC",
		fontWeight: "500",
		color: theme.tit2,
	},
	replysub_refuname: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 8,
	},
	replyitem_text_con: {
		marginLeft: 40,
		marginTop: 5,
		marginBottom: 13,
	},
	replyitem_text: {
		fontSize: 13,
		color: theme.text2,
		lineHeight: 20,
	},
	replyitem_btn_con: {
		flexDirection: "row",
		alignContent: "center",
		justifyContent: "space-between",
		marginLeft: 43,
		marginBottom: 10,
	},
	replyitem_time: {
		fontSize: 12,
		color: theme.placeholder2,
	},
	replyitem_btn: {
		flexDirection: "row",
		alignContent: "center",
	},
	replyitem_upbtn: {
		marginLeft: 20,
		flexDirection: "row",
		alignContent: "center",
	},
	replyitem_uptext: {
		fontSize: 12,
		marginLeft: 3,
		color: theme.placeholder2,
	},
	replysub_con: {
		backgroundColor: theme.bg,
		marginLeft: 30,
		marginBottom: 12,
		paddingHorizontal: 10,
		height: "auto",
		paddingTop: 8,
	},
	replysub_img: {
		width: 22,
		height: 22,
		position: "absolute",
		borderRadius: 50,
		top: 9,
	},
	first_replysub_text_con: {
		borderTopWidth: 0,
	},
	replysub_text_con: {
		marginLeft: 30,
		marginBottom: 10,
		borderTopWidth: 1,
		borderTopColor: "rgba(224,224,224,.8)"
	},
	replysub_uname_con: {
		flexDirection: "row",
		alignContent: "center",
		marginTop: 12,
	},
	replysub_uname: {
		fontSize: 14,
		color: theme.tit2,
	},
	coverimg_con: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 0,
	},
	coverimg_msk: {
		position: "absolute",
		width: "100%",
		height: "100%",
		backgroundColor: "rgba(0,0,0,0.3)",
		zIndex: 1,
	},
	coverimg: {
		width: "100%",
		height: "100%",
		zIndex: 0,
	},
	title_icon: {
		width: 44,
		height: 44,
		textAlign: "center",
		lineHeight: 44,
	},

	footer_icon_con: {
		flexDirection: "row",
		alignItems: "center",
	},
	footer_icon: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 20,
	},
	footer_text: {
		marginLeft: 5,
	},
})

export default ArticleDetail;