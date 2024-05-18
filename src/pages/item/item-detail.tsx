import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Image, Dimensions, ScrollView, TouchableOpacity } from "react-native";

import { Tabs, MaterialTabBar, MaterialTabItem } from "react-native-collapsible-tab-view"
import LinearGradient from "react-native-linear-gradient";
import { ShadowedView } from "react-native-fast-shadow";
import reactNativeTextSize from "react-native-text-size";

import StickyHeader from "../../components/StickyHeader";
import HeaderView from "../../components/headerview";
import ToastCtrl from "../../components/toastctrl";
import ShareDetail from "../../components/share/share-detail";
import { ModalPortal, SlideAnimation } from "../../components/modals";

import HaveChecked from "../../assets//svg/itemdetail/have-checked.svg";
import WantChecked from "../../assets//svg/itemdetail/want-checked.svg";
import SmeltChecked from "../../assets//svg/itemdetail/smelt-checked.svg";
import Yimai from "../../assets/svg/itemdetail/yimai.svg";
import OpenAll from "../../assets/svg/itemdetail/openall.svg";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import us from "../../services/user-service/user-service";
import itemService from "../../services/item-service/item-service";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlestarLeft, handlereplystarLeft } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";

const events = new NativeEventEmitter();
const { width, height } = Dimensions.get("window");
const classname = "ItemDetailPage";

