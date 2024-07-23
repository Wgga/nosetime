import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Image, ScrollView } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import HeaderView from "../../components/view/headerview";

import us from "../../services/user-service/user-service";
import upService from "../../services/upload-photo-service/upload-photo-service";

import http from "../../utils/api/http";
import { Globalstyles } from "../../utils/globalmethod";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

const PerfumeListIntro = React.memo(({ navigation, route }: any) => {

	// 控件
	const classname = "PerfumeListIntroPage";
	const insets = useSafeAreaInsets();
	// 参数
	// 变量
	let coldata = React.useRef<any>({
		cid: 0, cname: "", cdesc: "", cpic: "/collection/default.jpg", ctags: []
	});
	// 数据
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false); // 是否渲染

	React.useEffect(() => {
		if (route.params) {
			if (route.params.collection) coldata.current = route.params.collection;
			setIsRender(val => !val);
		}
		// 接收图片
		events.subscribe("photo_upload" + classname + us.user.uid, (dataurl: string) => {
			uploadpic_by_dataurl(dataurl);
		});

		return () => {
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

	// 上传封面
	const uploadpic_by_dataurl = (dataurl: string) => {
		http.post(ENV.collection + "?type=collection&uid=" + us.user.uid, { method: "savepic_dataurl", token: us.user.token, Filedata: dataurl }).then((resp_data: any) => {
			if (resp_data.msg == "OK") {
				coldata.current.cpic = resp_data.url;
				setIsRender(val => !val);

				if (!coldata.current.cname) return;
				http.post(ENV.collection + "?uid=" + us.user.uid, { method: "updatecollection", collection: coldata.current, token: us.user.token }).then((resp_data2: any) => {
					coldata.current = resp_data2;
					setIsRender(val => !val);
				})
			} else if (resp_data.msg == "TOKEN_ERR" || resp_data.msg == "TOKEN_EXPIRE") {
				us.delUser();
				return navigation.navigate("Page", { screen: "Login", params: { src: "App编辑香单" } });
			}
		});
	}

	// 检测当前是否显示默认封面图
	const is_default_img = () => {
		if (us.user.uid != coldata.current.cuid) return false;//不是自己的香单，不显示
		if (!coldata.current.cpic) return true;//没封面图片显示上传
		return coldata.current.cpic.includes("default");
	}

	return (
		<View style={Globalstyles.container}>
			<View style={Globalstyles.header_bg_con}>
				<Image style={Globalstyles.header_bg_img} blurRadius={30} source={{ uri: ENV.image + coldata.current.cpic + "!s" }} />
				<View style={Globalstyles.header_bg_msk}></View>
			</View>
			<HeaderView data={{
				title: "",
				backicon: "close",
				backiconsize: 35,
				backiconcolor: theme.comment,
				isShowSearch: false,
				style: { backgroundColor: "transparent", paddingHorizontal: 10 },
				childrenstyle: {
					headercolor: { color: theme.toolbarbg },
				},
			}} method={{
				back: () => { navigation.goBack() },
			}} />
			<View style={styles.col_info_con}>
				<Pressable style={styles.col_image} onPress={selectPicture}>
					<Image style={{ width: "100%", height: "100%" }} source={{ uri: ENV.image + coldata.current.cpic + "!l" }} />
					{is_default_img() && <View style={Globalstyles.info_image_msk}>
						<Text style={Globalstyles.msk_text}>{"上传封面"}</Text>
						<Text style={Globalstyles.msk_text}>{"入住香单广场"}</Text>
					</View>}
				</Pressable>
				<Text style={styles.col_name}>{coldata.current.cname}</Text>
				<View style={styles.col_tags}>
					<Text style={styles.tags_tit}>{"标签 :"}</Text>
					<View style={styles.tags_tag}>
						{coldata.current.ctags.length > 0 && coldata.current.ctags.map((item: any, index: number) => {
							return (
								<Text key={item} style={styles.tags_text}>{item}</Text>
							)
						})}
					</View>
				</View>
				<Text style={styles.desc_tit}>{"内容简介 :"}</Text>
				<ScrollView><Text style={styles.desc_text}>{coldata.current.cdesc}</Text></ScrollView>
				{us.user.uid == coldata.current.cuid && <Pressable style={styles.col_btn} onPress={() => {
					navigation.navigate("PerfumeListEdit", { collection: coldata.current });
				}}>
					<Text style={styles.btn_text}>{"编辑香单"}</Text>
				</Pressable>}
			</View>
		</View>
	);
})

const styles = StyleSheet.create({
	col_info_con: {
		flex: 1,
		paddingTop: 20,
		paddingBottom: 50,
		paddingHorizontal: 75,
	},
	col_image: {
		width: 179,
		height: 179,
		borderRadius: 8,
		marginHorizontal: "auto",
	},
	col_name: {
		fontSize: 15,
		lineHeight: 22,
		paddingHorizontal: 10,
		paddingVertical: 15,
		borderBottomColor: "rgba(255,255,255,0.3)",
		borderBottomWidth: 1,
		color: theme.toolbarbg,
		letterSpacing: 2,
		textAlign: "center",
	},
	col_tags: {
		flexDirection: "row",
		marginTop: 30,
		marginBottom: 15,
	},
	tags_tag: {
		...Globalstyles.item_flex,
		marginLeft: 5,
	},
	tags_tit: {
		fontSize: 15,
		color: theme.toolbarbg,
	},
	tags_text: {
		fontSize: 13,
		color: theme.toolbarbg,
		paddingHorizontal: 12,
		marginRight: 10,
		marginBottom: 10,
		lineHeight: 22,
		backgroundColor: "rgba(255,255,255,0.1)",
		borderRadius: 10,
	},
	desc_tit: {
		color: theme.toolbarbg,
		fontSize: 15,
		marginTop: 4,
		marginBottom: 14,
	},
	desc_text: {
		fontSize: 13,
		color: theme.toolbarbg,
	},
	col_btn: {
		marginTop: 20,
		alignItems: "center",
		justifyContent: "center",
	},
	btn_text: {
		fontSize: 13,
		height: 30,
		textAlign: "center",
		lineHeight: 30,
		borderColor: "rgba(255,255,255,0.7)",
		borderWidth: 1,
		borderRadius: 15,
		color: theme.toolbarbg,
		paddingHorizontal: 16,
	},
});

export default PerfumeListIntro;