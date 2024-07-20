import React from "react";

import { View, Text, Image } from "react-native";

function HandleDesc({ containerStyle, itemStyle, type, item, itemKey }: any): React.JSX.Element {

	// 控件
	// 参数
	// 变量
	// 数据
	// 状态

	const handledesc = (desc: string) => {
		let sz: any[] = [];
		if (type == "image") {
			let regex = /<img[^>]+src="([^"]+)">/g;
			let match;
			while (match = regex.exec(desc)) {
				sz.push(<Image key={match[1]} style={itemStyle} source={{ uri: match[1] }} />);
			}
		} else {
			sz = desc.replace(/\r/g, "").replace(/\n\n/g, "\n").split(/\n/g).map((item: string, index: number) => {
				return (<Text key={index} style={itemStyle}>{item}</Text>)
			})
		}
		return sz;
	};

	return (
		<View style={containerStyle}>{handledesc(item[itemKey])}</View>
	);
}

export default HandleDesc;