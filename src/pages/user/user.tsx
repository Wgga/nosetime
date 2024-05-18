import React from "react";
import { View, Text } from "react-native";

function User({ navigation }: any): React.JSX.Element {
	return (
		<View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
			<Text>User!</Text>
		</View>
	);
}

export default User;