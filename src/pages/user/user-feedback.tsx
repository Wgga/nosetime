import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, ScrollView, TextInput, Image, ActivityIndicator } from "react-native";

import LinearGradient from "react-native-linear-gradient";
import { Brightness } from "react-native-color-matrix-image-filters";

import HeaderView from "../../components/headerview";
import ActionSheetCtrl from "../../components/actionsheetctrl";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

function UserFeedback({ navigation, route }: any): React.JSX.Element {
	// 控件
	// 参数
	const { title } = route.params;
	// 变量
	let aImages = React.useRef<any[]>([]); // 上传的图片列表
	let placeholder = React.useRef<string>("请留下您的宝贵意见或建议，商务合作请发邮件至contact@nosetime.com"); // 占位文字
	// 数据
	// 状态

	React.useEffect(() => {
		if (title == "院长办公室") {
			placeholder.current = "提交建议或提交新的题目...";
		} else if (title == "纠错反馈") {
			placeholder.current = "请告诉我们这道题的问题所在，我们将努力改进";
		} else {
			placeholder.current = "请留下您的宝贵意见或建议，商务合作请发邮件至contact@nosetime.com";
		}
	}, [])


	const publish = () => {

	}

	const openfiledlg = () => {
		ActionSheetCtrl.show({
			key: "filedlg_action_sheet",
			buttons: [{
				text: "拍照",
				handler: () => {
					ActionSheetCtrl.close("filedlg_action_sheet");
					buttonClicked(0);
				}
			}, {
				text: "从相册选择",
				handler: () => {
					ActionSheetCtrl.close("filedlg_action_sheet");
					buttonClicked(1);
				}
			}, {
				text: "取消",
				handler: () => {
					ActionSheetCtrl.close("filedlg_action_sheet");
				}
			}],
			onTouchOutside: () => {
				ActionSheetCtrl.close("filedlg_action_sheet");
			},
		})
	}

	const buttonClicked = (index: number) => {

	}

	return (
		<View style={styles.feedback_container}>
			<HeaderView
				data={{
					title,
					isShowSearch: false,
				}}
				method={{
					back: () => { navigation.goBack() },
				}} />
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.feedback_con}>
				<View style={styles.feedback_textarea_con}>
					<TextInput style={styles.textarea}
						multiline={true}
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
			<Pressable onPress={publish} style={styles.feedback_btn}>
				<LinearGradient
					colors={["#81B4EC", "#9BA6F5"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					locations={[0, 1]}
					style={[styles.feedback_btn_bg, { zIndex: 1, transform: [{ translateY: -2 }, { translateX: -2 }] }]}
				/>
				<LinearGradient
					colors={["#61A2E9", "#95A0EB"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					locations={[0, 1]}
					style={styles.feedback_btn_bg}
				/>
				<Text style={styles.feedback_btn_text}>{"提交"}</Text>
			</Pressable>
		</View>
	);
}
const styles = StyleSheet.create({
	feedback_container: {
		flex: 1,
		backgroundColor: theme.toolbarbg,
	},
	feedback_con: {
		paddingTop: 26,
		paddingHorizontal: 27,
	},
	feedback_textarea_con: {
		width: "100%",
		backgroundColor: theme.bg,
		borderRadius: 6,
		height: 180,
		padding: 10,
	},
	textarea: {
		width: "100%",
		fontSize: 14,
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
	feedback_btn: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		marginHorizontal: 20,
		marginBottom: 20,
		padding: 10,
		borderRadius: 30,
		overflow: "hidden",
		alignItems: "center",
	},
	feedback_btn_bg: {
		...StyleSheet.absoluteFillObject,
		borderRadius: 30,
		zIndex: 0,
	},
	feedback_btn_text: {
		fontSize: 16,
		color: theme.toolbarbg,
		zIndex: 2,
	},
});
export default UserFeedback;