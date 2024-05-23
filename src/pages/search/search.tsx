import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter } from "react-native";

import { useFocusEffect } from "@react-navigation/native";

import theme from "../../configs/theme";
import Icon from "../../assets/iconfont";
import searchService from "../../services/search-service/search-service";
import cache from "../../hooks/storage/storage";
import HeaderView from "../../components/headerview";
import http from "../../utils/api/http";
import { ENV } from "../../configs/ENV";

const events = new NativeEventEmitter();
const classname = "Search";

function Search({ navigation, route }: any): React.JSX.Element {

	// 控件

	// 数据
	const [history, setHistory] = React.useState<string[]>([]); // 搜索历史
	const [hotlist, setHotlist] = React.useState<string[]>([]); // 热搜榜

	// 变量
	const [placeholder, setPlaceholder] = React.useState<string>(""); // 搜索框placeholder
	const [word, setWord] = React.useState<string>(""); // 搜索框内容
	let from = React.useRef<string>(""); // 来源
	let cid = React.useRef<string>(""); // 分类id

	React.useEffect(() => {
		from.current = route.params?.from;
		cid.current = route.params?.cid;
		switch (from.current) {
			case "home":
				setPlaceholder("搜索香水、品牌、气味、帖子");
				break;
			case "mall":
				setPlaceholder("搜索香水、品牌、气味、风格");
				break;
			case "social":
				setPlaceholder("搜索帖子");
				break;
			case "collection":
				setPlaceholder("搜索香水");
				break;
			case "order":
				setPlaceholder("搜索订单");
				break;
			default:
				break;
		}
	}, [route]);

	useFocusEffect(
		React.useCallback(() => {
			cache.getItem("SearchHistory").then((cacheobj) => {
				if (cacheobj) {
					setHistory(cacheobj);
				}
			}).catch(() => { });
		}, [])
	)

	React.useEffect(() => {
		cache.getItem(classname + "hotlist").then((cacheobj) => {
			if (cacheobj) {
				setHotlist(cacheobj);
			}
		}).catch(() => {
			http.get(ENV.search + "?type=getsearch_hotlist").then((resp_data: any) => {
				cache.saveItem(classname + "hotlist", resp_data, 600);
				setHotlist(resp_data);
			})
		})
	}, [])

	const Search = (word: string) => {
		if (word == "") return;
		events.emit(classname + "gotoPage", from);
		let obj = {
			screen: "SearchResult",
			params: {
				shtype: "all",
				shword: word,
				holder: placeholder
			}
		}
		switch (from.current) {
			case "mall":
				obj.screen = "MallSearchResult";
				break;
			case "order":
				/* let params = [];
					this.orderlist.filter((item: any) => {
						for (let i in item.items) {
							if (item.items[i].tbitemname.includes(x)) {
								params.push(item);
							}
						}
					});
					let navigationExtras: NavigationExtras = { state: { list: params, searchWord: x } };
					this.router.navigate(["/mall-order/search/" + this.us.user.uid], navigationExtras); */
				break;
			case "social":
				obj.params = Object.assign(obj.params, { shtype: "topicv2" });
				break;
			case "collection":
				obj.params = Object.assign(obj.params, { shtype: "collection", cid });
				break;
			default:
				break;
		}
		navigation.navigate("Page", obj);
	}

	const clearHistory = () => {
		searchService.clearHistory();
		setHistory([]);
	}

	return (
		<View style={styles.search_con}>
			<HeaderView
				data={{
					title: "",
					placeholder,
					word,
					isShowSearch: true,
					isautoFocus: true
				}}
				method={{
					fun: () => { setWord("") },
					setWord,
					Search,
					back: () => { navigation.goBack() },
				}} />
			{(history && history.length > 0) &&
				<View>
					<View style={styles.list_title}>
						<Text style={{ fontSize: 16 }}>{"历史记录"}</Text>
						<Pressable style={{ paddingRight: 6 }} onPress={clearHistory}>
							<Icon name="delete" size={18} color={theme.text1} />
						</Pressable>
					</View>
					<View style={styles.tags_con}>
						{history.map((item, index) => {
							return (
								<Pressable key={index} style={styles.tags} onPress={() => { Search(item) }}>
									<Text style={styles.tags_text}>{item}</Text>
								</Pressable>
							)
						})}
					</View>
				</View>}
			{(hotlist && hotlist.length > 0) &&
				<View>
					<View style={styles.list_title}>
						<Text style={{ fontSize: 16 }}>{"热门"}</Text>
					</View>
					<View style={styles.tags_con}>
						{hotlist.map((item, index) => {
							return (
								<Pressable key={index} style={styles.tags} onPress={() => { Search(item) }}>
									<Text style={styles.tags_text}>{item}</Text>
								</Pressable>
							)
						})}
					</View>
				</View>}
		</View>
	);
}

const styles = StyleSheet.create({
	search_con: {
		flex: 1,
		backgroundColor: theme.toolbarbg,
	},
	list_title: {
		flexDirection: "row",
		justifyContent: "space-between",
		padding: 15,
	},
	tags_con: {
		flexDirection: "row",
		flexWrap: "wrap",
		paddingLeft: 10,
		paddingRight: 10,
	},
	tags: {
		paddingLeft: 10,
		paddingRight: 10,
		marginHorizontal: 7,
		marginVertical: 10,
		backgroundColor: theme.bg,
		borderRadius: 13,
	},
	tags_text: {
		lineHeight: 26,
		fontSize: 12,
		color: theme.comment
	}
});

export default Search;