import React from "react";
import { View, Text, StyleSheet, Pressable, Dimensions, FlatList, Image } from "react-native";

import FastImage from "react-native-fast-image";

import HeaderView from "../../components/headerview";
import ListBottomTip from "../../components/listbottomtip";

import http from "../../utils/api/http";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

const { width, height } = Dimensions.get("window");


const Item = React.memo(({ item, imgstyle, textstyle }: any) => {
	return (
		<View style={{ paddingHorizontal: 8 }}>
			<View style={imgstyle}>
				<FastImage style={{ width: "100%", height: "100%" }}
					source={{ uri: ENV.image + item.cpic + "!l" }}
				/>
			</View>
			<Text numberOfLines={1} style={textstyle}>{item.cname}</Text>
		</View>
	)
})

function PerfumeListSquare({ navigation, route }: any): React.JSX.Element {
	// 控件
	// 变量
	let method = React.useRef<string>("");
	let tags = React.useRef<any[]>([]);
	let title = React.useRef<string>("香单广场");
	let cur_page = React.useRef<number>(1);
	// 数据
	let hotlist = React.useRef<any[]>([]);
	let newlist = React.useRef<any[]>([]);
	let alllist = React.useRef<any[]>([]);
	// 参数
	// 状态
	let noMore = React.useRef<boolean>(false); // 是否还有更多
	let isempty = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		if (route.params && route.params.tags && route.params.tags.length > 0) {
			tags.current = route.params.tags;
			method.current = "gettagcollections&tag=" + route.params.tags;
			title.current = "香单分类";
		} else {
			tags.current = [];
			method.current = "getallcollections";
			title.current = "香单广场";
		}
		init();
	}, [])

	const getHotlist = () => {
		return new Promise((resolve, reject) => {
			http.get(ENV.collection + "?method=gethotcollections").then((resp_data: any) => {
				hotlist.current = resp_data;
				resolve(1);
			})
		})
	}

	const getNewlist = () => {
		return new Promise((resolve, reject) => {
			http.get(ENV.collection + "?method=getnewcollection").then((resp_data: any) => {
				newlist.current = resp_data;
				resolve(1);
			})
		})
	}

	const getAlllist = () => {
		return new Promise((resolve, reject) => {
			cur_page.current = 1;
			http.get(ENV.collection + "?method=" + method.current).then((resp_data: any) => {
				alllist.current = resp_data;
				isempty.current = (resp_data.length == 0);
				noMore.current = (resp_data.length < 20);
				resolve(1);
			})
		})
	}

	const init = () => {
		if (tags.current.length == 0) {
			Promise.all([getHotlist(), getNewlist(), getAlllist()]).then((data) => {
				if (data.includes(0)) {
					return navigation.navigate("Page", { screen: "Login", params: { src: "App香单广场" } });
				}
				setIsRender(val => !val);
			})
		} else {
			getAlllist().then(() => {
				setIsRender(val => !val);
			})
		}
	}

	const loadMore = () => {
		if (alllist.current.length == 0 || noMore.current) return;
		cur_page.current += 1;
		http.get(ENV.collection + "?method=" + method.current + "&page=" + cur_page.current).then((resp_data: any) => {
			for (let i in resp_data) {
				if (resp_data[i].cid == alllist.current[alllist.current.length - 1].cid) {
					noMore.current = true;
					setIsRender(val => !val);
					return;
				}
			}
			alllist.current = alllist.current.concat(resp_data);
			noMore.current = (resp_data.length < 20);
			setIsRender(val => !val);
		})
	}

	const gotodetail = (page: string, item: any = null) => {
		if (page == "PerfumeListTag") {
			navigation.navigate("Page", { screen: page, params: { tags: tags.current, src: "square" } });
		} else {
			navigation.navigate("Page", { screen: page, params: { id: item.cid } });
		}
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
				{title.current == "香单广场" && <Pressable style={Globalstyles.title_text_con} onPress={() => {
					gotodetail("PerfumeListTag")
				}}>
					<Text style={Globalstyles.title_text}>{"分类"}</Text>
				</Pressable>}
			</HeaderView>
			{isempty.current && <Image style={Globalstyles.emptyimg}
				resizeMode="contain"
				source={require("../../assets/images/empty/odor_blank.png")} />}
			{!isempty.current && <FlatList data={alllist.current}
				horizontal={false}
				numColumns={3}
				showsHorizontalScrollIndicator={false}
				columnWrapperStyle={{ paddingHorizontal: 8 }}
				keyExtractor={(item: any, index: number) => item.cid + "_" + index}
				ListHeaderComponent={() => {
					return (
						<>
							{hotlist.current.length > 0 && <>
								<Text style={styles.list_title}>{"热门推荐"}</Text>
								<FlatList data={hotlist.current}
									horizontal={true}
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={{ paddingHorizontal: 8 }}
									keyExtractor={(item: any) => item.cid}
									renderItem={({ item }: any) => {
										return (
											<Item item={item}
												imgstyle={[styles.item_img, styles.list_img]}
												textstyle={[styles.item_text, styles.list_text]}
											/>
										)
									}}
								/>
							</>}
							{newlist.current.length > 0 && <>
								<Text style={styles.list_title}>{"最新香单"}</Text>
								<FlatList data={newlist.current}
									horizontal={true}
									showsHorizontalScrollIndicator={false}
									contentContainerStyle={{ paddingHorizontal: 8 }}
									keyExtractor={(item: any) => item.cid}
									renderItem={({ item }: any) => {
										return (
											<Item item={item}
												imgstyle={[styles.item_img, styles.list_img]}
												textstyle={[styles.item_text, styles.list_text]}
											/>
										)
									}}
								/>
							</>}
							{(alllist.current.length > 0 && tags.current.length == 0) && <Text style={styles.list_title}>{"全部"}</Text>}
							{tags.current.length > 0 && <Text style={styles.list_title}>{"关键字：" + tags.current}</Text>}
						</>
					)
				}}
				onEndReachedThreshold={0.1}
				onEndReached={loadMore}
				renderItem={({ item }: any) => {
					return (
						<Item item={item}
							imgstyle={styles.item_img}
							textstyle={styles.item_text}
						/>
					)
				}}
				ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={alllist.current.length > 0} />}
			/>}
		</View>
	);
}
const styles = StyleSheet.create({
	list_title: {
		fontSize: 16,
		color: theme.tit2,
		marginVertical: 15,
		marginLeft: 15,
	},
	list_img: {
		width: (width - 16) * 0.465,
		height: ((width - 16) * 0.465) * 0.81,
	},
	list_text: {
		width: (width - 16) * 0.465,
		paddingHorizontal: 5,
		marginTop: 8,
		marginBottom: 8,
	},
	item_img: {
		width: (width - 16 - (16 * 3)) / 3,
		height: (width - 16 - (16 * 3)) / 3,
		borderWidth: 0.8,
		borderColor: theme.bg,
		borderRadius: 8,
		overflow: "hidden"
	},
	item_text: {
		width: (width - 16 - (16 * 3)) / 3,
		marginTop: 6,
		marginBottom: 21,
	}
});
export default PerfumeListSquare;