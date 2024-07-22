import React from "react";
import { FlatList, StyleSheet, View, Image, Text, Pressable } from "react-native";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlelevelLeft, handlelevelTop } from "../../utils/globalmethod";
import LinearGradient from "react-native-linear-gradient";
import ListBottomTip from "../listbottomtip";
import AlertCtrl from "../controller/alertctrl";
import us from "../../services/user-service/user-service";
import http from "../../utils/api/http";
import ToastCtrl from "../controller/toastctrl";

const CareView = React.memo(({ data, method }: any) => {

	const { items, likedata, type, isShowCS = true, noMore, isempty, isemptyo, navigation } = data;
	const { loadMore } = method;

	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	const getid = (type: string, item: any) => {
		let tabs = ["care", "fans"];
		if (tabs.includes(type)) {
			return item.id;
		} else {
			return item.uid;
		}
	}

	const care = (method: string, item: any) => {
		let id = getid(type, item);
		if (method == "del") {
			if (!likedata[id]) return;
			AlertCtrl.show({
				header: "确定要取消关注吗？",
				key: "del_care_alert",
				message: "",
				buttons: [{
					text: "取消",
					handler: () => {
						AlertCtrl.close("del_care_alert");
					}
				}, {
					text: "确定",
					handler: () => {
						AlertCtrl.close("del_care_alert");
						_care(method, id);
					}
				}],
			})
		} else {
			if (likedata[id]) return;
			_care(method, id);
		}
	}

	const _care = (type: string, id: number) => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App资深评论家页" } });
		}
		http.post(ENV.user, { token: us.user.token, method: "care" + type, ida: us.user.uid, idb: id }).then((resp_data: any) => {
			if (resp_data.msg == "ADD") {
				ToastCtrl.show({ message: "关注成功", duration: 1000, viewstyle: "short_toast", key: "care_add_toast" });
				likedata[id] = 1;
			} else if (resp_data.msg == "DEL") {
				ToastCtrl.show({ message: "取消成功", duration: 1000, viewstyle: "short_toast", key: "care_add_toast" });
				delete likedata[id];
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

	const gotodetail = (item: any) => {
		navigation.push("Page", { screen: "UserDetail", params: { uid: getid(type, item) } });
	}

	return (
		<FlatList data={items}
			showsVerticalScrollIndicator={false}
			contentContainerStyle={isShowCS && [styles.talent_con, styles.borderbg]}
			keyExtractor={(item: any) => getid(type, item)}
			onEndReachedThreshold={0.1}
			onEndReached={() => {
				if (items && items.length > 0) loadMore("loadMore");
			}}
			ListEmptyComponent={<View>
				{isempty && <Image style={Globalstyles.emptyimg}
					resizeMode="contain"
					source={require("../../assets/images/empty/userfriend_blank.png")} />}
				{isemptyo && <Image style={Globalstyles.emptyimg}
					resizeMode="contain"
					source={require("../../assets/images/empty/ouserfriend_blank.png")} />}
			</View>}
			renderItem={({ item }: any) => {
				return (
					<View style={styles.item_container}>
						<Pressable onPress={() => { gotodetail(item) }}>
							<Image style={styles.item_img_con}
								source={{ uri: ENV.avatar + getid(type, item) + ".jpg?" + item.uface }}
							/>
						</Pressable>
						<View style={styles.item_info}>
							<View style={Globalstyles.item_flex}>
								<Text numberOfLines={1} style={styles.item_uname} onPress={() => { gotodetail(item) }}>{item.uname}</Text>
								{item.ulevel > 0 && <View style={Globalstyles.level}>
									<Image style={[Globalstyles.level_icon, handlelevelLeft(item.ulevel), handlelevelTop(item.ulevel)]}
										defaultSource={require("../../assets/images/nopic.png")}
										source={require("../../assets/images/level.png")}
									/>
								</View>}
							</View>
							<View style={Globalstyles.item_flex}>
								{type == "talent" && <>
									<Text style={{ marginRight: 15 }}>{"商业香  " + item.stradexp}</Text>
									<Text>{"沙龙香  " + item.ssalonxp}</Text>
								</>}
								{type == "care" && <>
									<Text style={{ marginRight: 15 }}>{"商业香  " + item.utradexp}</Text>
									<Text>{"沙龙香  " + item.usalonxp}</Text>
								</>}
								{type == "fans" && <Text numberOfLines={1} style={styles.item_desc}>{item.desc}</Text>}
							</View>
						</View>
						{!likedata[getid(type, item)] && <Pressable onPress={() => { care("add", item) }} style={styles.item_btn_con}>
							<LinearGradient style={styles.item_btn}
								colors={["#81B4EC", "#9BA6F5"]}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}
								locations={[0, 1]}
							>
								<Text style={styles.btn_text}>{"关注"}</Text>
							</LinearGradient>
						</Pressable>}
						{likedata[getid(type, item)] && <Pressable onPress={() => { care("del", item) }} style={styles.item_btn_con}>
							<View style={[styles.item_btn, { borderWidth: 1, borderColor: "#EEEEEE" }]}>
								<Text style={styles.btn_text2}>{"已关注"}</Text>
							</View>
						</Pressable>}
					</View>
				)
			}}
			ListFooterComponent={<ListBottomTip noMore={noMore} isShowTip={items && items.length > 0} />}
		/>
	)
})

const styles = StyleSheet.create({
	borderbg: {
		borderTopColor: theme.bg,
		borderTopWidth: 6,
	},
	talent_con: {
		paddingVertical: 8,
	},
	item_container: {
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
	item_desc: {
		fontSize: 12,
		color: theme.comment,
		marginTop: 8,
		marginBottom: 12,
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
})

export default CareView;