import React from "react";
import { StyleSheet } from "react-native";

import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import events from "../hooks/events/events";

import TabOption from "./TabOption";
import Home from "../pages/home";
import Smart from "../pages/smart";
import Social from "../pages/social";
import Mall from "../pages/mall";
import User from "../pages/user/user";
import us from "../services/user-service/user-service";

const Tab = createBottomTabNavigator();

function Tabs({ navigation, route }: any): React.JSX.Element {
	// 控件

	let socialfid = React.useRef<number>(0);

	React.useEffect(() => {
		events.subscribe("social_fid", (value: number) => {
			socialfid.current = value;
		});
		return () => {
			events.unsubscribe("social_fid");
		}
	}, [])

	return (
		<>
			<Tab.Navigator
				screenOptions={({ route }: any) => ({
					...TabOption(route),
					tabBarStyle: {
						shadowColor: "transparent",
						borderColor: "transparent",
					},
					tabBarItemStyle: {
						borderColor: "transparent",
						flexDirection: "column",
					},
				})}>
				<Tab.Screen name="Home" options={{ title: "首页" }} component={Home} />
				<Tab.Screen name="Smart" options={{ title: "发现" }} component={Smart} />
				<Tab.Screen name="Social" options={{ title: "圈子" }} listeners={({ navigation, route }: any) => ({
					tabPress: (e: any) => {
						if (navigation.isFocused()) {
							e.preventDefault();
							if (!us.user.uid) {
								return navigation.navigate("Page", { screen: "Login", params: { src: "App圈子页" } });
							}
							if (socialfid.current == 0) {
								socialfid.current = 1;
							}
							navigation.navigate("Page", { screen: "SocialShequPost", params: { fid: socialfid.current } });
						}
					},
				})} component={Social} />
				<Tab.Screen name="Mall" options={{ title: "商城" }} component={Mall} />
				<Tab.Screen name="User" options={{ title: "我的" }} listeners={({ navigation, route }: any) => ({
					tabPress: (e: any) => {
						e.preventDefault();
						if (us.user.uid == 0) {
							navigation.navigate("Page", { screen: "Login", params: { src: "" } });
						} else {
							navigation.navigate("Tabs", { screen: "User" });
						}
					},
				})} component={User} />
			</Tab.Navigator >
		</>
	);
}

const styles = StyleSheet.create({
})

export default Tabs;

