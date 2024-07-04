import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions, Animated, Easing } from "react-native";

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
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");

function Scanner({ navigation, route }: any): React.JSX.Element {

	// 控件
	const insets = useSafeAreaInsets();
	const device = useCameraDevice("back")
	const cameraRef = React.useRef<any>(null);
	let animated = React.useRef<any>(null); // 动画实例
	// 参数
	// 变量
	let fadeInOpacity = React.useRef(new Animated.Value(0)).current;
	// 数据
	// 状态
	const [isEndAnimation, setIsEndAnimation] = React.useState<boolean>(false);
	const [flashlight, setFlashlight] = React.useState(false);

	const startAnimation = () => {
		animated.current = Animated.timing(fadeInOpacity, {
			toValue: 1,
			duration: 5000,
			easing: Easing.linear,
			useNativeDriver: true
		})
		animated.current.start(({ finished }: any) => {
			// 动画结束后重新调用
			if (finished) {
				fadeInOpacity.setValue(0);
				startAnimation();
			}
		});
	}

	React.useEffect(() => {
		startAnimation();
		return () => {
			animated.current && animated.current.stop();
		}
	}, [])

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
			<View style={{
				...StyleSheet.absoluteFillObject,
				left: 20,
				right: 20,
				zIndex: 0,
			}}>
				<Animated.View style={[{
					transform: [{
						translateY: fadeInOpacity.interpolate({
							inputRange: [0, 1],
							outputRange: [100, (height - 150)]
						})
					}]
				}]}>
					<LinearGradient
						colors={["transparent", "rgba(0,255,0,0.4)", "transparent"]}
						start={{ x: 0, y: 0 }}
						end={{ x: 1, y: 0 }}
						locations={[0, 0.5, 1]}
						style={{ height: 3 }}
					/>
				</Animated.View>
			</View>
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