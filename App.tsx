/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from "react";
import { StyleSheet, NativeEventEmitter } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import SplashScreen from "react-native-splash-screen";
import Orientation from "react-native-orientation-locker";
import { ModalPortal } from "./src/components/modals";
import { SafeAreaProvider } from "react-native-safe-area-context";
import SystemNavigationBar from "react-native-system-navigation-bar";

import Route from "./src/navigations/route";

import { ENV } from "./src/configs/ENV";

import http from "./src/utils/api/http";
import us from "./src/services/user-service/user-service";
import cache from "./src/hooks/storage/storage";

function App(): React.JSX.Element {

	const events = new NativeEventEmitter();

	React.useEffect(() => {
		setTimeout(() => {
			SplashScreen.hide();
			initializeApp();
		}, 1000);
		// Orientation.lockToPortrait();
	}, [])

	const initializeApp = () => {
		if (SystemNavigationBar) {
			// SystemNavigationBar.setFitsSystemWindows(false);
			// SystemNavigationBar.setNavigationColor("transparent");
		}
		let AppVersion = ENV.AppMainVersion + '.' + ENV.AppMiniVersion + '.' + ENV.AppBuildVersion;
		http.post(ENV.api + ENV.update, { uid: us.user.uid, did: us.did, ver: AppVersion }).then((resp_data: any) => {
			events.emit("userupdatedata", resp_data);
			cache.saveItem("userupdatedata", resp_data, 24 * 3600);
		})
	}

	return (
		<SafeAreaProvider>
			<React.Fragment>
				<NavigationContainer>
					<Route />
				</NavigationContainer>
				<ModalPortal />
			</React.Fragment>
		</SafeAreaProvider>
	);
}

const styles = StyleSheet.create({

});

export default App;
