import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView, Dimensions, FlatList } from "react-native";

import FastImage from "react-native-fast-image";

import articleService from "../../services/article-service/article-service";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";
import { Globalstyles } from "../../configs/globalstyles";
import { FlashList } from "@shopify/flash-list";
import ListBottomTip from "../../components/listbottomtip";

const { width, height } = Dimensions.get("window");

const ArticleList = React.memo(({ navigation, type }: any) => {

	// 数据
	let items = React.useRef<any[]>([]); // 过滤最新视频和最新文章的文章列表数据

	// 变量
	let hiddenid = React.useRef<number>(0); // 隐藏文章id

	// 状态
	let noMore = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		articleService.fetch(type, 1);

		events.subscribe("nosetime_articlesUpdated", (typeval: string) => {
			if (type != typeval) return;
			var item_list = articleService.getItems(type);
			if (item_list instanceof Array) {
				// 不包含本期专题和本期视频文章
				setTimeout(() => {
					cache.getItem("newitemid").then((newids) => {
						items.current = item_list.filter((item: any) => { return !newids.includes(item.id) });
						setIsRender(val => !val);
						events.publish("list_loadmore", true);
					}).catch(() => {
						items.current = item_list;
						setIsRender(val => !val);
						events.publish("list_loadmore", true);
						return;
					});
				}, 1000)


				if (type != "最新") {
					hiddenid.current = articleService.getMaxId() - 10;
				}
			}
		});

		events.subscribe("nosetime_articlesUpdateError", (typeval: string) => {
			if (type != typeval) return;
			setIsRender(val => !val);

			events.publish("list_loadmore", false);
		});

		return () => {
			events.unsubscribe("nosetime_articlesUpdated");
			events.unsubscribe("nosetime_articlesUpdateError");
		}
	}, [])

	return (
		<FlashList data={items.current}
			extraData={isrender}
			estimatedItemSize={100}
			scrollEnabled={false}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ backgroundColor: theme.toolbarbg }}
			keyExtractor={(item: any) => item.id}
			renderItem={({ item, index }: any) => {
				return (
					<View style={styles.article_con}>
						<Pressable onPress={() => { }}>
							<View style={styles.img_box}>
								<FastImage style={{ width: "100%", height: "100%" }} source={{ uri: ENV.image + item.pic }} />
							</View>
							{item.title && <View style={styles.tit_content}>
								<Text style={styles.title2} numberOfLines={1}>{item.title}</Text>
								{/* <Text style={styles.title3}>{item.title3}</Text> */}
							</View>}
							{(item.desc && !item.title) && <Text style={styles.desc} numberOfLines={2}>{item.desc}</Text>}
							<View style={styles.icon_box}>
								<View style={styles.icon_con}>
									<Icon name="heart" size={16} color={theme.placeholder} />
									<Text style={styles.icon_text}>{item.favcnt}</Text>
								</View>
								<View style={styles.icon_con}>
									<Icon name="reply" size={17} color={theme.placeholder} />
									<Text style={styles.icon_text}>{item.replycnt}</Text>
								</View>
							</View>
						</Pressable>
					</View>
				)
			}}
			ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={items.current.length > 0} />}
		/>
		// <ScrollView style={styles.container}
		// 	scrollEnabled={false}
		// 	onLayout={(e: any) => {
		// 		setListHeight(e.nativeEvent.layout.height, type);
		// 	}}
		// 	onContentSizeChange={(w, h) => {
		// 		setListHeight(h, type);
		// 	}}
		// >
		// 	{(listdata && listdata.length > 0) && listdata.map((item: any, index: number) => {
		// 		return (
		// 			<View key={item.id} style={styles.article_con}>
		// 				<Pressable onPress={() => { }}>
		// 					<View style={styles.img_box}>
		// 						<FastImage style={{ width: "100%", height: "100%" }} source={{ uri: ENV.image + item.pic }} />
		// 					</View>
		// 					{item.title && <View style={styles.tit_content}>
		// 						<Text style={styles.title2} numberOfLines={1}>{item.title}</Text>
		// 						{/* <Text style={styles.title3}>{item.title3}</Text> */}
		// 					</View>}
		// 					{(item.desc && !item.title) && <Text style={styles.desc} numberOfLines={2}>{item.desc}</Text>}
		// 					<View style={styles.icon_box}>
		// 						<View style={styles.icon_con}>
		// 							<Icon name="heart" size={16} color={theme.placeholder} />
		// 							<Text style={styles.icon_text}>{item.favcnt}</Text>
		// 						</View>
		// 						<View style={styles.icon_con}>
		// 							<Icon name="reply" size={17} color={theme.placeholder} />
		// 							<Text style={styles.icon_text}>{item.replycnt}</Text>
		// 						</View>
		// 					</View>
		// 				</Pressable>
		// 			</View >
		// 		)
		// 	})}
		// </ScrollView>
	);
})
const styles = StyleSheet.create({
	container: {
		paddingTop: 48,
		width: "100%",
		height: "100%",
		backgroundColor: theme.toolbarbg,
	},
	article_con: {
		flex: 1,
		paddingHorizontal: 25,
		paddingBottom: 20,
	},
	img_box: {
		position: "relative",
		width: (width - 50),
		aspectRatio: (width - 50) / 196.16,
		borderRadius: 8,
		overflow: "hidden",
		backgroundColor: "rgba(129,129,129,0.09)"
	},
	tit_content: {
		width: "100%",
		marginTop: 13
	},
	title2: {
		fontSize: 15,
		fontWeight: "500",
		color: theme.text1,
		marginBottom: 3
	},
	title3: {
		fontSize: 14,
		color: theme.comment,
	},
	desc: {
		fontSize: 14,
		color: theme.text2,
		marginTop: 12,
	},
	icon_box: {
		marginTop: 6,
		flexDirection: "row",
		alignItems: "center",
	},
	icon_con: {
		flexDirection: "row",
		alignItems: "center",
		marginRight: 10,
	},
	icon_text: {
		marginLeft: 5,
		fontSize: 12,
		color: theme.placeholder,
	}
});
export default ArticleList;