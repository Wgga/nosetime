import React from "react";
import { Platform, View, Text, StyleSheet, Pressable, ScrollView, TextInput, Image, ActivityIndicator } from "react-native";

import { Brightness } from "react-native-color-matrix-image-filters";

import HeaderView from "../../components/headerview";
import ActionSheetCtrl from "../../components/actionsheetctrl";
import LinearButton from "../../components/linearbutton";
import ToastCtrl from "../../components/toastctrl";

import upService from "../../services/upload-photo-service/upload-photo-service";
import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";

function UserFeedback({ navigation, route }: any): React.JSX.Element {
	// 控件
	const classname = "FeedbackPage";
	// 参数
	const { title } = route.params;
	// 变量
	let aImages = React.useRef<any[]>([]); // 上传的图片列表
	let placeholder = React.useRef<string>("请留下您的宝贵意见或建议，商务合作请发邮件至contact@nosetime.com"); // 占位文字
	let text = React.useRef<string>(""); // 文本内容
	let quesdata = React.useRef<any>({}); // 题目数据
	// 数据
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		if (title == "院长办公室") {
			placeholder.current = "提交建议或提交新的题目...";
		} else if (title == "纠错反馈") {
			placeholder.current = "请告诉我们这道题的问题所在，我们将努力改进";
			quesdata.current = route.params.quesdata;
		} else {
			placeholder.current = "请留下您的宝贵意见或建议，商务合作请发邮件至contact@nosetime.com";
		}

		events.subscribe("photo_upload" + classname + us.user.uid, (dataurl: string) => {
			uploadpic_by_dataurl(dataurl);
		});

		return () => {
			events.unsubscribe("photo_upload" + classname + us.user.uid);
		}
	}, [])

	const openfiledlg = () => {
		ActionSheetCtrl.show({
			key: "filedlg_action_sheet",
			buttons: [{
				text: "拍照",
				style: { color: theme.tit2 },
				handler: () => {
					ActionSheetCtrl.close("filedlg_action_sheet");
					setTimeout(() => { buttonClicked(0) }, 300);
				}
			}, {
				text: "从相册选择",
				style: { color: theme.tit2 },
				handler: () => {
					ActionSheetCtrl.close("filedlg_action_sheet");
					setTimeout(() => { buttonClicked(1) }, 300);
				}
			}, {
				text: "取消",
				style: { color: theme.tit },
				handler: () => {
					ActionSheetCtrl.close("filedlg_action_sheet");
				}
			}],
		})
	}

	const buttonClicked = (index: number) => {
		let params = {
			index: index,
			quality: 0.9,
			isCrop: false,
			includeBase64: true,
			src: "photoupload",
			classname,
			maxWidth: 1024,
			maxHeight: 1024,
		}
		upService.buttonClicked(params);
	}

	const uploadpic_by_dataurl = (dataurl: string) => {
		let idx = aImages.current.length;
		aImages.current.push({ id: idx + 1, uri: dataurl, percent: "", brightness: 1 });
		http.post(ENV.feedback + "?uid=" + us.user.uid, { method: "savepic_dataurl", token: us.user.token, Filedata: dataurl }).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				aImages.current[idx].url = resp_data.url;
				insertimg(idx + 1);
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App意见反馈" } });
			}
		});
	}

	const insertimg = (id: number) => {
		var start = 0;
		var str = text.current;
		if (str == null) str = "";
		var patt = new RegExp("\[图[0-9]+\]", "g");
		var result;
		while ((result = patt.exec(str)) != null) {
			var from = result.index;
			var to = from + result[0].length;
			if (start > from && start < to) {
				start = to;
				break;
			}
		}
		//插入文本
		var insertstr = "[图" + id + "]";
		text.current = str.substring(0, start) + insertstr + str.substring(start);
		setIsRender(val => !val);
	}

	const publish = () => {
		if (!text.current) {
			text.current = "";
		} else {
			text.current = text.current.trim();
		}

		var replytext = "";
		var str = text.current;
		replytext = text.current;
		var patt = new RegExp("\[图[0-9]+\]", "g");
		var result;
		while ((result = patt.exec(str)) != null) {
			var imgid = parseInt(result[0].substring(2));
			replytext = replytext.replace("[图" + imgid + "]", "[img]" + aImages.current[imgid - 1].url + "[/img]");
		}

		const AppVersion = ENV.AppMainVersion + "." + ENV.AppMiniVersion + "." + ENV.AppBuildVersion;
		let p = "APP ";
		if (Platform.OS == "android") p = "ANDROID ";
		else if (Platform.OS == "ios") p = "IOS ";
		cache.saveItem(classname + "publish", replytext, 24 * 3600);

		let params = {};
		if (title == "院长办公室") {
			params = {
				method: "postv2",
				content: replytext,
				src: "school_deanfb",
				uname: us.user.uname
			};
		} else if (title == "纠错反馈") {
			params = {
				method: "postv2",
				content: replytext,
				src: "school_questionfb",
				uname: us.user.uname,
				questype: quesdata.current.questype,
				questit: quesdata.current.questit
			};
		} else {
			params = {
				method: "postv2",
				content: replytext,
				url: p + AppVersion,
				src: "feedback",
				uname: us.user.uname
			};
		}

		if (!replytext) {
			ToastCtrl.show({ message: "内容不能为空", duration: 2000, viewstyle: "medium_toast", key: "replytext_toast" });
			return
		}
		http.post(ENV.feedback + "?uid=" + us.user.uid, params).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				cache.removeItem(classname + "publish");
				ToastCtrl.show({ message: "您的意见已提交，谢谢", duration: 2000, viewstyle: "medium_toast", key: "publish_success_toast" });
				navigation.goBack();
			} else {
				ToastCtrl.show({ message: "出错了：" + resp_data.msg, duration: 2000, viewstyle: "medium_toast", key: "publish_err_toast" });
			}
		});
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title,
				isShowSearch: false,
			}} method={{
				back: () => { navigation.goBack() },
			}} />
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.feedback_con}>
				<View style={styles.feedback_textarea_con}>
					<TextInput style={styles.textarea}
						multiline={true}
						value={text.current}
						onChangeText={(value: string) => {
							text.current = value;
							setIsRender(val => !val);
						}}
						placeholderTextColor={theme.placeholder}
						placeholder={placeholder.current}
					/>
				</View>
				<View style={styles.feedback_img_list}>
					<Text style={styles.img_tit}>{"添加相关截图"}</Text>
					<View style={styles.img_item_con}>
						{(aImages.current && aImages.current.length > 0) && aImages.current.map((item: any, index: number) => {
							return (
								<View key={item.id} style={styles.img_item}>
									<Brightness style={{ width: "100%", height: "100%" }} amount={item.brightness}>
										<Image style={{ width: "100%", height: "100%" }}
											source={{ uri: item.uri }}
										/>
									</Brightness>
									<ActivityIndicator size="small" color="#fff" style={styles.img_spinner} animating={item.brightness != 1} />
								</View>

							)
						})}
						<Pressable onPress={openfiledlg} style={styles.img_item_icon}>
							<Icon name="photo" size={25} color={theme.border} />
						</Pressable>
					</View>
				</View>
			</ScrollView>
			<LinearButton containerStyle={styles.footer_btn} text="提交" onPress={publish} />
		</View>
	);
}
const styles = StyleSheet.create({
	feedback_con: {
		paddingTop: 26,
		paddingHorizontal: 27,
		paddingBottom: 50,
	},
	feedback_textarea_con: {
		backgroundColor: theme.bg,
		borderRadius: 6,
		height: 180,
		padding: 10,
	},
	textarea: {
		width: "100%",
		height: "100%",
		textAlignVertical: "top",
		fontSize: 14,
		color: theme.tit2,
		padding: 0,
		margin: 0,
	},
	feedback_img_list: {
		marginTop: 26,
	},
	img_tit: {
		color: theme.tit2,
		fontFamily: "PingFang SC",
		fontWeight: "500",
		fontSize: 16,
		marginBottom: 23,
	},
	img_item_con: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
	},
	img_item: {
		width: 60,
		height: 60,
		marginBottom: 20,
		marginRight: 10,
		alignItems: "center",
		justifyContent: "center",
	},
	img_spinner: {
		position: "absolute",
	},
	img_item_icon: {
		width: 60,
		height: 60,
		borderWidth: 1,
		borderColor: theme.border,
		borderStyle: "dashed",
		marginBottom: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	footer_btn: {
		marginHorizontal: 20,
		marginVertical: 20,
	}
});
export default UserFeedback;