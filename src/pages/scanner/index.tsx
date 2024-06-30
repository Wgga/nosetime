import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";

import { Camera, CodeScanner, useCameraDevice } from "react-native-vision-camera";

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
	const device = useCameraDevice("back")
	// 参数
	// 变量
	// 数据
	// 状态

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
		}
	}
	return (
		<>
			{device && <Camera style={styles.scanner_con}
				device={device}
				isActive={true}
				codeScanner={codeScanner}
			/>}
		</>
	);
}

const styles = StyleSheet.create({
	scanner_con: {
		...StyleSheet.absoluteFillObject,
	}
});

export default Scanner;