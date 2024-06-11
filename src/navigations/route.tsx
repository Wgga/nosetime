import React from "react";
import { BackHandler, StatusBar } from "react-native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import ToastCtrl from "../components/toastctrl";
import { ModalPortal } from "../components/modals";

import Tabs from "../navigations/tabs";
import Page from "../navigations/page";

const Stack = createNativeStackNavigator();

function Route(): React.JSX.Element {
	const [isDarkMode, setIsDarkMode] = React.useState<boolean>(false);
	let exit = React.useRef<boolean>(false);
	let toast = React.useRef<any>(null);

	let navigation = useNavigation() as any;

	useFocusEffect(
		React.useCallback(() => {
			// 监听路由变化改变状态栏颜色
			const urlRegex = [
				"ItemDetail",
				"Login", "User", "UserJifen", "Lottery", "UserFav",
				"MallHeji", "MallBrand", "MallGroup", "MallOrderDetail", "MallCoupon", "MallWishList",
				"Home", "Lottery",
			];
			const unsubscribe = navigation.addListener("state", () => {
				let isMatched = urlRegex.find((item) => { return item == navigation.getCurrentRoute().name });
				// 根据当前路由的URL来动态改变StatusBar的颜色
				if (isMatched != undefined) {
					setIsDarkMode(true);
				} else {
					setIsDarkMode(false);
				}
			});

			// 监听Android物理返回按键
			const TabsRegex = ["Home", "Smart", "Social", "Mall", "User"];
			const onBackPress = () => {
				let isTabs = TabsRegex.find((item) => { return item == navigation.getCurrentRoute().name });
				if (isTabs != undefined) {
					if (exit.current) {
						exit.current = false;
						BackHandler.exitApp();
					}
					if (!toast.current) {
						toast.current = ToastCtrl.show({
							message: "再次返回退出香水时代",
							duration: 2000,
							viewstyle: "medium_toast",
							key: "exit_toast",
							onShow: () => { exit.current = true; },
							onDismiss: () => {
								exit.current = false;
								toast.current = null;
							},
							onTouchOutside: () => { },
							hasOverlay: false,
							modalStyle: { backgroundColor: "transparent" },
						});
					}
				} else {
					navigation.goBack();
				}
				return true;
			}
			const backHandler = BackHandler.addEventListener("hardwareBackPress", onBackPress);

			return () => {
				unsubscribe();
				backHandler.remove();
			};
		}, [isDarkMode])
	);

	return (
		<>
			<StatusBar
				barStyle={isDarkMode ? "light-content" : "dark-content"}
				backgroundColor="transparent"
				animated={true}
				translucent={true}
			/>
			<Stack.Navigator screenOptions={{ headerShown: false }}>
				<Stack.Screen name="Tabs" component={Tabs} />
				<Stack.Screen name="Page" component={Page} />
			</Stack.Navigator>
		</>
	);
}

export default Route;