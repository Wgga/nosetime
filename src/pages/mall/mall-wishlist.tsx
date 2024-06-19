import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, Image, FlatList } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderView from "../../components/headerview";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";
import Sample from "../../assets/svg/sample.svg";
import Bottle from "../../assets/svg/bottle.svg";

const { width, height } = Dimensions.get("window");

function MallWishList({ navigation }: any): React.JSX.Element {
	// 控件
	const insets = useSafeAreaInsets();
	// 变量
	const [edit, setEdit] = React.useState<boolean>(false); // 是否编辑
	const [tab, setTab] = React.useState<string>("wishlist"); // 当前tab
	// 数据
	let wishlist = React.useRef<any[]>([]);
	let stocktip = React.useRef<any[]>([]);
	// 参数
	// 状态
	const [isrender, setIsRender] = React.useState(false); // 是否渲染
	let wishlist_isempty = React.useRef<boolean>(false);
	let stocktip_isempty = React.useRef<boolean>(false);


	React.useEffect(() => {
		init();
	}, [])

	// 获取愿望单数据
	const getWishlist = () => {
		return new Promise((resolve, reject) => {
			if (!us.user.uid) {
				resolve(0);
			} else {
				http.post(ENV.mall + "?uid=" + us.user.uid, { method: "getwishlist", token: us.user.token }).then((resp_data: any) => {
					if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
						us.delUser();
						resolve(0);
					} else {
						wishlist.current = resp_data;
						if (wishlist.current.length == 0) {
							wishlist_isempty.current = true;
						}
						resolve(1);
					}
				});
			}
		})
	}

	// 获取到货提醒数据
	const getStocktip = () => {
		return new Promise((resolve, reject) => {
			if (!us.user.uid) {
				resolve(0);
			} else {
				http.post(ENV.mall + "?uid=" + us.user.uid, { method: "getsubscription", token: us.user.token }).then((resp_data: any) => {
					if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
						us.delUser();
						resolve(0);
					} else {
						stocktip.current = resp_data;
						if (stocktip.current.length == 0) {
							stocktip_isempty.current = true;
						}
						resolve(1);
					}
				});
			}
		})
	}

	const init = () => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App愿望单列表页" } });
		}

		Promise.all([getWishlist(), getStocktip()]).then((data) => {
			if (data.includes(0)) {
				return navigation.navigate("Page", { screen: "Login", params: { src: "App愿望单列表页" } });
			}
			setIsRender(val => !val);
		})
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: "",
				isShowSearch: false,
				style: { zIndex: 0 },
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				}
			}} method={{
				back: () => { navigation.goBack() },
			}}>
				<View style={[Globalstyles.header_bg, { height: 90 + insets.top }]}>
					<Image style={{ width: "100%", height: "100%" }}
						source={require("../../assets/images/headbgpage/wishlistbg.jpg")}
					/>
				</View>
				<View style={styles.wishlist_title}>
					<Pressable onPress={() => { setTab("wishlist") }}>
						<Text style={[styles.wishlist_title_text, { marginRight: 55 }, tab == "wishlist" && { color: theme.toolbarbg }]}>{"愿望单"}</Text>
					</Pressable>
					<Pressable onPress={() => { setTab("stocktip") }}>
						<Text style={[styles.wishlist_title_text, tab == "stocktip" && { color: theme.toolbarbg }]}>{"到货提醒"}</Text>
					</Pressable>
				</View>
				<Pressable style={Globalstyles.title_text_con} onPress={() => { setEdit(val => !val) }}>
					{!edit && <Text style={Globalstyles.title_text}>{"编辑"}</Text>}
					{edit && <Text style={Globalstyles.title_text}>{"完成"}</Text>}
				</Pressable>
			</HeaderView>
			<View style={[Globalstyles.list_content, Globalstyles.container]}>
				{(wishlist_isempty.current && tab == "wishlist") && <Image style={Globalstyles.emptyimg}
					resizeMode="contain"
					source={require("../../assets/images/empty/wishlist_blank.png")} />}
				{(stocktip_isempty.current && tab == "stocktip") && <Image style={Globalstyles.emptyimg}
					resizeMode="contain"
					source={require("../../assets/images/empty/stocktip_blank.png")} />}
				{(!wishlist_isempty.current || !stocktip_isempty.current) && <FlatList data={tab == "stocktip" ? stocktip.current : wishlist.current}
					showsHorizontalScrollIndicator={false}
					keyExtractor={(item: any) => item.id}
					renderItem={({ item }: any) => {
						return (
							<View style={styles.wish_or_stip_item}>
								<View style={styles.item_img_con}>
									{((tab == "wishlist" && item.type == 1) || tab == "stocktip") && <Image style={styles.item_img}
										source={{ uri: ENV.image + "/perfume/" + item.id + ".jpg!l" }}
										resizeMode="contain"
									/>}
									{(tab == "wishlist" && item.type == 3) && <Image style={[styles.item_img, styles.item_hj_img]}
										source={{ uri: ENV.image + item.info.appimage + "!l" }}
									/>}
								</View>
								<View style={styles.item_info}>
									<View style={{ maxWidth: "90%" }}>
										{((tab == "wishlist" && item.type == 1) || tab == "stocktip") && <>
											<Text numberOfLines={1} style={[styles.item_cnname, !item.instock && { color: theme.placeholder }]}>{item.cnname}</Text>
											<Text numberOfLines={1} style={[styles.item_enname, !item.instock && { color: theme.placeholder }]}>{item.enname}</Text>
										</>}
										{(tab == "wishlist" && item.type == 3) && <Text numberOfLines={1} style={[styles.item_cnname, !item.instock && { color: theme.placeholder }]}>{item.info.tbhjname + " - 合辑"}</Text>}

										{(item.minprice < item.maxprice) && <Text style={styles.item_price}>
											{"¥ " + item.minprice + " ﹣ ¥ " + item.maxprice}
										</Text>}
										{(item.minprice >= item.maxprice) && <Text style={styles.item_price}>
											{"¥ " + item.minprice}
										</Text>}
									</View>
									{edit && <Icon name="delete" style={styles.item_icon} size={19} color={theme.placeholder} />}

									{(tab == "wishlist" && item.instock && !edit) && <Icon name="addcart" style={styles.item_icon} size={19} color={theme.placeholder} />}
									{(tab == "wishlist" && !item.instock) && <Text style={styles.nostock}>{"缺货"}</Text>}

									{(tab == "stocktip" && item.instock) && <Text style={styles.stocktip_msg}>{item.msg}</Text>}
									{(tab == "stocktip" && !item.instock) && <Text style={styles.stocktip_msg}>{item.msg}</Text>}


									{(((tab == "wishlist" && item.type == 1) || tab == "stocktip") && item.instock) && <View style={styles.item_price_icon}>
										{item.bottle && <Bottle width={31} height={15} />}
										{item.sample && <Sample width={31} height={15} />}
									</View>}
								</View>
							</View>

						)
					}}
				/>}
				{(!stocktip_isempty.current && tab == "stocktip")}
			</View>
		</View >
	);
}
const styles = StyleSheet.create({
	wishlist_title: {
		flex: 1,
		height: 44,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center"
	},
	wishlist_title_text: {
		fontSize: 17,
		color: "#CCCCCC",
		fontWeight: "500",
	},
	right_btn_con: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
	},
	btn_con: {
		backgroundColor: "#92abf2",
	},
	del_btn: {
		backgroundColor: "#D77878",
	},
	btn_text: {
		fontSize: 13,
		color: theme.toolbarbg,
	},
	wish_or_stip_item: {
		flexDirection: "row",
		backgroundColor: theme.toolbarbg,
		padding: 15,
	},
	item_img_con: {
		width: 70,
		height: 70,
		alignItems: "center",
		justifyContent: "center",
	},
	item_img: {
		width: 64,
		height: 64,
	},
	item_hj_img: {
		width: 60,
		height: 60,
	},
	item_info: {
		flex: 1,
		marginLeft: 8,
	},
	item_cnname: {
		color: theme.text1,
		fontSize: 13,
		fontWeight: "500",
	},
	item_enname: {
		fontSize: 12,
		color: "#777777",
		marginTop: 4,
	},
	item_price: {
		marginTop: 5,
		fontSize: 13,
		color: theme.tit
	},
	item_icon: {
		position: "absolute",
		right: 0,
		top: 0,
	},
	nostock: {
		position: "absolute",
		right: 0,
		bottom: 0,
		fontSize: 13,
		color: theme.placeholder
	},
	stocktip_msg: {
		fontSize: 13,
		marginTop: 5,
		color: theme.tit,
	},
	item_price_icon: {
		position: "absolute",
		right: 0,
		bottom: 0,
		flexDirection: "row",
		alignItems: "center",
	},
});
export default MallWishList;