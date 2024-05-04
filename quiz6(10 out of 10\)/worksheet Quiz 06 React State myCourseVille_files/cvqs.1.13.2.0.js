$(document).ready(function(){
	
});

function prepareQsAnswerSubmission(){
	$("#cvqs-submit-qs-answer").unbind("click");
	$("#cvqs-submit-qs-answer").click(clickSubmitQsAnswer);
}

function clickSubmitQsAnswer(){
	$("#courseville-submit-status").html("Submitting..."+addSpinnerSmall());
    var studentId = $(this).attr("student_id");
    var assignmentId = $(this).attr("assignment_id");
    var isGroup = $(this).attr("is_group");
    var groupId = -1;
    if(isGroup==1){
        groupId = $(this).attr("group_id");
    }
    var answerParams = cvqsCollectAnswers();

    var url = $("#base-url").val()+"?q=cvqs/ajax/submit";
    var params = "assignment_id="+assignmentId+"&student_id="+studentId+"&group_id="+groupId;
    params += answerParams;
    cvqsAjaxPost(url,params,"courseville-submit-status",null);
}

function cvqsCollectAnswers(){
	var answerParams = "";
	$(".cvqs-to-post").each(function(index){
		var qstnType = $(this).attr("qstn_type");
		var qstnNId = $(this).parents(".cvqs-qstn-wrapper").attr("qstn_nid");
        var qsNId = $(this).parents(".cvqs-qs-wrapper").attr("qs_nid");
		if(qstnType=="1"){
            if($(this).attr("[data-inputtype='integer']")){
                answerParams += "&answer_"+qstnNId+"="+parseInt($(this).val());
            }else{
                answerParams += "&answer_"+qstnNId+"="+encodeURIComponent($(this).val());
            }
		}else if(qstnType=="2"){
			if($(this).is(':checked')){
				answerParams += "&answer_"+qstnNId+"="+$(this).val();
			}
		}
        answerParams += "&qs_nid_"+qstnNId+"="+qsNId;
	});
	return answerParams;
}

function cvqsAjaxPost(url,params,target,finisher,extra){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState==4&&xhr.status==200){
            var response = JSON.parse(xhr.responseText);
            if(target!=null){
                $("#"+target).html(response);
            }
            if(finisher!=null){
                window[finisher](response,extra);   
            }
        }
    };
    xhr.open("POST",url,true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-length", params.length);
    xhr.setRequestHeader("Connection", "close");
    xhr.send(params);
}