import React from "react";
import { StyleSheet, View, Text, StatusBar, Pressable, Image, FlatList, NativeEventEmitter, Keyboard, Dimensions, Animated, Easing } from "react-native";

import { WebView } from "react-native-webview";
import Orientation from "react-native-orientation-locker";

import Icon from "../../assets/iconfont";

import HeaderView from "../../components/headerview";
import FooterView from "../../components/footerview";
import VideoPlayer from "../../components/videoplayer";
import ListBottomTip from "../../components/listbottomtip";
import ToastCtrl from "../../components/toastctrl";

import http from "../../utils/api/http";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import cache from "../../hooks/storage/storage";

import us from "../../services/user-service/user-service";
import articleService from "../../services/article-service/article-service";

const Winwidth = Dimensions.get("window").width;
const events = new NativeEventEmitter();
const classname = "ArticleDetail";

const HeaderWebView = React.memo(({ articleid }: any) => {

	const [webheight, setWebHeight] = React.useState<number>(600);
	const [articledata, setArticledata] = React.useState<any>({});
	const [hotarticle, setHotarticle] = React.useState<any[]>([]);
	const [isfull, setIsfull] = React.useState<boolean>(false);
	const webview = React.useRef(null);

	React.useEffect(() => {
		// 监听文章内视频是否全屏显示
		events.addListener("fullScreenChange" + classname + articleid, (fullval) => {
			setIsfull(fullval);
		})

		// 监听数据设置文章列表数据
		events.addListener(classname + articleid + "setArticleData", (data) => {
			setArticledata(data);
			articleService.fetchHotArticle(data.tag);
		})

		events.addListener(classname + articleid + "HotArticle", (data) => {
			setHotarticle(data);
			// startAnimation();
		})

		return () => {
			events.removeAllListeners(classname + articleid + "fullScreenChange");
			events.removeAllListeners(classname + articleid + "setArticleData");
			events.removeAllListeners(classname + articleid + "HotArticle");
		}
	}, [])

	const INJECTED_JAVASCRIPT = `(function () {
		function getHeight() {
			let webheight = 0;
			if (document.documentElement && (document.documentElement.scrollHeight)) {
				webheight = document.documentElement.scrollHeight;
			} else if (document.body && (document.body.scrollHeight)) {
				webheight = document.body.scrollHeight;
			}
			window.ReactNativeWebView.postMessage(JSON.stringify({ height: webheight }))
		}
		setTimeout(getHeight, 1000);
		var allLinks = document.querySelectorAll("a");
		allLinks.forEach((link)=>{
			link.addEventListener("click", (ev)=>{
				let e = ev.srcElement || ev.target;
				for (let i = 0; i < 3; ++i) {
					if (e.nodeName == "A")
						break;
					else
						e = e.parentNode;
				}
				if (e.nodeName != "A") return;
				let obj = e.hash.substr(e.hash.indexOf("?") + 1).replace(/%22/g, '"');
				window.ReactNativeWebView.postMessage(obj);
			});
		})
	})();`;

	// 监听webview内容并获取其高度和处理webview内点击事件
	const handleMessage = (event: any) => {
		if (!event.nativeEvent.data) return;
		let data = JSON.parse(event.nativeEvent.data);
		if (data.height && data.height > 0 && data.height != webheight) {
			setWebHeight(data.height);
		}
		if (data.page && data.page.length > 3) {
			/* let params = { token: token, method: "clickarticle", did: did, page: data.page, code: data.id };
			http.post(ENV.mall + "?uid=" + uid, params); */
		}
	};

	const rippleAnim = React.useRef<Animated.Value>(new Animated.Value(0)).current;

	const startAnimation = () => {
		Animated.timing(rippleAnim, {
			toValue: 1,
			duration: 2000,
			delay: 1000,
			easing: Easing.bezier(0.85, 0, 0.15, 1),
			useNativeDriver: true,
		}).start(({ finished }) => {
			if (finished) {
				rippleAnim.setValue(0);
				startAnimation();
			}
		});
	};

	return (
		<View style={styles.scrollview_con}>
			{articledata.mp4URL && <View>
				<VideoPlayer
					source={articledata.mp4URL}
					poster={articledata.picURL}
				>
					<Animated.View style={[
						styles.video_ripple,
						{
							transform: [
								{
									scale: rippleAnim.interpolate({
										inputRange: [0, 1],
										outputRange: [1, 1.35],
									}),
								},
							],
							opacity: rippleAnim.interpolate({
								inputRange: [0, 0.6, 1],
								outputRange: [0, 0.6, 0],
							}),
						},
					]} />
				</VideoPlayer>
			</View>}
			<View style={isfull ? styles.hide_view : null}>
				{!articledata.mp4URL && <View style={styles.content_img}>
					<Image source={{ uri: ENV.image + articledata.coverimg, cache: "force-cache" }}
						style={{ width: Winwidth, height: articledata.tempH }} resizeMode="cover" />
				</View>}
				<View style={[styles.webview_con, { height: webheight }]}>
					<WebView
						ref={webview}
						originWhitelist={["*"]}
						scalesPageToFit={false}
						setBuiltInZoomControls={false}
						scrollEnabled={false}
						nestedScrollEnabled={false}
						showsHorizontalScrollIndicator={false}
						showsVerticalScrollIndicator={false}
						injectedJavaScript={INJECTED_JAVASCRIPT}
						onMessage={handleMessage}
						style={{ width: Winwidth - 48 }}
						source={{ html: articledata.html }} />
				</View>
				<View style={styles.btn_container}>
					<View style={[styles.btn_content, styles.btn_margin]}>
						<Icon name="time" size={16} color={theme.placeholder} />
						<Text style={styles.btn_text}>{articledata.tm}</Text>
					</View>
					<View style={[styles.btn_content, styles.btn_margin]}>
						<Icon name="look" size={16} color={theme.placeholder} />
						<Text style={styles.btn_text}>{articledata.view}</Text>
					</View>
					<View style={styles.btn_content}>
						<Icon name="share3" size={16} color={theme.placeholder} />
					</View>
				</View>
				<>
					<Text style={styles.title}>热门文章</Text>
					{(hotarticle && hotarticle.length > 0) && <FlatList
						data={hotarticle}
						horizontal={true}
						showsHorizontalScrollIndicator={false}
						contentContainerStyle={styles.contentContainer}
						keyExtractor={(item: any, index: number) => item.id}
						renderItem={({ item, index }: any) => {
							return (
								<View style={styles.itemContainer}>
									<Image style={styles.itemImg} source={{ uri: ENV.image + item.pic, cache: "force-cache" }} resizeMode="cover" />
									<Text style={styles.item_tit}>{item.title}</Text>
								</View>
							)
						}}
					/>}
				</>
			</View>
			<View style={styles.reply_con}>
				<Text style={styles.title}>热门评论</Text>
			</View>
		</View>
	)
})

