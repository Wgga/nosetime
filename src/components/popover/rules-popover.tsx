import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";

import LinearGradient from "react-native-linear-gradient";
import WebView from "react-native-webview";

import { ModalPortal } from "../modals";

import theme from "../../configs/theme";
import { Globalstyles } from "../../configs/globalstyles";

const { width, height } = Dimensions.get("window");

function RulesPopover({ modalparams }: any): React.JSX.Element {

	// 控件
	// 变量
	// 参数
	const { modalkey, rulesdata } = modalparams;
	// 数据
	const [rule, setRule] = React.useState<string>("");
	// 状态

	React.useEffect(() => {
		if (rulesdata && rulesdata.content) {
			setRule(
				`<html>
					<head><style>
						*{padding:0;margin:0;}
						.content{padding-bottom:100px;}
						.content p{margin: 0 10px 0 15px;}
						.content ul{padding: 0 20px 0 35px;margin: 14px 0;}
						.content li{margin-bottom:10px;}
						div{font-size:14px;color:${theme.placeholder};}
					</style></head>
					<body><div class="content">${rulesdata.content}</div></body>
				</html>`
			);
		}
	}, [])

	return (
		<View style={[styles.rules_con, Globalstyles.list_content]}>
			<Text style={styles.rules_title}>{rulesdata.title}</Text>
			<WebView
				originWhitelist={["*"]}
				scalesPageToFit={false}
				setBuiltInZoomControls={false}
				scrollEnabled={false}
				source={{ html: rule }} />
			<Pressable style={{ width: "100%" }} onPress={() => {
				ModalPortal.dismiss(modalkey);
			}}>
				<LinearGradient
					colors={["#81B4EC", "#9BA6F5"]}
					start={{ x: 0, y: 0 }}
					end={{ x: 1, y: 0 }}
					locations={[0, 1]}
					style={styles.vote_btn}
				>
					<Text style={styles.vote_btn_text}>{"完成"}</Text>
				</LinearGradient>
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	rules_con: {
		height: height * 0.61,
		backgroundColor: theme.toolbarbg,
	},
	rules_title: {
		fontSize: 18,
		height: 71,
		lineHeight: 71,
		textAlign: "center",
		color: "#000",
	},
	vote_btn: {
		width: "100%",
		height: 46,
		alignItems: "center",
		justifyContent: "center",
	},
	vote_btn_text: {
		fontSize: 16,
		color: theme.toolbarbg,
	}
});

export default RulesPopover;