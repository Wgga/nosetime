import React from "react";

import { View, Text, StyleSheet, Pressable, Image } from "react-native";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";
import HeaderView from "../../components/headerview";
import { FlashList } from "@shopify/flash-list";
import ListBottomTip from "../../components/listbottomtip";

function UserShequ({ navigation, route }: any): React.JSX.Element {

	// 控件
	// 参数
	// 变量
	let uid = React.useRef<number>(0);
	let cnt = React.useRef<number>(0);
	let name = React.useRef<string>("");
	const [curTab, setCurTab] = React.useState<string>("user");
	let cur_page = React.useRef<any>({
		user: 1,
		fav: 1
	});
	// 数据
	let userTopics = React.useRef<any>([]);
	let favTopics = React.useRef<any>([]);
	// 状态
	let UsernoMore = React.useRef<boolean>(false);
	let FavnoMore = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		if (route.params) {
			uid.current = route.params.uid ? route.params.uid : 0;
			cnt.current = route.params.cnt ? route.params.cnt : 0;
			name.current = route.params.name ? route.params.name : "";
		}
		init()
	}, [])


	const getUserTopic = () => {
		return new Promise((resolve, reject) => {
			http.post(ENV.shequ, { method: "getpubtopic", id: uid.current }).then((resp_data: any) => {
				userTopics.current = resp_data;
				if (resp_data.length < 20) UsernoMore.current = true;
				resolve(1);
			})
		})
	}

	const getFavTopic = () => {
		return new Promise((resolve, reject) => {
			http.post(ENV.api + ENV.shequ, { method: "getfavtopic", id: uid.current }).then((resp_data: any) => {
				favTopics.current = resp_data;
				if (resp_data.length < 20) FavnoMore.current = true;
				resolve(1);
			})
		})
	}

	const init = () => {
		Promise.all([getUserTopic(), getFavTopic()]).then(() => {
			setIsRender(val => !val);
		})
	}

	const loadMore = () => {
		if ((curTab == "user" && UsernoMore.current) || (curTab == "fav" && FavnoMore.current)) return;
		cur_page.current[curTab] += 1;
		let method = curTab == "user" ? "getpubtopic" : "getfavtopic";
		http.post(ENV.shequ, { method, id: uid.current, page: cur_page.current[curTab] }).then((resp_data: any) => {
			if (curTab == "user") {
				userTopics.current = userTopics.current.concat(resp_data);
				if (resp_data.length < 20) UsernoMore.current = true;
			} else {
				favTopics.current = favTopics.current.concat(resp_data);
				if (resp_data.length < 20) FavnoMore.current = true;
			}
		})
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: name.current + "的话题(" + cnt.current + ")",
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}} />
			<View style={Globalstyles.tab_tit_con}>
				{uid.current == us.user.uid && <Pressable style={Globalstyles.tab_tit} onPress={() => { setCurTab("user") }}>
					<Text style={[Globalstyles.tabtext, curTab == "user" && Globalstyles.activetab]}>{"我的"}</Text>
					{curTab == "user" && <Text style={Globalstyles.tabline}></Text>}
				</Pressable>}
				{uid.current != us.user.uid && <Pressable style={Globalstyles.tab_tit} onPress={() => { setCurTab("user") }}>
					<Text style={[Globalstyles.tabtext, curTab == "user" && Globalstyles.activetab]}>{"自建"}</Text>
					{curTab == "user" && <Text style={Globalstyles.tabline}></Text>}
				</Pressable>}
				<Pressable style={Globalstyles.tab_tit} onPress={() => { setCurTab("fav") }}>
					<Text style={[Globalstyles.tabtext, curTab == "fav" && Globalstyles.activetab]}>{"收藏"}</Text>
					{curTab == "fav" && <Text style={Globalstyles.tabline}></Text>}
				</Pressable>
			</View>
			{(userTopics.current.length > 0 || favTopics.current.length > 0) && <FlashList data={curTab == "user" ? userTopics.current : favTopics.current}
				extraData={isrender}
				estimatedItemSize={100}
				showsVerticalScrollIndicator={false}
				contentContainerStyle={{ backgroundColor: theme.toolbarbg }}
				keyExtractor={(item: any) => item.ctdlgid}
				onEndReachedThreshold={0.1}
				onEndReached={loadMore}
				renderItem={({ item, index }: any) => {
					return (
						<Pressable style={styles.topic_item} onPress={() => {
							navigation.navigate("Page", { screen: "SocialShequDetail", params: { ctdlgid: item.ctdlgid } });
						}}>
							<View style={styles.item_title}>
								<Image style={styles.item_image} source={{ uri: ENV.avatar + item.uid + ".jpg!l?" + item.uface }} />
								<Text style={styles.item_desc}>{item.cttitle}</Text>
							</View>
							<View style={styles.item_info}>
								<Text style={styles.text_style}>{item.cttime}</Text>
								<View style={styles.item_reply}>
									<Icon name="reply2" size={14} color={theme.placeholder} style={{ marginRight: 5 }} />
									<Text style={styles.text_style}>{item.cnt}</Text>
								</View>
							</View>
						</Pressable>
					)
				}}
				ListFooterComponent={<ListBottomTip
					noMore={curTab == "user" ? UsernoMore.current : FavnoMore.current}
					isShowTip={curTab == "user" ? userTopics.current.length > 0 : favTopics.current.length > 0} />
				}
			/>}
		</View>
	);
}

const styles = StyleSheet.create({
	topic_item: {
		padding: 15,
		borderBottomColor: theme.bg,
		borderBottomWidth: 1
	},
	item_title: {
		flexDirection: "row",
		alignItems: "center",
		marginBottom: 15,
	},
	item_image: {
		width: 35,
		height: 35,
		borderRadius: 50
	},
	item_desc: {
		marginLeft: 15,
		fontSize: 14,
		color: theme.tit2
	},
	item_info: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between"
	},
	text_style: {
		fontSize: 12,
		color: theme.placeholder
	},
	item_reply: {
		flexDirection: "row",
		alignItems: "center",
	},
});

export default UserShequ;