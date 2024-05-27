import React from "react";
import { View } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ArticleDetail from "../pages/article/article-detail";

import Login from "../pages/user/login";
import Protocol from "../pages/user/protocol";
import UserDetail from "../pages/user/user-detail";
import UserJifen from "../pages/user/user-jifen";
import UserSetting from "../pages/user/user-setting";
import UserUnregister from "../pages/user/user-unregister";
import UserFeedback from "../pages/user/user-feedback";

import Search from "../pages/search/search";
import SearchResult from "../pages/search/search-result";

import ItemDetail from "../pages/item/item-detail";

import SocialShequDetail from "../pages/social/social-shequ-detail";

import WikiDetail from "../pages/wiki/wiki-detail";

import MediaListDetail from "../pages/media/media-list-detail";
import PicList from "../pages/media/pic-list";

import MallGroup from "../pages/mall/mall-group";
import MallHeji from "../pages/mall/mall-heji";
import MallItem from "../pages/mall/mall-item";
import MallAddress from "../pages/mall/mall-address";
import MallAddressEdit from "../pages/mall/mall-address-edit";

const Stack = createNativeStackNavigator();

function Page(): React.JSX.Element {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="ArticleDetail" component={ArticleDetail} />

			<Stack.Screen name="Login" component={Login} />
			<Stack.Screen name="Protocol" component={Protocol} />
			<Stack.Screen name="UserDetail" component={UserDetail} />
			<Stack.Screen name="UserJifen" component={UserJifen} />
			<Stack.Screen name="UserSetting" component={UserSetting} />
			<Stack.Screen name="UserUnregister" component={UserUnregister} />
			<Stack.Screen name="UserFeedback" component={UserFeedback} />

			<Stack.Screen name="Search" component={Search} />
			<Stack.Screen name="SearchResult" component={SearchResult} />

			<Stack.Screen name="ItemDetail" component={ItemDetail} />

			<Stack.Screen name="SocialShequDetail" component={SocialShequDetail} />

			<Stack.Screen name="WikiDetail" component={WikiDetail} />

			<Stack.Screen name="MediaListDetail" component={MediaListDetail} />
			<Stack.Screen name="PicList" component={PicList} />

			<Stack.Screen name="MallGroup" component={MallGroup} />
			<Stack.Screen name="MallHeji" component={MallHeji} />
			<Stack.Screen name="MallItem" component={MallItem} />
			<Stack.Screen name="MallAddress" component={MallAddress} />
			<Stack.Screen name="MallAddressEdit" component={MallAddressEdit} />
		</Stack.Navigator>
	);
}

export default Page;