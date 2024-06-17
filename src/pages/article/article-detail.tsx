import React from "react";
import { View, Text, StatusBar, Pressable, StyleSheet, Image, FlatList, Keyboard, useWindowDimensions, Animated } from "react-native";

import { WebView } from "react-native-webview";
import Orientation from "react-native-orientation-locker";
import FastImage from "react-native-fast-image";

import HeaderView from "../../components/headerview";
import FooterView from "../../components/footerview";
import VideoPlayer from "../../components/videoplayer";
import ListBottomTip from "../../components/listbottomtip";
import ToastCtrl from "../../components/toastctrl";
import SharePopover from "../../components/popover/share-popover";
import { ModalPortal, SlideAnimation } from "../../components/modals";

import us from "../../services/user-service/user-service";
import articleService from "../../services/article-service/article-service";

import events from "../../hooks/events/events";

import http from "../../utils/api/http";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";
import RenderHtml from "../../components/renderhtml";

const classname = "ArticleDetail";

const ArticleDetail = React.memo(({ navigation, route }: any) => {
	// 参数
	const { id } = route.params;
	// 控件
	const windowD = useWindowDimensions();

	// 状态
	const [loading, setLoading] = React.useState<boolean>(true); // 是否加载中
	const [isfull, setIsfull] = React.useState<boolean>(false); // 是否全屏显示
	const [showmenu, setShowMenu] = React.useState<boolean>(false); // 是否显示菜单
	const [isfocus, setIsFocus] = React.useState<boolean>(false); // 是否获取焦点
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据
	let isShowHeader = React.useRef<boolean>(false); // 是否显示头部
	let isShowFooter = React.useRef<boolean>(false); // 是否显示底部
	let noMore = React.useRef<boolean>(false); // 是否有更多数据

	// 变量
	const [replytext, setReplyText] = React.useState<string>(""); // 评论回复内容
	let headerOpt = React.useRef(new Animated.Value(0)).current; // 头部透明度动画
	let footerOpt = React.useRef(new Animated.Value(0)).current; // 底部透明度动画
	let footerZ = React.useRef(new Animated.Value(-1)).current; // 底部层级动画
	// 数据
	let articledata = React.useRef<any>({}); // 文章数据
	let hotarticle = React.useRef<any>([]); // 热门文章
	let replydata = React.useRef<any>({}); // 评论数据
	let likelist = React.useRef<any>({}); // 是否收藏文章
	let likefavs = React.useRef<any>({}); // 点赞列表
	let page = React.useRef<number>(1); // 当前页数

	// 初始化数据
	React.useEffect(() => {
		articleService.fetchArticleData(classname, id);
		// 监听文章内视频是否全屏显示
		events.subscribe(classname + id + "fullScreenChange", (fullval) => {
			setIsfull(fullval);
		})

		console.log("%c Line:280 🍇", "color:#f5ce50");
		events.subscribe(classname + id + "ArticleData", (data) => {
			articledata.current = articleService.getArticleData(classname, id);
			articleService.fetchHotArticle(articledata.current.tag);
		})

		events.subscribe(classname + id + "HotArticle", (data) => {
			hotarticle.current = data;
			// 获取文章评论数据
			getArticleReply();

			let ids = [id];
			islike(ids)
			// 统计商城UV，不要删
			http.post(ENV.mall + "?uid=" + us.user.uid, {
				token: us.user.token, method: "getarticle", did: us.did, page: "article", code: id
			}).then(() => { }).catch(() => { });

			// 根据文章内容判断状态栏颜色
			if (articledata.current.mp4URL) {
				StatusBar.setBarStyle("dark-content", true);
			} else {
				StatusBar.setBarStyle("light-content", true);
			}
		})

		Keyboard.addListener("keyboardDidShow", () => { setIsFocus(true); })
		Keyboard.addListener("keyboardDidHide", () => { setIsFocus(false); })

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
			if (page.current == 1) {
				replydata.current = resp_data;
			} else {
				replydata.current.items = replydata.current.items.concat(resp_data.items);
			}
			if (resp_data.items.length < 50) noMore.current = true;
			// this.setrefuname(replydata.current.items);
			favs(resp_data);
			if (page.current == 1) {
				events.publish(classname + id + "setArticleData", articledata.current);
				setTimeout(() => { setLoading(false) }, 1000);
			}
			setIsRender(val => !val);
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

	// 收藏文章
	const favarticle = () => {
		setShowMenu(val => !val);
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App文章页" } });
		}
		http.post(ENV.article + "?uid=" + us.user.uid, {
			method: "togglefav", aid: id, token: us.user.token
		}).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				likelist.current[id] = true;
				ToastCtrl.show({ message: "收藏成功", duration: 2000, viewstyle: "short_toast", key: "fav_add_toast" });
			} else if (resp_data.msg == "REMOVE") {
				likelist.current[id] = false;
				ToastCtrl.show({ message: "已取消收藏", duration: 2000, viewstyle: "short_toast", key: "fav_remove_toast" });
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App文章页" } });
			}
			articledata.current.favcnt = resp_data.favcnt;
		});
	}

	// 处理评论数
	const unitNumber = (number: number) => {
		return articleService.unitNumber(number, 1);
	}

	const gotodetail = (page: any, id: number) => {
		console.log("%c Line:235 🍫", "color:#93c0a4");
		if (page == "item-detail") {
			navigation.navigate("Page", { screen: "ItemDetail", params: { id, src: "APP文章:" + id } });
		} else if (page == "mall-item") {
			navigation.navigate("Page", { screen: "MallItem", params: { id, src: "APP文章:" + id } });
		} else if (page == 'mall-heji') {
			navigation.navigate("Page", { screen: "MallHeji", params: { id, src: "APP文章:" + id } });
		} else if (page == 'mall-group') {
			navigation.navigate("Page", { screen: "MallGroup", params: { id, src: "APP文章:" + id, word: 1 } });
		}
	}

	return (
		<>
			{loading && <View style={[styles.loading_con, isfull && styles.hide_view]}>
				<Image style={styles.loading_img} source={require("../../assets/images/loading.gif")} />
			</View>}
			<HeaderView data={{
				title: !articledata.current.mp4URL ? articledata.current.title2 : articledata.current.title,
				isShowSearch: false,
				showmenu,
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
			}} MenuChildren={() => {
				return (
					<>
						<Pressable style={Globalstyles.menu_icon_con} onPress={() => {
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
							setShowMenu(val => !val);
						}}>
							<Icon style={Globalstyles.menu_icon} name="share2" size={14} color={theme.text1} />
							<Text style={Globalstyles.menu_text}>{"分享"}</Text>
						</Pressable>
						<Pressable style={[Globalstyles.menu_icon_con, Globalstyles.no_border_bottom]} onPress={favarticle}>
							<Icon style={Globalstyles.menu_icon} name={likelist.current[id] ? "heart-checked" : "heart"} size={14}
								color={likelist.current[id] ? theme.redchecked : theme.text1} />
							<Text style={Globalstyles.menu_text}>{"收藏"}</Text>
						</Pressable>
					</>
				)
			}}>
				{!articledata.current.mp4URL && <Animated.View style={[styles.coverimg_con, { opacity: headerOpt }]}>
					<View style={styles.coverimg_msk}></View>
					<Image source={{ uri: ENV.image + articledata.current.coverimg, cache: "force-cache" }} style={styles.coverimg} resizeMode="cover" />
				</Animated.View>}
				<Pressable style={{ zIndex: 1 }} onPress={() => { setShowMenu(val => !val) }}>
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
				ListHeaderComponent={<>
					{articledata.current.mp4URL && <VideoPlayer
						source={articledata.current.mp4URL}
						poster={articledata.current.picURL}
						classname={classname + id}>
						{/* <Animated.View style={[
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
							]} /> */}
					</VideoPlayer>}
					<View style={[styles.scrollview_con, isfull && styles.hide_view]}>
						<View>
							{!articledata.current.mp4URL && <View style={styles.content_img}>
								<Image source={{ uri: ENV.image + articledata.current.coverimg }}
									style={{ width: windowD.width, height: articledata.current.tempH }}
								/>
							</View>}
							<View style={styles.webview_con}>
								{articledata.current.html && <RenderHtml
									contentWidth={windowD.width - 48}
									html={`<div class='content' id='content'><p>2024香水基金会颁奖典礼在林肯中心大卫·H·科赫剧院举行。今年是香水基金会成立<strong>75周年</strong>，全场座无虚席，观看人数更是突破纪录。</p><p><strong><span style="color:#222"><span style="color:#222">菲菲奖 The Fragrance Foundation Awards</span></span></strong></p><p><img src="https://img.xssdcdn.com/article/690/2024S900x900.jpg"/></p><p></p><p>今年的获奖名单仍有很多熟悉的面孔，而一些奖项的获奖香水也让人有些意外。接下来，香水时代为大家带来2024TFF奖完整版获奖名单。</p><p></p><p><br/></p><p><a href='#/?{"page":"item-detail","id":781451}'><img src="https://img.xssdcdn.com/article/690/001S1080x274.jpg"/></a></p><center><small><a href='#/?{"page":"item-detail","id":781451}'><img src="https://img.xssdcdn.com/article/690/1S1000x1000.jpg"/></a></small></center></div>`}
									ignoreDomNode={(node: any) => {
										return (
											node.name === "div" && (node.attribs.class === "title" || node.attribs.class === "author")
										)
									}}
									tagsStyles={{
										p: {
											paddingVertical: 4,
											lineHeight: 29,
											margin: 0,
										},
										a: {
											color: "#6979bf",
											textDecorationLine: "none"
										}
									}}
									onPress={gotodetail}
								/* customHTMLElementModels={{
									"center": HTMLElementModel.fromCustomModel({
										tagName: "center",
										mixedUAStyles: {
											textAlign: "center",
										},
										contentModel: HTMLContentModel.block
									}),
								}} */
								/* renderers={{
									img: (props: any) => {
										let imgWH: any[] = [],
											tempW: number = windowD.width - 48,
											tempH: number = 0;
										const { rendererProps } = useInternalRenderer("img", props);
										const cover = rendererProps.source.uri;
										if (cover) {
											imgWH = cover.split(/S(\d+)x(\d+)/g);
											if (imgWH) {
												tempH = imgWH[2] * tempW / imgWH[1];
											}
										}
										return (
											<FastImage style={{ width: tempW, height: tempH }}
												source={{ uri: cover }} />
										)
									}
								}}
								renderersProps={{
									a: {
										onPress: (event: any, href: string) => {
											let obj = JSON.parse(href.substr(href.indexOf("?") + 1).replace(/%22/g, '"'));
											gotodetail(obj.page, obj.id);
										}
									}
								}} */
								/>}
							</View>
							<View style={styles.btn_container}>
								<View style={[styles.btn_content, styles.btn_margin]}>
									<Icon name="time" size={16} color={theme.placeholder} />
									<Text style={styles.btn_text}>{articledata.current.tm}</Text>
								</View>
								<View style={[styles.btn_content, styles.btn_margin]}>
									<Icon name="look" size={16} color={theme.placeholder} />
									<Text style={styles.btn_text}>{articledata.current.view}</Text>
								</View>
								<View style={styles.btn_content}>
									<Icon name="share3" size={16} color={theme.placeholder} />
								</View>
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
				</>}
				contentContainerStyle={styles.flatlist_con}
				removeClippedSubviews={true}
				renderItem={({ item, index }: any) => {
					return (
						<View style={[
							styles.replyitem_con,
							isfull && styles.hide_view,
							{ borderBottomColor: index == replydata.current.items.length - 1 ? "transparent" : theme.bg }
						]}>
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
				ListFooterComponent={<ListBottomTip noMore={noMore.current}
					isShowTip={replydata.current.items && replydata.current.items.length > 0}
					style={isfull && styles.hide_view}
				/>}
			/>
			{isfocus && <Pressable style={[Globalstyles.keyboardmask, isfull && styles.hide_view]} onPress={() => { Keyboard.dismiss(); }}></Pressable>}
			<FooterView data={{
				placeholder: "快快告诉我，你在想什么", replytext,
				opacity: footerOpt, zIndex: !isfocus ? footerZ : 13,
				style: isfull && styles.hide_view
			}} method={{ setReplyText }}>
				{!isfocus && <View style={styles.footer_icon_con}>
					<View style={styles.footer_icon}>
						<Icon name="reply" size={16} color={theme.fav} />
						{articledata.current.replycnt > 0 && <Text style={styles.footer_text}>{unitNumber(articledata.current.replycnt)}</Text>}
					</View>
					<View style={styles.footer_icon}>
						<Icon name={likelist.current[id] ? "heart-checked" : "heart"}
							size={16} color={likelist.current[id] ? theme.redchecked : theme.fav}
						/>
						{articledata.current.favcnt > 0 && <Text style={styles.footer_text}>{unitNumber(articledata.current.favcnt)}</Text>}
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