const ItemHeader = React.memo(({ itemid, navigation }: any) => {

	// 数据
	const [seltitstr, setSeltitstr] = React.useState<any>("media"); // 选中的标题，值为photo(影像记录)和intro(官方简介)，默认为photo(影像记录)
	const [seltitstr2, setSeltitstr2] = React.useState<any>("innose"); // 选中的标题2，值为innose(包含它的香单)和inarticle(相关文章)，默认为innose(包含它的香单)
	const [seltitstr3, setSeltitstr3] = React.useState<any>("similar"); // 选中的标题3，值为similar(味道相似)和like(喜欢它的人也喜欢)，默认为similar(味道相似)
	const [introcontent, setIntroContent] = React.useState<string>(""); // 简介数据
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	let itemdata = React.useRef<any>({}); // 单品页数据
	let wikidata = React.useRef<any>({}); // 百科数据
	let odorpct = React.useRef<any>({}); // 气味百分比
	let odorlist = React.useRef<any[]>([]); // 气味数据
	let itemcolors = React.useRef<any>({}); // 单品页主题色
	let shortreply = React.useRef<any[]>([]); // 短评数据
	let similarlist = React.useRef<any[]>([]); // 相似单品数据
	let photolist = React.useRef<any[]>([]); // 图片影像数据
	let vodlist = React.useRef<any[]>([]); // 视频影像数据
	let innoselist = React.useRef<any[]>([]); // 包含它的香单数据
	let inforeply = React.useRef<any>({}); // 评论回复数据
	let maxtotal = React.useRef<number>(0); // 简介最大显示字数
	let intro_popover = React.useRef<any>({}); // 简介弹窗
	let wanteditem = React.useRef<any>({}); // 用户收藏数据
	let type2 = React.useRef<any>(""); // 收藏类型
	let odor_vote = React.useRef<any>({}); // 用户气味投票数据
	let odor_name = React.useRef<any>({}); // 投票后气味名称数据
	let isbuy_ = React.useRef<any>({}); // 是否购买
	let allodorcnt = React.useRef<number>(0); // 所有气味数量

	React.useEffect(() => {
		events.addListener(classname + itemid + "itemdatas", (data: any) => {
			itemdata.current = data.itemdata;
			wikidata.current = data.wikidata;
			odorpct.current = data.odorpct;
			odorlist.current = data.odorlist;
			allodorcnt.current = data.itemdata;
			getotherdata();
		})

		events.addListener(classname + itemid + "itemcolors", (data: any) => {
			itemcolors.current = data;
		});

		return () => {
			events.removeAllListeners(classname + itemid + "itemdatas");
			events.removeAllListeners(classname + itemid + "itemcolors");
			ModalPortal.dismiss(intro_popover.current);
		}
	}, []);

	// 获取一句话香评数据
	const getReplyData = () => {
		return new Promise((resolve, reject) => {
			cache.getItem(classname + itemid + "reply").then((cacheobj) => {
				if (cacheobj) {
					shortreply.current = cacheobj.reply;
					resolve(1);
				}
			}).catch(() => {
				http.post(ENV.reply + "?type=item&id=" + itemid, { uid: us.user.uid, did: us.did }).then((resp_data: any) => {
					cache.saveItem(classname + itemid + "reply", resp_data, 600);
					shortreply.current = resp_data.reply;
					resolve(1);
				});
			});
		})
	}

	// 获取味道相似数据
	const getSimilarData = () => {
		return new Promise((resolve, reject) => {
			cache.getItem(classname + itemid + "similar").then((cacheobj) => {
				if (cacheobj) {
					similarlist.current = cacheobj;
					resolve(1);
				}
			}).catch(() => {
				http.get(ENV.item + "?method=similar&id=" + itemid).then((resp_data: any) => {
					cache.saveItem(classname + itemid + "similar", resp_data, 600);
					similarlist.current = resp_data;
					resolve(1);
				});
			})
		})
	}

	// 获取影像数据
	const getMediaData = () => {
		return new Promise((resolve, reject) => {
			cache.getItem(classname + itemid + "media").then((cacheobj) => {
				if (cacheobj) {
					setmediadata(cacheobj);
					resolve(1);
				}
			}).catch(() => {
				http.get(ENV.item + "?method=mediav2&id=" + itemid + "&pagesize=24&page=1").then((resp_data: any) => {
					cache.saveItem(classname + itemid + "media", resp_data, 600);
					setmediadata(resp_data);
					resolve(1);
				});
			});
		})
	}

	// 设置影像数据
	const setmediadata = (data: any) => {
		photolist.current = data.medias.slice(0, 6);
		vodlist.current = data.vods;
		if (photolist.current.length > 0 || vodlist.current.length > 0) {
			setSeltitstr("media");
		} else {
			setSeltitstr("intro");
		}
	}

	// 获取包含它的香单数据
	const getInnoseData = () => {
		return new Promise((resolve, reject) => {
			cache.getItem(classname + itemid + "innose").then((cacheobj) => {
				if (cacheobj) {
					innoselist.current = cacheobj;
					resolve(1);
				}
			}).catch(() => {
				http.get(ENV.collection + "?method=searchitem&id=" + itemid).then((resp_data: any) => {
					cache.saveItem(classname + itemid + "innose", resp_data, 600);
					innoselist.current = resp_data;
					resolve(1);
				});
			});
		})
	}

	// 获取香水想要数据
	const getWantedData = () => {
		return new Promise((resolve, reject) => {
			if (!us.user.uid) {
				resolve(0);
			} else {
				http.post(ENV.reply + "?method=wanteditem&type=item&id=" + itemid + "&uid=" + us.user.uid, { token: us.user.token }).then((resp_data: any) => {
					if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
						us.delUser();
						resolve(0);
					} else {
						wanteditem.current = resp_data;
						switch (resp_data.type) {
							case "1":
								type2.current = "wanted";
								break;
							case "2":
								type2.current = "have";
								break;
							case "3":
								type2.current = "smelt";
								break;
							default:
								type2.current = "";
								break;
						}
						resolve(1);
					}
				});
			}
		})
	}

	// 获取气味投票数据
	const getOdorVoteData = () => {
		return new Promise((resolve, reject) => {
			if (!us.user.uid) {
				resolve(0);
			} else {
				http.post(ENV.item + "?method=getodorvote" + "&id=" + itemid + "&uid=" + us.user.uid, { token: us.user.token }).then((resp_data: any) => {
					if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
						us.delUser();
						resolve(0);
					} else {
						odor_vote.current = resp_data;
						resp_data.forEach((item: any) => {
							odor_name.current[item.uoodor] = parseInt(item.uocnt);
						})
						resolve(1);
					}
				});
			}
		})
	}

	// 获取用户是否买过当前商品
	const getIsBuy = () => {
		return new Promise((resolve, reject) => {
			if (!us.user.uid) {
				resolve(0);
			} else {
				http.post(ENV.item, { method: "isbuyv2", uid: us.user.uid, ids: [itemid] }).then((resp_data: any) => {
					if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
						us.delUser();
						resolve(0);
					} else {
						for (let i in resp_data) {
							isbuy_.current[resp_data[i]] = 1;
						}
						resolve(1);
					}
				});
			}
		})
	}

	// 获取其他数据
	const getotherdata = () => {
		setIsRender(false);
		Promise.all([getReplyData(), getSimilarData(), getMediaData(), getInnoseData(), getWantedData(), getOdorVoteData(), getIsBuy()]).then((data) => {
			if (data.length == 7) {
				setIsRender(true);
			}
		})

		// 评论回复数据
		/* cache.getItem(classname + "publish" + itemid).then((cacheobj) => {
			if (cacheobj && cacheobj.replytext != "") {
				inforeply.current = cacheobj;
			}
		}).catch(() => {
			return;
		}); */
	}

	// 设置可显示的简介
	const setIntrodata = (e: any) => {
		reactNativeTextSize.measure({
			width: e.nativeEvent.layout.width,
			fontSize: 14,
			fontFamily: "monospace",
			fontWeight: "normal",
			text: itemdata.current.intro,
			lineInfoForLine: 5
		}).then((data: any) => {
			maxtotal.current = data.lineInfo.start - 4;
			setIntroContent(itemdata.current.intro.slice(0, maxtotal.current));
		})
	}
	// 显示全部简介
	const showPopover = () => {
		let intro_list = itemdata.current.intro.split("\n");
		intro_list.forEach((item: string, index: number) => {
			intro_list[index] = (<Text key={index} style={styles.intro_popover_intro}>{item}</Text>)
		})
		intro_popover.current = ModalPortal.show((
			<View style={styles.intro_popover_con}>
				<Pressable style={styles.intro_popover_close} onPress={() => {
					ModalPortal.dismiss(intro_popover.current);
				}}>
					<Icon name="close" size={25} color={theme.placeholder} />
				</Pressable>
				<View style={styles.intro_popover_tit_con}>
					<Text style={styles.intro_popover_ctit}>{"官方简介"}</Text>
					<View style={styles.intro_popover_etit_con}>
						<View style={styles.etit_line}></View>
						<Text style={styles.intro_popover_etit}>{"Official Information"}</Text>
						<View style={styles.etit_line}></View>
					</View>
				</View>
				{itemdata.current && <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
					<TouchableOpacity activeOpacity={1} style={styles.intro_popover_info_con}>
						{itemdata.current.poster && <Image style={styles.intro_popover_poster}
							source={{ uri: ENV.image + "/post/" + itemdata.current.poster + ".jpg" }}
							resizeMode="contain" />}
						{itemdata.current.intro && <View>{intro_list}</View>}
					</TouchableOpacity>
				</ScrollView>}
			</View>
		), {
			width,
			height: height * 0.7,
			rounded: false,
			useNativeDriver: true,
			modalAnimation: new SlideAnimation({
				initialValue: 0,
				slideFrom: "bottom",
				useNativeDriver: true,
			}),
			onTouchOutside: () => {
				ModalPortal.dismiss(intro_popover.current);
			},
			swipeDirection: "down",
			animationDuration: 300,
			type: "bottomModal",
			modalStyle: { borderTopLeftRadius: 10, borderTopRightRadius: 10 },
		});
	}

	const vote = (x: any) => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "单品页" } });
		}
		setIsRender(false);
		if (!odor_name.current[x.uoodor]) odor_name.current[x.uoodor] = 0;
		if (odor_name.current[x.uoodor] < 3) {
			odor_name.current[x.uoodor] = odor_name.current[x.uoodor] + 1;
			x.cnt = parseInt(x.cnt) + 1;
		} else {
			delete odor_name.current[x.uoodor];
			x.cnt = parseInt(x.cnt) - 3;
		}
		allodorcnt.current = 0;
		itemdata.current.mainodor.forEach((item: any) => {
			allodorcnt.current += parseInt(item.cnt);
		});
		let pct = 0;
		itemdata.current.mainodor.forEach((item: any) => {
			pct = Math.round(((parseInt(item.cnt) / allodorcnt.current) * 100) * 10) / 10;
			odorpct.current[item.uoodor] = pct < 1 ? pct.toFixed(1) + "%" : pct.toFixed(0) + "%";
		});
		let params: any = [];
		Object.keys(odor_name.current).forEach((item: any) => {
			params.push({ uoodor: item, uocnt: odor_name.current[item].toString() });
		})
		http.post(ENV.item + "?method=postodor&id=" + itemid + "&uid=" + us.user.uid, { token: us.user.token, voteodor: params }).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				setIsRender(true);
				ToastCtrl.show({ message: "再次点击，可调整投票数：0～3", duration: 1000, viewstyle: "superior_toast" });
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {//20240229 shibo:处理token失效
				us.delUser();
				return;
			}
		})
	}

	return (
		<View style={styles.header_con}>
			<View style={styles.header_img_con}>
				<Image style={styles.header_img}
					resizeMode="contain"
					defaultSource={require("../../assets/images/noxx.png")}
					source={{ uri: ENV.image + "/perfume/" + itemid + ".jpg" }} />
			</View>
			<View style={styles.header_info_con}>
				{(itemcolors.current && itemcolors.current.itembgcolor) && <LinearGradient
					colors={[theme.toolbarbg, itemcolors.current.itembgcolor]}
					start={{ x: 0, y: 0 }}
					end={{ x: 0, y: 0.5 }}
					style={styles.header_con_bg}
				></LinearGradient>}
				{itemdata.current && <View style={styles.header_info_con_top}>
					<View style={{ paddingHorizontal: 16 }}>
						<Text style={styles.info_cnname}>{itemdata.current.cnname}</Text>
						<Text style={styles.info_enname}>{itemdata.current.enname}</Text>
						<View style={styles.favbtn_con}>
							{type2.current == "" && <>
								<View style={[styles.favbtn, { backgroundColor: itemcolors.current.itemcolor }]}>
									<Icon style={styles.favbtn_icon} name="heart3" size={16} color={theme.toolbarbg} />
									<Text style={styles.favbtn_text}>{"想要"}</Text>
								</View>
								<View style={[styles.favbtn, { backgroundColor: itemcolors.current.itemcolor }]}>
									<Icon style={styles.favbtn_icon} name="smell2" size={16} color={theme.toolbarbg} />
									<Text style={styles.favbtn_text}>{"闻过"}</Text>
								</View>
								<View style={[styles.favbtn, { backgroundColor: itemcolors.current.itemcolor }]}>
									<Icon style={styles.favbtn_icon} name="star3" size={16} color={theme.toolbarbg} />
									<Text style={styles.favbtn_text}>{"拥有"}</Text>
								</View>
							</>}
							{type2.current == "wanted" && <View style={styles.favbtned}>
								<View style={[styles.favbtn, { backgroundColor: itemcolors.current.itemcolor }]}>
									<WantChecked width={16} height={16} style={styles.favbtn_icon} />
									<Text style={styles.favbtn_text}>{"想要"}</Text>
								</View>
								<Text style={styles.favbtned_text}>{"我想要这款香水"}</Text>
							</View>}
							{type2.current == "smelt" && <View style={styles.favbtned}>
								<View style={[styles.favbtn, { backgroundColor: itemcolors.current.itemcolor }]}>
									<SmeltChecked width={16} height={16} style={styles.favbtn_icon} />
									<Text style={styles.favbtn_text}>{"闻过"}</Text>
								</View>
								<Text style={styles.favbtned_text}>{"我闻过这款香水"}</Text>
							</View>}
							{type2.current == "have" && <View style={styles.favbtned}>
								<View style={[styles.favbtn, { backgroundColor: itemcolors.current.itemcolor }]}>
									<HaveChecked width={16} height={16} style={styles.favbtn_icon} />
									<Text style={styles.favbtn_text}>{"已拥有"}</Text>
								</View>
								<Text style={styles.favbtned_text}>{"我拥有这款香水"}</Text>
							</View>}
						</View>
						<View style={[styles.card_con, { backgroundColor: itemcolors.current.itemcolor }]}>
							<View style={styles.card_top}>
								<Text style={styles.card_top_title}>{"香水时代评分"}</Text>
								{isbuy_.current[itemid] && <View style={styles.isbuy_con}>
									<Yimai width={15} height={15} style={{ marginRight: 3 }} />
									<Text style={styles.isbuy_text}>{"我买过这款香水"}</Text>
								</View>}
							</View>
							<View style={styles.card_middle}>
								<View style={styles.card_scores}>
									{itemdata.current.isscore > 0 && <Text style={styles.card_scores_text}>{itemdata.current.isscore}</Text>}
									{itemdata.current.isscore == 0 && <Text style={styles.card_noscores_text}>{"暂无评分"}</Text>}
									<View style={Globalstyles.star}>
										{itemdata.current.s0 == 1 && <Image
											style={[Globalstyles.star_icon, handlestarLeft(itemdata.current.s1)]}
											defaultSource={require("../../assets/images/nopic.png")}
											source={require("../../assets/images/star/starcard.png")}
										/>}
										{itemdata.current.s0 == 0 && <Image
											style={[Globalstyles.star_icon, handlestarLeft(itemdata.current.s1)]}
											defaultSource={require("../../assets/images/nopic.png")}
											source={require("../../assets/images/star/replystar.png")}
										/>}
									</View>
								</View>
								<View style={styles.card_score_bar_graph}>
									<View style={styles.stars_con}>
										{itemdata.current.stars && itemdata.current.stars.map((item: any, index: number) => {
											return (
												<View style={styles.stars_con_item} key={index}>
													<View style={Globalstyles.star_num}>
														<Image
															style={[Globalstyles.star_num_icon, Globalstyles["star_num_icon_" + (index + 1)]]}
															defaultSource={require("../../assets/images/nopic.png")}
															source={require("../../assets/images/star/starcard.png")}
														/>
													</View>
													<View style={styles.star_outbar}>
														<View style={[styles.star_inbar, { width: `${item}%` }]}></View>
													</View>
												</View>
											)
										})}
									</View>
									{itemdata.current.istotal >= 10 && <Text style={styles.card_istotal}>{itemdata.current.istotal + "人评价"}</Text>}
									{itemdata.current.istotal < 10 && <Text style={styles.card_istotal}>{"评分人数过少"}</Text>}
								</View>
							</View>
							<View style={styles.card_bottom}>
								{(itemdata.current.wantedcnt && itemdata.current.wantedcnt[0]) && <Text style={styles.wantedcnt}>{itemdata.current.wantedcnt[0] + "人想要"}</Text>}
								{(itemdata.current.wantedcnt && itemdata.current.wantedcnt[1]) && <Text style={styles.wantedcnt}>{itemdata.current.wantedcnt[1] + "人拥有"}</Text>}
								{(itemdata.current.wantedcnt && itemdata.current.wantedcnt[2]) && <Text style={styles.wantedcnt}>{itemdata.current.wantedcnt[2] + "人闻过"}</Text>}
							</View>
						</View>
						<View style={styles.nature_con}>
							<View style={[styles.nature, { marginBottom: 7 }]}>
								{itemdata.current.brand && <View style={styles.nature_item}>
									<Text style={styles.range_label}>品牌：</Text>
									<Text style={styles.range_label}>{itemdata.current.brand}</Text>
								</View>}
								{itemdata.current.perfumer && <View style={[styles.nature_item, styles.nature_item2]}>
									<Text style={styles.range_label}>调香师：</Text>
									<Text numberOfLines={1} style={[styles.range_label, { flex: 1 }]}>{itemdata.current.perfumer + ""}</Text>
								</View>}
							</View>
							<View style={styles.nature}>
								{itemdata.current.attrib && <View style={styles.nature_item}>
									<Text style={styles.range_label}>属性：</Text>
									<Text style={styles.range_label}>{itemdata.current.attrib}</Text>
								</View>}
								{itemdata.current.fragrance && <View style={[styles.nature_item, styles.nature_item2]}>
									<Text style={styles.range_label}>香调：</Text>
									<Text style={styles.range_label}>{itemdata.current.fragrance}</Text>
								</View>}
							</View>
						</View>
						{(itemdata.current.top || itemdata.current.middle || itemdata.current.base) && <View style={[styles.notes_con, styles.fragrance_con]}>
							<View style={[styles.notes_title_con, styles.fragrance_title_con]}>
								<View style={[styles.notes_title_bg, styles.fragrance_title_bg, { borderBottomColor: itemcolors.current.itemcolor }]}></View>
								<ShadowedView style={[styles.notes_title_bg_shadow, styles.fragrance_title_bg_shadow]}></ShadowedView>
								<Text style={styles.notes_title}>{"香调表"}</Text>
								<Text style={styles.notes_title}>{"Notes"}</Text>
							</View>
							<View style={[styles.notes_info_con, styles.fragrance_info_con, { backgroundColor: itemcolors.current.itemcolor }]}>
								{(itemdata.current.top && itemdata.current.top.length > 0) && <View style={styles.fragrance_info_item_con}>
									<LinearGradient
										colors={["transparent", "rgba(255,255,255,0.4)", "transparent"]}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 0 }}
										style={styles.fragrance_item_border}
									></LinearGradient>
									<View style={styles.notes_info_item}>
										<Text style={styles.fragrance_item_title}>{"前调："}</Text>
										{itemdata.current.top.map((item: any, index: number) => {
											return (
												<View key={item}>
													{wikidata.current[item] && <Pressable onPress={() => { }}>
														<Text style={[styles.fragrance_item_title, { marginRight: 3 }]}>{item}</Text>
													</Pressable>}
												</View>
											)
										})}
									</View>
								</View>}
								{(itemdata.current.middle && itemdata.current.middle.length > 0) && <View style={styles.fragrance_info_item_con}>
									<LinearGradient
										colors={["transparent", "rgba(255,255,255,0.4)", "transparent"]}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 0 }}
										style={styles.fragrance_item_border}
									></LinearGradient>
									<View style={styles.notes_info_item}>
										<Text style={styles.fragrance_item_title}>{"中调："}</Text>
										{itemdata.current.middle.map((item: any, index: number) => {
											return (
												<View key={item}>
													{wikidata.current[item] && <Pressable onPress={() => { }}>
														<Text style={[styles.fragrance_item_title, { marginRight: 3 }]}>{item}</Text>
													</Pressable>}
												</View>
											)
										})}
									</View>
								</View>}
								{(itemdata.current.base && itemdata.current.base.length > 0) && <View style={styles.fragrance_info_item_con}>
									<View style={styles.notes_info_item}>
										<Text style={styles.fragrance_item_title}>{"后调："}</Text>
										{itemdata.current.base.map((item: any, index: number) => {
											return (
												<View key={item}>
													{wikidata.current[item] && <Pressable onPress={() => { }}>
														<Text style={[styles.fragrance_item_title, { marginRight: 3 }]}>{item}</Text>
													</Pressable>}
												</View>
											)
										})}
									</View>
								</View>}
							</View>
						</View>}
						{(!(itemdata.current.top || itemdata.current.middle || itemdata.current.base) && itemdata.current.odor) && <View style={[styles.notes_con, styles.odor_con]}>
							<View style={[styles.notes_title_con, styles.odor_title_con]}>
								<View style={[styles.notes_title_bg, styles.odor_title_bg, { borderBottomColor: itemcolors.current.itemcolor }]}></View>
								<ShadowedView style={[styles.notes_title_bg_shadow, styles.odor_title_bg_shadow]}></ShadowedView>
								<Text style={styles.notes_title}>{"气味"}</Text>
								<Text style={styles.notes_title}>{"Notes"}</Text>
							</View>
							<View style={[styles.notes_info_con, styles.odor_info_con, { backgroundColor: itemcolors.current.itemcolor }]}>
								<View style={styles.notes_info_item}>
									{itemdata.current.odor.map((item: any, index: number) => {
										return (
											<View key={item}>
												{wikidata.current[item] && <Pressable onPress={() => { }}>
													<Text style={styles.odor_info_text}>{item}</Text>
												</Pressable>}
											</View>
										)
									})}
								</View>
							</View>
						</View>}
						{(itemdata.current.ptimevote && itemdata.current.ptimevote != 0) && <View style={styles.odor_time}>
							<Text style={styles.odor_time_title}>{"留香时间"}</Text>
							<View style={styles.odor_outbar}>
								{(itemcolors.current && itemcolors.current.itemcolor && itemcolors.current.itemcolor04) && <ShadowedView style={[styles.odor_inbar, { width: `${itemdata.current.ptimevote}%` }]}>
									<LinearGradient
										colors={[itemcolors.current.itemcolor, itemcolors.current.itemcolor04]}
										start={{ x: 0.1, y: 0 }}
										end={{ x: 1, y: 0 }}
										style={styles.odor_inbar_bg}
									>
									</LinearGradient>
									<Icon name="odortime" size={16} color={itemcolors.current.itemcolor} style={styles.odor_time_icon} />
								</ShadowedView>}
							</View>
						</View>}
					</View>
					{(itemdata.current.mainodor && itemdata.current.mainodor.length > 0) && <View style={styles.marginV20}>
						<Text style={styles.odor_vote_title}>{"闻到气味投票"}</Text>
						{itemdata.current.mainodor.length > 10 && <ScrollView horizontal={true} style={styles.odor_vote_list} showsHorizontalScrollIndicator={false}>
							{(odorlist.current && odorlist.current.length > 0) && odorlist.current.map((item: any, index: number) => {
								return (
									<View key={index} style={[styles.odor_vote_item_con, { width: (57 + 26) * Math.ceil(item.length / 2) - 26 }]}>
										{index == 0 && <LinearGradient
											colors={["transparent", "rgba(255,255,255,0.4)", "transparent"]}
											start={{ x: 0, y: 0 }}
											end={{ x: 0, y: 1 }}
											style={styles.odor_vote_line}
										></LinearGradient>}
										{(item && item.length > 0) && item.map((item2: any, index: number) => {
											return (
												<View key={item2.wid} style={{
													width: 57,
													marginRight: ((index + 1) % Math.ceil(item.length / 2)) == 0 ? 0 : 26,
													marginBottom: (index + 1) > Math.ceil(item.length / 2) ? 0 : 28,
												}}>
													<Pressable onPress={() => { vote(item2) }}>
														{odor_name.current[item2.uoodor] && <View style={styles.vote_num}>
															<Text style={[styles.vote_num_text, { fontSize: 22 }]}>{"+"}</Text>
															<Text style={[styles.vote_num_text, { fontSize: 24 }]}>{odor_name.current[item2.uoodor]}</Text>
														</View>}
														<Image style={styles.odor_vote_item_img}
															source={{ uri: ENV.image + "/odor/" + item2.wid + ".jpg" }}>
														</Image>
														<Text style={styles.odor_vote_item_pct}>{odorpct.current[item2.uoodor]}</Text>
													</Pressable>
													<Text numberOfLines={1} style={styles.odor_vote_item_text}>{item2.uoodor}</Text>
												</View>
											)
										})}
									</View>
								)
							})}
						</ScrollView>}
						{itemdata.current.mainodor.length <= 10 && <View style={[styles.odor_vote_list, { flexDirection: "row", flexWrap: "wrap" }]}>
							{itemdata.current.mainodor.length > 0 && itemdata.current.mainodor.map((item: any, index: number) => {
								return (
									<View key={item.wid} style={{
										width: 57,
										marginRight: (index + 1) == 5 || (index + 1) == 10 ? 0 : ((width - 40) - (57 * 5)) / 4,
										marginBottom: itemdata.current.mainodor.length > 5 ? ((index + 1) > 5 ? 0 : 28) : 0,
									}}>
										<View>
											<Image style={styles.odor_vote_item_img}
												source={{ uri: ENV.image + "/odor/" + item.wid + ".jpg" }}>
											</Image>
											<Text style={styles.odor_vote_item_pct}>{odorpct.current[item.uoodor]}</Text>
										</View>
										<Text numberOfLines={1} style={styles.odor_vote_item_text}>{item.uoodor}</Text>
									</View>
								)
							})}
						</View>}
					</View>}
					{(photolist.current.length > 0 || vodlist.current.length > 0 || itemdata.current.intro || itemdata.current.poster) && <View style={styles.marginV20}>
						<View style={styles.titstr_title}>
							{(photolist.current.length > 0 || vodlist.current.length > 0) && <Pressable style={styles.titstr_title_con} onPress={() => {
								if (seltitstr == "media") return;
								setSeltitstr("media");
							}}>
								<Text style={[styles.titstr_title_text, seltitstr == "media" && { opacity: 1 }]}>{"影像记录"}</Text>
								{((photolist.current.length > 0 || vodlist.current.length > 0) && (itemdata.current.intro || itemdata.current.poster)) && <View style={styles.titstr_title_line}></View>}
							</Pressable>}
							{(itemdata.current.intro || itemdata.current.poster) && <Pressable onPress={() => {
								if (seltitstr == "intro") return;
								setSeltitstr("intro");
							}}>
								<Text style={[styles.titstr_title_text, seltitstr == "intro" && { opacity: 1 }]}>{"官方简介"}</Text>
							</Pressable>}
						</View>
						{(seltitstr == "media" && (photolist.current.length > 0 || vodlist.current.length > 0)) && <ScrollView style={styles.paddingL20} horizontal={true} showsHorizontalScrollIndicator={false}>
							{(vodlist.current && vodlist.current.length > 0) && vodlist.current.map((item: any, index: number) => {
								return (
									<View key={item.mid} style={[styles.media_item_con, styles.vodlist_item_con]}>
										<Image style={styles.media_item_img}
											defaultSource={require("../../assets/images/nopic.png")}
											resizeMode="cover"
											source={{ uri: item.vpicurl }} />
										<Image style={styles.vodlist_item_triangle}
											resizeMode="cover"
											source={require("../../assets/images/player/play.png")} />
									</View>
								)
							})}
							{(photolist.current && photolist.current.length > 0) && photolist.current.map((item: any, index: number) => {
								return (
									<View key={item.mid} style={[styles.media_item_con, styles.photolist_item_con]}>
										<Image style={styles.media_item_img}
											defaultSource={require("../../assets/images/nopic.png")}
											resizeMode="cover"
											source={{ uri: ENV.image + "/" + item.picurl + ".jpg!l" }} />
									</View>
								)
							})}
							<Pressable style={styles.media_moredata_btn} onPress={() => {
								navigation.navigate("Page", { screen: "PicList", params: { id: itemid } });
							}}>
								<Text style={styles.media_moredata_btn_text}>{"全部照片"}</Text>
								<OpenAll width={12} height={12} style={styles.media_moredata_btn_icon} />
							</Pressable>
						</ScrollView>}
						{(seltitstr == "intro" && ((itemdata.current.intro && itemdata.current.intro.length > 0) || itemdata.current.poster)) && <Pressable style={styles.intro_con}
							onPress={showPopover}>
							{itemdata.current.poster && <Image style={styles.intro_img} source={{ uri: ENV.image + "/post/" + itemdata.current.poster + ".jpg" }} />}
							{itemdata.current.intro &&
								<View style={{ flex: 1 }} onLayout={setIntrodata}>
									<Text numberOfLines={5} style={[styles.intro_text, { fontFamily: "monospace" }]}>{introcontent}</Text>
									{itemdata.current.intro.length > maxtotal.current && <View style={styles.intro_morebtn_con}>
										<Text style={styles.intro_text}>{"..."}</Text>
										<Text style={styles.intro_morebtn_text}>{"展开"}</Text>
										<Icon style={{ transform: [{ translateY: 1 }] }} name="btmarrow" size={28} color={"rgba(255,255,255,0.3)"} />
									</View>}
								</View>}
						</Pressable>}
					</View>}
					{(innoselist.current && innoselist.current.length > 0) && <View style={styles.marginV20}>
						<View style={styles.titstr_title}>
							{innoselist.current.length > 0 && <Pressable style={styles.titstr_title_con} onPress={() => {
								if (seltitstr2 == "innose") return;
								setSeltitstr2("innose");
							}}>
								<Text style={[styles.titstr_title_text, seltitstr2 == "innose" && { opacity: 1 }]}>{"包含它的香单"}</Text>
								{/* <View style={styles.titstr_title_line}></View> */}
							</Pressable>}
							{/* {inarticle.current.length > 0 && <Pressable onPress={() => {
								if (seltitstr2 == "inarticle") return;
								setSeltitstr2("inarticle");
							}}>
								<Text style={[styles.titstr_title_text, seltitstr2 == "inarticle" && { opacity: 1 }]}>{"相关文章"}</Text>
							</Pressable>} */}
						</View>
						{(seltitstr2 == "innose" && innoselist.current.length > 0) && <ScrollView style={styles.paddingL20} horizontal={true} showsHorizontalScrollIndicator={false}>
							{(innoselist.current && innoselist.current.length > 0) && innoselist.current.map((item: any, index: number) => {
								return (
									<View key={item.cid} style={styles.h_list_item_con}>
										<View style={[styles.h_list_item_img_con, { backgroundColor: "rgba(0,0,0,0.09)" }]}>
											<Image style={styles.innose_item_img}
												defaultSource={require("../../assets/images/nopic.png")}
												resizeMode="cover"
												source={{ uri: ENV.image + "/" + item.cpic + "!l" }} />
										</View>
										<Text numberOfLines={2} style={styles.h_list_item_text}>{item.cname}</Text>
									</View>
								)
							})}
							<View style={{ marginRight: 20 }}></View>
						</ScrollView>}
						{/* {(seltitstr2 == "inarticle" && inarticlelist.current.length > 0) && <ScrollView style={styles.paddingL20} horizontal={true} showsHorizontalScrollIndicator={false}>
							{(inarticlelist.current && inarticlelist.current.length > 0) && inarticlelist.current.map((item: any, index: number) => {
								return (
									<View key={item.cid} style={styles.innose_item_con}></View>
								)
							})}
							<View style={{ marginRight: 20 }}></View>
						</ScrollView>} */}
					</View>}
					{(similarlist.current && similarlist.current.length > 0) && <View style={styles.marginV20}>
						<View style={styles.titstr_title}>
							{similarlist.current.length > 0 && <Pressable style={styles.titstr_title_con} onPress={() => {
								if (seltitstr3 == "similar") return;
								setSeltitstr3("similar");
							}}>
								<Text style={[styles.titstr_title_text, seltitstr3 == "similar" && { opacity: 1 }]}>{"味道相似"}</Text>
								{/* <View style={styles.titstr_title_line}></View> */}
							</Pressable>}
							{/* {likelist.current.length > 0 && <Pressable onPress={() => {
								if (seltitstr3 == "like") return;
								setSeltitstr3("like");
							}}>
								<Text style={[styles.titstr_title_text, seltitstr2 == "like" && { opacity: 1 }]}>{"喜欢它的人也喜欢"}</Text>
							</Pressable>} */}
						</View>
						{(seltitstr3 == "similar" && similarlist.current.length > 0) && <ScrollView style={styles.paddingL20} horizontal={true} showsHorizontalScrollIndicator={false}>
							{(similarlist.current && similarlist.current.length > 0) && similarlist.current.map((item: any, index: number) => {
								return (
									<View key={item.iid} style={styles.h_list_item_con}>
										<View style={[styles.h_list_item_img_con, { backgroundColor: theme.toolbarbg }]}>
											<Image style={styles.similar_item_img}
												defaultSource={require("../../assets/images/nopic.png")}
												resizeMode="contain"
												source={{ uri: ENV.image + "/perfume/" + item.iid + ".jpg!l" }} />
										</View>
										<Text numberOfLines={1} style={styles.h_list_item_text}>{item.ifullname}</Text>
									</View>
								)
							})}
							<View style={{ marginRight: 20 }}></View>
						</ScrollView>}
						{/* {(seltitstr3 == "like" && likelist.current.length > 0) && <ScrollView style={styles.paddingL20} horizontal={true} showsHorizontalScrollIndicator={false}>
							{(likelist.current && likelist.current.length > 0) && likelist.current.map((item: any, index: number) => {
								return (
									<View key={item.cid} style={styles.innose_item_con}></View>
								)
							})}
							<View style={{ marginRight: 20 }}></View>
						</ScrollView>} */}
					</View>}
					{(shortreply.current && shortreply.current.length > 0) && <View style={styles.shortreply_con}>
						<Text style={styles.shortreply_title}>{"一句话香评"}</Text>
						<View style={styles.shortreply_con_list}>
							{shortreply.current.map((item: any, index: number) => {
								return (
									<View key={item.udid} style={[styles.shortreply_item_con, index == 0 && { borderTopWidth: 0 }]}>
										<Image style={styles.shortreply_item_img} defaultSource={require("../../assets/images/default_avatar.png")}
											source={{ uri: ENV.avatar + item.replyuid + ".jpg!l?" + item.uface }} />
										<View style={styles.shortreply_item_info_con}>
											<View style={styles.info_name_con}>
												<Text style={styles.info_name}>{item.uname}</Text>
												<View style={Globalstyles.replystar}>
													<Image
														style={[Globalstyles.replystar_icon, handlereplystarLeft(item.uwscore * 2)]}
														defaultSource={require("../../assets/images/nopic.png")}
														source={require("../../assets/images/star/replystar.png")}
													/>
												</View>
											</View>
											<View style={styles.info_reply_con}>
												<Text style={styles.info_reply}>{item.content}</Text>
											</View>
										</View>
									</View>
								)
							})}
						</View>
					</View>}
				</View>}
			</View>
		</View>
	)
})

