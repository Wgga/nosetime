import React from "react";
import { View, Text, StyleSheet, Pressable, StatusBar } from "react-native";
import theme from "../../configs/theme";
function MallHeji({ navigation }: any): React.JSX.Element {
	return (
		<View style={{ flex: 1, backgroundColor: theme.toolbarbg }}>
			<Text>MallHeji!</Text>
		</View>
	);
}
const styles = StyleSheet.create({
});
export default MallHeji;