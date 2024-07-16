import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, Image, FlatList, Animated, useWindowDimensions, PixelRatio, ActivityIndicator } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";
import RNFS from "react-native-fs";
import { PieChart } from "react-native-gifted-charts";
import ViewShot, { captureRef } from "react-native-view-shot";
import { ShadowedView } from "react-native-fast-shadow";
import Svg, { Ellipse } from "react-native-svg";
import WebView from "react-native-webview";

import HeaderView from "../../components/headerview";
import { ModalPortal } from "../../components/modals";
import PhotoPopover from "../../components/popover/photo-popover";
import RadarChart from "../../components/radarchart";
import LinearButton from "../../components/linearbutton";
import SharePopover from "../../components/popover/share-popover";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlestarLeft, toCamelCase, setContentFold } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

const UserDetail = React.memo(({ navigation, route }: any) => {

	// 控件
	const classname = "UserDetailPage";
	const insets = useSafeAreaInsets();
	const windowD = useWindowDimensions();
	const dnaref = React.useRef<any>(null);
	// 变量
	let uid = React.useRef<number>(0);
	let avatar = React.useRef<string>("");
	let who = React.useRef<string>("");
	let topicTab = React.useRef<string>("");
	let colTab = React.useRef<string>("");
	const [curTab, setCurTab] = React.useState<string>("home");
	let headerOpt = React.useRef(new Animated.Value(0)).current; // 头部透明度动画
	let dna_cnt = React.useRef<number>(0);
	let dna_cnt2 = React.useRef<number>(0);
	let dnaloadText = React.useRef<string>("正在生成，请稍后...");
	let dnaHeight = React.useRef<number>(0);
	let dnaHeaderH = React.useRef<number>(0);
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
	let gene_code = React.useRef<any>({
		circle_graph: [],
		notes: [],
		style: [],
		odor: [],
		brand: [],
		perfumer: [],
		gene_type_graph: "",
		gene_popular_graph: "",
		gene_sex_graph: ""
	});
	let dna_info = React.useRef<any>({
		uri: "",
		dataurl: ""
	})
	// 参数
	const noseTypeList: any = ["商业", "沙龙", "热门", "中等", "冷门", "男士", "中性", "女士"];
	const colorlist: any = ["#e0e0e0", "#f7f7f7", "#e0e0e0", "#ebebeb", "#f7f7f7", "#e0e0e0", "#ebebeb", "#f7f7f7"];
	const note_lists: any = ["柑橘调", "果香调", "花香调", "美食调", "西普调", "皮革调", "东方调", "木质调", "馥奇调", "水生调", "绿叶调", "芳香调"];
	// 状态
	let isShowUsercol = React.useRef<boolean>(false);
	let isShowFavcol = React.useRef<boolean>(false);
	let isShowUserTopic = React.useRef<boolean>(false);
	let isShowFavTopic = React.useRef<boolean>(false);
	let isShowHeader = React.useRef<boolean>(false); // 是否显示头部
	const [isrender, setIsRender] = React.useState<boolean>(false);
	const [dnaloading, setDnaLoading] = React.useState<boolean>(false);


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
		data["udesc2"] = "";
		if (data.udesc.length > 0) {
			setContentFold({
				item: data, // 列表数据
				key: "udesc", // 需要展开收起的字段
				src: "user", // 来源
				width: windowD.width - 40, // 列表项的宽度
				fontSize: 12, // 列表项的字体大小
				lineInfoForLine: 5, // 收起时显示的行数
				moreTextLen: 4, // 展开收起按钮长度
			})
		}
		info.current = data;
		avatar.current = ENV.avatar + info.current.uid + ".jpg?" + info.current.uface;
		// this.getaddtiondata();
	}


	const initGeneData = () => {
		//标记香水，清空缓存，实时更新
		dna_cnt.current = 0;
		dna_cnt2.current = 0;
		gene_code.current = {
			circle_graph: [],
			notes: [],
			style: [],
			odor: [],
			brand: [],
			perfumer: [],
			gene_type_graph: "",
			gene_popular_graph: "",
			gene_sex_graph: ""
		};
	}

	// 处理【香水统计】数据
	const handleBase = (data: any) => {
		let noseTypeGene = [];
		for (var i in noseTypeList) {
			var name = noseTypeList[i];
			noseTypeGene.push({ text: name, value: data[i], color: colorlist[i] })
		}
		gene_code.current["circle_graph"] = [
			{ name: "gene_type_graph", data: noseTypeGene.slice(0, 2) },
			{ name: "gene_popular_graph", data: noseTypeGene.slice(2, 5) },
			{ name: "gene_sex_graph", data: noseTypeGene.slice(5, 8) }
		]
	}

	// 获取嗅觉DNA数据
	const getGeneData = () => {
		return new Promise((resolve, reject) => {
			initGeneData();
			http.post(ENV.user, { method: "getdnainfo", id: uid.current }).then((resp_data: any) => {

				// 处理香水统计数据
				var base_cnt = resp_data.base.reduce((total: number, i: number) => { return i + total });
				if (resp_data.base && base_cnt != 0) {
					handleBase(resp_data.base);
				} else {
					dna_cnt.current = 1;
				}

				// 气味偏好数据过滤掉无id的
				resp_data.odor = resp_data.odor.filter((item: any) => { return item.id });

				// 处理香调偏好数据
				var fragrance_cnt = resp_data.fragrance.reduce((total: number, i: number) => { return i + total });
				if (resp_data.fragrance && fragrance_cnt != 0) {
					for (var i in resp_data.fragrance) {
						gene_code.current["notes"].push({ label: note_lists[i], value: resp_data.fragrance[i] });
					}
				} else {
					dna_cnt2.current = 1;
				}

				//如果没有下边四个数据显示灰色的图　
				if (resp_data.style && resp_data.style.length != 0) gene_code.current["style"] = resp_data.style;
				if (resp_data.odor && resp_data.odor.length != 0) gene_code.current["odor"] = resp_data.odor.slice(0, 8);
				if (resp_data.brand && resp_data.brand.length != 0) gene_code.current["brand"] = resp_data.brand;
				if (resp_data.perfumer && resp_data.perfumer.length != 0) gene_code.current["perfumer"] = resp_data.perfumer;
				if ((resp_data.style.length != 0
					|| resp_data.odor.length != 0
					|| resp_data.brand.length != 0
					|| resp_data.perfumer.length != 0
				) && dna_cnt.current != 0) {
					dna_cnt2.current = 1;
				}
				if (uid.current != us.user.uid) cache.saveItem("herDna", resp_data)
				else if (uid.current == us.user.uid) cache.saveItem("userDna", resp_data)

				resolve(1);
			})
		})
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
			getCompare(),
			getGeneData()
		]).then(() => {
			colTab.current = usercol.current.length == 0 && favcol.current.length > 0 ? "fav" : "user";
			setTimeout(() => { setIsRender(val => !val); }, 100)
		})
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
			navigation.push("Page", { screen: "UserFav", params: { id: 0, uid: uid.current } });
		} else if (page == "item-detail") {
			navigation.navigate("Page", { screen: "ItemDetail", params: { id: item.id } });
		} else if (page == "social-shequ-detail") {
			navigation.navigate("Page", { screen: "SocialShequDetail", params: { ctdlgid: item.ctdlgid } });
		} else if (page == "user-shequ") {
			navigation.navigate("Page", { screen: "UserShequ", params: { uid: uid.current, cnt: info.current.topic, name: info.current.uname } });
		} else if (page == "user-friend") {
			navigation.push("Page", { screen: "UserFriend", params: { uid: uid.current, carecnt: info.current.care, name: info.current.uname, fanscnt: info.current.fans, } });
		} else {
			let screen = toCamelCase(page);
			navigation.navigate("Page", { screen: screen, params: { uid: uid.current } });
		}
	}

	const gotodiscuss = (type: string, cnt: number,) => {
		navigation.push("Page", { screen: "UserDiscuss", params: { type, uid: uid.current, cnt, name: info.current.uname } });
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

	// 动态修改顶部导航栏透明度
	const showHeaderView = (e: any) => {
		if (e.nativeEvent.contentOffset.y > 150) {
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

	// 打开DNA报告弹窗
	const open_dnaPopover = () => {
		ModalPortal.show((
			<View style={styles.dna_photo_con}>
				<View style={styles.dna_photo_info}>
					<Image style={styles.dna_photo_avatar} source={{ uri: ENV.avatar + us.user.uid + ".jpg?" + us.user.uface }} />
					<Icon name="close" size={30} color={theme.toolbarbg} style={styles.dna_photo_closebtn} onPress={() => {
						ModalPortal.dismiss("dnaphoto_popover");
					}} />
					<View style={styles.dna_photo_msgcon}>
						<Text style={styles.dna_photo_uname}>{info.current.uname}</Text>
						<Text style={styles.dna_photo_msg}>{"已入住香水时代" + info.current.days + "，记录了" + info.current.records + "款香水"}</Text>
						<Text style={styles.dna_photo_desc} numberOfLines={2}>{info.current.udesc}</Text>
						<Text style={styles.dna_photo_title}>{info.current.uname + "的嗅觉DNA报告"}</Text>
					</View>
				</View>
				<View style={{ overflow: "hidden", flex: 1 }}>
					<WebView originWhitelist={["*"]}
						scalesPageToFit={false}
						setBuiltInZoomControls={false}
						showsVerticalScrollIndicator={false}
						scrollEnabled={false}
						containerStyle={{ paddingBottom: 180, marginTop: -dnaHeaderH.current }}
						source={{
							html: `<html><head><style>*{padding:0;margin:0;}img{width:${width}px}</style></head>
					<body><img src="${dna_info.current.dataurl}" /></body></html>`
						}}
					/>
				</View>
				<ShadowedView style={styles.dna_photo_share}>
					<SharePopover data={{ containerStyle: { paddingBottom: 16 }, uri: dna_info.current.uri }} />
				</ShadowedView>
			</View>
		), {
			key: "dnaphoto_popover",
			width,
			height,
			rounded: false,
			useNativeDriver: true,
			onTouchOutside: () => {
				ModalPortal.dismiss("dnaphoto_popover");
			},
			onHardwareBackPress: () => {
				ModalPortal.dismiss("dnaphoto_popover");
				return true;
			},
			animationDuration: 300,
			type: "bottomModal",
			modalStyle: { backgroundColor: "transparent", paddingTop: 75 + insets.top },
		});
	}

	// 生成嗅觉DNA报告
	const createDNAPhoto = () => {
		if (dna_info.current.uri && dna_info.current.dataurl) {
			open_dnaPopover();
			return;
		}
		if (dnaref.current) {
			setDnaLoading(true);
			dnaref.current.capture().then((uri: string) => {
				RNFS.readFile(uri, "base64").then((res: any) => {
					let dataurl = "data:image/png;base64," + res;
					dna_info.current = { uri, dataurl };
					setDnaLoading(false);
					open_dnaPopover();
				}).catch(err => { });
			}).catch(() => { })
		}
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: info.current.uname,
				isShowSearch: false,
				style: Globalstyles.absolute,
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
					headertitle: { opacity: headerOpt },
				}
			}} method={{
				back: () => { navigation.goBack() },
			}}>
				<Animated.View style={[Globalstyles.header_bg_con, { opacity: headerOpt }]}>
					<View style={Globalstyles.header_bg_msk}></View>
					{avatar.current && <Image style={Globalstyles.header_bg_img} blurRadius={40} source={{ uri: avatar.current }} />}
				</Animated.View>
				<Icon style={styles.title_icon} name="btmarrow" size={12} color={theme.toolbarbg} onPress={() => { gotodetail("user-intro") }} />
			</HeaderView>
			{dnaloading && <View style={styles.dnaload_con}>
				<View style={styles.dnaload_info}>
					<ActivityIndicator size="large" color="#9BA6F5" />
					<Text style={styles.dnaload_text}>{dnaloadText.current}</Text>
				</View>
			</View>}
			<ScrollView showsVerticalScrollIndicator={false} onScroll={showHeaderView}>
				{avatar.current && <View style={styles.header_bg}>
					<Image style={Globalstyles.header_bg_img} blurRadius={40} source={{ uri: avatar.current }} />
					<View style={[Globalstyles.header_bg_msk]}></View>
				</View>}
				<View style={{ alignItems: "center", zIndex: 1 }}>
					{avatar.current && <Image style={[styles.user_avatar, { marginTop: 41 + insets.top }]} source={{ uri: avatar.current }} />}
					<Text style={styles.user_name}>{info.current.uname}</Text>
					{info.current.udesc && <Pressable style={styles.intro_con} onPress={() => { gotodetail("user-intro") }}>
						{!info.current.udesc2 && <Text numberOfLines={5} style={[styles.intro_text, { fontFamily: "monospace", textAlign: "center" }]}>{info.current.udesc}</Text>}
						{info.current.udesc2 && <>
							<Text numberOfLines={5} style={[styles.intro_text, { fontFamily: "monospace" }]}>{info.current.udesc2}</Text>
							<View style={styles.intro_morebtn_con}>
								<Text style={styles.intro_text}>{"..."}</Text>
								<Icon name="btmarrow" style={styles.intro_icon} size={10} color={theme.toolbarbg} />
							</View>
						</>}
					</Pressable>}
					{info.current.name != "[已注销] " && <View style={styles.user_tabbar_con}>
						<Text style={styles.tabbar_text} onPress={() => { gotodetail("user-friend") }}><Text style={styles.tabbar_num}>{info.current.friend}</Text>{"\n友邻"}</Text>
						<Text style={styles.tabbar_text} onPress={() => { gotodiscuss("wanted", info.current.wanted) }}><Text style={styles.tabbar_num}>{info.current.wanted}</Text>{"\n想要"}</Text>
						<Text style={styles.tabbar_text} onPress={() => { gotodiscuss("smelt", info.current.smelt) }}><Text style={styles.tabbar_num}>{info.current.smelt}</Text>{"\n闻过"}</Text>
						<Text style={styles.tabbar_text} onPress={() => { gotodiscuss("have", info.current.have) }}><Text style={styles.tabbar_num}>{info.current.have}</Text>{"\n拥有"}</Text>
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
							resizeMode="contain" />}
						{(us.user.uid != uid.current && commoncnt.current > 0) && <View style={styles.item_padding}>
							<ShadowedView style={styles.commonfav_con}>
								<View style={styles.commonfav_avatar_con}>
									{avatar.current && <Image style={styles.commonfav_avatar} source={{ uri: avatar.current }} />}
									<Image style={[styles.commonfav_avatar, styles.commonfav_avatar2]} source={{ uri: ENV.avatar + us.user.uid + ".jpg?" + us.user.uface }} />
								</View>
								<View style={styles.commonfav_list}>
									<View style={Globalstyles.item_flex}>
										<Text style={styles.commonfav_tit}>{"我们共同的喜好 " + commoncnt.current + "个"}</Text>
										<Icon name="advance" size={14} color={theme.tit2} style={{ marginLeft: 10 }} />
									</View>
									<Text style={[styles.textstyle, { marginTop: 5 }]}>{
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
								<View style={Globalstyles.item_flex}>
									{isShowUsercol.current && <Text style={[styles.tit_text, colTab.current == "user" && { color: theme.tit2 }]} onPress={() => { toggleCol("user") }}>{"自建香单"}</Text>}
									{(isShowUsercol.current && isShowFavcol.current) && <Text style={styles.tit_text}>|</Text>}
									{isShowFavcol.current && <Text style={[styles.tit_text, colTab.current == "fav" && { color: theme.tit2 }]} onPress={() => { toggleCol("fav") }}>{"收藏香单"}</Text>}
								</View>
								<Pressable hitSlop={10} style={Globalstyles.item_flex} onPress={() => { gotodetail("perfume-list") }}>
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
								<View style={Globalstyles.item_flex}>
									{isShowUserTopic.current && <Text style={[styles.tit_text, topicTab.current == who.current && { color: theme.tit2 }]} onPress={() => { toggleTopic(who.current) }}>{who.current + "的话题"}</Text>}
									{(isShowUserTopic.current && isShowFavTopic.current) && <Text style={styles.tit_text}>|</Text>}
									{isShowFavTopic.current && <Text style={[styles.tit_text, topicTab.current == "fav" && { color: theme.tit2 }]} onPress={() => { toggleTopic("fav") }}>{"收藏话题"}</Text>}
								</View>
								<Pressable hitSlop={10} style={Globalstyles.item_flex} onPress={() => { gotodetail("user-shequ") }}>
									<Text style={styles.col_btn}>{"全部"}</Text>
									<Icon name="advance" size={14} color={theme.color} />
								</Pressable>
							</View>
							{topicTab.current == who.current && info.current.topics.map((item: any) => {
								return (
									<Pressable key={item.ctdlgid} style={[styles.item_padding, Globalstyles.item_flex, { borderBottomColor: theme.bg, borderBottomWidth: 1 }]}
										onPress={() => { gotodetail("social-shequ-detail", item) }}>
										{avatar.current && <Image style={styles.topic_avatar} source={{ uri: avatar.current }} />}
										<Text style={styles.topic_tit}>{item.cttitle}</Text>
									</Pressable>
								)
							})}
							{topicTab.current == "fav" && favTopics.current.map((item: any) => {
								return (
									<Pressable key={item.ctdlgid} style={[styles.item_padding, Globalstyles.item_flex, { borderBottomColor: theme.bg, borderBottomWidth: 1 }]}
										onPress={() => { gotodetail("social-shequ-detail", item) }}>
										{avatar.current && <Image style={styles.topic_avatar} source={{ uri: ENV.avatar + item.uid + ".jpg!l?" + item.uface }} />}
										<Text style={styles.topic_tit}>{item.cttitle}</Text>
									</Pressable>
								)
							})}
						</View>}
						{info.current.short > 0 && <View style={styles.item_list}>
							<Pressable style={[styles.item_title, { paddingBottom: 15 }]} onPress={() => { gotodiscuss("short", info.current.short) }}>
								<Text style={[styles.tit_text, { color: theme.tit2 }]}>{who.current + "的一句话香评 (" + info.current.short + ")"}</Text>
								<Icon name="advance" size={14} color={theme.color} />
							</Pressable>
							{(info.current.shorts && info.current.shorts.length > 0) && info.current.shorts.map((item: any) => {
								return (
									<View key={item.id} style={styles.item_padding}>
										<View style={{ flexDirection: "row" }}>
											<View style={styles.discuss_image_info}>
												<Pressable style={styles.discuss_img} onPress={() => { gotodetail("item-detail", item) }}>
													<Image style={{ width: "100%", height: "100%" }} source={{ uri: ENV.image + "/perfume/" + item.id + ".jpg!m" }} resizeMode="contain" />
												</Pressable>
												<View style={styles.img_traiangle}></View>
											</View>
											<View style={{ marginLeft: 10 }}>
												<Text style={styles.discuss_name} onPress={() => { gotodetail("item-detail", item) }}>{item.cnname}</Text>
												<Text style={[styles.discuss_name, { color: theme.text2 }]} onPress={() => { gotodetail("item-detail", item) }}>{item.enname}</Text>
											</View>
										</View>
										<View style={styles.discuss_info}>
											{item.score > 0 && <View style={Globalstyles.star}>
												<Image style={[Globalstyles.star_icon, handlestarLeft(item.score * 2)]}
													defaultSource={require("../../assets/images/nopic.png")}
													source={require("../../assets/images/star/star.png")}
												/>
											</View>}
											<Text numberOfLines={1} style={styles.discuss_desc} onPress={() => { gotodiscuss("short", info.current.short) }}>{item.desc}</Text>
										</View>
									</View>
								)
							})}
						</View>}
						{info.current.discuss > 0 && <>
							<Pressable style={[styles.item_title, { paddingBottom: 15 }]} onPress={() => { gotodiscuss("discuss", info.current.discuss) }}>
								<Text style={[styles.tit_text, { color: theme.tit2 }]}>{who.current + "的香水评论 (" + info.current.discuss + ")"}</Text>
								<Icon name="advance" size={14} color={theme.color} />
							</Pressable>
							{(info.current.discusss && info.current.discusss.length > 0) && info.current.discusss.map((item: any) => {
								return (
									<View key={item.id} style={styles.item_padding}>
										<View style={{ flexDirection: "row" }}>
											<View style={styles.discuss_image_info}>
												<Pressable style={styles.discuss_img} onPress={() => { gotodetail("item-detail", item) }}>
													<Image style={{ width: "100%", height: "100%" }} source={{ uri: ENV.image + "/perfume/" + item.id + ".jpg!m" }} resizeMode="contain" />
												</Pressable>
												<View style={styles.img_traiangle}></View>
											</View>
											<View style={{ marginLeft: 10 }}>
												<Text style={styles.discuss_name} onPress={() => { gotodetail("item-detail", item) }}>{item.cnname}</Text>
												<Text style={[styles.discuss_name, { color: theme.text2 }]} onPress={() => { gotodetail("item-detail", item) }}>{item.enname}</Text>
											</View>
										</View>
										<View style={styles.discuss_info}>
											{item.score > 0 && <View style={Globalstyles.star}>
												<Image style={[Globalstyles.star_icon, handlestarLeft(item.score * 2)]}
													defaultSource={require("../../assets/images/nopic.png")}
													source={require("../../assets/images/star/star.png")}
												/>
											</View>}
											<Text numberOfLines={4} style={styles.discuss_desc} onPress={() => { gotodiscuss("discuss", info.current.discuss) }}>{item.desc}</Text>
										</View>
									</View>
								)
							})}
							<Pressable style={{ alignItems: "center" }} onPress={() => { gotodiscuss("discuss", info.current.discuss) }}>
								<Text style={styles.discuss_morebtn}>{"查看全部"}</Text>
							</Pressable>
						</>}
					</View>}

					{(info.current.name != "[已注销] " && curTab == "gene") && <View style={{ height: (dnaHeight.current + 71) - dnaHeaderH.current, overflow: "hidden" }}>
						<ViewShot ref={dnaref} options={{ fileName: "DNA" + new Date().valueOf(), format: "png" }} style={{
							position: "absolute", top: -dnaHeaderH.current
						}} onLayout={(e: any) => {
							dnaHeight.current = e.nativeEvent.layout.height;
						}}>
							<View style={{ backgroundColor: theme.toolbarbg }}>
								<View style={styles.dna_photo_info} onLayout={(e: any) => {
									dnaHeaderH.current = e.nativeEvent.layout.height;
									setIsRender(val => !val);
								}}>
									<Image style={[styles.dna_photo_avatar, { position: "relative", top: 0, marginTop: 30 }]} source={{ uri: ENV.avatar + us.user.uid + ".jpg?" + us.user.uface }} />
									<View style={[styles.dna_photo_msgcon, { paddingTop: 10 }]}>
										<Text style={styles.dna_photo_uname}>{info.current.uname}</Text>
										<Text style={styles.dna_photo_msg}>{"已入住香水时代" + info.current.days + "，记录了" + info.current.records + "款香水"}</Text>
										<Text style={styles.dna_photo_desc} numberOfLines={2}>{info.current.udesc}</Text>
										<Text style={styles.dna_photo_title}>{info.current.uname + "的嗅觉DNA报告"}</Text>
									</View>
								</View>
								{dna_cnt.current != 1 && <View style={styles.item_list}>
									<Text style={[styles.gene_title, { paddingTop: 0 }]}>{"香水统计"}</Text>
									<View style={{ flexDirection: "row" }}>
										{gene_code.current.circle_graph.length > 0 && gene_code.current.circle_graph.map((item: any) => {
											return (
												<View key={item.name} style={styles.base_item}>
													{item.data.length > 0 && <>
														<View style={{ height: width / 3, justifyContent: "center" }}>
															<PieChart data={item.data} radius={(width / 3 * 0.65) / 2} />
														</View>
														<View style={styles.base_info_con}>
															{item.data.map((item2: any) => {
																return (
																	<View key={item2.text} style={styles.base_info}>
																		<Text style={styles.base_text}>{item2.text}</Text>
																		<View style={[styles.base_bg, { backgroundColor: item2.color }]}></View>
																		<Text style={[styles.base_text, { width: 34 }]}>{item2.value + "%"}</Text>
																	</View>
																)
															})}
														</View>
													</>}
												</View>
											)
										})}
									</View>
								</View>}
								{dna_cnt2.current != 1 && <View style={styles.item_list}>
									<Text style={styles.gene_title}>{"香调偏好"}</Text>
									<View style={{ alignItems: "center" }}>
										{gene_code.current.notes.length > 0 &&
											<RadarChart data={gene_code.current.notes}
												size={width * 0.85}
												isCircle
												gradientColor={{
													startColor: "#FFF",
													endColor: "#FFF",
													count: 3,
												}}
												labelSize={12}
												divisionStroke={"#EEE"}
												labelColor={"#4D4D4D"}
												stroke={["#EEE", "#EEE", "#CCC"]}
												dataFillColor={"#999"}
												dataFillOpacity={0.3}
											/>
										}
									</View>
								</View>}
								{(dna_cnt2.current == 1 && dna_cnt.current != 1) && <View>
									<Text style={styles.gene_title}>{"嗅觉偏好"}</Text>
									<Image style={Globalstyles.emptyimg}
										source={require("../../assets/images/empty/somedna_blank.png")}
										resizeMode="contain" />
								</View>}
								{(dna_cnt2.current != 1 && gene_code.current.style.length > 0) && <View style={styles.item_list}>
									<Text style={styles.gene_title}>{"风格偏好"}</Text>
									<View style={styles.style_con}>
										{gene_code.current.style.map((item: any) => {
											return (
												<View key={item.tag} style={styles.style_item}>
													<Text>{item.val + "%"}</Text>
													<View style={styles.style_outbar}>
														{item.val != 100 && <Svg width="14" height="5" viewBox="0 0 14 5" style={[styles.style_svg, { top: -2 }]}>
															<Ellipse strokeWidth={1} stroke="#AFAFAF" cx="50%" cy="50%" rx="49%" ry="40%" fill="none" />
														</Svg>}
														<View style={[styles.style_inbar, { height: `${item.val}%` }]}>
															<Svg width="14" height="5" viewBox="0 0 14 5" style={[styles.style_svg, { top: -2 }]}>
																<Ellipse strokeWidth={1} stroke="#AFAFAF" cx="50%" cy="50%" rx="49%" ry="40%" fill={theme.border} />
															</Svg>
														</View>
														<Svg width="14" height="5" viewBox="0 0 14 5" style={[styles.style_svg, { bottom: -2.5, zIndex: -1 }]}>
															<Ellipse strokeWidth={1} stroke="#AFAFAF" cx="50%" cy="50%" rx="49%" ry="40%" fill={theme.border} />
														</Svg>
													</View>
													<Text>{item.tag}</Text>
												</View>
											)
										})}
									</View>
								</View>}
								{(dna_cnt2.current != 1 && gene_code.current.odor.length > 0) && <View style={styles.item_list}>
									<Text style={styles.gene_title}>{"气味偏好"}</Text>
									<View style={{ paddingHorizontal: 20 }}>
										{gene_code.current.odor.map((item: any) => {
											return (
												<View key={item.id} style={styles.odor_item}>
													<Text style={[styles.textstyle, styles.item_tag]}>{item.tag}</Text>
													<View style={[styles.progress_outbar, { flex: 1 }]}>
														<View style={[styles.progress_inbar, { width: `${item.val}%` }]}></View>
													</View>
													<Text style={[styles.textstyle, styles.item_val]}>{item.val + "%"}</Text>
												</View>
											)
										})}
									</View>
								</View>}
								{(dna_cnt2.current != 1 && gene_code.current.brand.length > 0) && <View style={styles.item_list}>
									<Text style={styles.gene_title}>{"品牌偏好"}</Text>
									<View style={{ paddingHorizontal: 20, paddingBottom: 17 }}>
										{gene_code.current.brand.map((item: any) => {
											return (
												<View key={item.id} style={styles.brand_item}>
													<Image style={styles.brand_img} source={{ uri: ENV.image + "/brand/" + (item.id % 100000) + ".jpg" }} resizeMode="contain" />
													<View style={styles.brand_info}>
														<View style={styles.info_name}>
															<Text numberOfLines={1} style={[styles.textstyle, { flex: 1 }]}>{item.cnname + " " + item.enname}</Text>
															<Text style={[styles.textstyle, { marginLeft: 10 }]}>{item.val + "%"}</Text>
														</View>
														<View style={[styles.progress_outbar, { marginTop: 15 }]}>
															<View style={[styles.progress_inbar, { width: `${item.val}%` }]}></View>
														</View>
													</View>
												</View>
											)
										})}
									</View>
								</View>}
								{(dna_cnt2.current != 1 && gene_code.current.perfumer.length > 0) && <View style={{ paddingBottom: 30 }}>
									<Text style={styles.gene_title}>{"调香师偏好"}</Text>
									<View>
										{gene_code.current.perfumer.map((item: any) => {
											return (
												<View key={item.id} style={{ padding: 20 }}>
													<View style={[styles.info_name, styles.perfume_outbar]}>
														<View style={[styles.perfume_inbar, { width: `${item.val}%` }]}></View>
														<Text style={[styles.textstyle, { marginLeft: 17, zIndex: 1 }]}>{item.tag}</Text>
														<Text style={[styles.textstyle, { marginRight: 17, zIndex: 1 }]}>{item.val + "%"}</Text>
													</View>
												</View>
											)
										})}
									</View>
								</View>}
							</View>
						</ViewShot>
						{(dna_cnt2.current != 1 && uid.current == us.user.uid) && <LinearButton containerStyle={[styles.dna_photo_btn, { top: dnaHeight.current - dnaHeaderH.current }]}
							text={"生成嗅觉DNA报告"}
							textStyle={styles.dna_photo_btn_text}
							colors2={["#81B4EC", "#9BA6F5"]}
							isShowColor={false}
							onPress={createDNAPhoto}
						/>}
					</View>}
				</View>
			</ScrollView >
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
	header_bg: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 400,
		zIndex: 0,
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
		zIndex: 1,
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
		backgroundColor: theme.toolbarbg,
		zIndex: 1,
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
	commonfav_tit: {
		fontSize: 14,
		color: theme.tit2
	},
	textstyle: {
		fontSize: 12,
		color: theme.text2,
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
	gene_title: {
		paddingVertical: 20,
		paddingHorizontal: 13,
		fontFamily: "PingFang SC",
		fontSize: 14,
		color: theme.tit2,
		fontWeight: "500",
	},
	base_item: {
		width: width / 3,
		height: "100%",
		alignItems: "center",
	},
	base_info_con: {
		paddingTop: 5,
		paddingBottom: 20,
	},
	base_info: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 8,
	},
	base_bg: {
		width: 13,
		height: 13,
		marginHorizontal: 5,
	},
	base_text: {
		fontSize: 12,
		color: theme.text2,
		textAlign: "center",
	},
	style_con: {
		paddingBottom: 20,
		flexDirection: "row",
	},
	style_item: {
		flexGrow: 1,
		alignItems: "center",
	},
	style_outbar: {
		width: 14,
		marginVertical: 15,
		height: 90,
		borderColor: "#AFAFAF",
		borderWidth: 1,
		borderTopWidth: 0,
		borderBottomWidth: 0,
	},
	style_svg: {
		position: "absolute",
		left: -1,
		zIndex: 1
	},
	style_inbar: {
		backgroundColor: theme.border,
		width: 12,
		position: "absolute",
		bottom: 0,
	},
	odor_item: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 15
	},
	item_tag: {
		width: 55,
		height: 17,
		lineHeight: 17,
	},
	progress_outbar: {
		backgroundColor: theme.bg,
		borderRadius: 5,
		overflow: "hidden",
		height: 10,
	},
	progress_inbar: {
		backgroundColor: theme.border,
		height: 10,
		borderRadius: 5,
		overflow: "hidden",
	},
	item_val: {
		width: 50,
		textAlign: "right",
	},
	brand_item: {
		paddingVertical: 15,
		flexDirection: "row"
	},
	brand_img: {
		width: 60,
		height: 60,
		borderColor: theme.bg,
		borderWidth: 1,
	},
	brand_info: {
		flex: 1,
		marginLeft: 15,
	},
	info_name: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	perfume_outbar: {
		height: 20,
		backgroundColor: theme.bg,
		borderRadius: 10,
		overflow: "hidden",
		// paddingHorizontal: 17,
	},
	perfume_inbar: {
		position: "absolute",
		top: 0,
		bottom: 0,
		zIndex: 0,
		borderRadius: 10,
		overflow: "hidden",
		backgroundColor: theme.border,
	},
	dnaload_con: {
		...StyleSheet.absoluteFillObject,
		zIndex: 99,
		alignItems: "center",
		justifyContent: "center",
		backgroundColor: "rgba(0,0,0,0.5)",
	},
	dnaload_info: {
		paddingVertical: 10,
		paddingHorizontal: 20,
		backgroundColor: theme.toolbarbg,
		borderRadius: 8,
		overflow: "hidden",
	},
	dnaload_text: {
		fontSize: 16,
		color: theme.tit2,
		marginTop: 7
	},
	dna_photo_btn: {
		marginBottom: 30,
		padding: 0,
		paddingHorizontal: 100,
	},
	dna_photo_btn_text: {
		color: theme.toolbarbg,
		fontSize: 15,
	},
	dna_photo_con: {
		flex: 1,
		backgroundColor: theme.toolbarbg,
		borderTopLeftRadius: 16.7,
		borderTopRightRadius: 16.7,
	},
	dna_photo_info: {
		justifyContent: "center",
		alignItems: "center",
	},
	dna_photo_avatar: {
		position: "absolute",
		top: -18,
		width: 52.5,
		height: 52.5,
		borderRadius: 50,
		overflow: "hidden",
		borderColor: theme.toolbarbg,
		borderWidth: 2.5,
	},
	dna_photo_closebtn: {
		position: "absolute",
		top: -38,
		right: 10,
	},
	dna_photo_msgcon: {
		paddingTop: 43,
		alignItems: "center",
	},
	dna_photo_uname: {
		fontSize: 15,
		color: theme.tit2,
		fontFamily: "PingFang SC",
		fontWeight: "bold",
		marginBottom: 16,
	},
	dna_photo_msg: {
		fontSize: 12,
		color: theme.text2,
		marginBottom: 16,
	},
	dna_photo_desc: {
		marginHorizontal: 25,
		fontSize: 12,
		color: theme.comment,
	},
	dna_photo_title: {
		marginVertical: 15,
		fontSize: 15,
		color: "#505AB3",
	},
	dna_photo_share: {
		position: "absolute",
		bottom: 0,
		left: 0,
		right: 0,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
		overflow: "hidden",
		shadowOpacity: 0.3,
		shadowRadius: 30,
		shadowOffset: {
			width: 0,
			height: 0,
		},
	}
});

export default UserDetail;