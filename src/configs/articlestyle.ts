
import theme from "./theme";

export const articlestyle = {
	style: `*{padding:0;margin:0;}
	#content{user-select:none;-webkit-user-select:none;-moz-user-select:none;-ms-user-select:none;pointer-events:none;overflow:hidden;}
	#content .article_img{display:block !important;cursor:pointer;line-height:normal;}
	.title,.author{display:none;}
	.content a{pointer-events:auto;text-decoration:none !important;color:#6979bf;-webkit-tap-highlight-color:rgba(255,0,0,0);}
	.content a img,.content p img,.content center img{width:100%;height:auto !important;background-color:${theme.bg};}
	.content p, center {padding-left:0 !important;color:${theme.text2};margin:0;padding:4px 0;line-height:29px;font-size:15px;}
	.content .maintitle{padding-bottom:0;margin-bottom:-3px;}
	.content .subtitle{padding-top:0;}
	.article_editor_first{background-color:rgb(214,92,124);display:inline-block;padding:5px 25px;color:${theme.toolbarbg}}
	.article_editor_second{height:30px;display:flex;align-items:center}
	.article_editor_second div:first-child{border:1px solid rgb(56,99,177);color:rgb(56,99,177);width:30px;height:30px;line-height:30px;box-sizing:border-box;text-align:center}
	.article_editor_second div:last-child{display:flex;align-items:center;height:100%;color:${theme.toolbarbg};text-align:center;padding:5px 20px;box-sizing:border-box;background-color:rgb(56,99,177);border-radius:0 20px 20px 0}
	.article_editor_third{position:relative;overflow:hidden}
	.article_editor_third .third-text{position:relative;color:rgb(95,73,122);display:flex;align-items:center}
	.article_editor_third .third-text div{display:inline-block}
	.article_editor_third .third-text>:nth-child(1)::before,.article_editor_third .third-text>:nth-child(5)::before{content:'';position:absolute;background-color:rgb(128,100,162);transform:skew(-22deg);width:3px;height:10px;z-index:1}
	.article_editor_third .third-text>:nth-child(1)::before{right:0px;top:-1px}
	.article_editor_third .third-text>:nth-child(5)::before{left:2px;bottom:-1px}
	.article_editor_third .third-text>:nth-child(1){margin-right:3px;margin-top:3px;border-top:1px solid rgb(95,73,122)}
	.article_editor_third .third-text>:nth-child(5){margin-left:1px;margin-bottom:3px;border-bottom:1px solid rgb(95,73,122)}
	.article_editor_third .third-text>:nth-child(1),.article_editor_third .third-text>:nth-child(5){width:80px;height:20px;min-width:8px;position:relative}
	.article_editor_third .third-text>:nth-child(2),.article_editor_third .third-text>:nth-child(4){width:4px;height:20px;background-color:rgb(95,73,122);transform:skew(-22deg)}
	.article_editor_third .third-text .info{margin:0 10px}
	.article_editor_fourth{display:inline-block;border:1px solid rgb(128,100,162);border-top:10px solid rgb(128,100,162);padding:5px 20px}
	.article_editor_fifth{position:relative;display:inline-block}
	.article_editor_fifth>div{padding:5px 20px;position:relative;display:inline-block;border:1px solid rgb(73,105,33);background-color:${theme.toolbarbg};color:rgb(73,105,33);box-sizing:border-box;z-index:1;font-size:16px;font-weight:700;letter-spacing:2.5px;min-width:100px;text-align:center}
	.article_editor_fifth::before{content:'';width:100%;height:100%;position:absolute;top:16px;left:10px;border:1px solid rgb(122,153,56);box-sizing:border-box;background-color:rgb(122,153,56);color:rgb(122,153,56)}
	.article_editor_fifth div div:nth-child(n+2){width:7px;height:7px;display:inline-block;border-radius:50%;background-color:${theme.toolbarbg};position:absolute;bottom:-12px}
	.article_editor_fifth div div:nth-child(2){width:calc(100% - 130px);height:1px;display:inline-block;position:absolute;right:66px;bottom:-9px;background-color:${theme.toolbarbg}}
	.article_editor_fifth div div:nth-child(3){right:15px}
	.article_editor_fifth div div:nth-child(4){right:30px}
	.article_editor_fifth div div:nth-child(5){right:44px}
	.article_editor_fifth div div:nth-child(6){right:60px}
	.discenter{display:flex;justify-content:center}
	.disleft{display:flex;justify-content:left}
	.vote_list{padding:24px 14px 18px;background-color:${theme.bg};border-radius:5px;margin-bottom:19px;}
	.vote_list>span{display:block;text-align:center;line-height:normal;}
	.vote_tit{color:${theme.text2};font-size:15px;font-weight:500;}
	.vote_desc{margin-top:7px;color:${theme.comment};font-size:12px;}
	.vote_item_con>div,.vote_item .vote_item_msg,.name_con{display:flex;}
	.sel_btn,.vote_item .vote_item_msg img,.item_cname,.item_ename,.vote_btn{pointer-events: auto;}
	.vote_item_con{margin-top:26px;}
	.vote_item_con>div{margin-bottom:8px;}
	.vote_item,.name_con{flex:1;}
	.vote_item,.sel_btn{background-color:${theme.toolbarbg};border-radius:5px;}
	.vote_item{position:relative;overflow:hidden;}
	.vote_item .vote_item_msg{align-items:center;padding:8px 6px;}
	.vote_item .vote_item_msg img{width:38px;height:38px;object-fit:contain;background-color:${theme.toolbarbg};border-radius:3px;}
	.vote_item .vote_item_msg.textleft{padding:8px 6px 8px 12px;}
	.vote_item_msg{position:relative;z-index:1;}
	.vote_bg{position:absolute;top:0;bottom:0;z-index:0;background-color:${theme.border};}
	.vote_bg.checkedbg{background-color:#bdc4e6;}
	.vote_item_info{flex:1;font-size:13px;color:${theme.text1};}
	.name_con{flex-direction:column;justify-content:space-around;width:0;margin-left:7px;height:100%;line-height:normal;}
	.name_con span{align-self:baseline;white-space:nowrap;text-overflow:ellipsis;overflow:hidden;max-width:100%;}
	.name_con .item_cname{font-size:13px;color:${theme.text1};margin-bottom:1px;}
	.name_con .item_ename{font-size:12px;color:${theme.comment};}
	.vote_num_con.ischecked{color:#6979bf;}
	.vote_num_con{color:${theme.comment};font-size:12px;margin-left:20px;margin-right:8px;}
	.vote_num_con .iconseled{font-size:12px;margin-right:3px;}
	.sel_btn,.sel_btn>span{display:flex;align-items:center;justify-content:center;}
	.sel_btn{width:56px;margin-left:6px;}
	.sel_btn>span{width:14px;height:14px;border:1px solid #bfbfbf;border-radius:50%;}
	.sel_btn .radio.radio_checked::before{content:'';width:60%;height:60%;display:block;border-radius:50%;background-color:#6979bf;}
	.sel_btn .iconseled{color:#6979bf;font-size:11px;width:12px;}
	.vote_message{margin-top:12px;font-size:12px;color:${theme.placeholder};}
	.vote_btn{background-image:${theme.btnLinearGradient};width:200px;padding:8px;text-align:center;margin:13px auto 0;color:${theme.toolbarbg};border-radius:50px;}
	.vote_btn.gary{background-image:none;color:${theme.placeholder};background-color:${theme.border};}
	`
}