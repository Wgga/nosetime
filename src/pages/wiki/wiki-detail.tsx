import React from "react";
import { View, Text, StyleSheet, Pressable, StatusBar } from "react-native";
import theme from "../../configs/theme";
function WikiDetail({ navigation }: any): React.JSX.Element {
	return (
		<View style={{ flex: 1, backgroundColor: theme.toolbarbg }}>
			<Text>WikiDetail!</Text>
		</View>
	);
}
const styles = StyleSheet.create({
});
export default WikiDetail;