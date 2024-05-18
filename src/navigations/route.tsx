import React from "react";
import { useColorScheme, StyleSheet, StatusBar } from "react-native";

import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Tabs from "../navigations/tabs";
import Page from "../navigations/page";

const Stack = createNativeStackNavigator();
function Route(): React.JSX.Element {
	const [isDarkMode, setIsDarkMode] = React.useState(false);

	let navigation = useNavigation() as any;
	useFocusEffect(
		React.useCallback(() => {
			const urlRegex = ["ItemDetail", "Login", "MallHeji", "MallBrand", "User", "Home", "MallGroup", "Lottery", "MallOrderDetail"];
			const unsubscribe = navigation.addListener("state", () => {
				let isMatched = urlRegex.find((item) => { return item == navigation.getCurrentRoute().name });
				// 根据当前路由的URL来动态改变StatusBar的颜色
				if (isMatched != undefined) {
					setIsDarkMode(true);
				} else {
					setIsDarkMode(false);
				}
			});

			return unsubscribe;
		}, [])
	);

	return (
		<>
			<StatusBar
				barStyle={isDarkMode ? "light-content" : "dark-content"}
				backgroundColor="transparent"
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