const ItemDetail = React.memo(({ route, navigation }: any) => {

	// 参数
	const { id, title } = route.params;

	// 数据
	const [showmenu, setShowMenu] = React.useState<boolean>(false); // 是否显示菜单
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	// 变量
	let itemdata = React.useRef<any>({}); // 单品页数据
	let allodorcnt = React.useRef<number>(0); // 所有气味数量
	let odorpct = React.useRef<any>({}); // 气味百分比
	let odorlist = React.useRef<any[]>([]); // 气味列表
	let wikidata = React.useRef<any>({}); // 百科数据
	let itemcolors = React.useRef<any>({}); // 单品页主题样式表
	let issubscription_ = React.useRef<any>({}); // 是否订阅到货

	React.useEffect(() => {
		init();
	}, [])

	// 初始化数据
	const initdata = () => {
		itemdata.current = [];
		itemcolors.current = {};
		odorlist.current = [];
		odorpct.current = {};
		allodorcnt.current = 0;
	}

	// 页面初始化
	const init = () => {
		setIsRender(false);
		http.get(ENV.item + "?id=" + id).then((resp_data: any) => {
			initdata();
			if (!resp_data.title) return;
			itemdata.current = resp_data;
			// 如果该商品评分为0,则右边的星级条都为0
			if (resp_data.isscore == 0) {
				resp_data.istars = [0, 0, 0, 0, 0];
			}
			// 设置香水评分(保留一位小数,例如评分为8则显示为8.0)
			if (resp_data.isscore.toString().length == 1 && resp_data.isscore != 0) {
				itemdata.current.isscore = resp_data.isscore + ".0";
			}
			itemdata.current.stars = resp_data.istars.reverse();
			itemdata.current.wantedcnt = resp_data.wantedcnt;
			// 调香师最多显示三个
			itemdata.current.perfumers = (resp_data.perfumers && resp_data.perfumers.length > 3) ? resp_data.perfumers.slice(0, 3) : resp_data.perfumers;
			itemdata.current.intro = resp_data.intro ? resp_data.intro.replace(/\<p\>/g, "\n") : "";

			itemdata.current.ptimevote = resp_data.ptimevote.toString();
			// 设置单品页主题样式表
			if (!resp_data.color) {
				resp_data.color = "";
			}
			setitemcolors(resp_data.color);

			if (itemdata.current.mainodor.length > 0) {
				itemdata.current.mainodor.forEach((item: any) => {
					allodorcnt.current += parseInt(item.cnt);
					odorpct.current[item.uoodor] = "0%";
				});
				let pct = 0;
				itemdata.current.mainodor.forEach((item: any) => {
					pct = Math.round(((parseInt(item.cnt) / allodorcnt.current) * 100) * 10) / 10;
					odorpct.current[item.uoodor] = pct < 1 ? pct.toFixed(1) + "%" : pct.toFixed(0) + "%";
				});
				if (itemdata.current.mainodor.length > 10) {
					for (let i = 0; i < itemdata.current.mainodor.length; i += 8) {
						odorlist.current.push(itemdata.current.mainodor.slice(i, i + 8))
					}
				}
			}
			for (var key in resp_data.wikidata) {
				let obj = resp_data.wikidata[key];
				wikidata.current[obj["wname"]] = obj["wid"];
				wikidata.current[obj["woriname"]] = obj["wid"];
			}
			loadaddtioninfo(id);
		})
	}

	const loadaddtioninfo = (id: number) => {
		events.emit(classname + id + "itemdatas", {
			itemdata: itemdata.current,
			wikidata: wikidata.current,
			odorpct: odorpct.current,
			odorlist: odorlist.current,
			allodorcnt: allodorcnt.current,
		});
		getIsSubscribe();
	}

	// 获取用户是否订阅当前商品到货
	const getIsSubscribe = () => {
		if (!us.user.uid) {
			setIsRender(true);
			return;
		}
		http.post(ENV.mall + "?uid=" + us.user.uid, { method: "issubscription", ids: [id], token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return;
			}
			for (var i in resp_data) {
				issubscription_.current[resp_data[i]] = 1;
			}
			setIsRender(true);
		});
	}

	// 根据原始hsl颜色计算出hsb颜色并设置
	const setitemcolors = (color: string) => {
		let colors = [],
			hsbcs = [],
			handle_hsbcs = [],
			hslcolors = [],
			handle_hsbbgcs = [],
			hslbgcolors = [],
			colorstr = "",
			bgcolorstr = "";
		let handle_color = color.match(/\((.+?)\)/);
		if (!handle_color) return;
		colors = handle_color[1].replace(/%/g, "").split(",");
		hsbcs = itemService.hslToHsb(colors[0], colors[1], colors[2]);
		handle_hsbcs = itemService.handlehsb(hsbcs[0], hsbcs[1], hsbcs[2]);
		handle_hsbbgcs = itemService.handlehsb(hsbcs[0], hsbcs[1], hsbcs[2], "bg");
		hslcolors = itemService.hsbToHsl(handle_hsbcs[0], handle_hsbcs[1], handle_hsbcs[2]);
		hslbgcolors = itemService.hsbToHsl(handle_hsbbgcs[0], handle_hsbbgcs[1], handle_hsbbgcs[2]);
		colorstr = hslcolors.map((num, index) => index > 0 ? num + "%" : num).join(",");
		bgcolorstr = hslbgcolors.map((num, index) => index > 0 ? num + "%" : num).join(",");
		itemcolors.current = {
			itemcolor: `hsl(${colorstr})`,
			itembgcolor: `hsl(${bgcolorstr})`,
			itemcolor04: `hsla(${colorstr},0.4)`,
		};
		events.emit(classname + id + "itemcolors", itemcolors.current);
	}

	// 显示/隐藏右上角菜单
	const showMenu = () => {
		let isShowmenu = !showmenu;
		setShowMenu(isShowmenu);
	}

	return (
		<>
			<HeaderView
				data={{
					title,
					isShowSearch: false,
					showmenu,
					style: { backgroundColor: itemcolors.current.itembgcolor },
					childrenstyle: {
						headercolor: { color: theme.toolbarbg },
						headertitle: { opacity: 1 },
					}
				}}
				method={{
					back: () => { navigation.goBack(); },
				}}
				MenuChildren={() => {
					return (
						<>
							<Pressable style={[styles.menu_icon_con, {}]}>
								<Icon style={styles.menu_icon} name="share2" size={13} color={theme.tit2} />
								<Text style={styles.menu_text}>{"分享"}</Text>
							</Pressable>
							<Pressable style={styles.menu_icon_con} onPress={() => { }}>
								<Icon style={styles.menu_icon} name="shopcart" size={15} color={theme.tit2} />
								<Text style={styles.menu_text}>{"去购买"}</Text>
							</Pressable>
							<Pressable style={styles.menu_icon_con} onPress={() => { }}>
								<Icon style={styles.menu_icon} name="edit" size={14} color={theme.tit2} />
								<Text style={styles.menu_text}>{"编辑香评"}</Text>
							</Pressable>
							<Pressable style={styles.menu_icon_con} onPress={() => { }}>
								<Icon style={styles.menu_icon} name="addlist" size={16} color={theme.tit2} />
								<Text style={styles.menu_text}>{"加入香单"}</Text>
							</Pressable>
							{issubscription_.current[id] && <Pressable style={styles.menu_icon_con} onPress={() => { }}>
								<Icon style={styles.menu_icon} name="star2-checked" size={16} color={theme.star} />
								<Text style={styles.menu_text}>{"取消到货提醒"}</Text>
							</Pressable>}
							{(!issubscription_.current[id] && !itemdata.current.onsale) && <Pressable style={styles.menu_icon_con} onPress={() => { }}>
								<Icon style={styles.menu_icon} name="star2" size={16} color={theme.tit2} />
								<Text style={styles.menu_text}>{"订阅到货提醒"}</Text>
							</Pressable>}
							<Pressable style={[styles.menu_icon_con, styles.no_border_bottom]} onPress={() => { }}>
								<Icon style={styles.menu_icon} name="cancelfav1" size={14} color={theme.tit2} />
								<Text style={styles.menu_text}>{"删除红心标记"}</Text>
							</Pressable>
						</>
					)
				}}>
				<Pressable style={{ zIndex: 1 }} onPress={showMenu}>
					<Icon name="sandian" size={20} color={theme.toolbarbg} style={styles.title_icon} />
				</Pressable>
			</HeaderView>
			<ShareDetail />
			<ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
				<ItemHeader itemid={id} navigation={navigation} />
			</ScrollView>
		</>
	);
})

