import React from "react";
import { View, Text, StyleSheet, Pressable, FlatList, Image } from "react-native";

import FastImage from "react-native-fast-image";
import HeaderView from "../../components/headerview";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlelevelLeft, handlelevelTop } from "../../configs/globalstyles";

import us from "../../services/user-service/user-service";
import ToastCtrl from "../../components/toastctrl";
import LinearGradient from "react-native-linear-gradient";

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
	const [isrender, setIsRender] = React.useState(false); // 是否渲染

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

	const getid = (type: string, item: any) => {
		if (type == "care") {
			return item.id;
		} else {
			return item.uid;
		}
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
				<View style={styles.title_text_con}></View>
			</HeaderView>
			<View style={Globalstyles.container}>
				{(tab == "care" && carelist.current.length == 0) && <View style={styles.borderbg}>
					<Image style={Globalstyles.emptyimg}
						resizeMode="contain"
						source={require("../../assets/images/empty/userfriend_blank.png")} />
				</View>}
				{((tab == "care" && carelist.current.length > 0) || (tab == "talent" && talentlist.current.length > 0)) && <FlatList data={tab == "care" ? carelist.current : talentlist.current}
					showsHorizontalScrollIndicator={false}
					contentContainerStyle={[styles.talent_con, styles.borderbg]}
					keyExtractor={(item: any) => getid(tab, item)}
					renderItem={({ item }: any) => {
						return (
							<View style={styles.talent_or_care_item}>
								<View style={styles.item_img_con}>
									<FastImage style={styles.item_img}
										source={{ uri: ENV.avatar + (tab == "talent" ? item.uid : item.id) + ".jpg?" + item.uface }}
									/>
								</View>
								<View style={styles.item_info}>
									<View style={styles.item_flex}>
										<Text numberOfLines={1} style={styles.item_uname}>{item.uname}</Text>
										<View style={Globalstyles.level}>
											<Image
												style={[Globalstyles.level_icon, handlelevelLeft(item.ulevel), handlelevelTop(item.ulevel)]}
												defaultSource={require("../../assets/images/nopic.png")}
												source={require("../../assets/images/level.png")}
											/>
										</View>
									</View>
									<View style={styles.item_message}>
										{tab == "talent" && <>
											<Text style={{ marginRight: 15 }}>{"商业香  " + item.stradexp}</Text>
											<Text>{"沙龙香  " + item.ssalonxp}</Text>
										</>}
										{tab == "care" && <>
											<Text style={{ marginRight: 15 }}>{"商业香  " + item.utradexp}</Text>
											<Text>{"沙龙香  " + item.usalonxp}</Text>
										</>}
									</View>
								</View>
								{(!like_.current[getid(tab, item)] && getid(tab, item) != us.user.uid) && <Pressable onPress={() => { care("add", item) }} style={styles.item_btn_con}>
									<LinearGradient style={styles.item_btn}
										colors={["#81B4EC", "#9BA6F5"]}
										start={{ x: 0, y: 0 }}
										end={{ x: 1, y: 0 }}
										locations={[0, 1]}
									>
										<Text style={styles.btn_text}>{"关注"}</Text>
									</LinearGradient>
								</Pressable>}
								{like_.current[getid(tab, item)] && <Pressable onPress={() => { care("del", item) }} style={styles.item_btn_con}>
									<View style={[styles.item_btn, { borderWidth: 1, borderColor: "#EEEEEE" }]}>
										<Text style={styles.btn_text2}>{"取消关注"}</Text>
									</View>
								</Pressable>}
							</View>
						)
					}}
				/>}
			</View>
		</View>
	);
}
const styles = StyleSheet.create({
	item_flex: {
		flexDirection: "row",
		alignItems: "center",
	},
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
	title_text_con: {
		width: 44,
		height: 44,
		justifyContent: "center",
	},
	borderbg: {
		borderTopColor: theme.bg,
		borderTopWidth: 6,
	},
	talent_con: {
		paddingVertical: 8,
	},
	talent_or_care_item: {
		paddingHorizontal: 14,
		paddingVertical: 20,
		flexDirection: "row",
	},
	item_img_con: {
		width: 55,
		height: 55,
		borderRadius: 50,
		overflow: "hidden",
	},
	item_img: {
		width: "100%",
		height: "100%",
	},
	item_info: {
		flex: 1,
		marginLeft: 13,
		justifyContent: "space-around",
	},
	item_uname: {
		fontSize: 14,
		fontWeight: "500",
		color: theme.tit2,
		fontFamily: "PingFang SC",
	},
	item_message: {
		flexDirection: "row",
		alignItems: "center",
	},
	item_btn_con: {
		justifyContent: "center",
		marginLeft: 40,
	},
	item_btn: {
		minWidth: 68,
		height: 30,
		alignItems: "center",
		justifyContent: "center",
		borderRadius: 20,
		paddingHorizontal: 6,
	},
	btn_text: {
		color: theme.toolbarbg,
		fontWeight: "500",
		fontSize: 14,
		fontFamily: "PingFang SC",
	},
	btn_text2: {
		color: "#808080",
		fontWeight: "500",
		fontSize: 14,
		fontFamily: "PingFang SC",
	}
});
export default Talent;