import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, TextInput, Image, ActivityIndicator } from "react-native";

import Stars from "react-native-stars";
import Slider from "@react-native-community/slider";
import { Brightness } from "react-native-color-matrix-image-filters";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import ActionSheetCtrl from "../../components/controller/actionsheetctrl";
import AlertCtrl from "../../components/controller/alertctrl";
import ToastCtrl from "../../components/controller/toastctrl";
import { ModalPortal } from "../../components/modals";
import ItemVotePopover from "../../components/popover/itemvote-popover";
import HeaderView from "../../components/headerview";
import RulesView from "../../components/rulesview";

import us from "../../services/user-service/user-service";
import upService from "../../services/upload-photo-service/upload-photo-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";
import StarUnCheck from "../../assets/svg/star/search/star_uncheck.svg";
import StarChecked from "../../assets/svg/star/search/star_checked.svg";

const { width, height } = Dimensions.get("window");

function ItemVote({ navigation, route }: any): React.JSX.Element {

	// 控件
	const classname = "ItemVotePage";
	const insets = useSafeAreaInsets();
	// 参数
	const { type, optionaltype, id, name, enname, src } = route.params;
	const scorestrarr: any = { "1": "太差了", "2": "不太好", "3": "一般般", "4": "还不错", "5": "棒极了" };
	const timevotestrarr: any = { "1": "非常短", "2": "较短", "3": "中等", "4": "较长", "5": "非常持久" };
	// 变量
	let info = React.useRef<any>({ type: "", score: 0, timevote: 0, replytext: "", udpic: "", udpichtml: "" });
	let title = React.useRef<string>("");
	let type1 = React.useRef<string>("");
	let type2 = React.useRef<string>("");
	let type3 = React.useRef<string>("");
	let holder = React.useRef<string>("");
	// 数据
	let mid = React.useRef<any[]>([]);
	let rmmid = React.useRef<any[]>([]);
	let aImages = React.useRef<any[]>([]);
	let rules = React.useRef<any>({});
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		init();
		title.current = name ? name : enname;
		type1.current = type;
		type3.current = optionaltype;

		// 接收图片
		events.subscribe("photo_upload" + classname + us.user.uid, (dataurl: string) => {
			uploadpic_by_dataurl(dataurl);
		});

		return () => {
			events.unsubscribe("photo_upload" + classname + us.user.uid);
		}
	}, [])

	// 选择图片方式
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
		http.post(ENV.reply + "?type=item&id=" + id + "&uid=" + us.user.uid, {
			method: "savepic_dataurl", token: us.user.token, Filedata: dataurl
		}).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				mid.current.push(resp_data.id);
				setIsRender(val => !val);
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App香评发布页" } });
			}
		});
	}

	// 删除图片
	const removeImage = (idx: number, item: any) => {
		AlertCtrl.show({
			header: "确定要删除吗？",
			key: "del_img_alert",
			message: "",
			buttons: [{
				text: "取消",
				handler: () => {
					AlertCtrl.close("del_img_alert");
				}
			}, {
				text: "确定",
				handler: () => {
					AlertCtrl.close("del_img_alert");
					rmmid.current = rmmid.current.concat(
						mid.current.splice(idx, 1)
					);
					aImages.current.splice(idx, 1);
					setIsRender(val => !val);
				}
			}],
		})
	}

	// 获取香评数据
	const getWantedItem = () => {
		return new Promise((resolve, reject) => {
			cache.getItem(classname + "publish" + id).then((cacheobj) => {
				if (cacheobj) {
					setinfodata(cacheobj);
					resolve(1);
				}
			}).catch(() => {
				http.post(ENV.reply + "?method=wanteditem&type=item&id=" + id + "&uid=" + us.user.uid, { token: us.user.token }).then((resp_data: any) => {
					if (resp_data.msg == "TOKEN_EXPIRE" || resp_data.msg == "TOKEN_ERR") {
						us.delUser();
						resolve(0);
					} else {
						cache.saveItem(classname + "publish" + id, resp_data, 3600);
						setinfodata(resp_data);
						resolve(1);
					}
				});
			});
		})
	}

	// 获取香评规则
	const getRules = () => {
		return new Promise((resolve, reject) => {
			cache.getItem(classname + "rules" + id).then((cacheobj) => {
				if (cacheobj) {
					rules.current = cacheobj;
					resolve(1);
				}
			}).catch(() => {
				http.get(ENV.item + "?method=rules&id=" + id).then((resp_data: any) => {
					cache.saveItem(classname + "rules" + id, resp_data, 3600);
					rules.current = resp_data;
					resolve(1);
				})
			})
		})
	};

	// 设置数据
	const setinfodata = (data: any) => {
		Object.assign(info.current, data);
		if (data.type == 1) type2.current = "wanted";
		else if (data.type == 2) type2.current = "have";
		else if (data.type == 3) type2.current = "smelt";

		if (type1.current != undefined && type1.current != "") { if (info.current.type != type1.current) info.current.type = type1.current; }
		else if (type2.current != undefined && type2.current != "") { if (info.current.type != type2.current) info.current.type = type2.current; }
		else if (type3.current != undefined && type3.current != "") { if (info.current.type != type3.current) info.current.type = type3.current; }

		info.current.timevote = data.timevote ? Math.floor((parseInt(data.timevote) + 1) / 2) : 0;
		if (data.udtype == 10 || data.udtype == 6) {
			info.current.replytext = data.rmcontent;
		} else if (data.udtype == 1 || data.udtype == 5) {
			info.current.replytext = data.content;
		}

		if (info.current.udpic && info.current.udpichtml) {
			mid.current = info.current.udpic.split(",");
			var arr = info.current.udpichtml.split('"');
			aImages.current = [];
			for (var i in arr) {
				if (arr[i].indexOf("img.xssdcdn.com") > 0 || arr[i].indexOf("imgsrc.xssdcdn.com") > 0) {
					aImages.current.push({ uri: arr[i], percent: "", brightness: 1 });
				}
			}
		}

		selectType();
	}

	// 切换类型
	const selectType = (type: string = "") => {
		if (type) info.current.type = type;
		if (info.current.type == "wanted") holder.current = "快快告诉我，你在想什么";
		else holder.current = "分享你的心声，从此不再孤独...";
		setIsRender(val => !val);
	}

	// 初始化
	const init = () => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App发布香评页" } });
		}
		Promise.all([getWantedItem(), getRules()]).then((data: any) => {
			if (data.includes(0)) {
				return navigation.navigate("Page", { screen: "Login", params: { src: "App发布香评页" } });
			}
			setIsRender(val => !val);
		})
	}

	// 显示香评结果弹窗
	const showvotepopover = (data: any) => {
		ModalPortal.show((
			<ItemVotePopover data={data} />
		), {
			key: "vote_popover",
			width: width,
			rounded: false,
			useNativeDriver: true,
			onTouchOutside: () => {
				ModalPortal.dismiss("vote_popover");
			},
			onDismiss: () => {
				if (data.jifen > 0) {
					ToastCtrl.show({ message: "发布成功，积分 +" + data.jifen, duration: 2000, viewstyle: "medium_toast", key: "publish_success_toast" });
				} else {
					ToastCtrl.show({ message: "发布成功", duration: 2000, viewstyle: "short_toast", key: "publish_success_toast" });
				}
			},
			onHardwareBackPress: () => {
				ModalPortal.dismiss("vote_popover");
				return true;
			},
			animationDuration: 300,
			modalStyle: { backgroundColor: "transparent", justifyContent: "center" },
		})
	}

	// 发布香评
	const publish = () => {
		var replytext = "";
		if (info.current.replytext) {
			replytext = info.current.replytext.trim();
		}
		cache.saveItem(classname + "publish" + id, info.current, 3600);

		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App发布香评页" } });
		}

		var refid = "";
		http.post(ENV.reply + "?method=post&type=item&id=" + id + "&uid=" + us.user.uid + "&refid=" + refid, {
			token: us.user.token,
			content: replytext,
			type: info.current.type,
			score: info.current.score,
			timevote: info.current.timevote * 2,
			mid: mid.current,
			rmmid: rmmid.current,
		}).then((resp_data: any) => {
			if (resp_data.msg.indexOf('OK') == 0) {
				events.publish("user_del_note");

				cache.removeItem(classname + "publish" + id);

				showvotepopover({
					info: info.current,
					user: us.user,
					cnname: name,
					enname: enname,
					id: id,
					jifen: resp_data.jifen
				})

				us.user.wantedcnt = resp_data.wantedcnt;
				us.saveUser(us.user);

				navigation.goBack();
				events.publish("exit_to_itemdetail", info.current.type)
			} else if (resp_data.msg == 'TOKEN_ERR' || resp_data.msg == 'TOKEN_EXPIRE') {
				//登录失效，转到登录界面，登录后直接进行发布并转到打分页面
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App发布香评页" } });
			} else {
				ToastCtrl.show({ message: "发布结果：" + resp_data.msg, duration: 2000, viewstyle: "medium_toast", key: "publish_err_toast" });
			}
		})
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
			<ScrollView contentContainerStyle={styles.vote_con} showsVerticalScrollIndicator={false}>
				<View style={styles.vote_title_con}>
					<Pressable onPress={() => { selectType("wanted") }} style={styles.title}>
						<Text style={[styles.title_text, info.current.type == "wanted" && styles.active_text]}>{"想要"}</Text>
						{info.current.type == "wanted" && <View style={styles.active_line}></View>}
					</Pressable>
					<Pressable onPress={() => { selectType("smelt") }} style={styles.title}>
						<Text style={[styles.title_text, info.current.type == "smelt" && styles.active_text]}>{"闻过"}</Text>
						{info.current.type == "smelt" && <View style={styles.active_line}></View>}
					</Pressable>
					<Pressable onPress={() => { selectType("have") }} style={styles.title}>
						<Text style={[styles.title_text, info.current.type == "have" && styles.active_text]}>{"拥有"}</Text>
						{info.current.type == "have" && <View style={styles.active_line}></View>}
					</Pressable>
				</View>
				{(info.current.type == "have" || info.current.type == "smelt") && <>
					<View style={styles.vote_item}>
						<Text style={styles.vote_text}>{"我的评价："}</Text>
						{info.current.score != 0 && <Text style={styles.vote_text}>{scorestrarr[info.current.score]}</Text>}
						{info.current.score == 0 && <Text style={styles.vote_text}>{"未点评"}</Text>}
					</View>
					<View style={styles.star_con}>
						<Stars default={parseInt(info.current.score)}
							count={5}
							starSize={50}
							spacing={20}
							update={(starval: any) => {
								info.current.score = starval;
								setIsRender(val => !val);
							}}
							fullStar={<StarChecked width={25} height={25} />}
							emptyStar={<StarUnCheck width={25} height={25} />}
						/>
					</View>
					<View style={[styles.vote_item, { marginTop: 29 }]}>
						<Text style={styles.vote_text}>{"留香时间："}</Text>
						{info.current.timevote != 0 && <Text style={styles.vote_text}>{timevotestrarr[info.current.timevote]}</Text>}
						{info.current.timevote == 0 && <Text style={styles.vote_text}>{"未点评"}</Text>}
					</View>
					<View style={styles.vote_range_con}>
						<Icon name="leaf-outline" size={25} color="#AEAEAE" style={{ marginRight: 5 }} />
						<Slider style={{ flex: 1 }}
							step={1}
							minimumValue={1}
							maximumValue={5}
							lowerLimit={1}
							upperLimit={5}
							onValueChange={(timeval) => {
								info.current.timevote = timeval;
								setIsRender(val => !val);
							}}
							value={info.current.timevote}
							minimumTrackTintColor="#E4E4E4"
						/>
						<Icon name="leaf" size={25} color="#AEAEAE" />
						<Icon name="leaf" size={25} color="#AEAEAE" style={{ transform: [{ translateX: -8 }] }} />
					</View>
				</>}
				<View style={styles.vote_textarea}>
					<TextInput style={styles.textarea}
						multiline={true}
						value={info.current.replytext}
						onChangeText={(value: string) => {
							info.current.replytext = value;
							setIsRender(val => !val);
						}}
						placeholderTextColor={theme.placeholder}
						placeholder={holder.current}
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
								<Pressable onPress={() => { removeImage(index, item) }} style={styles.delete}>
									<Icon name="delete1" size={20} color={theme.toolbarbg} />
								</Pressable>
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
			<RulesView rules={rules.current} tip={"香评发布规则"} />
		</View>
	);
}