const ArticleDetail = React.memo(({ route, navigation }: any) => {
	// 参数
	const { id } = route.params;

	// 控件

	// 数据
	const [loading, setLoading] = React.useState<boolean>(true); // 是否加载中
	const [isfull, setIsfull] = React.useState<boolean>(false); // 是否全屏显示
	const [showmenu, setShowMenu] = React.useState<boolean>(false); // 是否显示菜单
	const [replytext, setReplyText] = React.useState<string>(""); // 评论回复内容
	const [isfocus, setIsFocus] = React.useState<boolean>(false); // 是否获取焦点
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	// 变量
	let articledata = React.useRef<any>({}); // 文章数据
	let replydata = React.useRef<any>({}); // 评论数据
	let likelist = React.useRef<any>({}); // 是否收藏文章
	let likefavs = React.useRef<any>({}); // 点赞列表
	let isShowHeader = React.useRef<boolean>(false); // 是否显示头部
	let isShowFooter = React.useRef<boolean>(false); // 是否显示底部
	let noMore = React.useRef<boolean>(false); // 是否有更多数据
	let page = React.useRef<number>(1); // 当前页数
	let headerOpt = React.useRef(new Animated.Value(0)).current; // 头部透明度动画
	let footerOpt = React.useRef(new Animated.Value(0)).current; // 底部透明度动画
	let footerZ = React.useRef(new Animated.Value(0)).current; // 底部层级动画

	// 初始化数据
	React.useEffect(() => {
		articleService.fetchArticleData(classname, id);
		// 监听文章内视频是否全屏显示
		events.addListener(classname + id + "fullScreenChange", (fullval) => {
			setIsfull(fullval);
		})

		events.addListener(classname + id + "ArticleData", (data) => {
			articledata.current = articleService.getArticleData(classname, id);
			// 获取文章评论数据
			getArticleReply();

			let ids = [id];
			islike(ids)
			//统计商城UV，不要删
			http.post(ENV.mall + "?uid=" + us.user.uid, { token: us.user.token, method: "getarticle", did: us.did, page: "article", code: id }).then(() => { }).catch(() => { });

			// 根据文章内容判断状态栏颜色
			if (articledata.current.mp4URL) {
				StatusBar.setBarStyle("dark-content");
			} else {
				StatusBar.setBarStyle("light-content");
			}
		})

		Keyboard.addListener("keyboardDidShow", () => { setIsFocus(true); })
		Keyboard.addListener("keyboardDidHide", () => { setIsFocus(false); })

		return () => {
			events.removeAllListeners(classname + id + "fullScreenChange");
			events.removeAllListeners(classname + id + "ArticleData");
		}
	}, []);

	// 获取文章评论数据
	const getArticleReply = () => {
		if (noMore.current) return;
		http.post(ENV.article, { method: "getreplyv2", aid: id, pagesize: 50, page: page.current, from: 1 }).then((resp_data: any) => {
			if (page.current == 1) {
				replydata.current = resp_data;
			} else {
				replydata.current.items = replydata.current.items.concat(resp_data.items);
			}
			if (resp_data.items.length < 50) noMore.current = true;
			// this.setrefuname(replydata.current.items);
			favs(resp_data);
			if (page.current == 1) {
				events.emit(classname + id + "setArticleData", articledata.current);
				setTimeout(() => { setLoading(false) }, 1000);
			}
			setIsRender(false);
			setIsRender(true);
		});
	};

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



	// 获取用户是否收藏当前文章
	const islike = (ids: any[]) => {
		if (!us.user.uid) return;
		http.post(ENV.article, { method: "islike", uid: us.user.uid, ids: ids }).then((resp_data: any) => {
			for (let i in resp_data) {
				if (resp_data[i]) likelist.current[resp_data[i]] = true;
			}
		})
	}

	// 显示/隐藏右上角菜单
	const showMenu = () => {
		let isShowmenu = !showmenu;
		setShowMenu(isShowmenu);
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
				toValue: 200,
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

	// 收藏文章
	const favarticle = () => {
		showMenu();
		if (!us.user.uid) { return }
		http.post(ENV.article + '?uid=' + us.user.uid, {
			method: 'togglefav', aid: id, token: us.user.token
		}).then((resp_data: any) => {
			if (resp_data.msg == 'ADD') {
				likelist.current[id] = true;
				ToastCtrl.show({ message: "收藏成功", duration: 2000, viewstyle: 'short_toast' });
			} else if (resp_data.msg == 'REMOVE') {
				likelist.current[id] = false;
				ToastCtrl.show({ message: "已取消收藏", duration: 2000, viewstyle: 'short_toast' });
			} else if (resp_data.msg == 'TOKEN_ERR' || resp_data.msg == 'TOKEN_EXPIRE') {
				us.delUser();
				return;
			}
			articledata.current.favcnt = resp_data.favcnt;
		});
	}

	return (
		<>
			{loading && <View style={styles.loading_con}>
				<Image style={styles.loading_img} source={require("../../assets/images/loading.gif")} />
			</View>}
			<HeaderView
				data={{
					title: !articledata.current.mp4URL ? articledata.current.title2 : articledata.current.title,
					isShowSearch: false,
					showmenu,
					style: [
						{ display: isfull ? "none" : "flex" },
						!articledata.current.mp4URL ? styles.notmp4 : null
					],
					childrenstyle: {
						headercolor: { color: !articledata.current.mp4URL ? theme.toolbarbg : theme.text2 },
						headertitle: { opacity: !articledata.current.mp4URL ? headerOpt : 1 },
					}
				}}
				method={{
					back: () => { navigation.goBack(); Orientation.lockToPortrait(); },
				}}
				MenuChildren={() => {
					return (
						<>
							<Pressable style={styles.menu_icon_con}>
								<Icon style={styles.menu_icon} name="share2" size={14} color={theme.text1} />
								<Text style={styles.menu_text}>{"分享"}</Text>
							</Pressable>
							<Pressable style={[styles.menu_icon_con, styles.no_border_bottom]} onPress={favarticle}>
								{likelist.current[id] ? <Icon style={styles.menu_icon} name="heart-checked" size={16} color={theme.redchecked} /> : <Icon style={styles.menu_icon} name="heart" size={16} color={theme.text1} />}
								<Text style={styles.menu_text}>{"收藏"}</Text>
							</Pressable>
						</>
					)
				}}>
				{!articledata.current.mp4URL && <Animated.View style={[styles.coverimg_con, { opacity: headerOpt }]}>
					<View style={styles.coverimg_msk}></View>
					<Image source={{ uri: ENV.image + articledata.current.coverimg, cache: "force-cache" }} style={styles.coverimg} resizeMode="cover" />
				</Animated.View>}
				<Pressable style={{ zIndex: 1 }} onPress={showMenu}>
					<Icon name="sandian" size={20} color={!articledata.current.mp4URL ? theme.toolbarbg : theme.text2} style={styles.title_icon} />
				</Pressable>
			</HeaderView>
			<FlatList data={replydata.current.items}
				onScroll={(e) => {
					showHeaderView(e);
					showFooterView(e);
				}}
				keyExtractor={(item: any, index: number) => item.id}
				onEndReachedThreshold={0.1}
				onEndReached={(info: any) => {
					if (replydata.current.items) {
						page.current++;
						getArticleReply();
					}
				}}
				ListHeaderComponent={<HeaderWebView articleid={id} />}
				contentContainerStyle={styles.flatlist_con}
				removeClippedSubviews={true}
				renderItem={({ item, index }: any) => {
					return (
						<View style={[styles.replyitem_con, { borderBottomColor: index == replydata.current.items.length - 1 ? "transparent" : theme.bg, }]}>
							{item.uid > 0 && <Image source={{ uri: ENV.avatar + item.uid + ".jpg!l?" + item.uface }} style={styles.replyitem_img} resizeMode="cover" />}
							{!(item.uid > 0) && <Image source={{ uri: "https:" + item.wxavatar }} style={styles.replyitem_img} resizeMode="cover" />}
							<View style={styles.replyitem_uname_con}>
								{item.uid > 0 && <Text style={styles.replyitem_uname}>{item.uname}</Text>}
								{!(item.uid > 0) && <Text style={styles.replyitem_uname}>{item.wxnick}</Text>}
							</View>
							<View style={styles.replyitem_text_con}>
								<Text style={styles.replyitem_text} numberOfLines={5}>
									{item.content}
								</Text>
							</View>
							<View style={styles.replyitem_btn_con}>
								<Text style={styles.replyitem_time}>{item.actime}</Text>
								<View style={styles.replyitem_btn}>
									<Icon name="reply" size={15} color={theme.placeholder2} />
									<View style={styles.replyitem_upbtn}>
										{likefavs.current[item.id] ? <Icon name="up-checked" size={15} color={theme.placeholder2} /> : <Icon name="up" size={15} color={theme.placeholder2} />}
										{item.up > 0 && <Text style={styles.replyitem_uptext}>{item.up}</Text>}
									</View>
								</View>
							</View>
							{item.sub && item.sub.length > 0 && <View style={styles.replysub_con}>
								{item.sub.map((sub: any, subindex: number) => {
									return (
										<View key={sub.id} style={{ position: "relative" }}>
											{sub.uid > 0 && <Image source={{ uri: ENV.avatar + sub.uid + ".jpg!l?" + sub.uface }} style={styles.replysub_img} resizeMode="cover" />}
											<View style={[styles.replysub_text_con, subindex == 0 ? styles.first_replysub_text_con : null]}>
												<View style={styles.replysub_uname_con}>
													<Text style={styles.replysub_uname}>{sub.uname}</Text>
												</View>
												<View style={{ marginTop: 6 }}>
													<Text style={styles.replyitem_text}>{sub.content}</Text>
												</View>
												<View style={[styles.replyitem_btn_con, { marginTop: 6, marginLeft: 0, }]}>
													<Text style={styles.replyitem_time}>{sub.actime}</Text>
													<View style={styles.replyitem_btn}>
														<Icon name="reply" size={15} color={theme.placeholder2} />
														<View style={styles.replyitem_upbtn}>
															{likefavs.current[sub.id] ? <Icon name="up-checked" size={15} color={theme.placeholder2} /> : <Icon name="up" size={15} color={theme.placeholder2} />}
															{sub.up > 0 && <Text style={styles.replyitem_uptext}>{sub.up}</Text>}
														</View>
													</View>
												</View>
											</View>
										</View>
									)
								})}
							</View>}
						</View>
					)
				}}
				ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={replydata.current.items && replydata.current.items.length > 0} />}
			/>
			{isfocus && <Pressable style={styles.bgmsk} onPress={() => { Keyboard.dismiss(); }}></Pressable>}
			<FooterView
				data={{ placeholder: "快快告诉我，你在想什么", replytext, opacity: footerOpt, zIndex: footerZ }}
				method={{ setReplyText }}>
				{!isfocus && <View style={styles.footer_icon_con}>
					<View style={styles.footer_icon}>
						<Icon name="reply" size={16} color={theme.fav} />
						<Text style={styles.footer_text}>{articledata.current.replycnt}</Text>
					</View>
					<View style={styles.footer_icon}>
						{likelist.current[id] ? <Icon name="heart-checked" size={16} color={theme.redchecked} /> : <Icon name="heart" size={16} color={theme.fav} />}
						<Text style={styles.footer_text}>{articledata.current.favcnt}</Text>
					</View>
					<Icon name="share2" size={14} color={theme.fav} />
				</View>}
			</FooterView>
		</>
	);
})

