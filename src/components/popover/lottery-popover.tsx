import React from "react";
import { View, Text, StyleSheet, Dimensions, Image, Pressable, Animated, Easing } from "react-native";

import { ShadowedView } from "react-native-fast-shadow";
import Svg, { Ellipse } from "react-native-svg";

import LinearButton from "../linearbutton";
import { ModalPortal } from "../modals";

import theme from "../../configs/theme";

import IconTip1 from "../../assets/svg/userjifen/icontip1.svg";
import IconTip2 from "../../assets/svg/userjifen/icontip2.svg";
import IconTip3 from "../../assets/svg/userjifen/icontip3.svg";
import IconTip4 from "../../assets/svg/userjifen/icontip4.svg";
import IconTip5 from "../../assets/svg/userjifen/icontip5.svg";
import IconTip6 from "../../assets/svg/userjifen/icontip6.svg";
import IconTip7 from "../../assets/svg/userjifen/icontip7.svg";
import IconTip8 from "../../assets/svg/userjifen/icontip8.svg";
import IconTip9 from "../../assets/svg/userjifen/icontip9.svg";
import IconTip10 from "../../assets/svg/userjifen/icontip10.svg";
import IconTip11 from "../../assets/svg/userjifen/icontip11.svg";
import IconTip12 from "../../assets/svg/userjifen/icontip12.svg";
import IconTip13 from "../../assets/svg/userjifen/icontip13.svg";
import IconTip14 from "../../assets/svg/userjifen/icontip14.svg";
import IconTip15 from "../../assets/svg/userjifen/icontip15.svg";
import IconTip16 from "../../assets/svg/userjifen/icontip16.svg";
import IconTip17 from "../../assets/svg/userjifen/icontip17.svg";
import IconTip18 from "../../assets/svg/userjifen/icontip18.svg";
import IconTip19 from "../../assets/svg/userjifen/icontip19.svg";
import IconTip20 from "../../assets/svg/userjifen/icontip20.svg";

const { width, height } = Dimensions.get("window");

