$(document).ready(function(){
    cvworksheet_initUI();
    cvworksheet_prepareGenericItem();
    cvworksheet_prepareWorkPane();
    cvworksheet_prepareWorkTab();
    cvworksheet_preparePreview();
    cvworksheet_prepareUpload();
    cvworksheet_prepareSaveButton();
    cvworksheet_prepareAttentionCall();
});
function cvworksheet_initUI(){
    $("#courseville-worksheet-work-save-spinner").hide();
    $(".courseville-attachment-slot .cvui-spinner-icon").hide();
    $(".cvworksheet-hide-instruction").click(function(){
        $("#courseville-worksheet-root").attr("data-state","instruction-collapsed");
    });
    $(".cvworksheet-show-instruction").click(function(){
        $("#courseville-worksheet-root").removeAttr("data-state");
    });
}
function cvworksheet_prepareAttentionCall(){
    $("#cvworksheet-attention-autocomplete-staffinput").on("change",function(){
        var input = $(this);
        var list = $("#"+$(this).attr("list"));
        var val = $(this).val().trim();
        list.find("option:not([disabled])").each(function(){
            if(val==$(this).html()){
                input.val("");
                cvworksheet_callAttention($(this));
            }
        });
    });
    $(document).off("click",".cvworksheet-attentioncall-calleditem [data-part='remove-button']",cvworksheet_clickRemoveItemWAttention);
    $(document).on("click",".cvworksheet-attentioncall-calleditem [data-part='remove-button']",cvworksheet_clickRemoveItemWAttention);
    //Sort the datalist
    $("#cvworksheet-attention-autocomplete-staffdatalist > .cvworksheet-attentioncall-datalistoption").sort(cvworksheet_compareFunction).appendTo("#cvworksheet-attention-autocomplete-staffdatalist");
}
function cvworksheet_compareFunction(a,b){
    return ($(b).text().toUpperCase())<($(a).text().toUpperCase())?1:-1;  
}
function cvworksheet_clickRemoveItemWAttention(){
    var item = $(this).closest("#cvworksheet-attention-called-stafflist > li");
    cvworksheet_revokeAttention(item);
}
function cvworksheet_callAttention(option){
    var uid = option.attr("data-uid");
    var nameStr = option.html();
    option.prop("disabled",true);
    var target = $("#cvworksheet-attention-called-stafflist");
    var proto = target.find("[data-proto='1']").first();
    var item = proto.clone().removeAttr("data-proto").removeAttr("aria-hidden");
    item.children(".cvworksheet-attentioncall-calleditem").attr("data-uid",uid).attr("title",nameStr).attr("aria-label",nameStr);
    item.find("[data-part='name']").html(nameStr);
    item.show().css("display","inline-block");
    target.append(item);
    target.html(target.html());
}
function cvworksheet_revokeAttention(item){
    var uid = item.children(".cvworksheet-attentioncall-calleditem").attr("data-uid");
    item.fadeOut(200,function(){$(this).remove();});
    var list = $("#cvworksheet-attention-autocomplete-staffdatalist");
    list.find("option[data-uid='"+uid+"']").prop("disabled",false);
}
function cvworksheet_prepareGenericItem(){
    $(".courseville-generic-img-toggle-button").unbind("click",cvworksheet_clickGenericImgToggleButton);
    $(".courseville-generic-img-toggle-button").click(cvworksheet_clickGenericImgToggleButton);
}

function cvworksheet_clickGenericImgToggleButton(){
    var state = $(this).attr("state");
    var orgSrc = $(this).attr("src");
    if(state=="on"){
        $(this).attr("src",orgSrc.replace("_on","_off"));
        $(this).attr("state","off");
    }else{
        $(this).attr("src",orgSrc.replace("_off","_on"));
        $(this).attr("state","on");
    }
}

