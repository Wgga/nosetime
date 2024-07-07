import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image } from "react-native";

import { FlashList } from "@shopify/flash-list";
import FastImage from "react-native-fast-image";

import HeaderView from "../../components/headerview";
import StarImage from "../../components/starimage";
import ListBottomTip from "../../components/listbottomtip";

import us from "../../services/user-service/user-service";
import searchService from "../../services/search-service/search-service";

import http from "../../utils/api/http";

import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function Top({ navigation, route }: any): React.JSX.Element {

	// 控件
	// 参数
	// 变量
	let currentword = React.useRef<string>("");
	let title = React.useRef<string>("");
	let src = React.useRef<string>("");
	// 数据
	let items = React.useRef<any[]>([]);
	let like_ = React.useRef<any>({}); // 用户喜欢的数据ID列表
	// 状态
	let noMore = React.useRef<boolean>(false); // 是否还有更多数据
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		if (route.params.data) {
			currentword.current = route.params.data.tag;
			title.current = route.params.data.title;
			src.current = route.params.src;
		}
		loadMore("init");
		events.subscribe("nosetime_searchlistUpdated", (data: any) => {
			const { word, type } = data;
			if (word != currentword.current) return;
			items.current = searchService.getItems("item", currentword.current);

			//获取用户喜欢数据，获取数据后更新like_[]
			let ids: any[] = [];
			if (src.current == "top") {
				for (let i in items.current) {
					ids.push(items.current[i].id);
				}
			} else {
				ids = [currentword.current];
			}
			islike(ids);

			noMore.current = !searchService.moreDataCanBeLoaded("tag", currentword.current);
		});
		events.subscribe("nosetime_searchlistUpdatedError", (data: any) => {
			const { word, type } = data;
			if (word != currentword.current) return;
			noMore.current = !searchService.moreDataCanBeLoaded("tag", currentword.current);
		});

		return () => {
			events.unsubscribe("nosetime_searchlistUpdated");
			events.unsubscribe("nosetime_searchlistUpdatedError");
		}
	}, [])

	const loadMore = (src: string) => {
		searchService.fetch("tag", currentword.current, src);
	}

	const islike = (ids: any) => {
		if (!us.user.uid) {
			setIsRender(val => !val);
			return navigation.navigate("Page", { screen: "Login", params: { src: "App排行榜页" } });
		}
		http.post(ENV.api + ENV.item, { method: "islike", uid: us.user.uid, ids: ids }).then((resp_data: any) => {
			for (var i in resp_data) {
				like_.current[resp_data[i]] = 1;
			}
			setIsRender(val => !val);
		});
	}

	const wanted = (item: any) => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App排行榜页" } });
		}
		navigation.navigate("Page", {
			screen: "ItemVote",
			params: {
				type: "",
				optionaltype: "wanted",
				id: item.id,
				name: item.cnname,
				enname: item.enname,
				src: "App排行榜页"
			}
		})
	}

	const gotodetail = (page: string, item: any) => {
		if (page == "user-detail") {
			navigation.navigate("Page", { screen: "UserDetail", params: { uid: item.discussid, src: "App排行榜页" } });
		} else if (page == "item-detail") {
			navigation.navigate("Page", { screen: "ItemDetail", params: { id: item.id, src: "App排行榜页" } });
		}
	}

	const favtag = () => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App排行榜页" } });
		}
		http.post(ENV.search + "?uid=" + us.user.uid, {
			method: "togglefav", tag: currentword.current, token: us.user.token
		}).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				like_.current[currentword.current] = 1;
			} else if (resp_data.msg == "REMOVE") {
				like_.current[currentword.current] = 0;
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App排行榜页" } });
			}
			setIsRender(val => !val);
		});
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: title.current,
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}}>
				{src.current == "tag" && <Pressable style={Globalstyles.title_text_con} onPress={favtag}>
					<Icon name={like_.current[currentword.current] ? "fav" : "fav-outline"} size={22} color={like_.current[currentword.current] ? theme.redchecked : theme.tit2} />
				</Pressable>}
			</HeaderView>
			<FlashList data={items.current}
				extraData={isrender}
				estimatedItemSize={100}
				onEndReached={() => { loadMore("loadMore") }}
				onEndReachedThreshold={0.1}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ backgroundColor: theme.toolbarbg }}
				keyExtractor={(item: any, index: number) => item.id + index}
				renderItem={({ item, index }: any) => {
					return (
						<View style={styles.list_item_con}>
							{src.current == "top" && <View style={styles.item_top}>
								<Text style={styles.top_num}>{index + 1 + "#"}</Text>
								<Pressable onPress={() => { wanted(item) }}>
									<Icon name={like_.current[item.id] ? "fav" : "fav-outline"} size={22} color={like_.current[item.id] ? theme.redchecked : theme.tit2} />
								</Pressable>
							</View>}
							<View style={styles.item_info}>
								<Pressable style={styles.item_image} onPress={() => { gotodetail("item-detail", item) }}>
									<FastImage style={{ width: "100%", height: "100%" }}
										defaultSource={require("../../assets/images/noxx.png")}
										source={{ uri: ENV.image + "/perfume/" + item.id + ".jpg!l" }}
										resizeMode="contain"
									/>
								</Pressable>
								<Pressable style={styles.text_marginbtm} onPress={() => { gotodetail("item-detail", item) }}>
									<Text style={styles.item_name}>{item.cnname}</Text>
								</Pressable>
								<Pressable style={styles.text_marginbtm} onPress={() => { gotodetail("item-detail", item) }}>
									<Text style={styles.item_name}>{item.enname}</Text>
								</Pressable>
								<StarImage item={{
									istotal: item.istotal, isscore: item.isscore,
									s0: item.s0, s1: item.s1,
								}} isShowScore={true} style={{ fontSize: 14, color: theme.comment }} />
								<View style={styles.item_odor}>
									{item.odors.map((odor: any, index: number) => {
										return (
											<Image key={odor} style={styles.odors_image}
												source={{ uri: ENV.image + "/odor/" + odor + ".jpg" }}
											/>
										)
									})}
								</View>
							</View>
							<View style={styles.item_discuss_con}>
								<View style={styles.discuss_user}>
									<Image style={styles.avatar}
										source={{ uri: ENV.avatar + item.discussid + ".jpg!l?" + item.discussface }}
									/>
									<Text style={styles.avatar_text}><Text style={{ color: "#000" }}>{item.discussname}</Text>{" 的香评："}</Text>
								</View>
								{item.discuss && <Pressable onPress={() => {
									if (item.discuss2) {
										item.isopen = !item.isopen;
										setIsRender(val => !val);
									}
								}} style={styles.item_discuss}>
									{item.isopen && <Text style={[styles.discuss_text, { fontFamily: "monospace" }]}>{item.discuss}</Text>}
									{!item.isopen && <Text style={[styles.discuss_text, { fontFamily: "monospace" }]}>{item.discuss2}</Text>}
									{item.discuss2 && <View style={[styles.discuss_morebtn_con, item.isopen && styles.open_morebtn]}>
										{!item.isopen && <Text style={styles.discuss_text}>{"..."}</Text>}
										{!item.isopen && <Text style={styles.discuss_morebtn_text}>{"(显示全部)"}</Text>}
										{item.isopen && <Text style={styles.discuss_morebtn_text}>{"(收起全部)"}</Text>}
									</View>}
								</Pressable>}
							</View>
						</View>
					)
				}}
				ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={items.current.length > 0} />}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	list_item_con: {
		paddingBottom: 20,
		paddingHorizontal: 20,
		borderBottomWidth: 1,
		borderBottomColor: "rgba(224,224,224,0.3333)",
	},
	item_top: {
		position: "absolute",
		width: "100%",
		top: 20,
		left: 20,
		zIndex: 1,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	top_num: {
		fontSize: 30,
		color: theme.num,
		fontFamily: "monospace",
	},
	item_info: {
		alignItems: "center",
	},
	item_image: {
		width: "100%",
		height: 135,
		marginTop: 20,
		marginBottom: 10,
	},
	text_marginbtm: {
		marginBottom: 10,
	},
	item_name: {
		fontSize: 19,
		color: theme.tit2,
		paddingHorizontal: 10,
	},
	item_odor: {
		marginTop: 10,
		flexDirection: "row",
		alignItems: "center",
	},
	odors_image: {
		width: 37,
		height: 37,
		marginRight: 4,
	},
	item_discuss_con: {
		marginTop: 15,
		alignItems: "flex-start",
		justifyContent: "flex-start",
	},
	discuss_user: {
		flexDirection: "row",
		alignItems: "center",
	},
	avatar: {
		width: 30,
		height: 30,
		borderRadius: 50,
		overflow: "hidden",
	},
	avatar_text: {
		fontSize: 13,
		color: theme.comment,
		marginLeft: 5,
	},
	item_discuss: {
		width: "100%",
		marginTop: 23,
		marginBottom: 13
	},
	discuss_text: {
		fontSize: 13,
		lineHeight: 20,
		color: theme.comment,
	},
	discuss_morebtn_con: {
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
	discuss_morebtn_text: {
		fontSize: 13,
		color: theme.text1,
		marginLeft: 8,
	},

});

export default Top;