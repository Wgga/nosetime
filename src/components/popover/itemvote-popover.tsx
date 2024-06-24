import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image } from "react-native";

import LinearGradient from "react-native-linear-gradient";

import { ModalPortal } from "../modals";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalstyles";

import Icon from "../../assets/iconfont";
import ToastCtrl from "../toastctrl";

const { width, height } = Dimensions.get("window");

function ItemVotePopover({ data }: any): React.JSX.Element {

	// 控件
	// 变量
	// 数据
	// 参数
	// 状态
	const [share, setShare] = React.useState(false);

	const done = () => {
		cache.saveItem("share", true, 3650 * 86400);
		if (!share) {
			ModalPortal.dismiss("vote_popover");
		}
	}

	return (
		<View style={styles.vote_con}>
			<Text style={styles.vote_title}>{"评论成功"}</Text>
			<Image style={styles.vote_avatar}
				source={{
					uri: ENV.avatar + data.user.uid + ".jpg?" + data.user.uface
				}}
			/>
			{data.info.type == "smelt" && <Text style={styles.vote_type}>{"闻过"}</Text>}
			{data.info.type == "have" && <Text style={styles.vote_type}>{"拥有"}</Text>}
			{data.info.type == "wanted" && <Text style={styles.vote_type}>{"想要"}</Text>}
			<Text style={[styles.vote_name, { fontSize: 15 }]}>{data.cnname}</Text>
			<Text style={[styles.vote_name, { fontSize: 13 }]}>{data.enname}</Text>
			<Text numberOfLines={4} style={styles.vote_reply}>{data.info.replytext}</Text>
			<View style={styles.towechat}>
				{/* <Pressable onPress={() => { setShare(val => !val) }}>
					{share && <Icon name="radio" size={16} color={theme.primary} />}
					{!share && <Icon name="radio-checked" size={16} color={theme.primary} />}
				</Pressable>
				<Text style={styles.share_text}>{"去朋友圈炫耀一下"}</Text> */}
			</View>
			<Pressable style={{ width: "100%" }} onPress={done}>
				< LinearGradient
					colors={["#81B4EC", "#9BA6F5"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					locations={[0, 1]}
					style={styles.vote_btn}
				>
					<Text style={styles.vote_btn_text}>{"完成"}</Text>
				</LinearGradient>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	vote_con: {
		backgroundColor: theme.toolbarbg,
		marginHorizontal: 50,
		alignItems: "center",
		borderRadius: 15,
		overflow: "hidden",
	},
	vote_title: {
		marginTop: 20,
		marginBottom: 10,
		fontSize: 16,
		color: "#000",
	},
	vote_avatar: {
		width: 54,
		height: 54,
		borderRadius: 30,
		overflow: "hidden",
	},
	vote_type: {
		marginTop: 8,
		fontSize: 14,
		color: theme.comment,
	},
	vote_name: {
		paddingHorizontal: 20,
		marginTop: 8,
		color: theme.tit2,
	},
	vote_reply: {
		marginVertical: 15,
		paddingHorizontal: 25,
	},
	vote_icon: {
		width: 55,
		height: 94,
	},
	vote_cname: {
		fontSize: 14,
		color: theme.text1,
		marginTop: 8,
		paddingHorizontal: 6,
	},
	towechat: {
		flexDirection: "row",
		alignItems: "center",
		marginTop: 50,
		marginBottom: 30,
	},
	share_text: {
		fontSize: 15,
		color: theme.text1,
		marginLeft: 5,
	},
	vote_btn: {
		width: "100%",
		height: 46,
		alignItems: "center",
		justifyContent: "center",
	},
	vote_btn_text: {
		fontSize: 16,
		color: theme.toolbarbg,
	}
});

export default ItemVotePopover;