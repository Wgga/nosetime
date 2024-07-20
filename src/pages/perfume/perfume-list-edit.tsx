import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, ScrollView, Image, TextInput } from "react-native";

import { AvoidSoftInputView } from "react-native-avoid-softinput";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import us from "../../services/user-service/user-service";
import upService from "../../services/upload-photo-service/upload-photo-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../utils/globalmethod";

import Icon from "../../assets/iconfont";
import HeaderView from "../../components/headerview";
import LinearGradient from "react-native-linear-gradient";
import ToastCtrl from "../../components/controller/toastctrl";

const { width, height } = Dimensions.get("window");

function PerfumeListEdit({ navigation, route }: any): React.JSX.Element {

	// 控件
	const classname = "PerfumeListEditPage";
	const insets = useSafeAreaInsets();
	// 参数
	// 变量
	let face_img = React.useRef<string>("");
	let face_img2 = React.useRef<string>("");
	// 数据
	let coldata = React.useRef<any>({
		cid: 0, cname: "", cdesc: "", cpic: "/collection/default.jpg", ctags: []
	});
	let oricoldata = React.useRef<any>({
		cid: 0, cname: "", cdesc: "", cpic: "/collection/default.jpg", ctags: []
	});
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		if (route.params) {
			if (route.params.collection) oricoldata.current = route.params.collection;
			coldata.current = Object.assign({}, oricoldata.current);
			face_img.current = oricoldata.current.cpic.includes("default") ? ENV.image + oricoldata.current.cpic + "!m" : ""
			setIsRender(val => !val);
		}

		events.subscribe("selected_tags", (tags: any) => {
			coldata.current.ctags = tags;
			setIsRender(val => !val);
		})

		// 接收图片
		events.subscribe("photo_upload" + classname + us.user.uid, (dataurl: string) => {
			uploadpic_by_dataurl(dataurl);
		});

		return () => {
			events.unsubscribe("selected_tags");
			events.unsubscribe("photo_upload" + classname + us.user.uid);
		}
	}, []);

	// 选择图片
	const selectPicture = () => {
		let params = {
			index: 1,
			quality: 0.9,
			isCrop: true,
			includeBase64: true,
			src: "photoupload",
			classname,
			maxWidth: 1024,
			maxHeight: 1024,
		}
		upService.buttonClicked(params, { marginTop: insets.top });
	}

	// 上传图片
	const uploadpic_by_dataurl = (dataurl: string) => {
		http.post(ENV.collection + "?type=collection&uid=" + us.user.uid, { method: "savepic_dataurl", token: us.user.token, Filedata: dataurl }).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				face_img.current = dataurl;
				face_img2.current = resp_data.url;
				setIsRender(val => !val);

				if (!coldata.current.cname) return;
				http.post(ENV.collection + "?uid=" + us.user.uid, { method: "updatecollection", collection: coldata.current, token: us.user.token }).then((resp_data2: any) => {
					oricoldata.current = Object.assign({}, coldata.current);
					setIsRender(val => !val);
				})
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App编辑香单" } });
			}
		});
	}

	// 选择标签
	const seltag = () => {
		navigation.navigate("Page", { screen: "PerfumeListTag", params: { tags: coldata.current.ctags } });
	}

	// 创建香单
	const create_perfumeList = () => {
		if (!us.user.uid) {
			return navigation.navigate("Page", { screen: "Login", params: { src: "App编辑香单" } });
		}

		coldata.current.cname = coldata.current.cname.trim();
		if (!coldata.current.cname) {
			ToastCtrl.show({ message: "香单名称不能为空", duration: 1000, viewstyle: "medium_toast", key: "colname_notempty_toast" });
			return;
		}

		if (coldata.current.cname == oricoldata.current.cname
			&& coldata.current.ctags == oricoldata.current.ctags
			&& coldata.current.cdesc == oricoldata.current.cdesc
			&& face_img2.current == oricoldata.current.cpic
		) {
			navigation.goBack();
			return;
		}

		if (face_img2.current) coldata.current.cpic = face_img2.current;
		http.post(ENV.collection + "?uid=" + us.user.uid, { method: "updatecollection", collection: coldata.current, token: us.user.token }).then((resp_data: any) => {
			if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App编辑香单" } });
			}
			if (resp_data.cid > 0) {
				ToastCtrl.show({ message: coldata.current.cid ? "修改成功" : "创建香单成功", duration: 1000, viewstyle: "medium_toast", key: "success_toast" });
				events.publish("collection_change", resp_data);
				cache.removeItem("usercollections" + us.user.uid);
				navigation.goBack();
			} else {
				ToastCtrl.show({ message: resp_data.msg, duration: 1000, viewstyle: "medium_toast", key: "errpr_toast" });
			}
			setIsRender(val => !val);
		});
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: "编辑香单",
				isShowSearch: false,
				style: { backgroundColor: theme.toolbarbg }
			}} method={{
				back: () => {
					navigation.goBack();
				},
			}} />
			<AvoidSoftInputView showAnimationDuration={50} hideAnimationDuration={50} showAnimationDelay={0} hideAnimationDelay={0}
				style={{ flex: 1 }}>
				<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 32, minHeight: "100%" }} keyboardDismissMode="on-drag">
					<Pressable style={[styles.edit_face, styles.flex_row]} onPress={selectPicture}>
						<Text style={styles.edit_tit}>{"修改香单封面"}</Text>
						{face_img.current && <Image style={styles.edit_face_img} source={{ uri: face_img.current }} />}
					</Pressable>
					<View style={styles.edit_con}>
						<TextInput style={styles.nameinput}
							multiline={false}
							placeholder={"香单名称"}
							maxLength={24}
							onChangeText={(text: string) => {
								coldata.current.cname = text;
								setIsRender(val => !val);
							}}
							value={coldata.current.cname}
						/>
					</View>
					{coldata.current.ctags.length == 0 && <Pressable style={[styles.edit_con, styles.flex_row]} onPress={seltag}>
						<Text style={styles.edit_tit}>{"添加标签"}</Text>
						<Icon name="advance" size={14} color={theme.tit2} />
					</Pressable>}
					{coldata.current.ctags.length > 0 && <View style={[styles.edit_con, styles.flex_row]}>
						<View style={styles.tags_con}>
							{coldata.current.ctags.map((item: any, index: number) => {
								return (
									<Text key={item} style={styles.tags_text}>{item}</Text>
								)
							})}
						</View>
						<Pressable style={styles.tags_con} onPress={seltag}>
							<Text style={{ fontSize: 14, color: theme.fav, marginRight: 5 }}>{"修改"}</Text>
							<Icon name="advance" size={14} color={theme.fav} />
						</Pressable>
					</View>}
					<View style={styles.edit_desc}>
						<TextInput style={styles.descinput}
							multiline={true}
							placeholder={"编辑香单简介"}
							onChangeText={(text: string) => {
								coldata.current.cdesc = text;
								setIsRender(val => !val);
							}}
							value={coldata.current.cdesc}
						/>
					</View>
				</ScrollView>
			</AvoidSoftInputView>
			<Pressable onPress={create_perfumeList}>
				<LinearGradient colors={["#81B4EC", "#9BA6F5"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					locations={[0, 1]} style={[Globalstyles.flex_center, { height: 50 + insets.bottom, paddingBottom: insets.bottom }]}>
					<Text style={Globalstyles.btn_text}>{"确定"}</Text>
				</LinearGradient>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	flex_row: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	edit_face: {
		height: 90,
	},
	edit_tit: {
		fontSize: 14,
		color: theme.tit2
	},
	edit_face_img: {
		width: 65,
		height: 65,
		borderRadius: 5,
		overflow: "hidden",
	},
	edit_con: {
		height: 50,
		borderBottomColor: theme.bg,
		borderBottomWidth: 1,
		justifyContent: "center",
	},
	nameinput: {
		padding: 0,
		color: theme.tit2,
		lineHeight: 22,
		paddingLeft: 2,
	},
	tags_con: {
		flexDirection: "row",
		alignItems: "center",
	},
	tags_text: {
		borderRadius: 13,
		borderColor: theme.border,
		borderWidth: 1,
		paddingHorizontal: 15,
		paddingVertical: 4,
		fontSize: 12,
		color: theme.tit2,
		marginRight: 10,
	},
	edit_desc: {
		paddingTop: 8,
		borderBottomColor: theme.bg,
		borderBottomWidth: 1,
	},
	descinput: {
		maxHeight: 420,
		padding: 0,
		paddingVertical: 10,
		textAlignVertical: "top",
	},
});

export default PerfumeListEdit;