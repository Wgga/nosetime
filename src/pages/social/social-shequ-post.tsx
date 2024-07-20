import React from "react";

import { View, Text, StyleSheet, Pressable, ScrollView, TextInput, Image, ActivityIndicator } from "react-native";

import LinearGradient from "react-native-linear-gradient";
import { ShadowedView } from "react-native-fast-shadow";
import { Brightness } from "react-native-color-matrix-image-filters";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ActionSheetCtrl from "../../components/controller/actionsheetctrl";
import HeaderView from "../../components/headerview";
import ToastCtrl from "../../components/controller/toastctrl";
import RulesView from "../../components/rulesview";

import upService from "../../services/upload-photo-service/upload-photo-service";
import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../utils/globalmethod";

import Icon from "../../assets/iconfont";

function SocialShequPost({ navigation, route }: any): React.JSX.Element {

	// 控件
	const insets = useSafeAreaInsets();
	const classname = "SocialShequPostPage";
	// 参数
	const forum_name = ["", "香水闲谈", "荐香求助", "有关气味", "小众沙龙"];
	const forum_tag = ["", "闲谈", "求助", "气味", "沙龙"];
	// 变量
	let title = React.useRef<string>("");
	let id = React.useRef<number>(0);
	let edit = React.useRef<number>(0);
	// 数据
	let rules = React.useRef<any>({});
	let info = React.useRef<any>({ title: "", content: "", fid: 1 });
	let mid = React.useRef<any[]>([]);
	let aImages = React.useRef<any[]>([]);
	let maximgid = React.useRef<number>(1);
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染
	const [showmenu, setShowMenu] = React.useState<boolean>(false); // 是否显示菜单

	React.useEffect(() => {
		id.current = route.params.id;
		edit.current = route.params.edit ? route.params.edit : 0;
		info.current.title = route.params.title ? route.params.title : "";
		info.current.content = route.params.content ? route.params.content : "";
		info.current.fid = route.params.fid ? route.params.fid : 1;
		title.current = route.params.edit ? "编辑话题" : "发布新话题";

		init();

		// 接收图片
		events.subscribe("photo_upload" + classname + us.user.uid, (dataurl: string) => {
			uploadpic_by_dataurl(dataurl);
		});

		return () => {
			events.unsubscribe("photo_upload" + classname + us.user.uid);
		}
	}, [])

	const init = () => {
		if (!us.user.uid) {
			events.publish("social_show_filter", true);
			return navigation.navigate("Page", { screen: "Login", params: { src: "App帖子发布页" } });
		}

		cache.getItem(classname + "publish" + id.current).then((cacheobj) => {
			if (cacheobj && cacheobj.replytext != "")
				info.current = cacheobj;
		}).catch(() => { });

		if (info.current.content != undefined) {
			var arr = info.current.content.match(/\[img\]([^\[]*)\[\/img\]/g);
			var content = info.current.content;
			for (var i in arr) {
				var url = arr[i].replace(/\[[\/]*img\]/g, "");
				var img = ENV.image + url + "!m";
				// 20240514 shibo:修复重新编辑帖子后，图片无法显示的问题
				aImages.current.push({ uri: img, url, id: maximgid.current, brightness: 1 });
				content = content.replace("[img]" + url + "[/img]", "[图" + maximgid.current + "]");
				maximgid.current++;
			}
			info.current.content = content;
		}

		cache.getItem(classname + "rules").then((cacheobj) => {
			if (cacheobj) {
				rules.current = cacheobj;
				setIsRender(val => !val);
			}
		}).catch(() => {
			http.get(ENV.shequ + "?method=rules").then((resp_data: any) => {
				cache.saveItem(classname + "rules", resp_data, 3600);
				rules.current = resp_data;
				setIsRender(val => !val);
			})
		})
	}

	const publish = () => {
		if (!info.current.title)
			info.current.title = "";
		else
			info.current.title = info.current.title.trim();
		if (!info.current.content)
			info.current.content = "";
		else
			info.current.content = info.current.content.trim();
		var content = "";

		var str = info.current.content;
		content = info.current.content;
		var patt = new RegExp("\[图[0-9]+\]", "g");
		var result;
		while ((result = patt.exec(str)) != null) {
			var imgid = parseInt(result[0].substring(2));
			content = content.replace("[图" + imgid + "]", "[img]" + aImages.current[imgid - 1].url + "[/img]");
		}

		if (info.current.title == "") {
			ToastCtrl.show({ message: "请填写话题名称", duration: 2000, viewstyle: "medium_toast", key: "social_title_toast" });
			return;
		}
		if (info.current.title.length > 50) {
			ToastCtrl.show({ message: "话题名称应少于50个字符", duration: 2000, viewstyle: "long_toast", key: "social_title2_toast" });
			return;
		}

		cache.saveItem(classname + "publish" + id.current, info.current, 24 * 3600);

		if (!us.user.uid) {
			//没有登录，转到登录界面，登录后直接进行发布并转到打分页面(如果是香评)，再转到发布到微博页面？
			return navigation.navigate("Page", { screen: "Login", params: { src: "App帖子发布页" } });
		}

		http.post(ENV.shequ + "?method=post&edit=" + edit.current + "&fid=" + info.current.fid + "&uid=" + us.user.uid + "&id=" + id.current, {
			token: us.user.token, content: content, title: info.current.title
		}).then((resp_data: any) => {
			if (resp_data.msg.indexOf("OK") == 0) {
				//发布成功
				if (edit.current == 1) {
					events.publish("update_topic", { content: content, title: info.current.title });
				}
				cache.removeItem(classname + "publish" + id.current);
				ToastCtrl.show({ message: "发布成功", duration: 2000, viewstyle: "short_toast", key: "publish_success_toast" });
				navigation.goBack();
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				//登录失效，转到登录界面，登录后直接进行发布并转到打分页面
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App帖子发布页" } });
			} else {
				ToastCtrl.show({ message: "发布结果：" + resp_data.msg, duration: 2000, viewstyle: "medium_toast", key: "publish_err_toast" });
			}
		});
	}

	// 选择图片方式
	const openfiledlg = () => {
		ActionSheetCtrl.show({
			key: "filedlg_action_sheet",
			textStyle: { color: theme.tit2 },
			buttons: [{
				text: "拍照",
				handler: () => {
					ActionSheetCtrl.close("filedlg_action_sheet");
					setTimeout(() => { buttonClicked(0) }, 300);
				}
			}, {
				text: "从相册选择",
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

	// 选择图片
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
		upService.buttonClicked(params, { marginTop: insets.top });
	}

	// 请求上传图片接口
	const uploadpic_by_dataurl = (dataurl: string) => {
		let idx = aImages.current.length;
		aImages.current.push({ id: idx + 1, uri: dataurl, percent: "", brightness: 1 });
		http.post(ENV.shequ + "?uid=" + us.user.uid, {
			method: "savepic_dataurl", token: us.user.token, Filedata: dataurl
		}).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				mid.current.push(resp_data.id);
				aImages.current[idx].url = resp_data.url;
				insertimg(idx + 1);
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App帖子发布页" } });
			}
		});
	}

	const insertimg = (id: number) => {
		var start = 0;
		var str = info.current.content;
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
		info.current.content = str.substring(0, start) + insertstr + str.substring(start);
		setIsRender(val => !val);
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: title.current,
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}}>
				<Pressable style={[Globalstyles.title_text_con, { alignItems: "center" }]} onPress={publish}>
					<Icon name="send3" size={22} color={theme.comment} />
				</Pressable>
			</HeaderView>
			<ScrollView contentContainerStyle={styles.social_con} showsVerticalScrollIndicator={false}>
				<View style={styles.social_item}>
					<TextInput style={styles.title_input}
						multiline={true}
						value={info.current.title}
						onChangeText={(value: string) => {
							info.current.title = value;
							setIsRender(val => !val);
						}}
						placeholder={"起个标题吧..."}
						placeholderTextColor={theme.placeholder}
					/>
					<Pressable onPress={()=>{ setShowMenu(val => !val) }} style={styles.social_tag}>
						<LinearGradient
							colors={["#81B4EC", "#9BA6F5"]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							locations={[0, 1]}
							style={styles.btn_bg}
						>
							<Text style={styles.btnbg_text}>{"#"}</Text>
						</LinearGradient>
						<Text style={styles.btn_text}>{forum_tag[info.current.fid]}</Text>
					</Pressable>
					{showmenu && <ShadowedView style={styles.social_menu}>
						{forum_tag.map((item: string, index: number) => {
							return (
								<Pressable onPress={() => {
									if (item) {
										info.current.fid = index;
										setShowMenu(false);
									}
								}} key={index}>
									{item && <Text style={[styles.menu_text, forum_tag[info.current.fid] == item && { color: "#6874CB" }]}>{item}</Text>}
								</Pressable>
							)
						})}
					</ShadowedView>}
				</View>
				<View style={styles.social_textarea}>
					<TextInput style={styles.textarea}
						value={info.current.content}
						onChangeText={(value: string) => {
							info.current.content = value;
							setIsRender(val => !val);
						}}
						placeholder={"在这里输入正文..."}
						placeholderTextColor={theme.placeholder}
					/>
				</View>
				<View style={styles.img_item_con}>
					{(aImages.current && aImages.current.length > 0) && aImages.current.map((item: any, index: number) => {
						return (
							<View key={item.id} style={styles.img_item}>
								<Brightness style={{ width: "100%", height: "100%" }} amount={item.brightness}>
									<Image style={{ width: "100%", height: "100%" }}
										source={{ uri: item.uri }}
									/>
								</Brightness>
								{item.brightness != 1 && <ActivityIndicator size="small" color="#fff" style={styles.img_spinner} animating={item.brightness != 1} />}
							</View>
						)
					})}
					<Pressable onPress={openfiledlg} style={styles.img_item_icon}>
						<Image style={{ width: "100%", height: "100%" }}
							source={require("../../assets/images/plus.png")}
						/>
					</Pressable>
				</View>
			</ScrollView>
			<RulesView rules={rules.current} tip={"社区发言规则"} />
		</View>
	);
}

const styles = StyleSheet.create({
	social_con: {
		backgroundColor: theme.toolbarbg,
		paddingBottom: 50,
		paddingHorizontal: 20
	},
	social_item: {
		flexDirection: "row",
		alignItems: "center",
		borderBottomColor: theme.border,
		borderBottomWidth: 1,
	},
	title_input: {
		flex: 1,
		height: 49,
		lineHeight: 49,
		paddingHorizontal: 15,
		fontSize: 16,
		color: "#000",
		verticalAlign: "middle",
	},
	social_tag: {
		flexDirection: "row",
		alignItems: "center",
	},
	btn_bg: {
		width: 14,
		height: 14,
		borderRadius: 50,
		alignItems: "center",
		justifyContent: "center",
		marginRight: 3,
	},
	btnbg_text: {
		fontSize: 15,
		height: "100%",
		lineHeight: 17,
		color: theme.toolbarbg,
		transform: [{ scale: 0.8 }]
	},
	btn_text: {
		fontSize: 15,
		color: "#6874CB"
	},
	social_menu: {
		position: "absolute",
		top: 51,
		right: 0,
		backgroundColor: theme.toolbarbg,
		borderRadius: 10,
		shadowColor: "#000",
		shadowOpacity: 0.2,
		shadowRadius: 10,
		shadowOffset: {
			width: 0,
			height: 0,
		},
		paddingBottom: 16.
	},
	menu_text: {
		paddingHorizontal: 37,
		paddingTop: 16,
		fontSize: 14.7,
		color: theme.tit2,
	},
	social_textarea: {
		width: "100%",
		height: 455,
		paddingVertical: 16,
		paddingHorizontal: 13,
		borderBottomWidth: 1,
		borderBottomColor: theme.bg,
	},
	textarea: {
		width: "100%",
		height: "100%",
		textAlignVertical: "top",
		fontSize: 15,
		color: theme.text1,
		padding: 0,
		margin: 0,
	},
	img_item_con: {
		flexDirection: "row",
		alignItems: "center",
		flexWrap: "wrap",
		marginTop: 10,
		marginLeft: 10,
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
		width: 64,
		height: 64,
		marginBottom: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	delete: {
		...StyleSheet.absoluteFillObject,
		zIndex: 1,
		backgroundColor: "rgba(0,0,0,0.2)",
		alignItems: "center",
		justifyContent: "center",
	},
});

export default SocialShequPost;