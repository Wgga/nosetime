import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, FlatList, Image } from "react-native";

import FastImage from "react-native-fast-image";

import HeaderView from "../../components/headerview";
import ListBottomTip from "../../components/listbottomtip";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();
const classname = "PicListPage";

function PicList({ route, navigation }: any): React.JSX.Element {
	// 控件
	// 参数
	const { id } = route.params;
	// 变量
	let cur_page = React.useRef<number>(1); // 当前页码
	let total = React.useRef<number>(0); // 总页码
	// 数据
	let photolist = React.useRef<any[]>([]); // 媒体数据
	let vodlist = React.useRef<any[]>([]); // 视频数据
	// 状态
	let noMore = React.useRef<boolean>(false); // 是否还有更多
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		init()
	}, []);

	const init = () => {
		cur_page.current = 1;
		cache.getItem("ItemDetailPage" + id + "media").then((cacheobj) => {
			if (cacheobj) {
				setmediadata(cacheobj);
			}
		}).catch(() => {
			http.get(ENV.item + "?method=mediav2&id=" + id + "&pagesize=24&page=" + cur_page.current).then((resp_data: any) => {
				setmediadata(resp_data);
			})
		});
	}

	const loadMore = () => {
		cur_page.current += 1;
		if (id > 0) {
			http.get(ENV.item + "?method=mediav2&id=" + id + "&pagesize=24&page=" + cur_page.current).then((resp_data: any) => {
				setmediadata(resp_data);
			})
		}
	}

	const setmediadata = (items: any) => {
		total.current = parseInt(items.total);
		if (cur_page.current == 1) {
			photolist.current = items.medias;
			if (items.vods.length > 0) {
				items.vods.map((item: any) => {
					item.vname = item.vname.replace(id, "").replace(".mp4", "").trim();
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
		setIsRender((val) => !val);
	}

	return (
		<>
			<HeaderView data={{
				title: "全部视频照片（" + total.current + "）",
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg },
				childrenstyle: {
					headercolor: { color: theme.text2 },
					headertitle: { opacity: 1 },
				}
			}} method={{
				back: () => { navigation.goBack(); },
			}} />
			{(photolist.current && photolist.current.length > 0) && <FlatList
				data={photolist.current}
				horizontal={false}
				contentContainerStyle={styles.photolist_con}
				keyExtractor={(item: any) => item.mid}
				numColumns={3}
				showsVerticalScrollIndicator={false}
				columnWrapperStyle={styles.photolist_item_con}
				ListHeaderComponent={(
					<>
						{(vodlist.current && vodlist.current.length > 0) && <View style={styles.vodlist_con}>
							{vodlist.current.map((item: any, index: number) => {
								return (
									<View key={item.mid} style={styles.vodlist_item}>
										<View style={styles.item_image_con}>
											<Image style={styles.item_image}
												source={{ uri: item.vpicurl, cache: "force-cache" }} />
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
					</>
				)}
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
		height: (width - 40) * 0.625,
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
		bottom: "4%",
		right: "8%",
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
});
export default PicList;