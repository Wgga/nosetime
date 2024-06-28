/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from "react";
import { StyleSheet } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import SplashScreen from "react-native-splash-screen";
import Orientation from "react-native-orientation-locker";
import { ModalPortal } from "./src/components/modals";
import { SafeAreaProvider } from "react-native-safe-area-context";

import Route from "./src/navigations/route";

import us from "./src/services/user-service/user-service";

import http from "./src/utils/api/http";

import cache from "./src/hooks/storage";
import events from "./src/hooks/events";

import { ENV } from "./src/configs/ENV";

function App(): React.JSX.Element {

	React.useEffect(() => {
		initializeApp();
		setTimeout(() => { SplashScreen.hide() }, 1000);
		events.subscribe("nosetime_tokenerr", () => {
			console.log('TOKEN ERR, delUser');
			us.delUser();
		});

		// Orientation.lockToPortrait();
		return () => {
			events.unsubscribe("nosetime_tokenerr");
		}
	}, [])

	const initializeApp = () => {
		setTimeout(() => { checkUpdate() }, 500);
	}

	const checkUpdate = () => {
		let AppVersion = ENV.AppMainVersion + "." + ENV.AppMiniVersion + "." + ENV.AppBuildVersion;
		http.post(ENV.api + ENV.update, { uid: us.user.uid, did: us.did, ver: AppVersion }).then((resp_data: any) => {
			events.publish("userupdatedata", resp_data);
			cache.saveItem("userupdatedata", resp_data, 24 * 3600);

			if (us.isandroid && resp_data.cdn) {
				/* // TODO
				this.push.ping(resp_data.cdn, (res) => {
					this.http.post(ENV.api + ENV.usage, { 'method': 'cdn', data: res }).subscribe((resp_data: any) => { });
				}, (e) => { }) */
			}
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
