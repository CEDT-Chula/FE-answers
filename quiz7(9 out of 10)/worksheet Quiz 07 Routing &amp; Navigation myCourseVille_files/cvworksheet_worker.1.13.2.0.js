let worksheetWorkerSnapper;
let worksheetWorkerSender;
let worksheetSnapStore = [];
let worksheetLastSnap = {box:"",slot:[],qs:""};
const worksheetSnapInterval = 60*1000;
const worksheetSnapSendInterval = 300*1000;
$(document).ready(function(){
    let delay = Math.random()*150*1000;
    setTimeout(function(){
        worksheetWorkerSnapper = setInterval(function(){
            cvworksheet_genSnap();
        },worksheetSnapInterval);
        worksheetWorkerSender = setInterval(function(){
            if(worksheetSnapStore.length > 0){
                try{cvworksheet_sendSnap();}catch(e){}
            }
        },worksheetSnapSendInterval);
    },delay);
});
function cvworksheet_genSnap(){
    let d = new Date();
    let milli = d.getTime();
    let ckeId = 'courseville-textarea-answer-'+$("#courseville-form-timestamp").val();
    let answer = cvworksheet_getDataFromCKEditor(ckeId);
    let slotfileParams = [];
    $(".courseville-attachment-slot [data-part='uploaded-filepath']").each(function(){
        slotfileParams.push($(this).val());
    });
    let answerParams = cvqsCollectAnswers();
    if(cvworksheet_snap_will_changed(answer,slotfileParams,answerParams)){
        let snap = {box: answer,slot: slotfileParams,qs: answerParams,t:milli}
        worksheetSnapStore.push(snap);
        worksheetLastSnap.box = snap.box;
        worksheetLastSnap.slot = snap.slot;
        worksheetLastSnap.qs = snap.qs;
    }
}
function cvworksheet_snap_will_changed(answer,slotfileParams,answerParams){
    let changed = false;
    if(worksheetLastSnap.box!=answer){changed = true;}
    if(worksheetLastSnap.slot.length == slotfileParams.length){
        for(let i=0;i<worksheetLastSnap.slot.length;i++){
            if(worksheetLastSnap.slot[i]!=slotfileParams[i]){changed = true;}
        }
    }else{changed = true;}
    if(worksheetLastSnap.qs!=answerParams){changed = true;}
    return changed;
}
function cvworksheet_sendSnap(){
    let saveButton = $("#courseville-worksheet-work-save-button");
    var url = "?q=courseville/ajax/cvworksheet_savesnap";
    var data = {
        worksheet:$("#courseville-worksheet-root").attr("data-worksheetid"),
        nid: saveButton.attr("assignment_id"),
        gpid: saveButton.attr("group_id"),
        snaps: JSON.stringify(worksheetSnapStore),
    }
    $.ajax({method:"POST",url:url,data:data,dataType:"json"});
    worksheetSnapStore = [];
}