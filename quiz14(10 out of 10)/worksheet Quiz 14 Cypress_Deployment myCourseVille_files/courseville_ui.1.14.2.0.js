$(document).ready(function(){
	cvui_initSlidingPane();
	cvui_initModal();
	cvui_initTabList();
	cvui_initCollapseControl();
	cvui_initRadioWrapper();
	cvui_initPopupmenu();
});
function cvui_initPopupmenu(){
	$(document).on("click",".cvui-popupmenu-launcher",function(e){
		e.preventDefault();
		let popup = $("#"+$(this).attr("data-popupid"));
		cvui_createTemplateForPopupmenu(popup);
		popup.detach().appendTo($("body"));
		if(popup.attr("data-shown")=="1" && popup.attr("data-launcher")==$(this).attr("id")){
			cvui_HidePopupmenu(popup);
		}else{
			cvui_moveUpdateAndShowPopupmenu(popup,$(this));
		}
		popup.attr("data-launcher",$(this).attr("id"));
	});
	$(document).on("focusout",".cvui-popupmenu",function(e){
		let popup = $(this);
		setTimeout(function(){
			if($(document.activeElement).closest(popup).length==0){
				cvui_HidePopupmenu(popup);
			}
		},200);
	});
	function cvui_createTemplateForPopupmenu(popup){
		if(popup.find("[data-part='template']").length==0){
			let orgUL = popup.children("ul").clone();
			orgUL.attr("data-part","template").attr("aria-hidden","true").css({position:"absoute",width:0,height:0});
			popup.append(orgUL);
		}
	}
}
function cvui_moveUpdateAndShowPopupmenu(popup,launcher){
	cvui_updatePopupmenuParams();
	popup.css("position","absolute");
	let rect = launcher[0].getBoundingClientRect(),
	scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
	scrollTop = window.pageYOffset || document.documentElement.scrollTop;
	cvui_removePopupmenuHiddenItems();
	popup.fadeIn();
	let popuprect = popup[0].getBoundingClientRect();
	popup.attr("data-shown","1").css({top:(rect.bottom+scrollTop)+"px",left:(rect.right+scrollLeft-popuprect.width)+"px"});
	popup.focus();

	function cvui_updatePopupmenuParams(){
		let orgULHtml = popup.children("[data-part='template']").html();
		launcher.find("[data-part='params'] > input[data-key]").each(function(){
			orgULHtml = orgULHtml.replace("%%%"+$(this).attr("data-key")+"%%%",$(this).val());
		});
		popup.children("ul").first().html(orgULHtml);
	}
	function cvui_removePopupmenuHiddenItems(){
		launcher.find("[data-part='hidden-items'] > input").each(function(){
			popup.children("ul").first().find("[data-itemid='"+$(this).val()+"']").remove();
		});
	}
}
function cvui_HideAllPopupmenu(){
	$(".cvui-popupmenu").hide();
}
function cvui_HidePopupmenu(popup){
	popup.hide().attr("data-shown","0");
}
function cvui_initCollapseControl(){
	$(document).on("click",".cvui-collapsecontrol",function(e){
		e.preventDefault();
	});
}
function cvui_initSlidingPane(){
	$.fn.extend({
		cvuiSlidingPane:cvuiSlidingPane,
	});
	$(document).on("click",".cvui-slidingpane .cvui-slidingpane-slideto-button",function(){
		var targetID = $(this).attr("data-target");
		$(this).parents(".cvui-slidingpane").first().cvuiSlidingPane("slideTo",targetID);
	});
}
function cvuiSlidingPane(){
	if(!$(this).hasClass("cvui-slidingpane")){
		return false;
	}else if(arguments.length<=0){
		return false;
	}
	var cmd = arguments[0];
	if(cmd=="slideTo"){
		return cvuiSlidingPane_slideTo($(this),arguments[1]);		
	}else{
		return false;
	}
}
function cvuiSlidingPane_slideTo(element,toPane){
	var target = 0;
	var panes = element.find(".cvui-slidingpane-panecontainer").first().find(".cvui-slidingpane-pane");
	if(panes.length>0){
		if(typeof(toPane)=="number"){
			target = parseInt(toPane);
		}else if(typeof(toPane)=="string"){
			var i;
			var found = false;
			for(i=0;i<panes.length;i++){
				if($(panes[i]).attr("id")==toPane){
					target = i;
					found = true;
					break;
				}
			}
			if(!found) return false;
		}else{
			return false;
		}
		if(target<panes.length){
			element.find(".cvui-slidingpane-panecontainer").css("transform","translateX(-"+(target*5)+"%)");
		}else{
			return false;
		}
	}else{
		return false;
	}
}
function cvui_initModal(){
    $(document).on("hidden.bs.modal",".cvui-modal",function(){
        $(this).find(".modal-title").html("");
        $(this).find(".modal-body [data-role=\"info\"]").hide();
        $(this).find(".modal-body [data-role=\"content\"]").html("");
        $(this).find(".modal-body [data-role=\"pre-content\"]").html("");
        $(this).find(".modal-body [data-role=\"post-content\"]").html("");
		$(this).attr("data-state","restored");
		$(this).attr("aria-modal","false");
	});
	$(document).on("shown.bs.modal",".cvui-modal",function(){
		$(this).attr("aria-modal","true");
	});
    $(document).on("click",".cvui-modal [data-role=\"maximize-modal\"]",function(){
        $(this).closest(".cvui-modal").attr("data-state","maximized");
    });
    $(document).on("click",".cvui-modal [data-role=\"restore-modal\"]",function(){
        $(this).closest(".cvui-modal").attr("data-state","restored");
    });
    $(document).on("click",".cvui-modal-open",function(){
    	var launcher = $(this);
	    var modal = $($(this).attr("data-target"));
	    if($(this).hasClass("cvui-modal-execute")){
	        var action = $(this).attr("data-action");
	        modal.one("shown.bs.modal",function(){
	            window[action](launcher);
	        });
	    }
	    modal.find(".modal-body [data-role=\"spinner\"]").show();
	    modal.modal("show");
    });
}
function cvui_initTabList(){
	$(document).on("click",".cvui-tablist-tab[aria-selected='false']",function(){
		var tab = $(this);
		var tablist = $(this).closest(".cvui-tablist");
		tablist.children(".cvui-tablist-tab").each(function(){
			$(this).attr("aria-selected","false").attr("tabindex","0");
			$("#"+$(this).attr("aria-controls")).fadeOut(200);
		});
		$(this).attr("aria-selected","true").attr("tabindex","-1");
		setTimeout(function(){
			$("#"+tab.attr("aria-controls")).fadeIn();
		},500);
	});
}
function cvui_initRadioWrapper(){
	$(document).on("click",".cvui-radio-wrapper",function(){
		let radioName = $(this).attr("data-radioname");
		$(".cvui-radio-wrapper[data-radioname='"+radioName+"'] input[type='checkbox']").prop("checked",false);
		$(this).find("input[type='checkbox']").prop("checked",true);		
	});
}