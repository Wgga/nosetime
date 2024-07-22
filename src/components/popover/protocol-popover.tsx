import React from "react";
import { View, StyleSheet, Text, StatusBar } from "react-native";

import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ModalPortal } from "../modals";

import http from "../../utils/api/http";
import { Globalstyles } from "../../utils/globalmethod";

import { ENV } from "../../configs/ENV";
import theme from "../../configs/theme";

import Icon from "../../assets/iconfont";



function ProtocolPopover({ modalparams }: any): React.JSX.Element {

	const insets = useSafeAreaInsets();

	const { modalkey, type, title } = modalparams;
	// 数据
	const [protocol, setProtocol] = React.useState<string>(""); // 协议

	React.useEffect(() => {
		StatusBar.setBarStyle("dark-content", true);
		if (type == "jfrule") {
			http.get(ENV.points + "?method=rules").then((resp_data: any) => {
				setProtocol(
					`<html>
						<head><style>
							*{padding:0;margin:0;}
							.content{padding:15px;padding-bottom:100px;}
							div{font-size:14px;color:${theme.text2};}
						</style></head>
						<body><div class="content">${resp_data.msg}</div></body>
					</html>`
				);
			}).catch((error: any) => { });
		} else {
			http.get(ENV.terms + "?method=" + type, "text").then((resp_data: any) => {
				resp_data = resp_data.replace(/\n|\\n/g, "<p>");
				setProtocol(
					`<html>
						<head><style>
							*{padding:0;margin:0;}
							.content{padding:15px;padding-bottom:50px;}
							div{font-size:13px;line-height:20px;color:${theme.text1};text-indent:26px;}
						</style></head>
						<body><div class="content">${resp_data}</div></body>
					</html>`
				);
			}).catch((error: any) => { });
		}
	}, [])

	return (
		<View style={Globalstyles.container}>
			<View style={[styles.title_con, { paddingTop: insets.top }]}>
				<Icon name="leftarrow" size={20} color={theme.text2} style={Globalstyles.title_icon}
					onPress={() => {
						ModalPortal.dismiss(modalkey);
						StatusBar.setBarStyle("default", true);
					}}
				/>
				<Text style={styles.title_text}>{title}</Text>
				<View style={Globalstyles.title_icon}></View>
			</View>
			<WebView originWhitelist={["*"]}
				scalesPageToFit={false}
				setBuiltInZoomControls={false}
				scrollEnabled={false}
				source={{ html: protocol }}
			/>
		</View>
	);
}
const styles = StyleSheet.create({
	title_con: {
		backgroundColor: theme.toolbarbg,
		flexDirection: "row",
		alignItems: "flex-end",
		justifyContent: "space-between",
		zIndex: 1,
	},
	title_text: {
		height: 44,
		lineHeight: 44,
		fontSize: 16,
		fontWeight: "500",
		fontFamily: "PingFang SC",
		color: theme.text2,
	},
})

export default ProtocolPopover;