function cvworksheet_preparePreview(){
    $("#courseville-worksheet-preview-modal").off("shown.bs.modal").on("shown.bs.modal",function(){
        $("#courseville-worksheet-preview-modal .modal-title").focus();
    });
    $(".courseville-worksheet-preview-button").unbind("click");
    $(".courseville-worksheet-preview-button").click(function(){
        var ckeId = $(this).attr("ckeid");
        var title = $(this).attr("data-modaltitle");
        var content = cvworksheet_getDataFromCKEditor(ckeId,false);
        var previewModal = $("#courseville-worksheet-preview-modal");
        previewModal.find(".modal-body [data-role='spinner']").hide();
        previewModal.find(".modal-title").html(title);
        previewModal.find(".modal-body [data-role='content']").html(content);
        previewModal.modal("show");
    });
}
function cvworksheet_prepareWorkPane(){
    $(".courseville-worksheet-work-pane").hide();
    var currentStep = $("#courseville-worksheet-work-tabs").attr("current_step");
    $(".courseville-worksheet-work-pane[step=\""+currentStep+"\"]").show("slow");
}
function cvworksheet_prepareWorkTab(){
    $(".courseville-worksheet-work-tab").unbind("click",cvworksheet_clickWorkTab);
    $(".courseville-worksheet-work-tab").click(cvworksheet_clickWorkTab);
    $(".courseville-worksheet-work-tab.courseville-current").unbind("click",cvworksheet_clickWorkTab);
}
function cvworksheet_clickWorkTab(){
    var currentStep = $("#courseville-worksheet-work-tabs").attr("current_step");
    var toStep = $(this).attr("step");
    $(".courseville-worksheet-work-tab").removeClass("courseville-current").attr("aria-selected","false");
    $(".courseville-worksheet-work-tab[step=\""+toStep+"\"]").addClass("courseville-current").attr("aria-selected","true");
    $(".courseville-worksheet-work-pane[step=\""+currentStep+"\"]").hide("slow",function(){
        $(".courseville-worksheet-work-pane[step=\""+toStep+"\"]").show("slow",function(){
            $("#courseville-worksheet-work-tabs").attr("current_step",toStep);
            cvworksheet_prepareWorkTab();
        })
    })
}
function cvworksheet_prepareUpload(){
    $(".courseville-submit-upload").unbind("click");
    $(".courseville-submit-upload").click(cvworksheet_clickSubmitUpload);

    $(".courseville-attachment-slot-file").change(function(){
        var fileOK = true;
        var file = null;
        var errorContext = "";
        var parentItem = $(this).closest(".courseville-attachment-slot");
        parentItem.find(".courseville-submit-upload").prop("disabled",true);
        
        if($(this)[0].files.length>0){
            file = $(this)[0].files[0];
            if(file.size/1024/1024>20){
                fileOK = false;
                errorContext = "file-too-large";
            }
        }else{
            fileOK = false;
            errorContext = "no-file-selected";
        }
        if(fileOK){
            var slotID = parentItem.attr("data-slot");
            var form = parentItem.find("#courseville-attachment-slot-upload-form-"+slotID);
            var spinner = parentItem.find("[data-part=\"upload-spinner\"] .cvui-spinner-icon");
            var status = parentItem.find("[data-part=\"upload-spinner\"] .cvui-spinner-status");
            var selectedFileLabel = parentItem.find("[data-part=\"selected-filepath\"]");
            selectedFileLabel.html("<i class='fa fa-file-o'></i> "+file.name);
            spinner.show();
            status.html($("#courseville-attachment-ui-msg [data-content=\"attaching\"]").text());

            try{
                const eventSnapData = {
                    'eventtype' : 'file-attached-to-slot-changed',
                    'eventdata' : JSON.stringify({
                        'slotid' : slotID,
                        'filename' : file.name
                    })
                };
                cvworksheetEventSnap_send(eventSnapData);
            }catch(err){}

            form.submit();
        }else{
            var alertMsg = $("#courseville-attachment-ui-msg [data-context=\""+errorContext+"\"]").text();
            if(errorContext=="file-too-large"){
                alertMsg += " ("+Math.ceil(file.size/1024/1024)+" MB)";
            }
            alert(alertMsg);
            parentItem.find(".courseville-submit-upload").prop("disabled",false);
        }
    });
    
}
function cvworksheet_blink(element,state,i){
    element.attr("data-blinking","1");
    i = i-1;
    if(state&&i>=0){
        element.animate({opacity:0},200,"linear",function(){
            $(this).animate({opacity:1},200);
            if(element.attr("data-blinking")=="1"){
                cvworksheet_blink(element,state,i);
            }
        });
    }else{
        element.attr("data-blink","0");
        element.css("opacity",1);
    }
}
function cvworksheet_clickSubmitUpload(){
    var parentItem = $(this).closest(".courseville-attachment-slot");
    var slotID = parentItem.attr("data-slot");
    var form = parentItem.find("#courseville-attachment-slot-upload-form-"+slotID);
    var fileBrowser = form.find(".courseville-attachment-slot-file");
    fileBrowser.click();
}

