import React from "react";
import { FlatList, StyleSheet, View, Image, Text, Pressable } from "react-native";

import theme from "../configs/theme";
import { ENV } from "../configs/ENV";
import { Globalstyles, handlelevelLeft, handlelevelTop } from "../configs/globalmethod";
import LinearGradient from "react-native-linear-gradient";

const CareView = React.memo(({ data, method }: any) => {

	const { items, likedata, type } = data;

	const getid = (type: string, item: any) => {
		let tabs = ["care", "fans"];
		if (tabs.includes(type)) {
			return item.id;
		} else {
			return item.uid;
		}
	}

	return (
		<>
			{(["care", "fans"].includes(type) && items.length == 0) && <View style={styles.borderbg}>
				<Image style={Globalstyles.emptyimg}
					resizeMode="contain"
					source={require("../assets/images/empty/userfriend_blank.png")} />
			</View>}
			{(items && items.length > 0) && <FlatList data={items}
				showsHorizontalScrollIndicator={false}
				contentContainerStyle={[styles.talent_con, styles.borderbg]}
				keyExtractor={(item: any) => getid(type, item)}
				renderItem={({ item }: any) => {
					return (
						<View style={styles.item_container}>
							<Image style={styles.item_img_con}
								source={{ uri: ENV.avatar + getid(type, item) + ".jpg?" + item.uface }}
							/>
							<View style={styles.item_info}>
								<View style={Globalstyles.item_flex}>
									<Text numberOfLines={1} style={styles.item_uname}>{item.uname}</Text>
									{item.ulevel > 0 && <View style={Globalstyles.level}>
										<Image
											style={[Globalstyles.level_icon, handlelevelLeft(item.ulevel), handlelevelTop(item.ulevel)]}
											defaultSource={require("../assets/images/nopic.png")}
											source={require("../assets/images/level.png")}
										/>
									</View>}
								</View>
								<View style={Globalstyles.item_flex}>
									{type == "talent" && <>
										<Text style={{ marginRight: 15 }}>{"商业香  " + item.stradexp}</Text>
										<Text>{"沙龙香  " + item.ssalonxp}</Text>
									</>}
									{["care", "fans"].includes(type) && <>
										<Text style={{ marginRight: 15 }}>{"商业香  " + item.utradexp}</Text>
										<Text>{"沙龙香  " + item.usalonxp}</Text>
									</>}
								</View>
							</View>
							{!likedata[getid(type, item)] && <Pressable onPress={() => { }} style={styles.item_btn_con}>
								<LinearGradient style={styles.item_btn}
									colors={["#81B4EC", "#9BA6F5"]}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									locations={[0, 1]}
								>
									<Text style={styles.btn_text}>{"关注"}</Text>
								</LinearGradient>
							</Pressable>}
							{likedata[getid(type, item)] && <Pressable onPress={() => { }} style={styles.item_btn_con}>
								<View style={[styles.item_btn, { borderWidth: 1, borderColor: "#EEEEEE" }]}>
									<Text style={styles.btn_text2}>{"已关注"}</Text>
								</View>
							</Pressable>}
						</View>
					)
				}}
			/>}
		</>
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