import React from "react";

import { Image, View, Text, StyleSheet, Pressable, Dimensions, ScrollView } from "react-native";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";
import { Globalstyles } from "../../utils/globalmethod";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";
import AlertCtrl from "../controller/alertctrl";
import { ModalPortal } from "../modals";
import AlertInputPopover from "./alertinput-popover";
import ToastCtrl from "../controller/toastctrl";

const { width, height } = Dimensions.get("window");

const PerfumeListPopover = React.memo(({ data }: any) => {

	// 控件
	// 参数
	const { iids, cid, perfumeLists = [], src, key } = data;
	// 变量
	let perfumename = React.useRef<string>("");
	// 数据
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染数据

	const plus_nose = (item: any) => {
		http.post(ENV.collection + "?uid=" + us.user.uid, {
			method: "addperfume", cid: item.cid, iid: iids, token: us.user.token
		}).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				item.cnt = resp_data.cnt;
				events.publish("userGetusercollections");
				cache.saveItem("usercollections" + us.user.uid, perfumeLists, 600);
				setIsRender(val => !val);
				ToastCtrl.show({ message: "添加成功", duration: 1000, viewstyle: "short_toast", key: "add_success_toast" });
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
			} else if (resp_data.msg) {
				ToastCtrl.show({ message: resp_data.msg, duration: 1000, viewstyle: "medium_toast", key: "add_error_toast" });
			}
			setTimeout(() => { ModalPortal.dismiss(key); }, 500);
		})
	}

	const create_perfume = () => {
		ModalPortal.show((
			<AlertInputPopover data={{
				header: "新建香单",
				message: "",
				inputs: [{
					type: "text",
					value: perfumename.current,
					onChangeText: (value: any) => {
						perfumename.current = value;
					},
					placeholder: "请输入香单名称",
				}],
				buttons: [{
					text: "取消",
					handler: () => {
						ModalPortal.dismiss("giftcode_inputAlert");
						perfumename.current = "";
					}
				}, {
					text: "确认",
					handler: () => {
						if (perfumename.current == "") {
							ToastCtrl.show({ message: "没有输入香单名称", duration: 1000, viewstyle: "medium_toast", key: "perfumename_empty_toast" });
						} else {
							newcollection();
						}
					}
				}],
			}}
			/>
		), {
			key: "perfume_inputAlert",
			width: width,
			rounded: false,
			useNativeDriver: true,
			onTouchOutside: () => {
				ModalPortal.dismiss("perfume_inputAlert");
				perfumename.current = "";
			},
			onHardwareBackPress: () => {
				ModalPortal.dismiss("perfume_inputAlert");
				perfumename.current = "";
				return true;
			},
			animationDuration: 300,
			modalStyle: { backgroundColor: "transparent" },
		})
	}

	const newcollection = () => {
		http.post(ENV.collection + "?uid=" + us.user.uid, {
			method: "updatecollection", collection: { cname: perfumename.current }, token: us.user.token
		}).then((resp_data: any) => {
			ModalPortal.dismiss("perfume_inputAlert");
			if (resp_data.cid > 0) {
				resp_data.cnt = 0;
				perfumeLists.unshift(resp_data);
				cache.saveItem("usercollections" + us.user.uid, perfumeLists, 600);
				setIsRender(val => !val);
			}
		});
	}

	return (
		<View style={[styles.perfume_list_con, Globalstyles.list_content]}>
			<View style={styles.perfume_list_title}>
				{src == "perfume-list-detail" && <Text style={styles.list_tit}>{"已选择" + iids.length + "款添加到"}</Text>}
				{src == "item-detail" && <Text style={styles.list_tit}>{"加入香单"}</Text>}
				<Pressable style={styles.list_tit_btn} onPress={create_perfume}>
					<Icon name="plus3" size={13} color={theme.color} style={{ marginRight: 5 }} />
					<Text style={styles.btn_text}>{"新建香单"}</Text>
				</Pressable>
			</View>
			<ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
				{perfumeLists.length > 0 && perfumeLists.map((item: any, index: number) => {
					return (
						<Pressable key={item.cid} onPress={() => { plus_nose(item) }} style={styles.list_item}>
							<Image style={styles.item_image} source={{ uri: ENV.image + item.cpic + "!m" }} />
							<View style={styles.item_info}>
								<Text numberOfLines={1} style={styles.info_cname}>{item.cname}</Text>
								<Text style={styles.info_cnt}>{item.cnt + "款"}</Text>
							</View>
						</Pressable>
					)
				})}
			</ScrollView>
		</View>
	);
})

const styles = StyleSheet.create({
	perfume_list_con: {
		height: height * 0.61,
		backgroundColor: theme.toolbarbg,
	},
	perfume_list_title: {
		paddingVertical: 25,
		paddingHorizontal: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	list_tit: {
		fontSize: 17,
		color: theme.text2,
		fontWeight: "500",
		fontFamily: "PingFang SC",
	},
	list_tit_btn: {
		...Globalstyles.item_flex,
		paddingHorizontal: 12,
		paddingVertical: 7,
		borderColor: theme.border,
		borderWidth: 1,
		borderRadius: 15,
	},
	btn_text: {
		fontSize: 13,
		color: theme.color,
	},
	list_item: {
		...Globalstyles.item_flex,
		marginBottom: 16,
	},
	item_image: {
		width: 60,
		height: 60,
		borderRadius: 10,
	},
	item_info: {
		flex: 1,
		marginLeft: 14,
	},
	info_cname: {
		fontSize: 14,
		color: theme.text2,
		fontWeight: "500",
		fontFamily: "PingFang SC",
		marginBottom: 11,
	},
	info_cnt: {
		fontSize: 13,
		color: theme.comment,
	}
});

export default PerfumeListPopover;