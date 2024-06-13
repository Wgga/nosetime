import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image, RefreshControl } from "react-native";

import FastImage from "react-native-fast-image";
import { useFocusEffect } from "@react-navigation/native";
import Carousel from "react-native-reanimated-carousel";
import { FlashList } from "@shopify/flash-list";
import { LongPressGestureHandler } from "react-native-gesture-handler";

import ListBottomTip from "../../components/listbottomtip";

import shequService from "../../services/shequ-service/shequ-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";
import events from "../../hooks/events/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

const SocialShequ = React.memo(({ navigation, type }: any) => {

	// 控件
	const classname = "SocialShequPage";
	const slidesref = React.useRef<any>(null);
	// 参数
	// 变量
	let currentword = React.useRef<string>("");
	const [slidesIndex, setSlidesIndex] = React.useState<number>(0);
	// 数据
	let items = React.useRef<any[]>([]);
	let banners = React.useRef<any[]>([]);
	// 状态
	let noMore = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		currentword.current = type;

		events.subscribe("nosetime_topicsUpdated", (word) => {
			if (currentword.current != word) return;

			items.current = shequService.getItems(currentword.current);
			noMore.current = !shequService.moreDataCanBeLoaded(currentword.current);
			setIsRender(val => !val);
		});
		events.subscribe("nosetime_topicsUpdateError", (word) => {
			if (currentword.current != word) return;

			noMore.current = !shequService.moreDataCanBeLoaded(currentword.current);
			setIsRender(val => !val);
		});

		events.subscribe("social_shequ_fecth_new", () => {
			if (currentword.current == "最新"){
				shequService.fetch(currentword.current, 1);
			}
		});

		return () => {
			events.unsubscribe("nosetime_topicsUpdated");
			events.unsubscribe("nosetime_topicsUpdateError");
			events.unsubscribe("social_shequ_fecth_new");
		}
	}, [])

	useFocusEffect(
		React.useCallback(() => {
			init()
		}, [])
	)

	const init = () => {
		if (currentword.current == "最新") {
			http.get(ENV.shequ + "?method=getbannerlist").then((resp_data: any) => {
				banners.current = resp_data;
				cache.saveItem(classname + "banner", resp_data, 30);
			});
		}
		setTimeout(() => {
			shequService.fetch(currentword.current, 1);
		}, 500)
	}

	return (
		<FlashList data={items.current}
			extraData={isrender}
			estimatedItemSize={100}
			onEndReached={() => {
				shequService.fetch(currentword.current, 0);
			}}
			onEndReachedThreshold={0.1}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={{ backgroundColor: theme.toolbarbg }}
			keyExtractor={(item: any) => item.id}
			refreshing={false}
			onRefresh={() => {
				setTimeout(() => {
					shequService.fetch(currentword.current, 1);
				}, 500)
			}}
			ListHeaderComponent={(
				<>
					{currentword.current == "最新" &&
						<View style={styles.slides_container}>
							<Carousel ref={slidesref}
								width={width}
								data={banners.current}
								defaultIndex={0}
								autoPlayInterval={3000}
								scrollAnimationDuration={500}
								autoPlay={false}
								autoFillData
								panGestureHandlerProps={{
									activeOffsetX: [-10, 10],
								}}
								onSnapToItem={(index: number) => {
									setSlidesIndex(index);
								}}
								renderItem={({ item, index }: any) => (
									<LongPressGestureHandler>
										<Pressable key={item.code} onPress={() => {
										}}>
											<View style={styles.slides_container}>
												<FastImage style={{ width: "100%", height: "100%" }} source={{ uri: ENV.image + item.ctimg }} />
												<View style={styles.slides_title_box}>
													<Text style={styles.slides_title} numberOfLines={1}>{item.cttitle}</Text>
												</View>
											</View>
										</Pressable>
									</LongPressGestureHandler>
								)}
							/>
							<View style={styles.indicatorContainer}>
								{banners.current.map((item: any, index: number) => (
									<View key={item.id} style={[styles.dotstyle, { opacity: index === slidesIndex ? 1 : 0.2 }]}></View>
								))}
							</View>
						</View>}
				</>
			)}
			renderItem={({ item, index }: any) => {
				return (
					<View style={styles.list_item}>
						<Text numberOfLines={1} style={styles.item_title}>{item.title}</Text>
						<View style={styles.item_info}>
							<View style={styles.item_flex}>
								<FastImage style={styles.item_avatar}
									source={{ uri: ENV.avatar + item.uid + ".jpg!l?" + item.uface }}
								/>
								<Text style={styles.item_uname}>{item.uname}</Text>
							</View>
							<View style={styles.item_flex}>
								{item.cnt != "" && item.cnt != "0" && <Text style={styles.reply_cnt}>{item.cnt}</Text>}
								<Icon name="reply2" size={18} color={theme.comment} />
							</View>
						</View>
					</View>
				)
			}}
			ListFooterComponent={<ListBottomTip noMore={noMore.current} isShowTip={items.current.length > 0} />}
		/>
	);
})

const styles = StyleSheet.create({
	refresh: {
		width: 32,
		height: 32,
	},
	slides_container: {
		width: width,
		aspectRatio: 392 / 160,
		backgroundColor: "rgba(129, 129, 129, 0.09)"
	},
	slides_title_box: {
		...StyleSheet.absoluteFillObject,
		paddingTop: 66,
		alignItems: "center",
		backgroundColor: "rgba(0,0,0,0.12)"
	},
	slides_title: {
		fontSize: 16,
		textShadowColor: "#777",
		textShadowOffset: { width: 0, height: 0 },
		textShadowRadius: 6,
		color: theme.toolbarbg,
	},
	indicatorContainer: {
		position: "absolute",
		left: 0,
		right: 0,
		flexDirection: "row",
		justifyContent: "center",
		bottom: 12,
		alignItems: "center",
	},
	dotstyle: {
		marginHorizontal: 4,
		width: 8,
		height: 8,
		borderRadius: 50,
		opacity: 0.2,
		backgroundColor: theme.toolbarbg,
	},
	list_item: {
		paddingHorizontal: 20,
		paddingVertical: 15,
	},
	item_title: {
		fontSize: 14,
		color: theme.text2,
		marginBottom: 15,
		marginRight: 30,
	},
	item_info: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	item_flex: {
		flexDirection: "row",
		alignItems: "center",
	},
	item_avatar: {
		width: 22,
		height: 22,
		borderRadius: 50,
		overflow: "hidden",
	},
	item_uname: {
		fontSize: 12,
		color: theme.comment,
		marginLeft: 6,
	},
	reply_cnt: {
		fontSize: 12,
		color: theme.comment,
		marginRight: 3,
	}
});

export default SocialShequ;