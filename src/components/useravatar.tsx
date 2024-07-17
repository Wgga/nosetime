import React from "react";

import { StyleSheet, Pressable, Image, Text, View } from "react-native";

import { useSafeAreaInsets } from "react-native-safe-area-context";

import ActionSheetCtrl from "./actionsheetctrl";


import us from "../services/user-service/user-service";
import upService from "../services/upload-photo-service/upload-photo-service";

import events from "../hooks/events";

import theme from "../configs/theme";
import { ENV } from "../configs/ENV";

function UserAvatar({ classname }: any): React.JSX.Element {

	// 控件
	const insets = useSafeAreaInsets();
	// 参数
	// 变量
	// 数据
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false);

	React.useEffect(() => {
		events.subscribe(classname + "change_avatar", () => {
			setIsRender(val => !val);
		})
		return () => {
			events.unsubscribe(classname + "change_avatar");
		}
	}, []);

	const changeAvatar = () => {
		let params = {
			index: 0,
			quality: 0.9,
			includeBase64: true,
			maxWidth: 400,
			maxHeight: 400,
			src: "useravatar",
			classname,
			isCrop: true,
		}
		ActionSheetCtrl.show({
			key: "avatar_action_sheet",
			buttons: [{
				text: "拍照",
				style: { color: theme.redchecked },
				handler: () => {
					ActionSheetCtrl.close("avatar_action_sheet");
					setTimeout(() => { upService.buttonClicked(params, { marginTop: insets.top }) }, 300);
				}
			}, {
				text: "从相册选择",
				style: { color: theme.tit2 },
				handler: () => {
					ActionSheetCtrl.close("avatar_action_sheet");
					params["index"] = 1;
					setTimeout(() => { upService.buttonClicked(params, { marginTop: insets.top }) }, 300);
				}
			}, {
				text: "取消",
				style: { color: theme.tit },
				handler: () => {
					ActionSheetCtrl.close("avatar_action_sheet");
				}
			}],
		})
	}

	return (
		<Pressable onPress={changeAvatar}>
			<Image style={styles.user_avatar}
				defaultSource={require("../assets/images/default_avatar.png")}
				source={{ uri: ENV.avatar + us.user.uid + ".jpg?" + us.user.uface }}
			/>
		</Pressable>
	);
}

const styles = StyleSheet.create({
	user_avatar: {
		width: 60,
		height: 60,
		borderWidth: 1,
		borderColor: theme.toolbarbg,
		borderRadius: 30,
		overflow: "hidden",
	},
});

export default UserAvatar;