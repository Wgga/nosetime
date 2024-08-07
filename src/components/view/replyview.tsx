import React from "react";
import { Text, StyleSheet, View, Image, Pressable } from "react-native";

import FastImage from "react-native-fast-image";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles, handlelevelLeft, handlelevelTop, show_items, display } from "../../utils/globalmethod";

import Icon from "../../assets/iconfont";

const ReplyItem = React.memo(({ data, method = {} }: any) => {

	const { contentkey, timekey, parentitem, item, islike } = data;
	const { reply_menu, like_reply, reply } = method;

	const handledesc = (item1: any, desc: string) => {
		let sz: any[] = [];
		sz = desc.replace(/\r/g, "").replace(/\n\n/g, "\n").split(/\n/g).map((item: string, index: number) => {
			return (
				<View key={index} style={Globalstyles.item_flex}>
					{(item1.refuid || item1.refuname) && <Text style={styles.reply_text}>{"回复 "}<Text style={styles.refuname}>{item1.refuname + "："}</Text></Text>}
					<Text style={styles.reply_text}>{item}</Text>
				</View>
			)
		})
		return sz;
	};

	return (
		<View style={styles.reply_item}>
			<FastImage style={styles.reply_avatar}
				source={{ uri: ENV.avatar + item.uid + ".jpg!l?" + item.uface }}
				resizeMode="contain"
			/>
			<View style={{ flex: 1, marginLeft: 11 }}>
				<View style={Globalstyles.item_flex_between}>
					<View style={[styles.info_name_con, { marginLeft: 0 }]}>
						<Text style={[styles.info_name, { fontSize: 13 }]}>{item.uname}</Text>
						{item.ulevel > 0 && <View style={Globalstyles.level}>
							<Image style={[Globalstyles.level_icon, handlelevelLeft(item.ulevel), handlelevelTop(item.ulevel)]}
								defaultSource={require("../../assets/images/nopic.png")}
								source={require("../../assets/images/level.png")}
							/>
						</View>}
					</View>
					<Pressable hitSlop={10} onPress={() => {
						if (parentitem) {
							reply_menu(item, parentitem)
						} else {
							reply_menu(item)
						}
					}}>
						<Icon name="shequsandian" size={16} color={theme.placeholder} />
					</Pressable>
				</View>
				<Pressable style={styles.main_desc} onPress={() => { reply(item) }}>{handledesc(item, item[contentkey])}</Pressable>
				<View style={[Globalstyles.item_flex_between, { marginBottom: 8 }]}>
					<Text style={styles.main_time}>{item[timekey]}</Text>
					<Pressable hitSlop={10} style={styles.reply_up} onPress={() => { like_reply(item) }}>
						<Icon name={islike ? "up-checked" : "up"} size={15} color={theme.placeholder2} />
						{item.up > 0 && <Text style={styles.up_cnt}>{item.up}</Text>}
					</Pressable>
				</View>
			</View>
		</View>
	)
})

const ReplyView = React.memo(({ data, method = {} }: any) => {

	const { contentkey, timekey, idkey, item, likedata, isShowSub } = data;
	const { reply_menu, like_reply, reply } = method;

	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	return (
		<View style={styles.list_item}>
			<ReplyItem data={{ contentkey, timekey, item, islike: likedata[item[idkey]] }} method={{ reply_menu, like_reply, reply }} />
			{(isShowSub || (item.sub && item.sub.length > 0)) && <View style={styles.list_sub_item}>
				{item.sub.map((sub: any, index: number) => {
					return (
						<View key={sub[idkey]}>
							{show_items(item.sub, index) && <ReplyItem data={{
								contentkey,
								timekey,
								parentitem: item,
								item: sub,
								islike: likedata[sub[idkey]]
							}} method={{ reply_menu, like_reply, reply }} />}
						</View>
					)
				})}
				{show_items(item.sub, -1) && <Pressable onPress={() => {
					display(item.sub);
					setIsRender(val => !val);
				}} style={Globalstyles.more_reply}>
					{!item.sub.show && <Text style={Globalstyles.more_reply_text}>{"共" + item.sub.length + "条回复"}</Text>}
					{item.sub.show && <Text style={Globalstyles.more_reply_text}>{"收起回复"}</Text>}
					<Icon name={item.sub.show ? "toparrow" : "btmarrow"} size={8} style={{ marginLeft: 4 }} color={theme.tit} />
				</Pressable>}
			</View>}
		</View>
	)
})

const styles = StyleSheet.create({
	list_item: {
		paddingHorizontal: 5,
		borderBottomColor: theme.bg,
		borderBottomWidth: 1,
	},
	reply_item: {
		paddingVertical: 11,
		paddingHorizontal: 15,
		flexDirection: "row",
	},
	reply_avatar: {
		width: 30,
		height: 30,
		borderRadius: 50,
		overflow: "hidden",
	},
	info_name_con: {
		flexDirection: "row",
		alignItems: "center",
		marginLeft: 8,
	},
	info_name: {
		fontSize: 14,
		color: theme.tit2,
		fontFamily: "PingFang SC",
		fontWeight: "500",
	},
	main_desc: {
		marginVertical: 13,
	},
	reply_text: {
		fontSize: 13,
		color: theme.text2,
		lineHeight: 20,
	},
	refuname: {
		fontFamily: "PingFang SC",
		fontWeight: "500",
		fontSize: 14,
	},
	main_time: {
		color: theme.placeholder2,
		fontSize: 12,
	},
	reply_up: {
		flexDirection: "row",
		alignItems: "center",
	},
	up_cnt: {
		fontSize: 12,
		marginLeft: 3,
		color: theme.placeholder2,
		transform: [{ translateY: 1 }]
	},
	list_sub_item: {
		backgroundColor: theme.bg,
		marginLeft: 50,
		marginRight: 15,
		marginBottom: 12,
		borderRadius: 8,
		overflow: "hidden",
	}
})

export default ReplyView;