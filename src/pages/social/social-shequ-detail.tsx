import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image, Keyboard, ScrollView } from "react-native";

import { Brightness } from "react-native-color-matrix-image-filters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";
import { ShadowedView } from "react-native-fast-shadow";
import FastImage from "react-native-fast-image";

import HeaderView from "../../components/headerview";
import ToastCtrl from "../../components/toastctrl";
import ListBottomTip from "../../components/listbottomtip";
import FooterView from "../../components/footerview";

import us from "../../services/user-service/user-service";
import articleService from "../../services/article-service/article-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";
import events from "../../hooks/events/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlelevelLeft, handlelevelTop } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

const ReplyItem = React.memo(({ item, islike }: any) => {

	const handledesc = (desc: string) => {
		let sz: any[] = [];
		sz = desc.replace(/\r/g, "").replace(/\n\n/g, "\n").split(/\n/g).map((item: string, index: number) => {
			return (<Text key={index} style={styles.reply_text}>{item}</Text>)
		})
		return sz;
	};

	return (
		<View style={styles.reply_item}>
			<FastImage style={styles.reply_image}
				source={{ uri: ENV.avatar + item.uid + ".jpg?!l" + item.uface }}
				resizeMode="contain"
			/>
			<View style={{ flex: 1, marginLeft: 11 }}>
				<View style={styles.item_flex_row}>
					<View style={[styles.info_name_con, { marginLeft: 0 }]}>
						<Text style={[styles.info_name, { fontSize: 13 }]}>{item.uname}</Text>
						<View style={Globalstyles.level}>
							<Image
								style={[Globalstyles.level_icon, handlelevelLeft(item.ulevel), handlelevelTop(item.ulevel)]}
								defaultSource={require("../../assets/images/nopic.png")}
								source={require("../../assets/images/level.png")}
							/>
						</View>
					</View>
					<Pressable onPress={() => { }}>
						<Icon name="shequsandian" size={16} color={theme.placeholder} />
					</Pressable>
				</View>
				<View style={styles.main_desc}>{handledesc(item.desc)}</View>
				<View style={[styles.item_flex_row, { marginBottom: 8 }]}>
					<Text style={styles.main_time}>{item.cttime}</Text>
					<View style={styles.reply_up}>
						<Icon name={islike ? "up-checked" : "up"} size={15} color={theme.placeholder2} />
						<Text style={styles.up_cnt}>{item.up}</Text>
					</View>
				</View>
			</View>
		</View>
	)
})

const ReplyImage = React.memo(({ index, uri }: any) => {

	const [imagedata, setImageData] = React.useState<any>({
		width: 1,
		height: 1,
	});

	return (
		<Image key={"image" + index}
			source={{ uri: ENV.image + uri }}
			onLoad={({ nativeEvent: { source: { width, height } } }: any) => {
				setImageData({ width, height })
			}}
			style={{ marginBottom: 13, width: width - 40, aspectRatio: imagedata.width / imagedata.height }}
		/>
	)
})

