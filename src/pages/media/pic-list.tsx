import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, FlatList, Image } from "react-native";

import FastImage from "react-native-fast-image";

import HeaderView from "../../components/headerview";
import ListBottomTip from "../../components/listbottomtip";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");
const classname = "PicListPage";

function PicList({ route, navigation }: any): React.JSX.Element {
	// 控件
	// 参数
	// 变量
	let cur_page = React.useRef<number>(1); // 当前页码
	let total = React.useRef<number>(0); // 总页码
	// 数据
	let params = React.useRef<any>({
		id: 0,
		src: "",
		title: "",
	});
	let photolist = React.useRef<any[]>([]); // 媒体数据
	let vodlist = React.useRef<any[]>([]); // 视频数据
	let smart_vodlist = React.useRef<any[]>([]); // 发现单品视频数据
	// 状态
	let noMore = React.useRef<boolean>(false); // 是否还有更多
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		if (route.params) {
			params.current = route.params;
		}
		init();
	}, []);

	const init = () => {
		cur_page.current = 1;
		if (params.current.src == "itemdetail") {
			cache.getItem("ItemDetailPage" + params.current.id + "media").then((cacheobj) => {
				if (cacheobj) {
					setmediadata(cacheobj);
				}
			}).catch(() => {
				http.get(ENV.item + "?method=mediav2&id=" + params.current.id + "&pagesize=24&page=" + cur_page.current).then((resp_data: any) => {
					setmediadata(resp_data);
				})
			});
		} else if (params.current.src == "smarthejivod") {
			cache.getItem("SmartEvaluatePagehjvodlist").then((cacheobj) => {
				if (cacheobj) {
					setitems("hejivod", cacheobj, "items_heji");
				}
			}).catch(() => {
				http.get(ENV.evaluate + "?method=gethomemorevod").then((resp_data: any) => {
					cache.saveItem(classname + "hjvodlist", resp_data, 600);
					setitems("SmartEvaluatePagehejivod", resp_data, "items_heji");
				})
			});
		} else if (params.current.src == "smartsinglevod") {
			cache.getItem("SmartEvaluatePagevodlist").then((cacheobj: any) => {
				if (cacheobj) {
					setitems("singlevod", cacheobj, "items");
				}
			}).catch(() => {
				http.get(ENV.evaluate + "?method=gethomevodlist&pagesize=20&page=" + cur_page.current).then((resp_data: any) => {
					cache.saveItem("SmartEvaluatePagevodlist", resp_data, 600);
					setitems("singlevod", resp_data, "items");
				})
			});
		}
	}

	const setitems = (src: string, resp: any, type: string) => {
		resp[type].map((item: any) => {
			item["mainname"] = item["name"] ? item["name"].split("：")[0] : "";
			item["subname"] = item["name"] ? item["name"].split("：")[1] : "";
		});
		if (cur_page.current == 1) {
			smart_vodlist.current = [];
		}
		if (src == "singlevod") {
			if (cur_page.current == 1) {
				smart_vodlist.current = resp.items;
			} else {
				smart_vodlist.current = smart_vodlist.current.concat(resp.items);
			}
			noMore.current = (resp.items.length < resp.perpage);
		} else {
			smart_vodlist.current = resp[type];
		}
		setIsRender(val => !val);
	}

	const loadMore = () => {
		if (params.current.src == "smarthejivod" || noMore.current) return;
		cur_page.current += 1;
		if (params.current.src == "itemdetail") {
			http.get(ENV.item + "?method=mediav2&id=" + params.current.id + "&pagesize=24&page=" + cur_page.current).then((resp_data: any) => {
				setmediadata(resp_data);
			})
		} else {
			http.get(ENV.evaluate + "?method=gethomevodlist&pagesize=20&page=" + cur_page.current).then((resp_data: any) => {
				setitems("singlevod", resp_data, "items");
			})
		}
	}

	const setmediadata = (items: any) => {
		total.current = parseInt(items.total);
		if (cur_page.current == 1) {
			photolist.current = items.medias;
			if (items.vods.length > 0) {
				items.vods.map((item: any) => {
					item.vname = item.vname.replace(params.current.id, "").replace(".mp4", "").trim();
					item["main_name"] = item.vname.split("：")[0];
					item["sub_name"] = item.vname.split("：")[1];
				});
				vodlist.current = items.vods;
			}
		} else {
			photolist.current = photolist.current.concat(items.medias);
		}
		let maxnum = total.current - vodlist.current.length;
		noMore.current = !(photolist.current.length < maxnum);
		setIsRender(val => !val);
	}

	const getid = (item: any) => {
		if (params.current.src == "smarthejivod") {
			return item.viid;
		} else {
			return item.mid;
		}
	}

	return (
		<>
			<HeaderView data={{
				title: params.current.src == "itemdetail" ? "全部视频照片（" + total.current + "）" : params.current.title,
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg },
				childrenstyle: {
					headercolor: { color: theme.text2 },
					headertitle: { opacity: 1 },
				}
			}} method={{
				back: () => { navigation.goBack(); },
			}} />
			{(params.current.src == "itemdetail" && photolist.current && photolist.current.length > 0) && <FlatList data={photolist.current}
				horizontal={false}
				contentContainerStyle={styles.photolist_con}
				keyExtractor={(item: any) => item.mid}
				numColumns={3}
				showsVerticalScrollIndicator={false}
				columnWrapperStyle={styles.photolist_item_con}
				ListHeaderComponent={<>
					{(vodlist.current && vodlist.current.length > 0) && <View style={styles.vodlist_con}>
						{vodlist.current.map((item: any, index: number) => {
							return (
								<View key={item.mid} style={styles.vodlist_item}>
									<View style={styles.item_image_con}>
										<FastImage style={styles.item_image} source={{ uri: item.vpicurl }} />
										<Image style={styles.triangle}
											source={require("../../assets/images/player/play.png")}
											resizeMode="cover"
										/>
									</View>
									<Text numberOfLines={1} style={styles.item_main_name}>{item.main_name}</Text>
									<Text numberOfLines={1} style={styles.item_sub_name}>{item.sub_name}</Text>
								</View>
							)
						})}
					</View>}
				</>}
				onEndReachedThreshold={0.1}
				onEndReached={loadMore}
				renderItem={({ item, index }: any) => {
					return (
						<View style={styles.photolist_item}>
							<FastImage style={styles.photolist_item_img}
								defaultSource={require("../../assets/images/nopic.png")}
								source={{
									uri: ENV.image + "/" + item.picurl + ".jpg!l",
								}}
								resizeMode={FastImage.resizeMode.cover}
							/>
						</View>
					)
				}}
				ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={photolist.current.length > 0} />}
			/>}
			{(params.current.src != "itemdetail" && smart_vodlist.current && smart_vodlist.current.length > 0) && <FlatList data={smart_vodlist.current}
				horizontal={false}
				contentContainerStyle={styles.smartvodlist_con}
				keyExtractor={(item: any) => getid(item)}
				showsVerticalScrollIndicator={false}
				numColumns={2}
				onEndReachedThreshold={0.1}
				onEndReached={loadMore}
				renderItem={({ item, index }: any) => {
					return (
						<View style={{
							marginBottom: 14,
							marginLeft: (index + 1) % 2 == 0 ? 7 : 0,
							marginRight: (index + 1) % 2 == 1 ? 7 : 0
						}}>
							<View style={styles.list_img_con}>
								<FastImage style={{ width: "100%", height: "100%" }}
									defaultSource={require("../../assets/images/nopic.png")}
									source={{ uri: item.vpicurl }}
								/>
								<Image style={[styles.triangle, styles.list_triangle]}
									source={require("../../assets/images/player/play.png")}
								/>
							</View>
							{item.mainname && <Text numberOfLines={1} style={[styles.vod_mainname, styles.vod_width]}>{item.mainname}</Text>}
							{item.subname && <Text numberOfLines={1} style={[styles.vod_subname, styles.vod_width]}>{item.subname}</Text>}
						</View>
					)
				}}
				ListFooterComponent={
					params.current.src == "smartsinglevod" ? <ListBottomTip noMore={noMore.current} isShowTip={smart_vodlist.current.length > 0} /> : null
				}
			/>}
		</>
	);
}
const styles = StyleSheet.create({
	vodlist_con: {
		paddingTop: 15,
		marginBottom: 20,
		paddingHorizontal: 20,
		borderBottomWidth: 8,
		borderBottomColor: theme.bg,
	},
	vodlist_item: {
		marginBottom: 20,
	},
	item_image_con: {
		width: width - 40,
		aspectRatio: 1728 / 1080,
		borderRadius: 10,
		overflow: "hidden",
	},
	item_image: {
		width: "100%",
		height: "100%",
	},
	triangle: {
		position: "absolute",
		width: 54,
		height: 54,
		zIndex: 9,
		bottom: 0,
		right: 0,
		marginBottom: (width - 40) * 0.04,
		marginRight: (width - 40) * 0.08,
	},
	item_main_name: {
		fontSize: 17,
		color: theme.tit2,
		marginTop: 13,
	},
	item_sub_name: {
		fontSize: 15,
		color: theme.comment,
		marginTop: 13,
	},
	photolist_item_con: {
		paddingHorizontal: 20,
	},
	photolist_con: {
		backgroundColor: theme.toolbarbg,
	},
	photolist_item: {
		width: (width - 40 - 20) / 3,
		marginRight: 10,
		marginBottom: 10,
		backgroundColor: "rgba(0,0,0,0.09)"
	},
	photolist_item_img: {
		width: "100%",
		height: 115,
	},
	smartvodlist_con: {
		paddingTop: 20,
		paddingHorizontal: 20,
		backgroundColor: theme.toolbarbg,
	},
	list_img_con: {
		width: (width - 40 - 14) / 2,
		aspectRatio: 1728 / 1080,
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: theme.bg
	},
	list_triangle: {
		width: (width - 40 - 14) / 2 * 0.23,
		height: "auto",
		aspectRatio: 137 / 137,
		marginBottom: "6%",
		marginRight: "6%",
	},
	vod_width: {
		width: (width - 40 - 14) / 2
	},
	vod_mainname: {
		width: width - 40,
		fontSize: 15,
		color: theme.text1,
		fontWeight: "500",
		marginTop: 13,
		fontFamily: "PingFang SC",
	},
	vod_subname: {
		width: width - 40,
		fontSize: 13,
		color: theme.comment,
		marginTop: 5,
	},
});
export default PicList;