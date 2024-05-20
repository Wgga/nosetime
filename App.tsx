/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React from "react";
import { StyleSheet, PanResponder, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";

import SplashScreen from "react-native-splash-screen";
import Orientation from "react-native-orientation-locker";
import { ModalPortal } from "./src/components/modals";
import { SafeAreaProvider } from 'react-native-safe-area-context';

import Route from "./src/navigations/route";

function App(): React.JSX.Element {

	React.useEffect(() => {
		setTimeout(() => {
			SplashScreen.hide();
		}, 1000);
		// Orientation.lockToPortrait();
	}, [])

	return (
		<React.Fragment>
			<SafeAreaProvider>
				<NavigationContainer>
					<Route />
				</NavigationContainer>
				<ModalPortal />
			</SafeAreaProvider>
		</React.Fragment>
	);
}

const styles = StyleSheet.create({

});

export default App;
