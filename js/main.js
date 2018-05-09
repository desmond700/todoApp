// JavaScript Document

var worker = new Worker("js/web-worker.js");

$(function(){

  $("button#add").click(function(){
    var task = $("input#taskinput").val();
    worker.onmessage = function(event){
      if(!isNaN(parseInt(event.data.id))){
        var text = $("<p></p>").append(event.data.task);
        var dele = $("<button class='btn btn-danger deleBtn' data-task-id='"+event.data.id+"'>delete</button>")
        var li = $("<li class='d-flex justify-content-between list-group-item'></li>").append(text,dele);
        $(".list-group").append(li);
      }
      else{
        console.log(event.data);
      }
    }
    worker.postMessage(task);
  })
})
