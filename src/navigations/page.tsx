import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import ArticleDetail from "../pages/article/article-detail";

import Search from "../pages/search/search";
import SearchResult from "../pages/search/search-result";
import Scanner from "../pages/scanner";

import ItemDetail from "../pages/item/item-detail";
import ItemVote from "../pages/item/item-vote";

import MediaListDetail from "../pages/media/media-list-detail";
import PicList from "../pages/media/pic-list";

import WikiDetail from "../pages/smart/wiki-detail";
import Talent from "../pages/smart/talent";
import Top from "../pages/smart/top";

import PerfumeListSquare from "../pages/perfume/perfume-list-square";
import PerfumeListTag from "../pages/perfume/perfume-list-tag";
import PerfumeListEdit from "../pages/perfume/perfume-list-edit";
import PerfumeList from "../pages/perfume/perfume-list";

import SocialShequDetail from "../pages/social/social-shequ-detail";
import SocialShequPost from "../pages/social/social-shequ-post";
import SocialXiaoxi from "../pages/social/social-xiaoxi";
import SocialSixinDetail from "../pages/social/social-sixin-detail";

import MallGroup from "../pages/mall/mall-group";
import MallHeji from "../pages/mall/mall-heji";
import MallItem from "../pages/mall/mall-item";
import MallAddress from "../pages/mall/mall-address";
import MallAddressEdit from "../pages/mall/mall-address-edit";
import MallIdcardEdit from "../pages/mall/mall-idcard-edit";
import MallCoupon from "../pages/mall/mall-coupon";
import MallWishList from "../pages/mall/mall-wishlist";
import MallKefu from "../pages/mall/mall-kefu";

import Login from "../pages/user/login";
import Protocol from "../pages/user/protocol";
import Lottery from "../pages/user/lottery";
import UserDetail from "../pages/user/user-detail";
import UserJifen from "../pages/user/user-jifen";
import UserSetting from "../pages/user/user-setting";
import UserUnregister from "../pages/user/user-unregister";
import UserFeedback from "../pages/user/user-feedback";
import UserChangeInfo from "../pages/user/user-change-info";
import UserChangeSignPerfume from "../pages/user/user-change-sign-perfume";
import UserChangeDesc from "../pages/user/user-change-desc";
import UserCart from "../pages/user/user-cart";
import UserFav from "../pages/user/user-fav";
import UserShequ from "../pages/user/user-shequ";
import UserIntro from "../pages/user/user-intro";
import UserLevelIntro from "../pages/user/user-level-intro";
import UserDiscuss from "../pages/user/user-discuss";
import UserFriend from "../pages/user/user-friend";

const Stack = createNativeStackNavigator();

function Page(): React.JSX.Element {
	return (
		<Stack.Navigator screenOptions={{ headerShown: false }}>
			<Stack.Screen name="ArticleDetail" component={ArticleDetail} />

			<Stack.Screen name="Search" component={Search} />
			<Stack.Screen name="SearchResult" component={SearchResult} />
			<Stack.Screen name="Scanner" component={Scanner} />

			<Stack.Screen name="ItemDetail" component={ItemDetail} />
			<Stack.Screen name="ItemVote" component={ItemVote} />

			<Stack.Screen name="MediaListDetail" component={MediaListDetail} />
			<Stack.Screen name="PicList" component={PicList} />

			<Stack.Screen name="WikiDetail" component={WikiDetail} />
			<Stack.Screen name="Talent" component={Talent} />
			<Stack.Screen name="Top" component={Top} />

			<Stack.Screen name="PerfumeListSquare" component={PerfumeListSquare} />
			<Stack.Screen name="PerfumeListTag" component={PerfumeListTag} />
			<Stack.Screen name="PerfumeListEdit" component={PerfumeListEdit} />
			<Stack.Screen name="PerfumeList" component={PerfumeList} />

			<Stack.Screen name="SocialShequDetail" component={SocialShequDetail} />
			<Stack.Screen name="SocialShequPost" component={SocialShequPost} />
			<Stack.Screen name="SocialXiaoxi" component={SocialXiaoxi} />
			<Stack.Screen name="SocialSixinDetail" component={SocialSixinDetail} />

			<Stack.Screen name="MallGroup" component={MallGroup} />
			<Stack.Screen name="MallHeji" component={MallHeji} />
			<Stack.Screen name="MallItem" component={MallItem} />
			<Stack.Screen name="MallAddress" component={MallAddress} />
			<Stack.Screen name="MallAddressEdit" component={MallAddressEdit} />
			<Stack.Screen name="MallIdcardEdit" component={MallIdcardEdit} />
			<Stack.Screen name="MallCoupon" component={MallCoupon} />
			<Stack.Screen name="MallWishList" component={MallWishList} />
			<Stack.Screen name="MallKefu" component={MallKefu} />

			<Stack.Screen name="Login" component={Login} />
			<Stack.Screen name="Protocol" component={Protocol} />
			<Stack.Screen name="Lottery" component={Lottery} />
			<Stack.Screen name="UserDetail" component={UserDetail} />
			<Stack.Screen name="UserJifen" component={UserJifen} />
			<Stack.Screen name="UserSetting" component={UserSetting} />
			<Stack.Screen name="UserUnregister" component={UserUnregister} />
			<Stack.Screen name="UserFeedback" component={UserFeedback} />
			<Stack.Screen name="UserChangeInfo" component={UserChangeInfo} />
			<Stack.Screen name="UserChangeSignPerfume" component={UserChangeSignPerfume} />
			<Stack.Screen name="UserChangeDesc" component={UserChangeDesc} />
			<Stack.Screen name="UserCart" component={UserCart} />
			<Stack.Screen name="UserFav" component={UserFav} />
			<Stack.Screen name="UserShequ" component={UserShequ} />
			<Stack.Screen name="UserIntro" component={UserIntro} />
			<Stack.Screen name="UserLevelIntro" component={UserLevelIntro} />
			<Stack.Screen name="UserDiscuss" component={UserDiscuss} />
			<Stack.Screen name="UserFriend" component={UserFriend} />
		</Stack.Navigator>
	);
}

export default Page;