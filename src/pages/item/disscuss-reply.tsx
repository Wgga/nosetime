import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image } from "react-native";

import { Brightness } from "react-native-color-matrix-image-filters";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { FlashList } from "@shopify/flash-list";

import ToastCtrl from "../../components/toastctrl";
import HeaderView from "../../components/headerview";
import ListBottomTip from "../../components/listbottomtip";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlelevelLeft, handlelevelTop, handlestarLeft } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

const DiscussReply = React.memo(({ navigation, route }: any) => {

	// 控件
	const insets = useSafeAreaInsets();
	// 参数
	// 变量
	let id = React.useRef<number>(0);
	let uid = React.useRef<number>(0);
	let uid2 = React.useRef<number>(0);
	let udid = React.useRef<number>(0);
	let title = React.useRef<string>("");
	let urtype = React.useRef<string>("");
	let src = React.useRef<string>("");
	// 数据
	let discuss = React.useRef<any>({});
	let like_ = React.useRef<any>({});
	let nolike_ = React.useRef<any>({});
	let replylist = React.useRef<any>([]);
	// 状态
	let noMore = React.useRef<boolean>(false);
	let isemptydata = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false);

	React.useEffect(() => {
		if (route.params) {
			id.current = route.params.id ? route.params.id : 0;
			uid.current = route.params.uid ? route.params.uid : 0;
			uid2.current = route.params.uid2 ? route.params.uid2 : 0;
			udid.current = route.params.udid ? route.params.udid : 0;
			title.current = route.params.title ? route.params.title : "";
			urtype.current = route.params.urtype ? route.params.urtype : "";
			src.current = route.params.src ? route.params.src : "";
		}
		init();
	}, []);

	const init = () => {
		cache.getItem("discuss-reply").then((cacheobj) => {
			setdiscuss(cacheobj);
		}).catch(err => {
			http.get(ENV.item + "?method=maindiscuss&id=" + id.current +
				"&udid=" + udid.current +
				"&uid=" + uid.current +
				"&urtype=" + urtype.current +
				"&uid2=" + uid2.current
			).then((resp_data: any) => {
				setdiscuss(resp_data);
			});
		});
	}

	const setdiscuss = (data: any) => {
		if (!data || !data.udid) {
			ToastCtrl.show({ message: "内容已被删除，无法查看", duration: 1000, viewstyle: "medium_toast", key: "content_empty_toast" });
			isemptydata.current = true;
			return;
		}
		discuss.current = data;
		discuss.current.udtime = data.udtime.split(" ")[0];
		if (!title.current) {
			title.current = (!discuss.current.udreplycnt || discuss.current.udreplycnt <= 0) ? "暂无回复" : discuss.current.udreplycnt + "条回复";
		}
		console.log("%c Line:86 🍡 discuss.current", "color:#3f7cff", discuss.current);
		if (udid.current == 0) udid.current = data["udid"];
		islike_disucss([udid.current]);
		loadMore(null, 0);
	}

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

	const loadMore = (item: any, index: number) => {
		setIsRender(val => !val);
	}

	const gotodetail = (item: any) => {
	}

	const handledesc = (desc: string) => {
		let sz: any[] = [];
		sz = desc.replace(/\r/g, "").replace(/\n\n/g, "\n").split(/\n/g).map((item: string, index: number) => {
			return (<Text key={index} style={styles.discuss_desc_text}>{item}</Text>)
		})
		return sz;
	};

	const handledescimg = (desc: string) => {
		let regex = /<img[^>]+src="([^"]+)">/g;
		let match, sz: any = [];
		while (match = regex.exec(desc)) {
			sz.push(<Image key={match[1]} style={Globalstyles.desc_img} source={{ uri: match[1] }} />);
		}
		return sz;
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: title.current,
				isShowSearch: false,
				// showmenu,
				style: { zIndex: 0 },
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				}
			}} method={{
				back: () => { navigation.goBack() },
			}}
			// MenuChildren={() => {
			// 	return (
			// 		<>
			// 			<Pressable style={Globalstyles.menu_icon_con} onPress={() => { }}>
			// 				<Icon style={Globalstyles.menu_icon} name={like_.current[item0.current.id] ? "heart-checked" : "heart"} size={17}
			// 					color={like_.current[item0.current.id] ? theme.redchecked : theme.comment} />
			// 				<Text style={Globalstyles.menu_text}>{"收藏"}</Text>
			// 			</Pressable>
			// 			<Pressable style={[Globalstyles.menu_icon_con, Globalstyles.no_border_bottom]} onPress={() => {
			// 				navigation.navigate("Page", { screen: "MallCoupon" });
			// 				setShowMenu(val => !val);
			// 			}}>
			// 				<Icon style={Globalstyles.menu_icon} name="report2" size={16} color={theme.comment} />
			// 				<Text style={Globalstyles.menu_text}>{"举报"}</Text>
			// 			</Pressable>
			// 		</>
			// 	)
			// }}
			>
				<View style={[Globalstyles.header_bg, { height: 90 + insets.top }]}>
					<Brightness amount={0.85}>
						<Image style={{ width: "100%", height: "100%" }} blurRadius={40}
							source={{ uri: ENV.avatar + discuss.current.replyuid + ".jpg?!l" + discuss.current.uface }}
						/>
					</Brightness>
				</View>
				{/* <Pressable style={{ zIndex: 1 }} onPress={() => { setShowMenu(val => !val) }}>
					<Icon name="sandian" size={20} color={theme.toolbarbg} style={styles.title_icon} />
				</Pressable> */}
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
							<Image style={styles.user_avatar} source={{ uri: ENV.avatar + discuss.current.replyuid + ".jpg?!l" + discuss.current.uface }} />
							<View style={{ marginLeft: 10 }}>
								{src.current != "user" && <View style={[Globalstyles.item_flex, { marginBottom: 5 }]}>
									<Text numberOfLines={1} style={styles.user_uname} onPress={() => { }}>{discuss.current.uname}</Text>
									{discuss.current.ulevel > 0 && <View style={Globalstyles.level}>
										<Image
											style={[Globalstyles.level_icon, handlelevelLeft(discuss.current.ulevel), handlelevelTop(discuss.current.ulevel)]}
											defaultSource={require("../../assets/images/nopic.png")}
											source={require("../../assets/images/level.png")}
										/>
									</View>}
								</View>}
								{src.current == "user" && <Text style={styles.user_uname} onPress={() => { }}>{discuss.current.name}</Text>}
								{discuss.current.uwscore > 0 && <View style={Globalstyles.star}>
									<Image
										style={[Globalstyles.star_icon, handlestarLeft(discuss.current.uwscore * 2)]}
										defaultSource={require("../../assets/images/nopic.png")}
										source={require("../../assets/images/star/star.png")}
									/>
								</View>}
							</View>
						</View>
						{discuss.current.content && <View style={{ marginTop: 10 }}>{handledesc(discuss.current.content)}</View>}
						{discuss.current.udpichtml && <View style={Globalstyles.desc_img_con}>{handledescimg(discuss.current.udpichtml)}</View>}
						<View style={Globalstyles.item_flex_between}>
							<Text>{discuss.current.udtime}</Text>
							<View style={Globalstyles.item_flex}>
								<Pressable onPress={() => { }} style={[Globalstyles.item_flex, { marginRight: 20 }]}>
									<Icon name={like_.current[discuss.current.udid] ? "up-checked" : "up"} size={16} color={theme.placeholder} />
									<Text style={styles.up_text}>{discuss.current.udup != "0" ? discuss.current.udup : ""}</Text>
								</Pressable>
								<Icon name={nolike_.current[discuss.current.udid] ? "up-checked" : "up"} size={16}
									color={theme.placeholder} style={{ transform: [{ rotate: "180deg" }] }} />
							</View>
						</View>
					</View>}
					renderItem={({ item, index }: any) => {
						return (
							<></>
						)
					}}
					ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={replylist.current.length > 0} />}
				/>
			</View>
		</View>
	);
})

const styles = StyleSheet.create({
	discuss_head_con: {
		paddingHorizontal: 20,
		paddingTop: 32,
		paddingBottom: 15,
	},
	user_avatar: {
		width: 40,
		height: 40,
		borderRadius: 50,
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