const styles = StyleSheet.create({
	loading_con: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 99,
		backgroundColor: theme.toolbarbg,
		alignItems: "center",
		justifyContent: "center",
	},
	loading_img: {
		width: 32,
		height: 32,
		opacity: .8,
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
		aspectRatio: (200 - 15) / 120,
		marginLeft: 15,
		borderRadius: 10,
		overflow: "hidden",
		backgroundColor: theme.bg
	},
	itemImg: {
		width: "100%",
		aspectRatio: 200 / 120,
		borderRadius: 10,
	},
	item_tit: {
		position: "absolute",
		top: "50%",
		transform: [{ translateY: -20 }],
		paddingHorizontal: 15,
		color: theme.toolbarbg,
		textAlign: "center",
		fontSize: 14,
	},
	reply_con: {
		borderTopWidth: 6,
		borderTopColor: theme.bg,
		backgroundColor: "#FCFCFC",
		height: "auto",
	},
	flatlist_con: {
		backgroundColor: "#FCFCFC",
		height: "auto",
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
	replyitem_text_con: {
		marginLeft: 40,
		marginTop: 5,
		marginBottom: 13,
	},
	replyitem_text: {
		fontSize: 13,
		color: theme.text2,
	},
	replyitem_btn_con: {
		flexDirection: "row",
		alignContent: "center",
		justifyContent: "space-between",
		marginLeft: 43,
		marginBottom: 8,
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
		borderBottomWidth: 0,
	},
	replysub_text_con: {
		marginLeft: 30,
		marginBottom: 10,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(224,224,224,.8)"
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
	bgmsk: {
		position: "absolute",
		top: 0,
		bottom: 0,
		right: 0,
		left: 0,
		backgroundColor: "rgba(0,0,0,0.5)",
		zIndex: 12
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
	menu_icon_con: {
		paddingLeft: 5,
		paddingVertical: 13,
		paddingRight: 9,
		alignItems: "center",
		flexDirection: "row",
		borderBottomWidth: 1,
		borderBottomColor: theme.bg
	},
	no_border_bottom: {
		borderBottomWidth: 0,
	},
	menu_icon: {
		marginRight: 9,
		marginTop: 2,
	},
	menu_text: {
		fontSize: 14,
		color: theme.tit2,
		marginRight: 15,
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