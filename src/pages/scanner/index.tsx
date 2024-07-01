import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";

import { Camera, CodeScanner, useCameraDevice } from "react-native-vision-camera";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import us from "../../services/user-service/user-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../configs/globalmethod";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function Scanner({ navigation, route }: any): React.JSX.Element {

	// 控件
	const insets = useSafeAreaInsets();
	const device = useCameraDevice("back")
	const cameraRef = React.useRef<any>(null);
	// 参数
	// 变量
	// 数据
	// 状态
	const [flashlight, setFlashlight] = React.useState(false);

	const codeScanner: CodeScanner = {
		codeTypes: [
			"code-128", "code-39", "code-93",
			"codabar",
			"ean-13", "ean-8",
			"itf",
			"upc-e", "upc-a",
			"qr",
			"pdf-417",
			"aztec",
			"data-matrix"
		],
		onCodeScanned: (codes) => {
			console.log("%c Line:47 🍎 codes", "color:#93c0a4", codes);
		}
	}
	return (
		<>
			<Icon name="leftarrow" size={25} color={theme.toolbarbg} style={[styles.back_btn, { marginTop: insets.top }]} onPress={() => {
				navigation.goBack();
			}} />
			{device && <Camera ref={cameraRef} style={styles.scanner}
				device={device}
				torch={flashlight ? "on" : "off"}
				isActive={true}
				codeScanner={codeScanner}
			/>}
			<View style={styles.flashlight_btn}>
				<Icon name={flashlight ? "flashlight-on" : "flashlight-off"} size={35} color={theme.toolbarbg} onPress={() => {
					setFlashlight(val => !val);
				}} />
			</View>
		</>
	);
}

const styles = StyleSheet.create({
	back_btn: {
		position: "absolute",
		top: 5,
		left: 5,
		zIndex: 1,
		width: 44,
		height: 44,
		textAlign: "center",
		lineHeight: 44,
	},
	scanner: {
		...StyleSheet.absoluteFillObject,
		zIndex: 0,
	},
	flashlight_btn: {
		position: "absolute",
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 1,
		marginBottom: 100,
		alignItems: "center",
		justifyContent: "center",
	},
});

export default Scanner;