const styles = StyleSheet.create({
	title_icon: {
		width: 44,
		height: 44,
		textAlign: "center",
		lineHeight: 44,
	},
	menu_icon_con: {
		paddingLeft: 10,
		paddingVertical: 15,
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
	},
	menu_text: {
		fontSize: 14,
		color: theme.tit2,
		marginRight: 15,
	},
	header_con: {
		width: "100%",
		backgroundColor: theme.toolbarbg,
	},
	header_img_con: {
		width: width,
		height: width * 0.65,
		alignItems: "center",
		marginTop: 12,
	},
	header_img: {
		width: width * 0.8,
		height: "100%",
		borderRadius: 8,
		backgroundColor: theme.toolbarbg,
	},
	header_info_con: {
		flex: 1,
	},
	header_con_bg: {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		zIndex: 1
	},
	header_info_con_top: {
		paddingTop: 5,
		zIndex: 2
	},
	info_cnname: {
		fontSize: 17,
		color: theme.text2,
		marginTop: 10,
		textAlign: "center",
	},
	info_enname: {
		fontSize: 13,
		color: theme.comment,
		marginTop: 5,
		textAlign: "center",
	},
	favbtn_con: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginTop: 24,
		marginHorizontal: 10,
	},
	favbtn: {
		width: "30%",
		height: 36,
		borderRadius: 8,
		overflow: "hidden",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	favbtn_icon: {
		marginRight: 5,
	},
	favbtn_text: {
		fontSize: 14,
		color: theme.toolbarbg,
		fontWeight: "500",
	},
	favbtned: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	favbtned_text: {
		color: "#777",
		fontSize: 14,
		marginLeft: 14
	},
	card_con: {
		marginTop: 18,
		marginHorizontal: 10,
		paddingTop: 12,
		paddingHorizontal: 15,
		borderRadius: 12,
		overflow: "hidden",
	},
	card_top: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	card_top_title: {
		fontSize: 15,
		color: theme.toolbarbg,
	},
	isbuy_con: {
		height: 18,
		flexDirection: "row",
		alignItems: "center",
	},
	isbuy_text: {
		fontSize: 13,
		color: theme.toolbarbg,
		marginRight: 15,
	},
	card_middle: {
		marginTop: 9,
		flexDirection: "row",
		justifyContent: "space-between",
		borderBottomWidth: 1,
		borderBottomColor: "rgba(255,255,255,.2)",
	},
	card_scores: {
		width: 90,
		alignItems: "center",
	},
	card_scores_text: {
		width: "100%",
		fontSize: 34,
		color: theme.toolbarbg,
		fontWeight: "500",
		textAlign: "center",
	},
	card_noscores_text: {
		fontSize: 13,
		lineHeight: 30,
		marginTop: 9,
		marginBottom: 6,
		color: "rgba(255,255,255,0.5)"
	},
	card_score_bar_graph: {
		flex: 1,
		marginBottom: 5,
		marginTop: 10,
		alignItems: "flex-end",
		paddingRight: 5,
	},
	stars_con: {
		alignItems: "center",
	},
	stars_con_item: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 2,
	},
	star_outbar: {
		flex: 1,
		height: 5,
		backgroundColor: "rgba(255,255,255,.4)",
		borderRadius: 4,
		overflow: "hidden",
	},
	star_inbar: {
		height: 5,
		backgroundColor: "#F5B220",
		borderRadius: 4,
	},
	card_istotal: {
		fontSize: 11,
		color: "rgba(255,255,255,.9)",
		opacity: 0.8
	},
	card_bottom: {
		flexDirection: "row",
		alignItems: "center",
		marginVertical: 8,
	},
	wantedcnt: {
		fontSize: 12,
		color: theme.toolbarbg,
		marginRight: 15,
	},
	nature_con: {
		width: width - 52,
		marginTop: 27,
		marginHorizontal: 10,
		backgroundColor: "rgba(255,255,255,.4)",
		padding: 19,
		borderRadius: 10,
	},
	nature: {
		width: "100%",
		flexDirection: "row",
		alignItems: "center",
	},
	nature_item: {
		minWidth: (width - 55) * 0.38,
		marginRight: 20,
		flexDirection: "row",
		alignItems: "center",
	},
	nature_item2: {
		flex: 1,
		marginRight: 0,
	},
	range_label: {
		fontSize: 14,
		color: theme.text2,
	},
	notes_con: {
		marginTop: 25,
		flexDirection: "row",
		marginHorizontal: 10,
	},
	notes_title_con: {
		alignItems: "center",
		justifyContent: "center",
		zIndex: 1,
	},
	notes_title_bg: {
		position: "absolute",
		top: 0,
		right: 0,
		left: 0,
		bottom: 0,
		zIndex: 1,
		borderTopWidth: 0,
		borderTopColor: "transparent",
		borderLeftColor: "transparent",
		borderRightColor: "transparent",
	},
	notes_title_bg_shadow: {
		position: "absolute",
		width: 1,
		zIndex: 0,
		shadowColor: "rgba(0,0,0,0.5)",
		shadowOpacity: 1,
		shadowRadius: 8,
		shadowOffset: {
			width: 0,
			height: 0,
		},
	},
	notes_title: {
		fontSize: 14,
		color: "rgba(255,255,255,.9)",
		zIndex: 2
	},
	notes_info_con: {
		width: width - 30,
		zIndex: 0,
		justifyContent: "center",
	},
	notes_info_item: {
		width: (width - 30) * 0.7,
		left: (width - 30) * 0.2,
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		justifyContent: "center",
	},
	fragrance_con: {
		transform: [{ translateX: -66 }],
	},
	fragrance_title_con: {
		width: 140,
		height: 140,
	},
	fragrance_title_bg: {
		borderBottomWidth: 140,
		borderLeftWidth: 70,
		borderRightWidth: 70,
	},
	fragrance_title_bg_shadow: {
		right: 34,
		height: 156,
		transform: [{ rotate: "-27deg" }],
	},
	fragrance_info_con: {
		height: 140,
		transform: [{ translateX: -70 }],
	},
	fragrance_info_item_con: {
		flex: 1,
		justifyContent: "center",
	},
	fragrance_item_title: {
		fontSize: 14,
		color: "rgba(255,255,255,0.85)",
	},
	fragrance_item_border: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		height: 0.5
	},
	odor_con: {
		transform: [{ translateX: -46 }],
	},
	odor_title_con: {
		width: 100,
		height: 100,
	},
	odor_title_bg: {
		borderBottomWidth: 100,
		borderLeftWidth: 50,
		borderRightWidth: 50,
	},
	odor_title_bg_shadow: {
		right: 24,
		height: 112,
		transform: [{ rotate: "-27deg" }],
	},
	odor_info_con: {
		height: 100,
		transform: [{ translateX: -50 }],
	},
	odor_info_text: {
		fontSize: 13.5,
		color: theme.toolbarbg,
		marginRight: 3,
	},
	odor_time: {
		marginTop: 26,
		marginHorizontal: 10,
		marginBottom: 16,
		flexDirection: "row",
		alignItems: "center",
	},
	odor_time_title: {
		fontSize: 13,
		color: "rgba(255,255,255,0.9)",
		marginRight: 15,
	},
	odor_outbar: {
		flex: 1,
		height: 10,
		backgroundColor: "rgba(255,255,255,0.5)",
		borderRadius: 5,
	},
	odor_inbar: {
		height: 10,
		borderRadius: 5,
		shadowColor: "rgba(0,0,0,0.05)",
		shadowOpacity: 1,
		shadowRadius: 2,
		shadowOffset: {
			width: 0,
			height: 0,
		},
	},
	odor_inbar_bg: {
		width: "100%",
		borderRadius: 5,
		height: 10
	},
	odor_time_icon: {
		position: "absolute",
		top: -5,
		right: -2,
	},
	marginV20: {
		marginVertical: 20,
	},
	paddingL20: {
		paddingLeft: 20,
	},
	odor_vote_title: {
		fontSize: 16,
		color: "rgba(255,255,255,0.9)",
		marginBottom: 15,
		marginLeft: 20,
		marginRight: 20,
	},
	odor_vote_line: {
		position: "absolute",
		marginVertical: 50,
		top: 0,
		bottom: 0,
		right: -28,
		width: 1,
	},
	odor_vote_list: {
		paddingHorizontal: 20,
	},
	odor_vote_item_con: {
		flexDirection: "row",
		flexWrap: "wrap",
		marginRight: 56
	},
	vote_num: {
		position: "absolute",
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		backgroundColor: "rgba(0,0,0,0.5)",
		zIndex: 5,
		borderRadius: 5,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingRight: 5,
	},
	vote_num_text: {
		fontWeight: "600",
		color: theme.toolbarbg
	},
	odor_vote_item_img: {
		width: 57,
		height: 57,
		borderRadius: 5,
	},
	odor_vote_item_pct: {
		position: "absolute",
		right: 0,
		bottom: 0,
		fontSize: 10,
		color: "rgba(255,255,255,0.8)",
		paddingHorizontal: 3,
		borderTopLeftRadius: 6,
		borderBottomRightRadius: 5,
		backgroundColor: "rgba(0,0,0,0.35)",
	},
	odor_vote_item_text: {
		fontSize: 14,
		textAlign: "center",
		marginTop: 9,
		color: "rgba(255,255,255,0.9)",
	},
	titstr_title: {
		flexDirection: "row",
		paddingHorizontal: 20,
		paddingBottom: 15,
		opacity: 0.9,
	},
	titstr_title_con: {
		flexDirection: "row",
		alignItems: "center",
	},
	titstr_title_text: {
		fontSize: 16,
		color: theme.toolbarbg,
		fontWeight: "500",
		opacity: 0.7,
	},
	titstr_title_line: {
		width: 1,
		height: 12,
		right: 0,
		backgroundColor: "rgba(255,255,255,0.7)",
		marginHorizontal: 7,
	},
	media_item_con: {
		height: 141,
		borderRadius: 8,
		overflow: "hidden",
		marginRight: 19,
	},
	media_item_img: {
		width: "100%",
		height: "100%",
		borderRadius: 8,
	},
	vodlist_item_con: {
		width: 141 / 1080 * 1728,
	},
	vodlist_item_triangle: {
		position: "absolute",
		width: 27,
		height: 27,
		zIndex: 9,
		bottom: 10,
		right: 14,
		borderRadius: 27,
		borderWidth: 1,
		borderColor: theme.toolbarbg,
	},
	photolist_item_con: {
		width: 200,
	},
	media_moredata_btn: {
		width: 58,
		height: 141,
		marginRight: 40,
		backgroundColor: "rgba(0,0,0,0.1)",
		borderRadius: 8,
		alignItems: "center",
		justifyContent: "center",
	},
	media_moredata_btn_text: {
		width: 14,
		lineHeight: 18,
		fontWeight: "500",
		color: "rgba(255,255,255,0.5)",
	},
	media_moredata_btn_icon: {
		opacity: 0.4,
		marginVertical: 3,
	},
	intro_con: {
		height: 141,
		padding: 12,
		borderRadius: 10,
		marginHorizontal: 20,
		overflow: "hidden",
		flexDirection: "row",
		justifyContent: "center",
		backgroundColor: "rgba(0,0,0,0.1)",
	},
	intro_img: {
		width: 96,
		height: "100%",
		borderRadius: 10,
		marginRight: 13,
	},
	intro_text: {
		fontSize: 14,
		lineHeight: 23,
		color: "rgba(255,255,255,0.7)",
	},
	intro_morebtn_con: {
		position: "absolute",
		right: -5,
		bottom: -3,
		flexDirection: "row",
		alignItems: "center",
	},
	intro_morebtn_text: {
		fontSize: 14,
		transform: [{ translateX: 5 }],
		color: "rgba(255,255,255,0.3)",
	},
	h_list_item_con: {
		width: 103,
		marginRight: 19,
	},
	h_list_item_img_con: {
		width: 103,
		height: 103,
		borderRadius: 8,
		overflow: "hidden",
		alignItems: "center",
		justifyContent: "center",
	},
	innose_item_img: {
		width: "100%",
		height: "100%",
	},
	similar_item_img: {
		width: "80%",
		height: "80%",
	},
	h_list_item_text: {
		fontSize: 14,
		color: "rgba(255,255,255,0.9)",
		maxWidth: 103,
		lineHeight: 18,
		marginTop: 11,
	},
	shortreply_con: {
		marginTop: 20,
		marginBottom: 40,
		marginHorizontal: 20,
		paddingTop: 15,
		paddingBottom: 8,
		paddingHorizontal: 18,
		borderRadius: 10,
		overflow: "hidden",
		backgroundColor: "rgba(0,0,0,0.1)",
	},
	shortreply_title: {
		fontSize: 16,
		color: "rgba(255,255,255,0.9)",
		fontWeight: "500",
	},
	shortreply_con_list: {
		marginTop: 10,
	},
	shortreply_item_con: {
		paddingVertical: 14,
		flexDirection: "row",
		borderTopWidth: 1,
		borderTopColor: "rgba(255,255,255,0.04)",
	},
	shortreply_item_img: {
		width: 30,
		height: 30,
		borderRadius: 50,
	},
	shortreply_item_info_con: {
		flex: 1,
		marginLeft: 14,
	},
	info_name_con: {
		flexDirection: "row",
		alignItems: "center",
	},
	info_name: {
		fontSize: 14,
		fontFamily: "PingFang SC",
		fontWeight: "500",
		marginRight: 9,
		color: theme.toolbarbg,
	},
	info_reply_con: {
		flex: 1,
		marginTop: 8,
		opacity: 0.8,
	},
	info_reply: {
		fontSize: 14,
		color: theme.toolbarbg
	},
	intro_popover_con: {
		width: "100%",
		height: "100%",
		maxHeight: height * 0.7,
		paddingTop: 25,
		paddingHorizontal: 36,
		backgroundColor: theme.toolbarbg,
	},
	intro_popover_close: {
		position: "absolute",
		top: 21,
		right: 21
	},
	intro_popover_tit_con: {
		marginBottom: 20,
		alignItems: "center",
	},
	intro_popover_ctit: {
		fontSize: 16,
		fontWeight: "500",
		color: theme.text2,
	},
	intro_popover_etit_con: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 2,
	},
	intro_popover_etit: {
		fontSize: 12,
		color: theme.text2,
	},
	etit_line: {
		width: 18,
		height: 1,
		backgroundColor: theme.text2,
		marginHorizontal: 7,
	},
	intro_popover_info_con: {
		height: "100%",
		alignItems: "center",
		paddingBottom: 100,
	},
	intro_popover_poster: {
		width: 200,
		height: 200,
		marginTop: 22,
		marginBottom: 42,
	},
	intro_popover_intro: {
		fontSize: 15,
		color: theme.text2,
		opacity: 0.95,
		lineHeight: 26,
		marginBottom: 15
	},
});

export default ItemDetail;