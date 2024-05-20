import React from "react";
import { View, Text, StyleSheet, Pressable, NativeEventEmitter, Dimensions, Image } from "react-native";

import { ModalPortal } from "../../components/modals";

import http from "../../utils/api/http";

import cache from "../../hooks/storage/storage";

import theme from "../../configs/theme";

import { ENV } from "../../configs/ENV";
import Icon from "../../assets/iconfont";
import LinearGradient from "react-native-linear-gradient";

const { width, height } = Dimensions.get("window");
const events = new NativeEventEmitter();

function lowPricePopover({ modalparams }: any): React.JSX.Element {
	// 控件
	// 变量
	const [data, setData] = React.useState<any>({});
	// 数据
	// 参数
	// 状态

	React.useEffect(() => {
		setData(modalparams.modaldata);
	}, []);

	return (
		<>
			{data && <View style={styles.lowprice_con}>
				{(data.isdit && data.isdiy == 1) && <Image style={styles.diypopup}
					source={{ uri: ENV.image + data.img }}
					resizeMode="contain"
				/>}
				{(data.isdiy == 0 || !data.isdiy) && <View style={styles.popup_con}>
					<Image style={styles.popup_img}
						source={{ uri: ENV.image + data.img }}
					/>
					<View style={styles.whitebg}></View>
					<View style={styles.popup_info}>
						{data.title && <Text style={styles.main_title}>{data.title}</Text>}
						{data.subtitle && <Text style={styles.sub_title}>{data.subtitle}</Text>}
						{data.newprice && <Text style={styles.newprice}>{data.newprice}</Text>}
						{data.oriprice && <Text style={styles.oriprice}>{data.oriprice}</Text>}
						<LinearGradient
							colors={["#81B4EC", "#9BA6F5"]}
							start={{ x: 0, y: 0 }}
							end={{ x: 1, y: 0 }}
							style={styles.purchase}
						>
							<Pressable onPress={() => { }}>
								<Text style={styles.btn_text}>{data.btntext}</Text>
							</Pressable>
						</LinearGradient>
					</View>
				</View>}
				<Pressable style={styles.close_btn} onPress={() => { ModalPortal.dismiss(modalparams.modalkey) }}>
					<Icon name="close" size={25} color={theme.toolbarbg} />
				</Pressable>
			</View>}
		</>
	);
}
const styles = StyleSheet.create({
	lowprice_con: {
		width: "100%",
		height: height,
		alignItems: "center",
		justifyContent: "center",
	},
	diypopup: {
		width: width - 82,
		height: (width - 82) * 1.5,
	},
	popup_con: {
		width: width - 102,
		backgroundColor: theme.toolbarbg,
		borderRadius: 20,
		overflow: "hidden"
	},
	popup_img: {
		width: "100%",
		height: 245,
		backgroundColor: theme.placeholder
	},
	whitebg:{
		position: "absolute",
		left: 0,
		right: 0,
		height: 25,
		top: 230,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		backgroundColor: theme.toolbarbg
	},
	popup_info: {
		width: "100%",
		paddingHorizontal: 20,
		backgroundColor: theme.toolbarbg,
		alignItems: "center",
	},
	main_title: {
		fontSize: 19,
		marginVertical: 5,
		color: theme.text1,
	},
	sub_title: {
		height: 30,
		marginTop: 0,
		fontSize: 13,
		color: theme.text2,
	},
	newprice: {
		marginTop: 10,
		color: "#D25852",
		fontSize: 20,
	},
	oriprice: {
		marginTop: 8,
		color: theme.placeholder,
		fontSize: 13,
		textDecorationLine: "line-through",
	},
	purchase: {
		marginTop: 15,
		marginBottom: 24,
		borderRadius: 45,
		overflow: "hidden",
		paddingHorizontal: 30,
		paddingVertical: 11,
	},
	btn_text: {
		color: theme.toolbarbg,
		fontSize: 17,
		fontFamily: "PingFang SC",
		fontWeight: "500",
	},
	close_btn: {
		width: 43,
		height: 43,
		backgroundColor: "rgba(0,0,0,0.5)",
		marginTop: 34,
		borderRadius: 50,
		alignItems: "center",
		justifyContent: "center",
	}
});
export default lowPricePopover;