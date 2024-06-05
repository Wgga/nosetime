import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, Image } from "react-native";

import HeaderView from "../../components/headerview";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";
import events from "../../hooks/events/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function PerfumeListTag({ navigation }: any): React.JSX.Element {

	// 控件
	const classname = "PerfumeListTagPage";
	// 变量
	// 数据
	let alltags = React.useRef<any[]>([]);
	let seltags = React.useRef<any[]>([]);
	let selected_tags = React.useRef<any[]>([]);
	// 参数
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		/* cache.getItem(classname + "tags").then((cacheobj) => {
			if (cacheobj) {
				setAllTags(cacheobj);
			}
		}).catch(() => { */
		http.get(ENV.collection + "?method=gettags").then((resp_data: any) => {
			select_tags(resp_data);
			// cache.saveItem(classname + "tags", resp_data, 3600);
		});
		// });
	}, [])

	const handle_tag = (tags: any) => {
		let [...data] = tags;
		let first = [], more = [];
		first = data.slice(0, 6);
		more = data.slice(6);
		return { first, more };
	}

	const select_tags = (data: any) => {
		alltags.current = data;
		for (var i in alltags.current) {
			for (var j in alltags.current[i].tags) {
				if (seltags.current.indexOf(alltags.current[i].tags[j]) >= 0) {
					selected_tags.current.push(alltags.current[i].tags[j]);
					alltags.current[i].tags[j] = { name: alltags.current[i].tags[j], sel: 1 };
				} else {
					alltags.current[i].tags[j] = { name: alltags.current[i].tags[j], sel: 0 };
				}
			}
			if (alltags.current[i].tags2) {
				for (var j in alltags.current[i].tags2) {
					if (seltags.current.indexOf(alltags.current[i].tags2[j]) >= 0) {
						selected_tags.current.push(alltags.current[i].tags2[j]);
						alltags.current[i].tags2[j] = { name: alltags.current[i].tags2[j], sel: 1 };
					} else {
						alltags.current[i].tags2[j] = { name: alltags.current[i].tags2[j], sel: 0 };
					}
				}
			}
			console.log("%c Line:76 🍓", "color:#93c0a4", alltags.current[i].tags);
		}
		// setIsRender(val => !val);
	}

	const clickbtn = (tag: string, item: any) => {
		if (tag == "换一批") {
			let tmptags = item.tags2;
			item.tags2 = item.tags;
			item.tags = tmptags;
			item.tag_data = handle_tag(tmptags);
			setIsRender(val => !val);
			return;
		}
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: "选择标签",
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}}>
				<Pressable style={Globalstyles.title_text_con} onPress={() => { }}>
					<Text style={Globalstyles.title_text}>{"确定"}</Text>
				</Pressable>
			</HeaderView>
			<ScrollView contentContainerStyle={styles.tags_con} showsVerticalScrollIndicator={false}>
				<Text style={styles.tag_title}>{"本标签最多可选3个，现在已选" + selected_tags.current.length + "个"}</Text>
				{(alltags.current && alltags.current.length > 0) && alltags.current.map((item: any, index: number) => {
					return (
						<View key={item.name} style={styles.tag_item_con}>
							<View style={styles.tag_item}>
								<View style={[styles.item_border, { height: 100 }]}>
									<Image style={styles.item_icon}
										source={{ uri: item.icon }}
									/>
									<Text style={styles.item_name}>{item.name}</Text>
								</View>
								{item.tag_data && <View style={styles.tags_item_con}>
									{item.tag_data.first.length > 0 && item.tag_data.first.map((tag: any, index: number) => {
										return (
											<Pressable onPress={() => { clickbtn(tag, item) }} key={tag} style={[styles.item_border, { height: 50 }]}>
												{/* <View style={styles.item_tag_border}></View> */}
												<Text style={[styles.item_tag_text, tag == "换一批" && styles.item_alter]}>{tag}</Text>
											</Pressable>
										)
									})}
								</View>}
							</View>
							{item.tag_data && <View style={styles.tags_item_con}>
								{item.tag_data.more.length > 0 && item.tag_data.more.map((tag: any, index: number) => {
									return (
										<Pressable onPress={() => { clickbtn(tag, item) }} key={tag} style={[styles.item_border, { height: 50 }]}>
											{/* <View style={styles.item_tag_border}></View> */}
											<Text style={[styles.item_tag_text, tag == "换一批" && styles.item_alter]}>{tag}</Text>
										</Pressable>
									)
								})}
							</View>}
						</View>
					)
				})}
			</ScrollView>
		</View>
	);
}

const styles = StyleSheet.create({
	tags_con: {
		backgroundColor: theme.bg,
		paddingBottom: 40,
	},
	tag_title: {
		fontSize: 12,
		color: theme.text2,
		paddingLeft: 10,
		height: 40,
		lineHeight: 40,
	},
	tag_item_con: {
		marginBottom: 15,
		backgroundColor: theme.toolbarbg,
	},
	tag_item: {
		flexDirection: "row",
	},
	item_border: {
		width: width * 0.25,
		alignItems: "center",
		justifyContent: "center",
		borderBottomColor: theme.bg,
		borderRightColor: theme.bg,
		borderBottomWidth: 1,
		borderRightWidth: 1,
	},
	item_icon: {
		width: 29,
		height: 29,
	},
	item_name: {
		fontSize: 14,
		color: theme.tit
	},
	tags_item_con: {
		flex: 1,
		flexDirection: "row",
		flexWrap: "wrap",
	},
	item_tag_border: {
		position: "absolute",
		top: -2,
		right: -2,
		bottom: -2,
		left: -2,
		borderWidth: 2,
		borderColor: "#E93D4D"
	},
	item_tag_text: {
		fontSize: 14,
		color: theme.tit2
	},
	item_alter: {
		color: theme.tit
	},
});

export default PerfumeListTag;