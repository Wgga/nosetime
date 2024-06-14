import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, Image } from "react-native";

import { FlashList } from "@shopify/flash-list";

import ListBottomTip from "../../components/listbottomtip";

import smartService from "../../services/smart-service/smart-service";
import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";
import events from "../../hooks/events/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlestarLeft } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

const SmartDiscuss = React.memo(({ navigation }: any) => {
	// 控件
	// 变量
	let word = React.useRef<any>("discuss"); // 当前新鲜事评论数据
	// 数据
	let talentTop = React.useRef<any[]>([]); // 资深评论家部分数据
	let smartlist = React.useRef<any[]>([]); // 新鲜事评论数据
	let perfumelist = React.useRef<any[]>([]); // 香单广场部分数据
	// 参数
	// 状态
	let noMore = React.useRef<any>(false); // 是否还有更多新鲜事评论数据
	const [isrender, setIsRender] = React.useState(false); // 是否渲染

	React.useEffect(() => {
		init();
		events.subscribe("nosetime_smartlistUpdated", (type: string) => {
			smartlist.current = smartService.getItems(word.current);
			noMore.current = !smartService.moreDataCanBeLoaded(type);
			setIsRender(val => !val);
		});
		events.subscribe("nosetime_smartlistUpdatedError", (type: string) => {
			noMore.current = !smartService.moreDataCanBeLoaded(type);
			setIsRender(val => !val);
		});

		return () => {
			events.unsubscribe("nosetime_smartlistUpdated");
			events.unsubscribe("nosetime_smartlistUpdatedError");
		}
	}, []);

	const getTalentData = () => {
		return new Promise((resolve, reject) => {
			cache.getItem("SmartTalent").then((cacheobj) => {
				if (cacheobj) {
					talentTop.current = cacheobj.slice(0, 3);
					resolve(1);
				}
			}).catch(() => {
				http.get(ENV.smart + "?method=gettalent").then((resp_data: any) => {
					cache.saveItem("SmartTalent", resp_data, 600);
					talentTop.current = resp_data.slice(0, 3);
					resolve(1);
				});
			});
		})
	}

	const getPerfumeList = () => {
		return new Promise((resolve, reject) => {
			http.get(ENV.collection + "?method=getsquare").then((resp_data: any) => {
				perfumelist.current = resp_data;
				resolve(1);
			});
		})
	}

	const init = () => {
		smartService.fetch(word.current, us.user.uid, "init");
		Promise.all([getTalentData(), getPerfumeList()]).then((data) => {
			if (data.includes(0)) {
				return navigation.navigate("Page", { screen: "Login", params: { src: "App发现页新鲜事" } });
			}
			setIsRender(val => !val);
		})
	}

	const gotodetail = (page: string, item: any = null) => {
		if (page == "item-detail") {
			navigation.navigate("Page", { screen: "ItemDetail", params: { id: item.id, src: "APP新鲜事" } });
		} else {
			navigation.navigate("Page", { screen: page });
		}
	}

	return (
		<>
			{(smartlist.current && smartlist.current.length > 0) && <FlashList data={smartlist.current}
				extraData={isrender}
				estimatedItemSize={100}
				onEndReached={() => {
					smartService.fetch(word.current, us.user.uid, "loadMore");
				}}
				onEndReachedThreshold={0.1}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ backgroundColor: theme.toolbarbg }}
				keyExtractor={(item: any) => item.id + "_" + item.uid}
				ListHeaderComponent={<View style={Globalstyles.container}>
					<Pressable onPress={() => {
						gotodetail("Talent");
					}} style={[styles.like_con, styles.flex_row]}>
						<Text style={styles.flex_row_tit}>{"资深评论家"}</Text>
						<View style={styles.flex_row}>
							{(talentTop.current && talentTop.current.length > 0) && talentTop.current.map((item: any, index: number) => {
								return (
									<Image key={item.uid} style={styles.like_avatar} defaultSource={require("../../assets/images/default_avatar.png")}
										source={{ uri: ENV.avatar + item.uid + ".jpg?" + item.uface }}
									/>
								);
							})}
							<Icon name="r-return" size={15} color={theme.tit2} />
						</View>
					</Pressable>
					<Pressable onPress={() => {
						gotodetail("PerfumeListSquare");
					}} style={[styles.perfume_tit_con, styles.flex_row]}>
						<Text style={styles.flex_row_tit}>{"香单广场"}</Text>
						<Icon name="r-return" size={15} color={theme.tit2} />
					</Pressable>
					<View style={styles.perfume_list_con}>
						{(perfumelist.current && perfumelist.current.length > 0) && perfumelist.current.map((item: any, index: number) => {
							return (
								<View key={item.cid} style={[styles.perfume_item, { marginRight: (index + 1) % 3 == 0 ? 0 : 10 }]}>
									<Image style={styles.perfume_item_img} defaultSource={require("../../assets/images/nopic.png")}
										source={{ uri: ENV.image + item.cpic + "!l" }}
									/>
									<Text numberOfLines={2} style={styles.perfume_item_desc}>{item.cname}</Text>
								</View>
							)
						})}
					</View>
				</View>}
				renderItem={({ item, index }: any) => {
					return (
						<View style={styles.smartlist_item_con}>
							<Pressable onPress={() => {
								gotodetail("item-detail", item);
							}}>
								<Image style={styles.item_img} defaultSource={require("../../assets/images/noxx.png")}
									source={{ uri: ENV.image + "/perfume/" + item.id + ".jpg!m" }}
									resizeMode="contain"
								/>
							</Pressable>
							<View style={styles.item_info}>
								<Pressable onPress={() => {
									gotodetail("item-detail", item);
								}}>
									<Text numberOfLines={1} style={styles.item_cnname}>{item.cnname}</Text>
								</Pressable>
								<Pressable onPress={() => {
									gotodetail("item-detail", item);
								}}>
									<Text numberOfLines={1} style={styles.item_enname}>{item.enname}</Text>
								</Pressable>
								<View style={styles.item_uname}>
									<Text style={styles.item_uname_text}>{item.uname}</Text>
									{item.score > 0 && <View style={Globalstyles.star}>
										<Image
											style={[Globalstyles.star_icon, handlestarLeft(item.score * 2)]}
											defaultSource={require("../../assets/images/nopic.png")}
											source={require("../../assets/images/star/star.png")}
										/>
									</View>}
								</View>
								{(item.odors && item.odors.length > 0) && <View style={styles.item_tagodor_con}>
									{item.odors.map((item: any, index: number) => {
										return (
											<Image key={item} style={styles.item_tagodor_img} defaultSource={require("../../assets/images/nopic.png")}
												source={{ uri: ENV.image + "/odor/" + item + ".jpg" }} />
										)
									})}
								</View>}
								{item.desc && <Pressable style={{ marginTop: 14 }} onPress={() => {
									if (item.desc2) {
										item.isopen = !item.isopen;
										setIsRender(val => !val);
									}
								}}>
									{item.isopen && <Text style={[styles.desc_text, { fontFamily: "monospace" }]}>{item.desc}</Text>}
									{!item.isopen && <Text style={[styles.desc_text, { fontFamily: "monospace" }]}>{item.desc2}</Text>}
									{item.desc2 && <View style={[styles.desc_morebtn_con, item.isopen && styles.open_morebtn]}>
										{!item.isopen && <Text style={styles.desc_text}>{"..."}</Text>}
										{!item.isopen && <Text style={styles.desc_morebtn_text}>{"(显示全部)"}</Text>}
										{item.isopen && <Text style={styles.desc_morebtn_text}>{"(收起全部)"}</Text>}
									</View>}
								</Pressable>}
							</View>
						</View>
					)
				}}
				ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={smartlist.current.length > 0} />}
			/>}
		</>
	);
})

