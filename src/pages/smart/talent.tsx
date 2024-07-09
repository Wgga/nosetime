import React from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Image } from "react-native";

import FastImage from "react-native-fast-image";
import HeaderView from "../../components/headerview";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlelevelLeft, handlelevelTop } from "../../configs/globalmethod";

import us from "../../services/user-service/user-service";
import ToastCtrl from "../../components/toastctrl";
import LinearGradient from "react-native-linear-gradient";
import CareView from "../../components/careView";

function Talent({ navigation }: any): React.JSX.Element {
	// 控件
	// 变量
	const [tab, setTab] = React.useState<string>("talent"); // 当前tab
	// 数据
	let talentlist = React.useRef<any[]>([]);
	let carelist = React.useRef<any[]>([]);
	let like_ = React.useRef<any>({});
	// 参数
	// 状态
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
			getCare()
		}
	}

	// 获取我的关注数据
	const getCare = () => {
		http.post(ENV.user, { method: "getcare", id: us.user.uid }).then((resp_data: any) => {
			carelist.current = resp_data;

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

	const care = (type: string, item: any) => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App资深评论家页" } });
		}
		let id = tab == "care" ? item.id : item.uid;
		http.post(ENV.user, { token: us.user.token, method: "care" + type, ida: us.user.uid, idb: id }).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				ToastCtrl.show({ message: "关注成功", duration: 1000, viewstyle: "short_toast", key: "care_add_toast" });
				like_.current[id] = 1;
			} else if (resp_data.msg == "DEL") {
				ToastCtrl.show({ message: "取消成功", duration: 1000, viewstyle: "short_toast", key: "care_add_toast" });
				delete like_.current[id];
			} else if (resp_data.msg == "NOEFFECT") {
				console.log("发布失败：" + resp_data.msg);
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App资深评论家页" } });
			} else {
				console.log("发布失败：" + resp_data.msg);
			}
			setIsRender(val => !val);
		})
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
					type: tab
				}} />
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