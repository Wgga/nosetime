import React from "react";
import { View, StyleSheet, NativeEventEmitter, Dimensions, ScrollView, TextInput } from "react-native";

import HeaderView from "../../components/headerview";
import LinearButton from "../../components/linearbutton";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

function UserChangeDesc({ navigation }: any): React.JSX.Element {
	// 控件
	// 变量
	let udesc = React.useRef<string>("");
	// 数据
	// 参数
	// 状态
	const [isrender, setIsRender] = React.useState<boolean>(false);


	React.useEffect(() => {
		udesc.current = us.user.udesc;
		setIsRender(val => !val);
	}, [])

	const publish = () => {
		us.user.udesc = udesc.current;
		us.saveUser(us.user);
		http.post(ENV.user, { method: "changesetting", id: us.user.uid, token: us.user.token, info: { udesc: udesc.current } }).then((resp_data: any) => {
			events.emit("nosetime_reload_user_setting_list_page");
			navigation.goBack();
		});
	}

	return (
		<View style={styles.desc_container}>
			<HeaderView data={{
				title: "修改个人简介",
				isShowSearch: false,
			}} method={{
				back: () => { navigation.goBack() },
			}} />
			<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.desc_con}>
				<TextInput style={styles.textarea}
					multiline={true}
					value={udesc.current}
					onChangeText={(value: string) => {
						udesc.current = value;
						setIsRender(val => !val);
					}}
					placeholderTextColor={theme.placeholder}
					placeholder={"重新讲述一下你的伟大历程，让天下蝼蚁为你顶礼膜拜"}
				/>
				<LinearButton containerStyle={styles.footer_btn} text="讲完了" onPress={publish} />
			</ScrollView>
		</View>
	);
}
const styles = StyleSheet.create({
	desc_container: {
		flex: 1,
		backgroundColor: theme.toolbarbg,
	},
	desc_con: {
		paddingTop: 26,
		paddingHorizontal: 27,
		paddingBottom: 50,
	},
	textarea: {
		height: 380,
		padding: 10,
		textAlignVertical: "top",
		backgroundColor: theme.bg,
		fontSize: 14,
		margin: 0,
		color: theme.tit2,
		borderRadius: 6,
	},
	footer_btn: {
		marginTop: 87,
		marginHorizontal: 20,
	},
});
export default UserChangeDesc;