const styles = StyleSheet.create({
	flex_row: {
		flexDirection: "row",
		alignItems: "center",
	},
	flex_row_tit: {
		fontSize: 15,
		color: theme.tit2,
	},
	like_con: {
		height: 55,
		borderBottomWidth: 1,
		borderBottomColor: theme.bg,
		justifyContent: "space-between",
		paddingHorizontal: 20,
	},
	like_avatar: {
		width: 30,
		height: 30,
		borderRadius: 15,
		overflow: "hidden",
		marginRight: 5,
	},
	perfume_tit_con: {
		height: 48,
		justifyContent: "space-between",
		paddingHorizontal: 20,
	},
	perfume_list_con: {
		flexDirection: "row",
		flexWrap: "wrap",
		paddingHorizontal: 20,
	},
	perfume_item: {
		width: (width - 40 - 20) / 3,
	},
	perfume_item_img: {
		width: "100%",
		height: (width - 40 - 20) / 3,
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: theme.bg,
	},
	perfume_item_desc: {
		marginTop: 8,
		marginBottom: 19,
		fontSize: 14,
		color: theme.text1
	},
	smartlist_con: {
		paddingTop: 8,
	},
	smartlist_item_con: {
		marginTop: 11,
		marginBottom: 14,
		marginHorizontal: 15,
		flexDirection: "row",
	},
	item_img: {
		width: 50,
		height: 50,
		borderRadius: 6,
		overflow: "hidden",
		marginRight: 9,
		backgroundColor: theme.toolbarbg,
	},
	item_info: {
		flex: 1,
	},
	item_cnname: {
		fontSize: 14,
		color: theme.tit2,
	},
	item_enname: {
		fontSize: 14,
		color: theme.text2,
		marginTop: 3,
	},
	item_uname: {
		flexDirection: "row",
		flexWrap: "wrap",
		alignItems: "center",
		marginTop: 4,
		marginBottom: 13,
	},
	item_uname_text: {
		fontSize: 13,
		marginRight: 5,
		color: theme.comment
	},
	item_tagodor_con: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 2,
	},
	item_tagodor_img: {
		width: 28,
		height: 28,
		borderRadius: 4,
		overflow: "hidden",
		opacity: 0.8,
		marginRight: 6,
	},
	desc_text: {
		fontSize: 14,
		lineHeight: 20,
		color: theme.text1,
	},
	desc_morebtn_con: {
		position: "absolute",
		right: 0,
		bottom: 0,
		flexDirection: "row",
		alignItems: "center",
	},
	open_morebtn: {
		position: "relative",
		justifyContent: "flex-end",
	},
	desc_morebtn_text: {
		fontSize: 14,
		color: theme.text1,
		marginLeft: 8,
	},
});
export default SmartDiscuss;