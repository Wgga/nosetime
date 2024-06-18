import React from "react";
import { View, Text, StatusBar, Pressable, StyleSheet, Image, FlatList, Keyboard, useWindowDimensions, Animated, ScrollView } from "react-native";

import { WebView } from "react-native-webview";
import Orientation from "react-native-orientation-locker";
import FastImage from "react-native-fast-image";
import { FlashList } from "@shopify/flash-list";

// import RenderHtml from "../../components/renderhtml";
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
import AutoSizeImage from "../../components/renderhtml/autosizeimage";
import RenderHtml, { HTMLContentModel, HTMLElementModel, useInternalRenderer } from "react-native-render-html";

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

		events.subscribe(classname + id + "ArticleData", (data) => {
			articledata.current = articleService.getArticleData(classname, id);
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
			<FlashList data={replydata.current.items}
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
								{/* {articledata.current.html && <RenderHtml
									contentWidth={windowD.width - 48} html={articledata.current.html} ignoreDomNode={(node: any) => {
										return (
											node.name === "div" && (node.attribs.class === "title" || node.attribs.class === "author")
										)
									}} tagsStyles={{
										p: {
											paddingVertical: 4,
											lineHeight: 29,
											margin: 0,
										},
										a: {
											color: "#6979bf",
											textDecorationLine: "none"
										}
									}} onPress={gotodetail}
								/>} */}
								{articledata.current.html && <RenderHtml
									contentWidth={windowD.width - 48}
									source={{ html: articledata.current.html }}
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
									customHTMLElementModels={{
										"center": HTMLElementModel.fromCustomModel({
											tagName: "center",
											mixedUAStyles: {
												textAlign: "center",
											},
											contentModel: HTMLContentModel.block
										}),
									}}
									renderers={{
										img: (props: any) => {
											const { rendererProps } = useInternalRenderer("img", props);
											return (
												<AutoSizeImage contentWidth={(windowD.width - 48)} source={{ uri: rendererProps.source.uri }} />
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
									}}
								/>}
								{/* <View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"2024香水基金会颁奖典礼在林肯中心大卫·H·科赫剧院举行。今年是香水基金会成立"}</Text>
											<Text style={styles.strong}>{"75周年"}</Text>
											<Text>{"，全场座无虚席，观看人数更是突破纪录。"}</Text>
										</Text>
									</View>
									<View style={styles.p}>
										<Text style={styles.strong}>
											<Text style={{ color: "#222" }}>
												<Text style={{ color: "#222" }}>菲菲奖 The Fragrance Foundation Awards</Text>
											</Text>
										</Text>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"全称"}</Text>
											<Text style={styles.strong}>{"香水基金会大奖"}</Text>
											<Text>{"，被誉为"}</Text>
											<Text style={styles.strong}>{"“香水界的奥斯卡”"}</Text>
											<Text>{"，从1973年开办至今，已成为全球香水界一年一度的盛事。参选香水来自全球各大香水会员国的推荐，经过消费者及评审团票选的激烈竞争，最终评选出年度获奖名单。奖项兼具专业与商业的双重属性，参与评选的多以商业品牌为主。"}</Text>
										</Text>
									</View>
									<View style={styles.p}>
										<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/2024S900x900.jpg"} />
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											{"今年的获奖名单仍有很多熟悉的面孔，而一些奖项的获奖香水也让人有些意外。接下来，香水时代为大家带来2024TFF奖完整版获奖名单。"}
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 781451)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/001S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 781451)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/1S1000x1000.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"前调是类似"}</Text>
											<Text style={styles.textline}>{"水果乳酸菌饮料"}</Text>
											<Text>{"的味道，甜度很高。后调木质感逐渐强烈，伴随着"}</Text>
											<Text style={styles.textline}>{"淡淡的烟熏感"}</Text>
											<Text>{"，是一支甜酷风格的女香。比同系列的男香闻起来要有个性一些。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 806899)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/2S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 806899)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/02S1000x915.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={{ textAlign: "right" }}>
											<Text style={{ fontSize: 14 }}>{"△点击购买"}</Text>
										</Text>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"和原版相比，香精版本的"}</Text>
											<Text style={styles.textline}>{"柠檬和木质变得更加突出"}</Text>
											<Text>{"，衬托着爽朗的薰衣草和鼠尾草。在保持原有清爽感的同时，整体质感会更加冷冽和现代。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 819142)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/03S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 819142)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/3S800x600.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={{ textAlign: "right" }}>
											<Text style={{ fontSize: 14 }}>{"△点击购买"}</Text>
										</Text>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"丝滑的香草，再点缀上微苦的杏仁，变成了类似"}</Text>
											<Text style={styles.textline}>{"杏仁露的味道"}</Text>
											<Text>{"。官方写的是中性香，但是这个味道还是更适合女生。不得不说，TF营销功力一向深厚，禁忌欲望的概念话题度又有了。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 445761)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/04S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 445761)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/4S2500x2500.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={{ textAlign: "right" }}>
											<Text style={{ fontSize: 14 }}>{"△点击购买"}</Text>
										</Text>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"2007年上市，如今依旧备受少女们的喜爱。"}</Text>
											<Text style={styles.textline}>{"酸甜可口的果香仿佛鲜榨的果汁"}</Text>
											<Text>{"，加入少量的绿叶气息化解甜腻感，闻起来更加清新通透。香气充满元气，是永不过时的少女的味道。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 318250)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/05S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 318250)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/5S2048x2329.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={{ textAlign: "right" }}>
											<Text style={{ fontSize: 14 }}>{"△点击购买"}</Text>
										</Text>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text style={styles.textline}>{"香草和可可细腻得像一阵粉雾"}</Text>
											<Text>{"，搭配上蓬松干燥的薰衣草，在皮肤上呈现出温柔暖甜的气息。它的香气甜而不齁，而是梦幻又撩人，高级感满满。金灿灿的瓶身更被很多人当成开运神器。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 910661)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/06S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 910661)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/6S976x976.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={{ textAlign: "right" }}>
											<Text style={{ fontSize: 14 }}>{"△点击购买"}</Text>
										</Text>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"圣罗兰近些年走向了商业化的极端。"}</Text>
											<Text style={styles.textline}>{"薰衣草、橙花加过量的降龙涎香醚"}</Text>
											<Text>{"，闻到的瞬间脑海里会闪过众多商业馥奇男香。中外口碑相差很大，是一支完全向市场妥协的产物。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 492449)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/07S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 492449)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/7S769x523.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={{ textAlign: "right" }}>
											<Text style={{ fontSize: 14 }}>{"△点击购买"}</Text>
										</Text>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"花园系列的新作，风格和前作有了很大的改变。"}</Text>
											<Text style={styles.textline}>{"充满活力的柑橘"}</Text>
											<Text>{"，再结合开心果带有奶香味的香气，想象不出来花园，倒是混合出了一杯甜甜的燕麦奶。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 203187)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/012S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 203187)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/zmlS1100x810.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={{ textAlign: "right" }}>
											<Text style={{ fontSize: 14 }}>{"△点击购买"}</Text>
										</Text>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"这是一支"}</Text>
											<Text style={styles.textline}>{"七分熟的新鲜青梨"}</Text>
											<Text>{"，清甜的梨香伴随着脂粉感的花香，真是温柔到了骨子里。它的广告也很有创意，一个个从梨树上掉下来的香水瓶，就像瓶中装着的是真实的梨子。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 633584)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/09S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 633584)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/9S800x800.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={{ textAlign: "right" }}>
											<Text style={{ fontSize: 14 }}>{"△点击购买"}</Text>
										</Text>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"这是一款简单、轻盈的香水。"}</Text>
											<Text style={styles.textline}>{"清爽的柑橘带来一个明亮充满活力的开场"}</Text>
											<Text>{"，香草和牡丹带来朦胧的脂粉花香。味道不算新颖，胜在甜美、好穿。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 374781)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/010S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 374781)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/10S960x960.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text style={styles.textline}>{"薰衣草和香根草"}</Text>
											<Text>{"的组合，和市面上大多数的男香差别不大。香根草丰富的气味被浓厚的脂粉感遮盖了大半，作为一款男香，还是有些太甜了。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 983422)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/011S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 983422)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/11S4872x4872.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"碧梨的香水连续三年获得这个奖项， No.3是一支木质东方调的香水，"}</Text>
											<Text style={styles.textline}>{"甜美的果香融合温暖的木质和琥珀"}</Text>
											<Text>{"，在藏红花的催化下，尽显性感和妩媚。瓶身也换成了与之相配的暗红色。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 498874)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/640S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 498874)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/12S1800x1500.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={{ textAlign: "right" }}>
											<Text style={{ fontSize: 14 }}>{"△点击购买"}</Text>
										</Text>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"安娜苏SUNDAE系列的包装把食玩风格贯彻到底。圆筒型的包装，搭配上"}</Text>
											<Text style={styles.textline}>{"马卡龙色系的仿真冰淇凌瓶"}</Text>
											<Text>{"，童趣少女风完全就是安娜苏的统治区。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 131922)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/013S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 131922)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/13S1264x1264.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"今年的奢华包装没有往年的花哨。法兰西防御是国际象棋一个古老的开局体系，香水瓶身的设计也参考了"}</Text>
											<Text style={styles.textline}>{"国际象棋的棋子"}</Text>
											<Text>{"，设计虽然简单，但是黑色的金属瓶身看起来还是很有质感的。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 165548)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/014S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 165548)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/14S1077x1077.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"作为橙花狂热爱好者，路易十四曾经建造了欧洲最大的橙子园，这支香水就以此为灵感。"}</Text>
											<Text style={styles.textline}>{"高浓度的橙花搭配淋了蜂蜜的木质"}</Text>
											<Text>{"，如同一片洒满阳光的橙子园，温暖明亮。并且每支香水都添加了真金箔，太奢华了！"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 308171)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/015S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 308171)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/15S700x700.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"香如其名，开场是"}</Text>
											<Text style={styles.textline}>{"鲜嫩多汁的荔枝"}</Text>
											<Text>{"，之后清甜的玫瑰占据主场，伴有香槟酒一样的气泡感。整体香气清新又水润，可惜留香实在太短了。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 900396)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/016S1080x274.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Pressable onPress={() => {
											gotodetail("item-detail", 900396)
										}}>
											<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/16S2048x2329.jpg"} />
										</Pressable>
									</View>
									<View style={styles.p}>
										<Text style={{ textAlign: "right" }}>
											<Text style={{ fontSize: 14 }}>{"△点击购买"}</Text>
										</Text>
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text style={styles.textline}>{"干燥的烟丝淋上浓稠的蜂蜜"}</Text>
											<Text>{"，同时夹杂着一丝动物气息，营造出独特的暖甜氛围。但是整体香气似乎并不和谐，于是引来众多香友的吐槽“娇兰又翻车了……”"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/0018S1080x274.jpg"} />
									</View>
									<View style={styles.p}>
										<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/17S1200x1200.jpg"} />
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"罗勒与薄荷交织出清凉的绿意，加上青涩的无花果和充满气泡感的柠檬。仿佛是"}</Text>
											<Text style={styles.textline}>{"雨后的空气"}</Text>
											<Text>{"，清新通透，提振情绪。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/019S1080x274.jpg"} />
									</View>
									<View style={styles.p}>
										<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/18S1200x675.jpg"} />
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Text>{"Gilles Andrier于1993年加入奇华顿，在2005年升任首席执行官。在他的领导下，奇华顿在全球市场中实现了显著扩张，并重新定义了公司的战略方向，巩固了奇华顿在全球香氛与美容市场的领先地位。"}</Text>
										</Text>
									</View>

									<View style={styles.p}>
										<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/020S1080x274.jpg"} />
									</View>
									<View style={styles.p}>
										<AutoSizeImage contentWidth={(windowD.width - 48)} src={ENV.image + "/article/690/19S1000x500.jpg"} />
									</View>
									<View style={styles.p}>
										<Text style={styles.ptext}>
											<Pressable onPress={() => {
												gotodetail("wiki-detail", 12059302)
											}}>
												<Text style={styles.strong}>{"Jacques Cavallier Belletrud"}</Text>
											</Pressable>
											<Text>{"出生于格拉斯的香水世家，2004年曾获得Prix Francois Coty的冠军。他认为香气与记忆、情绪紧密相连。代表作数不胜数，宝格丽 大吉岭茶、三宅一生一生之水……目前他担任LV的专属调香师。"}</Text>
										</Text>
									</View>

								</View> */}
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