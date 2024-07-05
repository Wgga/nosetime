import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image } from "react-native";

import HeaderView from "../../components/headerview";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";
import { useFocusEffect } from "@react-navigation/native";
import ListBottomTip from "../../components/listbottomtip";
import { FlashList } from "@shopify/flash-list";
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");

function PerfumeList({ navigation, route }: any): React.JSX.Element {

	// 控件
	// 参数
	// 变量
	let uid = React.useRef<number>(0);
	const [curTab, setCurTab] = React.useState<string>("user");
	// 数据
	let usercoldata = React.useRef<any>([]);
	let favcoldata = React.useRef<any>([]);
	// 状态
	let cur_page = React.useRef<any>({
		user: 1,
		fav: 1
	});
	let UsernoMore = React.useRef<boolean>(false);
	let FavnoMore = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		if (route.params) {
			uid.current = route.params.uid ? route.params.uid : 0;
		}
	}, [])

	useFocusEffect(
		React.useCallback(() => {
			init()
		}, [])
	)

	const getUserCol = () => {
		return new Promise((resolve, reject) => {
			http.get(ENV.collection + "?method=getusercollections&uid=" + uid.current + "&page=1").then((resp_data: any) => {
				usercoldata.current = resp_data;
				if (resp_data.length < 100) UsernoMore.current = true;
				cache.saveItem("usercollections" + us.user.uid, resp_data, 600 * 100);
				resolve(1);
			})
		})
	}

	const getFavCol = () => {
		return new Promise((resolve, reject) => {
			http.get(ENV.collection + "?method=getfavcollections&uid=" + uid.current + "&page=1").then((resp_data: any) => {
				favcoldata.current = resp_data;
				if (resp_data.length < 100) FavnoMore.current = true;
				resolve(1);
			})
		})
	}

	const init = () => {
		Promise.all([getUserCol(), getFavCol()]).then(() => {
			setIsRender(val => !val);
		})
	}

	const loadMore = () => {
		console.log("%c Line:85 🍆", "color:#93c0a4");
		if ((curTab == "user" && UsernoMore.current) || (curTab == "fav" && FavnoMore.current)) return;
		cur_page.current[curTab] += 1;
		let method = curTab == "user" ? "getusercollections" : "getfavcollections";
		http.get(ENV.collection + "?method=" + method + "&uid=" + us.user.uid + "&page=" + cur_page.current[curTab]).then((resp_data: any) => {
			if (curTab == "user") {
				usercoldata.current = usercoldata.current.concat(resp_data);
				if (resp_data.length < 100) UsernoMore.current = true;
			} else {
				favcoldata.current = favcoldata.current.concat(resp_data);
				if (resp_data.length < 100) FavnoMore.current = true;
			}
		})
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: "香单",
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}} />
			<View style={styles.perfume_tit_con}>
				{uid.current == us.user.uid && <Pressable style={styles.perfume_tit} onPress={() => { setCurTab("user") }}>
					<Text style={[styles.tabtext, curTab == "user" && styles.activetab]}>{"我的"}</Text>
					{curTab == "user" && <Text style={styles.tabline}></Text>}
				</Pressable>}
				{uid.current != us.user.uid && <Pressable style={styles.perfume_tit} onPress={() => { setCurTab("user") }}>
					<Text style={[styles.tabtext, curTab == "user" && styles.activetab]}>{"自建"}</Text>
					{curTab == "user" && <Text style={styles.tabline}></Text>}
				</Pressable>}
				<Pressable style={styles.perfume_tit} onPress={() => { setCurTab("fav") }}>
					<Text style={[styles.tabtext, curTab == "fav" && styles.activetab]}>{"收藏"}</Text>
					{curTab == "fav" && <Text style={styles.tabline}></Text>}
				</Pressable>
			</View>
			{(usercoldata.current.length > 0 || favcoldata.current.length > 0) && <FlashList data={curTab == "user" ? usercoldata.current : favcoldata.current}
				extraData={isrender}
				estimatedItemSize={100}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ backgroundColor: theme.toolbarbg }}
				keyExtractor={(item: any) => item.cid}
				onEndReachedThreshold={0.1}
				onEndReached={loadMore}
				renderItem={({ item, index }: any) => {
					return (
						<View style={styles.perfume_item}>
							<Image style={styles.item_image} source={{ uri: ENV.image + item.cpic + "!m" }} />
							<View style={styles.item_info}>
								<Text numberOfLines={1} style={styles.item_name}>{item.cname}</Text>
								<Text numberOfLines={1} style={styles.item_desc}>{item.desc}</Text>
								<Text style={styles.item_cnt}>{item.cnt}</Text>
							</View>
						</View>
					)
				}}
				ListFooterComponent={<ListBottomTip
					noMore={curTab == "user" ? UsernoMore.current : FavnoMore.current}
					isShowTip={curTab == "user" ? usercoldata.current.length > 0 : favcoldata.current.length > 0} />
				}
			/>}
			{uid.current == us.user.uid && <Pressable onPress={() => {
				navigation.navigate("Page", { screen: "PerfumeListEdit", params: { uid: uid.current } });
			}}>
				<LinearGradient colors={["#81B4EC", "#9BA6F5"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					locations={[0, 1]} style={Globalstyles.confirm_btn}>
					<Text style={Globalstyles.btn_text}>{"新建香单"}</Text>
				</LinearGradient>
			</Pressable>}
		</View>
	);
}

const styles = StyleSheet.create({
	perfume_tit_con: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomColor: theme.bg,
		borderBottomWidth: 1,
	},
	perfume_tit: {
		flexGrow: 1,
		height: 40,
		alignItems: "center",
		justifyContent: "center",
	},
	tabtext: {
		fontSize: 16,
		color: theme.color
	},
	tabline: {
		position: "absolute",
		bottom: 5,
		width: 20,
		height: 1.5,
		backgroundColor: theme.tit
	},
	activetab: {
		color: theme.tit
	},
	perfume_item: {
		paddingHorizontal: 20,
		paddingVertical: 10,
		flexDirection: "row",
	},
	item_image: {
		width: 60,
		height: 60,
		borderRadius: 8,
		borderColor: theme.bg,
		borderWidth: 0.5,
	},
	item_info: {
		flex: 1,
		marginLeft: 10,
	},
	item_name: {
		color: theme.color,
		fontSize: 13,
	},
	item_desc: {
		color: theme.color,
		fontSize: 16,
	},
	item_cnt: {
		color: theme.comment,
		fontSize: 13,
	}
});

export default PerfumeList;