import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, Image } from "react-native";

import HeaderView from "../../components/headerview";
import ToastCtrl from "../../components/controller/toastctrl";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

const TagItem = React.memo(({ item, type, selectbtn }: any) => {
	return (
		<>
			{item.tag_data && <View style={styles.tags_item_con}>
				{item.tag_data[type].length > 0 && item.tag_data[type].map((tag: any, index: number) => {
					return (
						<Pressable key={tag.name} onPress={() => { selectbtn(tag, item) }}>
							{tag.sel && <View style={styles.item_tag_border}>
								<View style={styles.tag_border}></View>
								<Icon style={styles.tag_icon} name="correct" size={17} color={theme.toolbarbg} />
							</View>}
							<Text style={[
								styles.item_con,
								styles.item_tag_text,
								tag.name == "换一批" && styles.item_alter
							]}>
								{tag.name}
							</Text>
						</Pressable>
					)
				})}
			</View>}
		</>
	)
})

function PerfumeListTag({ navigation, route }: any): React.JSX.Element {

	// 控件
	const classname = "PerfumeListTagPage";
	// 变量
	let title = React.useRef<string>("添加标签");
	// 数据
	let alltags = React.useRef<any[]>([]);
	let seltags = React.useRef<any[]>([]);
	let selected_tags = React.useRef<any[]>([]);
	// 参数
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		selected_tags.current = [];
		if (route.params.tags.length > 0) {
			seltags.current = route.params.tags;
		}
		if (route.params.src == "square") {
			title.current = "选择标签";
		}
		cache.getItem(classname + "tags").then((cacheobj: any) => {
			if (cacheobj) {
				select_tags(cacheobj);
			}
		}).catch(() => {
			http.get(ENV.collection + "?method=gettags").then((resp_data: any) => {
				cache.saveItem(classname + "tags", resp_data, 3600);
				select_tags(resp_data);
			});
		});
	}, [])

	// 分割标签为两部分显示
	const handle_tag = (tags: any) => {
		let [...data] = tags;
		let first = [], more = [];
		first = data.slice(0, 6);
		more = data.slice(6);
		return { first, more };
	}

	// 处理标签数据
	const select_tags = (data: any) => {
		let tags_data = JSON.parse(JSON.stringify(data));
		for (let i = 0; i < tags_data.length; i++) {
			for (let j = 0; j < tags_data[i].tags.length; j++) {
				if (seltags.current.indexOf(tags_data[i].tags[j]) >= 0) {
					selected_tags.current.push(tags_data[i].tags[j]);
					tags_data[i].tags[j] = { name: tags_data[i].tags[j], sel: true };
				} else {
					tags_data[i].tags[j] = { name: tags_data[i].tags[j], sel: false };
				}
			}
			tags_data[i]["tag_data"] = handle_tag(tags_data[i].tags);
			if (tags_data[i].tags2) {
				for (var j in tags_data[i].tags2) {
					if (seltags.current.indexOf(tags_data[i].tags2[j]) >= 0) {
						selected_tags.current.push(tags_data[i].tags2[j]);
						tags_data[i].tags2[j] = { name: tags_data[i].tags2[j], sel: true };
					} else {
						tags_data[i].tags2[j] = { name: tags_data[i].tags2[j], sel: false };
					}
				}
			}
		}
		alltags.current = tags_data;
		setIsRender(val => !val);
	}

	const selectbtn = (tags: any, item: any) => {
		if (tags.name == "换一批") {
			let tmptags = item.tags2;
			item.tags2 = item.tags;
			item.tags = tmptags;
			item.tag_data = handle_tag(tmptags);
			setIsRender(val => !val);
			return;
		}
		if (tags.sel) {
			tags.sel = false;
			let index = selected_tags.current.indexOf(tags.name);
			if (index > -1) {
				selected_tags.current.splice(index, 1);
			}
		} else {
			if (selected_tags.current.length >= 3) {
				ToastCtrl.show({ message: "最多选择3个标签", duration: 2000, viewstyle: "medium_toast", key: "select_toast" });
				return;
			}
			tags.sel = true;
			selected_tags.current.push(tags.name);
		}
		setIsRender(val => !val);
	}

	const surebtn = () => {
		if (selected_tags.current.length == 0 && title.current != "添加标签") {
			return navigation.goBack();
		}
		if (title.current == "选择标签") {
			if (selected_tags.current.length == 0) {
				return navigation.goBack();
			}
			navigation.push("Page", { screen: "PerfumeListSquare", params: { tags: selected_tags.current } });
		} else {
			events.publish("selected_tags", selected_tags.current)
			navigation.goBack();
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
				<Pressable style={Globalstyles.title_text_con} onPress={surebtn}>
					<Text style={Globalstyles.title_text}>{"确定"}</Text>
				</Pressable>
			</HeaderView>
			<ScrollView contentContainerStyle={styles.tags_con} showsVerticalScrollIndicator={false}>
				<Text style={styles.tag_title}>{"本标签最多可选3个，现在已选" + selected_tags.current.length + "个"}</Text>
				{(alltags.current && alltags.current.length > 0) && alltags.current.map((item: any, index: number) => {
					return (
						<View key={item.name} style={styles.tag_item_con}>
							<View style={{ flexDirection: "row" }}>
								<View style={styles.item_con}>
									<Image style={styles.item_icon}
										source={{ uri: item.icon }}
									/>
									<Text style={styles.item_name}>{item.name}</Text>
								</View>
								<TagItem item={item} type="first" selectbtn={selectbtn} />
							</View>
							<TagItem item={item} type="more" selectbtn={selectbtn} />
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
	item_con: {
		width: width * 0.25,
		height: 100,
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
		top: 0,
		right: 0,
		bottom: 0,
		left: 0,
		borderWidth: 2,
		zIndex: 1,
		borderColor: "#E93D4D"
	},
	tag_border: {
		position: "absolute",
		top: 0,
		right: 0,
		width: 0,
		height: 0,
		zIndex: 1,
		borderWidth: 8,
		borderLeftColor: "transparent",
		borderBottomColor: "transparent",
		borderRightColor: "#E93D4D",
		borderTopColor: "#E93D4D",
	},
	tag_icon: {
		position: "absolute",
		top: -5,
		right: 1,
		width: 13,
		height: 13,
		zIndex: 1,
	},
	item_tag_text: {
		fontSize: 14,
		color: theme.tit2,
		height: 50,
		textAlign: "center",
		lineHeight: 50,
	},
	item_alter: {
		color: theme.tit
	},
});

export default PerfumeListTag;