function cvworksheet_stopUpload(param){
    var parentItem = $("#"+param["form_id"]).closest(".courseville-attachment-slot");
    var spinner = parentItem.find("[data-part=\"upload-spinner\"] .cvui-spinner-icon");
    var status = parentItem.find("[data-part=\"upload-spinner\"] .cvui-spinner-status");
    var button = parentItem.find(".courseville-submit-upload");
    parentItem.find("[data-part='uploaded-filepath']").val(param["file_location"]);
    spinner.hide();
    status.html(param["msg"]);
    button.prop("disabled",false);
}

function cvworksheet_prepareSaveButton(){
    $("#courseville-worksheet-work-save-button").unbind("click",cvworksheet_clickSave);
    $("#courseville-worksheet-work-save-button").click(cvworksheet_clickSave);
}

function cvworksheet_clickSave(){
    $("#courseville-worksheet-work-save-button").prop("disabled",true);
    const worksheetId = $("#courseville-worksheet-root").attr("data-worksheetid");
    const assignmentId = $(this).attr("assignment_id");
    const studentId = $(this).attr("student_id");
    const groupId = $(this).attr("group_id");
    const ckeId = 'courseville-textarea-answer-'+$("#courseville-form-timestamp").val();
    const answer = cvworksheet_getDataFromCKEditor(ckeId);
    const answerParams = cvqsCollectAnswers();
    const url = "?q=courseville/ajax/submit_submission";
    let params = "worksheet="+worksheetId+"&assignment_id="+assignmentId+"&student_id="+studentId+"&group_id="+groupId+"&answer="+answer;
    params += answerParams;

    var attention = [];
    $("#cvworksheet-attention-called-stafflist > li:not([data-proto='1']) > .cvworksheet-attentioncall-calleditem").each(function(){
        var uid = parseInt($(this).attr("data-uid"));
        if(uid>0){
            attention.push(uid);
        }
    });
    params += "&attn="+JSON.stringify(attention);

    $("#courseville-worksheet-work-save-spinner").show();
    var savingMsg = $(this).attr("data-saving-msg");
    $("#courseville-worksheet-work-status").html(savingMsg);
    cvworksheet_ajaxPost(url,params,null,"cvworksheet_afterSave");
}

function cvworksheet_afterSave(rp){
    $("#courseville-worksheet-work-save-spinner").hide();
    $("#courseville-worksheet-work-status").html(rp.msg);
    $("#courseville-worksheet-main-modal").off("shown.bs.modal").on("shown.bs.modal",function(){
        $("#courseville-worksheet-main-modal .modal-title").focus();
    });
    if(rp.status==1){
        var content = rp.html;
        $("#courseville-worksheet-main-modal .modal-title").html(rp.title);
        $("#courseville-worksheet-main-modal [data-role='spinner']").hide();
        $("#courseville-worksheet-main-modal [data-role='content']").html(content);
        $("#courseville-worksheet-main-modal").modal("show");
        if(rp.refresh==1){
            $("#courseville-worksheet-main-modal").on("hidden.bs.modal",function(){
                location.reload(true);
            });
        }
    }else{
        alert(rp.msg);
    }
}

function cvworksheet_ajaxPost(url,params,target,finisher){
    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(){
        if(xhr.readyState==4&&xhr.status==200){
            var response = JSON.parse(xhr.responseText);
            if(target!=null){
                $("#"+target).html(response);
            }
            if(finisher!=null){
                window[finisher](response);   
            }
            $("#courseville-worksheet-work-save-button").prop("disabled",false);
        }else if(xhr.readyState==4){
            const msg = "Something is wrong. Please try again in a few seconds.";
            alert(msg);
            $("#courseville-worksheet-work-save-spinner").hide();
            $("#courseville-worksheet-work-status").html(msg);
            setTimeout(function(){
                $("#courseville-worksheet-work-save-button").prop("disabled",false);
            }, 1500);
        }
    };
    xhr.open("POST",url,true);
    xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
    xhr.setRequestHeader("Content-length", params.length);
    xhr.setRequestHeader("Connection", "close");
    xhr.send(params);
}

function cvworksheet_getDataFromCKEditor(ckeId,doEncode){
    if(typeof(doEncode)==='undefined'){
        doEncode = true;
    }
    var data;
    if(CKEDITOR.instances[ckeId]==undefined){
        data = $("#"+ckeId).val();
    }else{
        data = CKEDITOR.instances[ckeId].getData();
    }
    if(doEncode){
        data = encodeURIComponent(data);
    }
    return data;
}

function cvworksheet_addSpinnerSmall(){
    return "<span class=\"courseville-css-spinner courseville-light-bg\"></span>";
}