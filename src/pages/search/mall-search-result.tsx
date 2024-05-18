import React from "react";
import { View, Text, StyleSheet, Pressable, StatusBar } from "react-native";

import theme from "../../configs/theme";
import HeaderView from "../../components/headerview";

function MallSearchResult({ navigation }: any): React.JSX.Element {
	return (
		<View style={{ flex: 1, backgroundColor: theme.toolbarbg }}>
			<HeaderView title={""} back={() => { navigation.goBack() }} />
			<Text>MallSearchResult!</Text>
		</View>
	);
}
const styles = StyleSheet.create({
});
export default MallSearchResult;