import React from "react";
import { View, StyleSheet, Pressable, Text, StatusBar } from "react-native";

import { WebView } from "react-native-webview";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import http from "../../utils/api/http";
import { ENV } from "../../configs/ENV";
import theme from "../../configs/theme";

import Icon from "../../assets/iconfont";

import HeaderView from "../../components/headerview";
import { ModalPortal } from "../../components/modals";


function ProtocolPopover({ modalparams }: any): React.JSX.Element {

	const insets = useSafeAreaInsets();

	const { modalkey, type, title } = modalparams;
	// 数据
	const [protocol, setProtocol] = React.useState<string>(""); // 协议

	React.useEffect(() => {
		StatusBar.setBarStyle("dark-content", true);
		http.get(ENV.api + ENV.terms + "?method=" + type, "text").then((resp_data: any) => {
			resp_data = resp_data.replace(/\n|\\n/g, "<p>");
			setProtocol(
				`<html><head>
				<style>.content{padding:15px;padding-bottom:50px;} div{font-size:13px;line-height:20px;color:${theme.text1};text-indent:26px;}</style>
				</head><body><div class="content">${resp_data}</div></body></html>`
			);
		}).catch((error: any) => { })
	}, [])

	return (
		<View style={{ flex: 1 }}>
			<View style={[styles.title_con, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
				<Pressable style={{ zIndex: 1 }} onPress={() => {
					ModalPortal.dismiss(modalkey);
					StatusBar.setBarStyle("default", true);
				}}>
					<Icon name="leftarrow" size={20} color={theme.text2} style={styles.title_icon} />
				</Pressable>
				<Text style={styles.title_text}>{title}</Text>
				<View style={styles.title_icon}></View>
			</View>
			<WebView
				originWhitelist={["*"]}
				scalesPageToFit={false}
				setBuiltInZoomControls={false}
				scrollEnabled={false}
				source={{ html: protocol }} />
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
	title_icon: {
		width: 44,
		height: 44,
		textAlign: "center",
		lineHeight: 44,
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