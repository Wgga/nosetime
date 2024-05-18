import { createIconSet } from "react-native-vector-icons";

const getIconOption = () => {
	let glyphMap: any = require("./icon.json");
	return {
		glyphMap,
		fontFamily: "iconfont",
	}
}
const { glyphMap, fontFamily } = getIconOption();
const Icon = createIconSet(glyphMap, fontFamily, "iconfont.ttf");

export default Icon;