import React from "react";
import { View, Text, StyleSheet, Pressable, StatusBar } from "react-native";
import theme from "../../configs/theme";
function MallGroup({ navigation }: any): React.JSX.Element {
	return (
		<View style={{ flex: 1, backgroundColor: theme.toolbarbg }}>
			<Text>MallGroup!</Text>
		</View>
	);
}
const styles = StyleSheet.create({
});
export default MallGroup;