import React from "react";

import { View, ScrollView, Text, StyleSheet, Pressable, Dimensions, TextInput } from "react-native";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../utils/globalmethod";

import Icon from "../../assets/iconfont";
import { ModalPortal } from "../modals";
import LinearGradient from "react-native-linear-gradient";
import ToastCtrl from "../controller/toastctrl";

const { width, height } = Dimensions.get("window");

function ReportPopover({ modalparams }: any): React.JSX.Element {

	// 控件
	const inputref = React.useRef<any>(null);
	// 参数
	const { modalkey, id, curpage, reportshequ, reportuser, reportpage, classname } = modalparams;
	// 变量
	let reportcon = React.useRef<string>("");
	// 数据
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false);
	const [replytext, setReplyText] = React.useState<string>("");

	React.useEffect(() => {
		if (classname != "UserDetailPage") {
			if (!reportuser) {
				reportcon.current = compile(reportshequ.desc_html != "" ? reportshequ.desc_html : reportshequ.title);
			} else {
				reportcon.current = compile(reportuser.desc);
			}
		}
		setIsRender(val => !val);
	}, [])

	const compile = (desc: string) => {
		if (!desc) return "";
		if (desc.length > 100) {
			return desc.replace(/(<\/?img.*?>)/g, "[图片]").substring(0, 100) + "......";
		}
		return desc.replace(/(<\/?img.*?>)/g, "[图片]");
	}

	const getreplytext = () => {
		let content = "", url = "", iid = reportshequ ? reportshequ.udiid : reportuser.udiid;
		if (classname == "DiscussReplyPage" || classname == "ItemDetailPage") {
			url = `https://www.nosetime.com/xiangshui/${iid}.html`;
		} else {
			url = `https://www.nosetime.com/member/topic.php?id=${id}&page=${Math.ceil(curpage / 2)}`;
		}
		if (classname == 'UserDetailPage') {
			content = `举报地址： https://www.nosetime.com/member/?id=${reportshequ.uid}
				举报用户ID：${reportshequ.uid}
				举报用户：${reportshequ.uname}
				举报理由：${replytext}`;
			return content;
		}
		if (!reportuser) {
			content = `举报地址： ${url}
				举报用户ID：${reportshequ.uid}
				举报用户：${reportshequ.uname}
				举报内容：<span class='text'>${reportcon.current}</span>
				举报理由：${replytext}`;
			return content;
		}
		if (!reportpage) {
			content = `举报地址： ${url}
				举报用户ID：${reportuser.uid}
				举报用户：${reportuser.uname}
				举报内容：<span class='text'>${reportcon.current}</span>
				举报理由：${replytext}`;
			return content;
		} else {
			content = `举报地址： ${url}
				举报用户ID：${reportuser.uid}
				举报用户：${reportuser.uname}
				举报内容：<span class='text'>${reportcon.current}</span>
				举报理由：${replytext}
				举报楼层ID：${reportpage.uname}
				举报楼层内容：<span class='text nored'>${compile(reportpage.desc)}</span>`;
			return content;
		}
	}

	const report = () => {
		if (replytext == "") {
			ToastCtrl.show({ message: "请填写举报理由", duration: 1000, viewstyle: "short_toast", key: "content_empty_toast" });
			return;
		}
		let content = getreplytext();
		if (!us.user.uid) return;
		http.post(ENV.sixin + "?method=send&uid=" + us.user.uid, { toid: "50002488", token: us.user.token, content }).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				ToastCtrl.show({ message: "举报成功", duration: 1000, viewstyle: "short_toast", key: "report_success_toast" });
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
			} else {
				ToastCtrl.show({ message: "举报失败", duration: 1000, viewstyle: "short_toast", key: "report_fail_toast" });
			}
			ModalPortal.dismiss(modalkey);
		});
	}

	return (
		<View style={styles.report_container}>
			<ScrollView contentContainerStyle={{ height }}>
				<Text style={styles.report_title}>{"举报信息"}</Text>
				{(reportshequ && reportshequ.uname) && <View style={[Globalstyles.item_flex, styles.report_item]}>
					<Text style={styles.report_item_tit}>{"举报用户："}</Text>
					<Text style={styles.report_item_text}>{reportshequ.uname}</Text>
				</View>}
				{(reportuser && reportuser.uname) && <View style={[Globalstyles.item_flex, styles.report_item]}>
					<Text style={styles.report_item_tit}>{"举报用户："}</Text>
					<Text style={styles.report_item_text}>{reportuser.uname}</Text>
				</View>}
				{reportcon.current && <View style={[Globalstyles.item_flex, styles.report_item]}>
					<Text style={styles.report_item_tit}>{"举报内容："}</Text>
					<Text style={styles.report_item_text}>{reportcon.current}</Text>
				</View>}
				<View style={[styles.report_item, { borderBottomWidth: 0 }]}>
					<Text style={styles.report_item_tit}>{"举报理由："}</Text>
					<TextInput ref={inputref}
						style={styles.footer_input}
						onChangeText={setReplyText}
						value={replytext}
						multiline={true}
						placeholder={"请填写举报理由"} />
				</View>
			</ScrollView>
			<Pressable style={{ width: "100%" }} onPress={report}>
				<LinearGradient
					colors={["#81B4EC", "#9BA6F5"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					locations={[0, 1]}
					style={Globalstyles.confirm_btn}>
					<Text style={Globalstyles.confirm_btn_text}>{"确定"}</Text>
				</LinearGradient>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	report_container: {
		height: height * 0.8,
		backgroundColor: theme.toolbarbg,
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15,
		overflow: "hidden",
	},
	report_title: {
		fontSize: 18,
		fontWeight: "600",
		fontFamily: "PingFang SC",
		color: theme.text2,
		marginTop: 10,
		textAlign: "center",
		lineHeight: 71,
	},
	report_item: {
		paddingVertical: 17,
		paddingHorizontal: 13,
		borderBottomColor: theme.bg,
		borderBottomWidth: 1,
		alignItems: "flex-start",
	},
	report_item_tit: {
		color: "#444",
		fontSize: 14,
	},
	report_item_text: {
		flexShrink: 1,
		color: theme.placeholder,
		fontSize: 14,
	},
	footer_input: {
		marginTop: 8,
		width: "100%",
		height: 300,
		borderColor: theme.border,
		borderWidth: 1,
		borderRadius: 5,
		color: "#444",
		fontSize: 14,
		textAlignVertical: "top",
		padding: 5,
	},
});

export default ReportPopover;