function cvworksheetEventSnap_send(data){
    const saveButton = $("#courseville-worksheet-work-save-button");
    data.cmd = "snapevent";
    data.worksheet = $("#courseville-worksheet-root").attr("data-worksheetid");
    data.nid = saveButton.attr("assignment_id");
    data.gpid = saveButton.attr("group_id");
    const url = "?q=courseville/ajax/worksheet";
    $.ajax({method:"POST",url:url,data:data,dataType:"json"});
}