import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get("window").width;
const uiWidth = 375;

function pxToDp(uiElementPx: number) {
	return (uiElementPx * screenWidth) / uiWidth;
}

const adaptiveStyleSheet = {
	create(styles: any) {
		const transformedStyles = { ...styles };
		const propertiesToAdapt = [
			"width",
			"height",
			"marginTop",
			"marginRight",
			"marginBottom",
			"marginLeft",
			'marginHorizontal',
			'marginVertical',
			"paddingTop",
			"paddingRight",
			"paddingBottom",
			"paddingLeft",
			'paddingHorizontal',
			'paddingVertical',
			"top",
			"right",
			"bottom",
			"left",
			"fontSize",
			"lineHeight",
		];
		for (let key in transformedStyles) {
			const style = transformedStyles[key];
			for (let property in style) {
				if (
					propertiesToAdapt.includes(property) &&
					typeof style[property] === "number"
				) {
					style[property] = pxToDp(style[property]);
				}
			}
		}
		return StyleSheet.create(transformedStyles);
	},
};

export { adaptiveStyleSheet as StyleSheet, pxToDp };