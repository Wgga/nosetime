import React from "react";

import { Text, StyleSheet, Pressable, Dimensions } from "react-native";

import theme from "../../configs/theme";

import Icon from "../../assets/iconfont";
import RulesPopover from "../popover/rules-popover";
import { ModalPortal } from "../modals";

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
			onTouchOutside: () => { ModalPortal.dismiss(params.modalkey) },
			onHardwareBackPress: () => {
				ModalPortal.dismiss(params.modalkey);
				return true;
			},
			animationDuration: 300,
			type: "bottomModal",
			modalStyle: { backgroundColor: "transparent" },
		})
	}

	return (
		<Pressable style={styles.footer_btn} onPress={() => {
			openRule({ rulesdata: rules, modalkey: "socialrule_popover" });
		}}>
			<Text style={styles.footerbtn_text}>{tip}</Text>
			<Icon name="tixing" size={14} color={theme.placeholder} />
		</Pressable>
	);
}

const styles = StyleSheet.create({
	footer_btn: {
		height: 50,
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