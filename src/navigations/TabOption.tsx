import { StyleSheet, Text, View } from "react-native";
import HomeUnCheck from "../assets/svg/tabs/home_uncheck.svg";
import HomeChecked from "../assets/svg/tabs/home_checked.svg";
import SmartUnCheck from "../assets/svg/tabs/smart_uncheck.svg";
import SmartChecked from "../assets/svg/tabs/smart_checked.svg";
import SocialUnCheck from "../assets/svg/tabs/social_uncheck.svg";
import SocialChecked from "../assets/svg/tabs/social_checked.svg";
import MallUnCheck from "../assets/svg/tabs/mall_uncheck.svg";
import MallChecked from "../assets/svg/tabs/mall_checked.svg";
import UserUnCheck from "../assets/svg/tabs/user_uncheck.svg";
import UserChecked from "../assets/svg/tabs/user_checked.svg";
import theme from "../configs/theme";

// TabOption 配置
const TabOption = (route: any) => {
	let imgSource: any;

	return {
		headerShown: false,
		tabBarIcon: ({ focused }: any) => {
			// 根据路由名称设置图标和样式
			switch (route.name) {
				case "Home":
					imgSource = focused ? <HomeChecked width={styles.iconhome.width} height={styles.iconhome.height} /> : <HomeUnCheck width={styles.iconhome.width} height={styles.iconhome.height} />;
					break;
				case "Smart":
					imgSource = focused ? <SmartChecked width={styles.iconsvg.width} height={styles.iconsvg.height} /> : <SmartUnCheck width={styles.iconsvg.width} height={styles.iconsvg.height} />;
					break;
				case "Social":
					imgSource = focused ? <View style={styles.iconsocialcon}><SocialChecked width={styles.iconsocial.width} height={styles.iconsocial.height} /></View> : <SocialUnCheck width={styles.iconsvg.width} height={styles.iconsvg.height} />;
					break;
				case "Mall":
					imgSource = focused ? <MallChecked width={styles.iconsvg.width} height={styles.iconsvg.height} /> : <MallUnCheck width={styles.iconsvg.width} height={styles.iconsvg.height} />;
					break;
				case "User":
					imgSource = focused ? <UserChecked width={styles.iconsvg.width} height={styles.iconsvg.height} /> : <UserUnCheck width={styles.iconsvg.width} height={styles.iconsvg.height} />;
					break;
			}
			// 设置图标样式
			return imgSource;
		},
		tabBarActiveTintColor: "#5763BD",
		tabBarInactiveTintColor: "#4D4D4D",
		tabBarLabel: ({ focused, color, children }: any) => {
			if (route.name === "Social" && focused) {
				return ""; // 设置空标题
			}
			return <Text style={{ color: color, fontSize: 12, fontWeight: "500" }}>{children}</Text>; // 其他情况返回默认标题
		},
		tabBarIconStyle: {
			flex: 1,
		},
	}
};
const styles = StyleSheet.create({
	iconsvg: {
		width: 22,
		height: 22,
	},
	iconhome: {
		width: 30,
		height: 30,
	},
	iconsocialcon: {
		width: 56,
		height: 56,
		backgroundColor: theme.toolbarbg,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 31.5,
		top: -3
	},
	iconsocial: {
		width: 45,
		height: 45,
	},
	btn_badge: {
		width: 12,
		height: 12,
	}
});
export default TabOption;