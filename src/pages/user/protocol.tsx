import React from "react";
import { View, StyleSheet } from "react-native";

import { WebView } from "react-native-webview";

import http from "../../utils/api/http";
import { ENV } from "../../configs/ENV";
import theme from "../../configs/theme";

import HeaderView from "../../components/headerview";
import { ModalPortal } from "../../components/modals";

function Protocol({ navigation, route }: any): React.JSX.Element {

	// 参数
	const { type, title } = route.params;

	// 变量
	const [protocol, setProtocol] = React.useState<string>(""); // 协议

	React.useEffect(() => {
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
		<View style={{ width: "100%", height: "100%" }}>
			<HeaderView
				data={{
					title,
					isShowSearch: false,
				}}
				method={{
					back: () => { navigation.goBack()},
				}} />
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
})

export default Protocol;