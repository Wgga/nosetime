import React from "react";
import { View, StyleSheet } from "react-native";

import { WebView } from "react-native-webview";

import HeaderView from "../../components/headerview";

import http from "../../utils/api/http";

import { ENV } from "../../configs/ENV";
import theme from "../../configs/theme";

function Protocol({ navigation, route }: any): React.JSX.Element {

	// 参数
	const { type, title } = route.params;

	// 变量
	const [protocol, setProtocol] = React.useState<string>(""); // 协议

	React.useEffect(() => {
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
		<View style={styles.protocol_con}>
			<HeaderView data={{
				title,
				isShowSearch: false,
			}} method={{
				back: () => { navigation.goBack() },
			}} />
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
	protocol_con: {
		flex: 1,
		backgroundColor: theme.toolbarbg,
	}
})

export default Protocol;