const styles = StyleSheet.create({
	vote_con: {
		backgroundColor: theme.toolbarbg,
		paddingBottom: 50,
	},
	vote_title_con: {
		flexDirection: "row",
		alignItems: "center",
		height: 50,
		borderBottomWidth: 1,
		borderBottomColor: theme.bg,
	},
	title: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
		height: "100%",
	},
	title_text: {
		fontSize: 16,
		fontWeight: "500",
		fontFamily: "PingFang SC",
		color: theme.placeholder
	},
	active_text: {
		color: theme.tit
	},
	active_line: {
		position: "absolute",
		bottom: 10,
		width: "15%",
		height: 2,
		backgroundColor: theme.tit
	},
	vote_item: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		marginTop: 14,
	},
	vote_text: {
		fontSize: 12,
		color: theme.placeholder
	},
	star_con: {
		marginTop: 10
	},
	vote_range_con: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
		paddingTop: 10,
		paddingBottom: 20,
		borderBottomColor: theme.bg,
		borderBottomWidth: 1,
		paddingHorizontal: 50,
	},
	vote_textarea: {
		width: "100%",
		paddingVertical: 10,
		paddingHorizontal: 20,
		borderBottomColor: theme.bg,
		borderBottomWidth: 1,
	},
	textarea: {
		textAlignVertical: "top",
		fontSize: 15,
		color: theme.tit2,
		padding: 0,
		margin: 0,
		minHeight: 300,
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

export default ItemVote;