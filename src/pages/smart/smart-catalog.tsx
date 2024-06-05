import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, Image, ScrollView } from "react-native";

import LinearGradient from "react-native-linear-gradient";
import { useNavigation } from "@react-navigation/native";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");
const classname: string = "SmartCatalogPage";

const SmartCatalog = React.memo(() => {
	// 控件
	const navigation: any = useNavigation();
	// 变量
	// 数据
	const [items, setItems] = React.useState<any[]>([]); // 排行列表数据
	// 参数
	// 状态

	React.useEffect(() => {
		cache.getItem(classname).then((cacheobj) => {
			if (cacheobj) {
				setItems(cacheobj);
			}
		}).catch(() => {
			http.get(ENV.smart + "?method=gettags").then((resp_data: any) => {
				if (resp_data && resp_data.length > 1) {
					resp_data.map((item: any) => {
						if (item.img && item.img.indexOf(".svg") > -1) {
							item["imgname"] = item.img.split("/").pop().replace(".svg", "");
						}
					});
					cache.saveItem(classname, resp_data, 600);
					setItems(resp_data);
				}
			});
		});
	}, []);

	return (
		<ScrollView contentContainerStyle={styles.catalog_con} showsVerticalScrollIndicator={false}>
			<View style={styles.catalog_top_con}>
				<View style={styles.ranking_top}>
					<Image style={styles.tradepic}
						source={require("../../assets/images/catalog/tradepic.jpg")}
					/>
					<Text style={[styles.title, styles.tradetitle, { marginLeft: 14 }]}>{"商业香排行榜"}</Text>
					<Text style={[styles.title, styles.tradetittop, { marginLeft: 14 }]}>{"TOP200"}</Text>
				</View>
				<View style={styles.ranking_btm}>
					<View style={[styles.ranking_btm_con, { marginRight: 5 }]}>
						<Image style={styles.salonpic}
							source={require("../../assets/images/catalog/salonpic.jpg")}
						/>
						<Text style={[styles.title, styles.salontitle, { marginLeft: 12 }]}>{"沙龙香排行榜"}</Text>
						<Text style={[styles.title, styles.salontittop, { marginLeft: 12 }]}>{"TOP200"}</Text>
					</View>
					<View style={[styles.ranking_btm_con, { marginLeft: 5 }]}>
						<View style={[styles.btm_right_con, { marginBottom: 5 }]}>
							<Image style={[styles.btm_right_img, styles.recentpic]}
								source={require("../../assets/images/catalog/recentpic.jpg")}
							/>
							<Text style={[styles.title, styles.btm_right_tit]}>{"新香排行榜"}</Text>
						</View>
						<View style={[styles.btm_right_con, { marginTop: 5 }]}>
							<Image style={[styles.btm_right_img, styles.affordablepic]}
								source={require("../../assets/images/catalog/affordablepic.jpg")}
							/>
							<Text style={[styles.title, styles.btm_right_tit]}>{"平价排行榜"}</Text>
						</View>
					</View>
				</View>
			</View>
			<View style={styles.catalog_btm_con}>
				{(items && items.length > 0) && items.map((item: any, index: number) => {
					return (
						<View key={index} style={{ alignItems: "center" }}>
							{(item.title && item.imgname) && <View style={styles.item_title}>
								<Icon name={item.imgname} size={22} color={theme.text2} />
								<LinearGradient colors={["transparent", "#5C5C5C", "transparent"]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									style={styles.item_title_line} />
							</View>}
							{item.menu && <View style={{ flexDirection: "row" }}>
								{item.menu.map((item2: any, index_menu: number) => {
									return (
										<View key={item2.name} style={styles.item_menu_item}>
											<Image style={styles.item_menu_img} source={{ uri: ENV.image + item2.img }} />
										</View>
									)
								})}
							</View>}
						</View>
					)
				})}
			</View>
		</ScrollView>
	);
})

const styles = StyleSheet.create({
	catalog_con: {
		backgroundColor: theme.toolbarbg,
		alignItems: "center",
		paddingBottom: 40,
	},
	catalog_top_con: {
		paddingHorizontal: 20,
	},
	ranking_top: {
		width: width - 40,
		height: (width - 40) / 2,
		borderRadius: 4,
		overflow: "hidden",
		marginBottom: 10,
		justifyContent: "flex-end",
	},
	title: {
		fontWeight: "500",
		color: theme.toolbarbg
	},
	tradepic: {
		position: "absolute",
		width: "100%",
		height: (width - 40) / 750 * 532,
		top: -(167 * 0.12),
	},
	tradetitle: {
		marginBottom: 5,
		fontSize: 19,
	},
	tradetittop: {
		marginBottom: 15,
		fontSize: 17,
	},
	ranking_btm: {
		height: (width - 40) / 2,
		flexDirection: "row",
	},
	ranking_btm_con: {
		width: (width - 40 - 10) / 2,
		height: "100%",
		borderRadius: 4,
		overflow: "hidden",
		justifyContent: "flex-end",
	},
	salonpic: {
		position: "absolute",
		width: ((width - 40) / 2) / 532 * 750,
		height: "100%",
		left: -((199 / 532 * 750) * 0.13),
	},
	salontitle: {
		marginBottom: 5,
		fontSize: 18,
	},
	salontittop: {
		fontSize: 17,
		marginBottom: 12,
	},
	btm_right_con: {
		width: (width - 40 - 10) / 2,
		height: (((width - 40) / 2) - 10) / 2,
		borderRadius: 4,
		overflow: "hidden",
		justifyContent: "flex-end",
	},
	btm_right_img: {
		position: "absolute",
		width: "100%",
		height: ((width - 40 - 10) / 2) / 750 * 532,
	},
	recentpic: {
		top: -(((((width - 40) / 2) - 10) / 2) * 0.06),
	},
	btm_right_tit: {
		marginLeft: 10,
		fontSize: 18,
		marginBottom: 9,
	},
	affordablepic: {
		top: -(((((width - 40) / 2) - 10) / 2) * 0.22),
	},
	catalog_btm_con: {
		marginTop: 10
	},
	item_title: {
		width: 22,
		height: 22,
		alignItems: "center",
		marginTop: 25,
		marginBottom: 10,
	},
	item_title_line: {
		width: 100,
		height: 1,
		transform: [{ translateY: -1 }],
	},
	item_menu_item: {
		paddingHorizontal: 9,
		paddingVertical: 13,
	},
	item_menu_img: {
		width: ((width - 40) - (18 * 3)) / 4,
		height: (((width - 40) - (18 * 3)) / 4) / 220 * 230,
		backgroundColor: "#E1E1E1",
		borderRadius: 4,
	}
});

export default SmartCatalog;