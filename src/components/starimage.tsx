import React from "react";
import Stars from "react-native-stars";
import StarUnCheck from "../assets/svg/star/search/star_uncheck.svg";
import StarChecked from "../assets/svg/star/search/star_checked.svg";
import StarHalf from "../assets/svg/star/search/star_half.svg";

function StarImage({ rating, style, children, cname }: any): React.JSX.Element {
	let star = 0;
	const starval = parseInt(rating + 0.5)
	if (starval >= 0 && starval <= 0.5) {
		star = 0;
	} else if (starval > 0.5 && starval <= 1.5) {
		star = 0.5;
	} else if (starval > 1.5 && starval <= 2.5) {
		star = 1;
	} else if (starval > 2.5 && starval <= 3.5) {
		star = 1.5;
	} else if (starval > 3.5 && starval <= 4.5) {
		star = 2;
	} else if (starval > 4.5 && starval <= 5.5) {
		star = 2.5;
	} else if (starval > 5.5 && starval <= 6.5) {
		star = 3;
	} else if (starval > 6.5 && starval <= 7.5) {
		star = 3.5;
	} else if (starval > 7.5 && starval <= 8.5) {
		star = 4;
	} else if (starval > 8.5 && starval <= 9.5) {
		star = 4.5;
	} else {
		star = 5;
	}
	return (
		<>
			<Stars
				default={star}
				count={5}
				half={true}
				disabled={true}
				starSize={20}
				spacing={2}
				fullStar={<StarChecked width={style.width} height={style.height} />}
				emptyStar={<StarUnCheck width={style.width} height={style.height} />}
				halfStar={<StarHalf width={style.width} height={style.height} />}
			/>
		</>
	)
}

export default StarImage;