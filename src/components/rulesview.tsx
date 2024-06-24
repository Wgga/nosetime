import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";

import http from "../utils/api/http";

import cache from "../hooks/storage";
import events from "../hooks/events";

import theme from "../configs/theme";
import { ENV } from "../configs/ENV";
import { Globalstyles } from "../configs/globalstyles";

import Icon from "../assets/iconfont";
import RulesPopover from "./popover/rules-popover";
import { ModalPortal, SlideAnimation } from "./modals";

const { width, height } = Dimensions.get("window");

function RulesView({ rules, tip }: any): React.JSX.Element {

	// 控件
	// 变量
	// 数据
	// 参数
	// 状态

	const openRule = (params: any) => {
		ModalPortal.show((
			<RulesPopover modalparams={params} />
		), {
			key: params.modalkey,
			width,
			rounded: false,
			useNativeDriver: true,
			modalAnimation: new SlideAnimation({
				initialValue: 0,
				slideFrom: "bottom",
				useNativeDriver: true,
			}),
			onTouchOutside: () => {
				ModalPortal.dismiss(params.modalkey);
			},
			swipeDirection: "down",
			animationDuration: 300,
			type: "bottomModal",
			modalStyle: { backgroundColor: "transparent" },
		})
	}

	return (
		<View style={{ height: 50 }}>
			<Pressable style={styles.footer_btn} onPress={() => {
				openRule({ rulesdata: rules, modalkey: "socialrule_popover" });
			}}>
				<Text style={styles.footerbtn_text}>{tip}</Text>
				<Icon name="tixing" size={14} color={theme.placeholder} />
			</Pressable>
		</View>
	);
}

const styles = StyleSheet.create({
	footer_btn: {
		height: "100%",
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "center",
	},
	footerbtn_text: {
		fontSize: 12,
		color: theme.placeholder,
		marginRight: 5,
	}
});

export default RulesView;