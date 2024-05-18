import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, Image, ScrollView } from "react-native";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get('window');
const events = new NativeEventEmitter();
const classname = 'SmartEvaluatePage';


const SmartVod = React.memo(({ navigation }: any) => {
	// 控件
	// 变量
	const [isrender, setIsRender] = React.useState(false); // 是否渲染
	// 数据
	let vodlist = React.useRef<any[]>([]); // 单品视频列表
	let hjvodlist = React.useRef<any[]>([]); // 合集视频列表
	let firstvod = React.useRef<any>({}); // 首个视频
	let smartvodlist = React.useRef<any[]>([]); // 发现页视频列表
	// 参数
	// 状态

	React.useEffect(() => {
		init();
	}, [])

	const getvodlist = () => {
		return new Promise((resolve, reject) => {
			cache.getItem(classname + "vodlist").then((cacheobj: any) => {
				if (cacheobj) {
					setitems("singlevod", cacheobj, "items");
					resolve(1);
				}
			}).catch(() => {
				http.get(ENV.evaluate + "?method=gethomevodlist&pagesize=20&page=1").then((resp_data: any) => {
					setitems("singlevod", resp_data, "items");
					cache.saveItem(classname + "vodlist", resp_data, 600);
					resolve(1);
				})
			});
		})
	}

	const gethjvodlist = () => {
		return new Promise((resolve, reject) => {
			cache.getItem(classname + "hjvodlist").then((cacheobj) => {
				if (cacheobj) {
					setitems("hejivod", cacheobj, "items_heji");
					resolve(1);
				}
			}).catch(() => {
				http.get(ENV.evaluate + "?method=gethomemorevod").then((resp_data: any) => {
					setitems("hejivod", resp_data, "items_heji");
					cache.saveItem(classname + "hjvodlist", resp_data, 600);
					resolve(1);
				})
			});
		})
	}

	const setitems = (src: string, resp: any, type: string) => {
		resp[type].forEach((item: any) => {
			item['mainname'] = item['name'] ? item['name'].split('：')[0] : '';
			item['subname'] = item['name'] ? item['name'].split('：')[1] : '';
		});
		if (src == "singlevod") {
			vodlist.current = resp.items.slice(1, 5);
		} else {
			hjvodlist.current = resp[type].slice(1, 5);
		}
		firstvod.current[src] = resp[type].length > 0 ? resp[type][0] : {};
	}

	const init = () => {
		setIsRender(false);
		Promise.all([getvodlist(), gethjvodlist()]).then((data) => {
			if (data.length == 2) {
				smartvodlist.current = [
					{ id: "hejivod", title: "视频合辑", items: hjvodlist.current, firstvod: firstvod.current["hejivod"] },
					{ id: "singlevod", title: "单品评测", items: vodlist.current, firstvod: firstvod.current["singlevod"] }
				]
				setIsRender(true);
			}
		})
	}

	return (
		<ScrollView style={styles.vodelist_con}
			showsVerticalScrollIndicator={false}>
			{(smartvodlist.current && smartvodlist.current.length > 0) && smartvodlist.current.map((item: any, index: number) => {
				return (
					<View key={item.id} style={styles.vodlist_item}>
						<View style={styles.vod_title_con}>
							<Text style={styles.vod_title_text}>{item.title}</Text>
							<View style={styles.vod_title_icon}>
								<Text style={styles.vod_title_icon_text}>{"全部"}</Text>
								<Icon name="r-return" size={15} color={theme.text1} />
							</View>
						</View>
						{item.firstvod && <View style={styles.vod_first_con}>
							<View style={styles.first_img_con}>
								<Image style={styles.vod_image}
									defaultSource={require("../../assets/images/nopic.png")}
									source={{ uri: item.firstvod.vpicurl }}
								/>
								<Image style={styles.triangle}
									source={require("../../assets/images/player/play.png")}
									resizeMode="cover"
								/>
							</View>
							{item.firstvod.mainname && <Text numberOfLines={1} style={styles.vod_mainname}>{item.firstvod.mainname}</Text>}
							{item.firstvod.subname && <Text numberOfLines={1} style={styles.vod_subname}>{item.firstvod.subname}</Text>}
						</View>}
						{(item.items && item.items.length > 0) && <View style={styles.vod_list}>
							{item.items.map((item2: any, index: number) => {
								return (
									<View key={item2.viid} style={{
										marginBottom: 14,
										marginLeft: (index + 1) % 2 == 0 ? 7 : 0,
										marginRight: (index + 1) % 2 == 1 ? 7 : 0
									}}>
										<View style={[styles.list_img_con]}>
											<Image style={styles.vod_image}
												defaultSource={require("../../assets/images/nopic.png")}
												source={{ uri: item2.vpicurl }}
											/>
											<Image style={[styles.triangle, styles.list_triangle]}
												source={require("../../assets/images/player/play.png")}
												resizeMode="cover"
											/>
										</View>
										{item2.mainname && <Text numberOfLines={1} style={[styles.vod_mainname, styles.vod_width]}>{item2.mainname}</Text>}
										{item2.subname && <Text numberOfLines={1} style={[styles.vod_subname, styles.vod_width]}>{item2.subname}</Text>}
									</View>
								)
							})}
						</View>}
					</View>
				)
			})}
		</ScrollView>
	);
})
const styles = StyleSheet.create({
	vodelist_con: {
		flex: 1,
		backgroundColor: theme.toolbarbg,
		paddingHorizontal: 20,
	},
	vodlist_item: {
		marginBottom: 20,
	},
	vod_title_con: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginTop: 18,
		marginBottom: 15,
	},
	vod_title_text: {
		fontSize: 15,
		color: theme.text1,
		fontWeight: "500",
	},
	vod_title_icon: {
		flexDirection: "row",
		alignItems: "center",
	},
	vod_title_icon_text: {
		marginRight: 4,
		color: "#808080",
		fontWeight: "500",
	},
	vod_first_con: {
		marginBottom: 20,
	},
	first_img_con: {
		width: width - 40,
		height: (width - 40) * 0.625,
		borderRadius: 8,
		overflow: "hidden",
	},
	vod_image: {
		width: "100%",
		height: "100%",
	},
	triangle: {
		position: "absolute",
		right: 0,
		bottom: 0,
		width: (width - 40) * 0.15,
		height: (width - 40) * 0.15,
		marginBottom: (width - 40) * 0.06,
		marginRight: (width - 40) * 0.06,
	},
	vod_mainname: {
		width: width - 40,
		fontSize: 15,
		color: theme.text1,
		fontWeight: "500",
		marginTop: 13,
	},
	vod_subname: {
		width: width - 40,
		fontSize: 13,
		color: theme.comment,
		marginTop: 5,
	},
	vod_list: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	list_img_con: {
		width: (width - 40 - 14) / 2,
		height: (width - 40 - 14) / 2 * 0.625,
		borderRadius: 8,
		overflow: "hidden",
	},
	list_triangle: {
		width: (width - 40 - 14) / 2 * 0.23,
		height: (width - 40 - 14) / 2 * 0.23,
		marginBottom: (width - 40 - 14) / 2 * 0.06,
		marginRight: (width - 40 - 14) / 2 * 0.06,
	},
	vod_width: {
		width: (width - 40 - 14) / 2
	}
});
export default SmartVod;