function LotteryPopover({ data }: any): React.JSX.Element {
	// 控件
	// 变量
	let rotateValue = React.useRef(new Animated.Value(0)).current;
	let rotateAnimation = React.useRef<any>(null);
	// 数据
	const tiplist: any[] = [
		<IconTip1 width={"100%"} height={"100%"} />,
		<IconTip2 width={"100%"} height={"100%"} />,
		<IconTip3 width={"100%"} height={"100%"} />,
		<IconTip4 width={"100%"} height={"100%"} />,
		<IconTip5 width={"100%"} height={"100%"} />,
		<IconTip6 width={"100%"} height={"100%"} />,
		<IconTip7 width={"100%"} height={"100%"} />,
		<IconTip8 width={"100%"} height={"100%"} />,
		<IconTip9 width={"100%"} height={"100%"} />,
		<IconTip10 width={"100%"} height={"100%"} />,
		<IconTip11 width={"100%"} height={"100%"} />,
		<IconTip12 width={"100%"} height={"100%"} />,
		<IconTip13 width={"100%"} height={"100%"} />,
		<IconTip14 width={"100%"} height={"100%"} />,
		<IconTip15 width={"100%"} height={"100%"} />,
		<IconTip16 width={"100%"} height={"100%"} />,
		<IconTip17 width={"100%"} height={"100%"} />,
		<IconTip18 width={"100%"} height={"100%"} />,
		<IconTip19 width={"100%"} height={"100%"} />,
		<IconTip20 width={"100%"} height={"100%"} />,
	]
	const [lottery, setLottery] = React.useState<any>({});
	// 参数
	// 状态

	React.useEffect(() => {
		setLottery(data);
		if (data.showbg) {
			rotateAnimation.current = Animated.loop(
				Animated.timing(rotateValue, {
					toValue: 1,
					duration: 6000,
					useNativeDriver: true,
					easing: Easing.linear
				})
			).start();
		}
	}, [])

	const close = () => {
		if (rotateAnimation.current) {
			rotateAnimation.current.stop();
		}
		ModalPortal.dismiss("lottery_popover");
	}

	return (
		<Pressable style={styles.lottery_container} onPress={close}>
			{lottery.showbg && <Animated.Image style={[styles.light_bg, {
				transform: [{ scale: 1.8 }, {
					rotateZ: rotateValue.interpolate({
						inputRange: [0, 1],
						outputRange: ["0deg", "360deg"],
					})
				}]
			}]}
				source={require("../../assets/images/lottery/light_bg.png")}
			/>}
			<ShadowedView style={styles.lottery_con}>
				<Image style={styles.popover_bg}
					source={require("../../assets/images/lottery/popover_bg.png")}
				/>
				<View style={styles.item_image_con}>
					{lottery.type == 2 && <View style={{ width: 120, alignItems: "center" }}>
						<View style={styles.perfume_image}>
							<Image style={styles.pimage}
								source={{ uri: lottery.image }}
								resizeMode="contain"
							/>
							<Image style={{ width: "100%", height: "100%" }}
								source={require("../../assets/images/lottery/perfume_bg.png")}
							/>
						</View>
						<Svg width="65%" height="5%" style={{ marginTop: 10, opacity: 0.5 }}>
							<Ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill="#BBB2CB" />
						</Svg>
					</View>}
					{lottery.type == 1 && <View style={styles.lose_image}>
						{tiplist[lottery.image - 1]}
						<Svg width="90%" height="5%" style={{ opacity: 0.5, marginTop: "-5%" }}>
							<Ellipse cx="50%" cy="50%" rx="50%" ry="50%" fill="#BBB2CB" />
						</Svg>
					</View>}
				</View>
				<Text style={styles.item_title}>{lottery.desc}</Text>
				{lottery.cnname && <Text style={styles.item_name}>
					<Text>{lottery.cnname}</Text>
					{lottery.ml && <Text>{" " + lottery.ml + "ml"}</Text>}
				</Text>}
				{lottery.enname && <Text style={styles.item_enname}>{lottery.enname}</Text>}
				<LinearButton containerStyle={styles.sure_btn}
					text={lottery.sure}
					textStyle={styles.sure_btn_text}
					btntransform={[{ translateY: -1 }, { translateX: -1 }]}
					colors={["#A795C6", "#8469AC"]}
					colors2={["#4C3C76", "#4C3C76"]}
					onPress={close}
				/>
			</ShadowedView>
		</Pressable>
	);
}
const styles = StyleSheet.create({
	lottery_container: {
		width: "100%",
		height: "100%",
		justifyContent: "center",
	},
	light_bg: {
		position: "absolute",
		width: "100%",
		zIndex: 0,
	},
	lottery_con: {
		borderRadius: 20,
		overflow: "hidden",
		paddingVertical: 35,
		marginHorizontal: 59,
		backgroundColor: theme.toolbarbg,
		shadowOpacity: 1,
		shadowRadius: 0,
		shadowColor: "#A38EE5",
		shadowOffset: {
			width: 0.3,
			height: -0.8,
		},
		alignItems: "center",
	},
	popover_bg: {
		position: "absolute",
		top: 0,
		width: "100%",
		height: (width - 118) / 500 * 383,
	},
	item_image_con: {
		width: "100%",
		alignItems: "center",
	},
	perfume_image: {
		width: 120,
		height: 114,
		justifyContent: "center",
	},
	pimage: {
		position: "absolute",
		width: "100%",
		height: "60%",
		zIndex: 1
	},
	lose_image: {
		width: 82,
		height: 104,
		alignItems: "center",
		justifyContent: "center",
	},
	item_title: {
		marginTop: 20,
		fontSize: 16,
		fontFamily: "PingFang SC",
		fontWeight: "500",
		color: "#5B3E79"
	},
	item_name: {
		color: "#6E5984",
		fontSize: 14,
		marginTop: 16,
		marginBottom: 10,
		fontWeight: "500",
		fontFamily: "PingFang SC",
		marginHorizontal: 20,
		textAlign: "center",
	},
	item_enname: {
		fontSize: 12,
		color: "#968DA8",
		marginBottom: 10,
		marginHorizontal: 35,
		textAlign: "center",
	},
	sure_btn: {
		width: "100%",
		paddingHorizontal: 40,
		marginTop: 15,
	},
	sure_btn_text: {
		fontSize: 15,
	},
});
export default LotteryPopover;