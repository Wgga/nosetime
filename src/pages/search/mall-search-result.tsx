import React from "react";

import { View, Text, StyleSheet, Pressable, Dimensions } from "react-native";

import HeaderView from "../../components/view/headerview";

import us from "../../services/user-service/user-service";
import searchService from "../../services/search-service/search-service";

import http from "../../utils/api/http";

import cache from "../../hooks/storage";
import events from "../../hooks/events";

import theme from "../../configs/theme";
import { ENV } from "../../configs/ENV";
import { Globalstyles } from "../../utils/globalmethod";

import Icon from "../../assets/iconfont";

const { width, height } = Dimensions.get("window");

function MallSearchResult({ navigation, route }: any): React.JSX.Element {

	// 控件
	// 参数
	const { shword, shtype, cid, holder } = route.params;
	// 变量
	const [searchword, setSearchword] = React.useState<string>(shword);
	// 数据
	// 状态

	React.useEffect(() => {

	}, [])

	const Search = () => {
		if (shword == searchword) {
			return;
		}
		if (searchword != "") {
			init(searchword);
		}
	}

	const init = (val: string) => {
		searchService.addHistory(val);
		searchService.fetch("mall", val, "init");
	}

	return (
		<View style={Globalstyles.container}>
			<HeaderView data={{
				title: "",
				placeholder: holder,
				word: searchword,
				isShowSearch: true,
				isautoFocus: false
			}} method={{
				fun: () => { navigation.goBack() },
				setWord: (wordval: string) => {
					setSearchword(wordval);
				},
				Search,
				back: () => { navigation.goBack() },
			}} />
		</View>
	);
}

const styles = StyleSheet.create({
});

export default MallSearchResult;