const SocialShequDetail = React.memo(({ navigation, route }: any) => {

	// 控件
	const insets = useSafeAreaInsets();
	const classname = "SocialShequDetailPage";
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
	const [replytext, setReplyText] = React.useState<string>(""); // 评论回复内容
	// 数据
	let pages = React.useRef<any>({
		page: 1, items: [], loaded: 0, full: 0,
	});
	let item0 = React.useRef<any>({ uid: 0, desc: "" });
	let items_top = React.useRef<any[]>([]);
	let pagecnt = React.useRef<number>(0);
	let pagenum = React.useRef<any>([]);
	let currentpage = React.useRef<number>(1);
	let like_ = React.useRef<any>({}); // 用户喜欢的数据ID列表
	// 状态
	let noMore = React.useRef<boolean>(false);
	let isemptydata = React.useRef<boolean>(false);
	const [isfocus, setIsFocus] = React.useState<boolean>(false); // 是否获取焦点
	const [showmenu, setShowMenu] = React.useState<boolean>(false); // 是否显示菜单
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据
	const [showPage, setShowPage] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (route.params) {
			fromid.current = route.params.id ? route.params.id : 0;
			id.current = route.params.ctdlgid ? route.params.ctdlgid : 0;
		}

		Keyboard.addListener("keyboardDidShow", () => { setIsFocus(true); })
		Keyboard.addListener("keyboardDidHide", () => { setIsFocus(false); })

		init()
	}, [])

	const init = () => {
		pages.current = { page: 1, items: [], loaded: 0, full: 0 };
		load("init");
		if (fromid.current && fromid.current > 0) {
			http.get(ENV.shequ + "?method=getshequdetailpage&dlgid=" + id.current + "&fromid=" + fromid.current).then((resp_data: any) => {
				console.log("%c Line:44 🍊 resp_data", "color:#42b983", resp_data);
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
			if (pages.current.page == 1 && item0.current.uid == 0) item0.current = resp_data.item0;

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

	const handledesc = (desc: string) => {
		let sz: any[] = [];
		sz = desc.split(/\[img\]|\[\/img\]/).map((part: string, index: number) => {
			if (part.includes(".jpg")) {
				return <ReplyImage index={index} uri={part} />
			} else if (part) {
				return <Text key={"text" + index} style={styles.reply_text}>{part}</Text>;
			}
		});
		return sz;
	}

	const go = (page: number) => {

	}

	const unitNumber = (number: number) => {
		return articleService.unitNumber(number, 1);
	}

	const show_items = (items: any, num: number) => {
		//控制显示前两回复，arr.show用于显示剩余回复
		if (num == -1 && items.length > 2) {
			return true;
		}
		if (num == 0 || num == 1) {
			return true
		} else if (!items.show) {
			return false;
		} else {
			return true;
		}
	}

	const display = (items: any) => {
		//用于显示剩余回复
		if (!items.show) {
			items.show = true;
		} else {
			items.show = false;
		}
		setIsRender(val => !val);
	}

	const goPage = (page: number) => {
		currentpage.current = page;
		setShowPage(false);
	}

	return (
		<View style={Globalstyles.container}>
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
						<Pressable style={Globalstyles.menu_icon_con} onPress={() => { }}>
							<Icon style={Globalstyles.menu_icon} name={like_.current[item0.current.id] ? "heart-checked" : "heart"} size={17}
								color={like_.current[item0.current.id] ? theme.redchecked : theme.comment} />
							<Text style={Globalstyles.menu_text}>{"收藏"}</Text>
						</Pressable>
						<Pressable style={[Globalstyles.menu_icon_con, Globalstyles.no_border_bottom]} onPress={() => {
							navigation.navigate("Page", { screen: "MallCoupon" });
							setShowMenu(val => !val);
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
				<Pressable style={{ zIndex: 1 }} onPress={() => { setShowMenu(val => !val) }}>
					<Icon name="sandian" size={20} color={theme.toolbarbg} style={styles.title_icon} />
				</Pressable>
			</HeaderView>
			{showPage && <Pressable style={styles.pagemask} onPress={() => { setShowPage(false); }}></Pressable>}
			<View style={[styles.select_page_con, { bottom: 77 + insets.bottom }]}>
				{!showPage && <Pressable style={styles.page_btn} onPress={() => {
					setShowPage(true);
				}}>
					<Text style={styles.currentpage}>{currentpage.current}</Text>
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
									<Text style={[styles.page_item_text, currentpage.current == item && styles.active_page]}>{item}</Text>
								</Pressable>
							)
						})}
					</ScrollView>
				</ShadowedView>}
			</View>
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
									<View style={Globalstyles.level}>
										<Image
											style={[Globalstyles.level_icon, handlelevelLeft(item0.current.ulevel), handlelevelTop(item0.current.ulevel)]}
											defaultSource={require("../../assets/images/nopic.png")}
											source={require("../../assets/images/level.png")}
										/>
									</View>
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
											<ReplyItem item={hot} islike={like_.current[hot.id]} />
										</View>

									)
								})}
							</View>
						</View>}
						{pages.current.items.length > 0 && <Text style={styles.item_title}>{"全部回复"}</Text>}
					</>}
					renderItem={({ item, index }: any) => {
						return (
							<View style={styles.list_item}>
								<ReplyItem item={item} islike={like_.current[item.id]} />
								{item.sub && <View style={styles.list_sub_item}>
									{item.sub.map((sub: any, index: number) => {
										return (
											<View key={sub.id}>
												{show_items(item.sub, index) && <ReplyItem item={sub} islike={like_.current[sub.id]} />}
											</View>
										)
									})}
									{show_items(item.sub, -1) && <Pressable onPress={() => {
										display(item.sub)
									}} style={styles.more_reply}>
										{!item.sub.show && <Text style={styles.more_reply_text}>{"共" + item.sub.length + "条回复"}</Text>}
										{item.sub.show && <Text style={styles.more_reply_text}>{"收起回复"}</Text>}
										<Icon name={item.sub.show ? "toparrow" : "btmarrow"} size={16} color={theme.tit} />
									</Pressable>}
								</View>}
							</View>
						)
					}}
					ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={pages.current.items.length > 0} />}
				/>
			</View>
			{isfocus && <Pressable style={Globalstyles.keyboardmask} onPress={() => { Keyboard.dismiss(); }}></Pressable>}
			<FooterView data={{ placeholder: "点击楼层文字，回复层主", replytext, }} method={{ setReplyText }}>
				{!isfocus && <View style={styles.footer_flex}>
					<View style={[styles.footer_flex, { marginRight: 20 }]}>
						<Icon name="reply" size={16} color={theme.fav} />
						{item0.current.replycnt > 0 && <Text style={styles.footer_text}>{unitNumber(item0.current.replycnt)}</Text>}
					</View>
					<View style={styles.footer_flex}>
						<Icon name={like_.current[item0.current.id] ? "heart-checked" : "heart"}
							size={16} color={like_.current[item0.current.id] ? theme.redchecked : theme.fav}
						/>
						{item0.current.up > 0 && <Text style={styles.footer_text}>{unitNumber(item0.current.up)}</Text>}
					</View>
				</View>}
			</FooterView>
		</View >
	);
})

const styles = StyleSheet.create({
	title_icon: {
		width: 44,
		height: 44,
		textAlign: "center",
		lineHeight: 44,
	},
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
	reply_item: {
		paddingVertical: 11,
		paddingHorizontal: 15,
		flexDirection: "row",
	},
	reply_image: {
		width: 30,
		height: 30,
		borderRadius: 50,
		overflow: "hidden",
	},
	item_flex_row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	reply_up: {
		flexDirection: "row",
		alignItems: "center",
	},
	up_cnt: {
		fontSize: 12,
		marginLeft: 3,
		color: theme.placeholder2,
		transform: [{ translateY: 1 }]
	},
	list_item: {
		paddingHorizontal: 5,
		borderBottomColor: theme.bg,
		borderBottomWidth: 1,
	},
	list_sub_item: {
		backgroundColor: theme.bg,
		marginLeft: 50,
		marginRight: 15,
		marginBottom: 12,
		borderRadius: 8,
		overflow: "hidden",
	},
	more_reply: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 45,
		marginBottom: 10,
	},
	more_reply_text: {
		fontSize: 12,
		color: theme.tit,
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