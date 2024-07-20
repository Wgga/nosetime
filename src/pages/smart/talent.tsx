import React from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Image } from "react-native";

import FastImage from "react-native-fast-image";
import HeaderView from "../../components/headerview";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlelevelLeft, handlelevelTop } from "../../utils/globalmethod";

import us from "../../services/user-service/user-service";
import ToastCtrl from "../../components/controller/toastctrl";
import LinearGradient from "react-native-linear-gradient";
import CareView from "../../components/careView";

function Talent({ navigation }: any): React.JSX.Element {
	// 控件
	// 变量
	const [tab, setTab] = React.useState<string>("talent"); // 当前tab
	let curpage = React.useRef<number>(1);
	// 数据
	let talentlist = React.useRef<any[]>([]);
	let carelist = React.useRef<any[]>([]);
	let like_ = React.useRef<any>({});
	// 参数
	// 状态
	let noMore = React.useRef<boolean>(false);
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		init();
	}, [])

	const init = () => {
		cache.getItem("SmartTalent").then((cacheobj) => {
			if (cacheobj) {
				talentlist.current = cacheobj;

				//获取用户喜欢数据，获取数据后更新like_[]
				var ids = [];
				for (let i in talentlist.current) {
					ids.push(talentlist.current[i].uid);
				}
				islike(ids);
			}
		}).catch(() => {
			http.get(ENV.smart + "?method=gettalent").then((resp_data: any) => {
				cache.saveItem("SmartTalent", resp_data, 600);
				talentlist.current = resp_data;

				//获取用户喜欢数据，获取数据后更新like_[]
				var ids = [];
				for (let i in talentlist.current) {
					ids.push(talentlist.current[i].uid);
				}
				islike(ids);
			});
		});
	}

	const toogle = (type: string) => {
		if (tab == type) return;
		setTab(type);
		if (type != "care") return;
		if (us.user.uid == 0) {
			navigation.navigate("Page", { screen: "Login", params: { src: "App资深评论家页" } });
		} else {
			getCare("init");
		}
	}

	// 获取我的关注数据
	const getCare = (type: string) => {
		if (type == "loadMore") {
			if (noMore.current) return;
			curpage.current++;
		}
		http.post(ENV.user, { method: "getcare", id: us.user.uid, page: curpage.current }).then((resp_data: any) => {
			if (type == "init") {
				carelist.current = resp_data;
			} else {
				carelist.current = carelist.current.concat(resp_data);
			}

			if (resp_data.length < 20) {
				noMore.current = true;
			}

			var ids = [];
			for (let i in carelist.current) {
				ids.push(carelist.current[i].id);
			}
			islike(ids);
		})
	}

	const islike = (ids: any) => {
		if (!us.user.uid) {
			setIsRender(val => !val);
			return
		}
		http.post(ENV.user, { method: "islike", uid: us.user.uid, ids: ids }).then((resp_data: any) => {
			for (var i in resp_data) {
				like_.current[resp_data[i]] = 1;
			}
			setIsRender(val => !val);
		});
	}

	return (
		<View style={styles.talent_container}>
			<HeaderView data={{
				title: "",
				isShowSearch: false,
				style: { zIndex: 0 },
				childrenstyle: {
					headercolor: { color: theme.comment },
				}
			}} method={{
				back: () => { navigation.goBack() },
			}}>
				<View style={styles.talent_title}>
					<Pressable onPress={() => { toogle("talent") }}>
						<Text style={[styles.talent_title_text, { marginRight: 55 }, tab == "talent" && { color: theme.tit2 }]}>{"资深评论家"}</Text>
					</Pressable>
					<Pressable onPress={() => { toogle("care") }}>
						<Text style={[styles.talent_title_text, tab == "care" && { color: theme.tit2 }]}>{"我的关注"}</Text>
					</Pressable>
				</View>
				<View style={Globalstyles.title_text_con}></View>
			</HeaderView>
			<View style={Globalstyles.container}>
				<CareView data={{
					items: tab == "care" ? carelist.current : talentlist.current,
					likedata: like_.current,
					type: tab,
					noMore: tab == "talent" ? true : noMore.current,
					isempty: tab == "care" && carelist.current.length == 0,
					navigation,
				}} method={{ loadMore: getCare }} />
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	talent_container: {
		flex: 1,
		backgroundColor: theme.bg,
	},
	talent_title: {
		flex: 1,
		height: 44,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center"
	},
	talent_title_text: {
		fontSize: 17,
		color: theme.placeholder,
		fontWeight: "500",
	},
});
export default Talent;