// JavaScript Document

var worker = new Worker("js/web-worker.js");

$(function(){

  /*$("button#add").click(function(){
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
  })*/

  var result = indexedDB.open("todoApp", 2);

  var db;

  // Worker response
  /*self.onmessage = function(e){
    var task = e.data;
    var result = indexedDB.open("todoApp", 2);
    result.onsuccess = function(e){
      db = e.target.result;
      getInitTask()
      //addTask(task);
      //getTask(task);
    }*/

    result.onsuccess = function(event){
      db = event.target.result;
      console.log("db success");
      getTask()
    }

    result.onerror = function(err){
      console.log("database error. " + err.target.errorCode);
    }

    result.onupgradeneeded = function(e){
      var db = e.target.result;
      var objectStore = db.createObjectStore("task", {keyPath: "id", autoIncrement: true})
      objectStore.createIndex("by_name", "name", { unique: false });
    }


  function getTask(){
    var transaction = db.transaction(["task"]);
    var objectStore = transaction.objectStore("task");
    var countRequest = objectStore.count();
    $(".list-group").empty();
    countRequest.onsuccess = function(event){
      $(".tskCnt").html(countRequest.result)
    }
    var count = 0;
    objectStore.openCursor().onsuccess = function(event){
      var cursor = event.target.result;

      if(cursor){
        ++count;
        var text = $("<p>"+count+". "+cursor.value.name+"</p>");
        var dele = $("<button class='btn btn-danger deleBtn' data-task-id='"+cursor.value.id+"'>delete</button>")
        var li = $("<li class='d-flex justify-content-between list-group-item'></li>").append(text,dele)
                      .attr("data-task-id", cursor.value.id);
        $(".list-group").append(li);
        cursor.continue();
      }

    }

    objectStore.onabort = function(event){
      self.postMessage("transaction aborted.");
    }

    objectStore.onerror = function(event){
      self.postMessage("transaction error.");
    }
  }

  $("button#add").click(function(){
    var task = $("input#taskinput").val();
    addTask(task);
  })

  $("body").on("click", ".deleBtn", function(){
    var taskid = $(this).attr("data-task-id");
    var transaction = db.transaction(["task"], "readwrite");
    var objectStore = transaction.objectStore("task");

    objectStore.openCursor().onsuccess = function(event){
      var cursor = event.target.result;
      if(cursor){
        if(cursor.value.id == taskid){
          let request = cursor.delete();
          request.onsuccess = function(event){
            console.log("task deleted.");
            $("[data-task-id='"+taskid+"']").remove();
            var task = $(".tskCnt").html();
            $(".tskCnt").html(parseInt(task) - 1);
          }
        }
        cursor.continue();
      }
    }
  })

  function addTask(task){
    var transaction = db.transaction(["task"], "readwrite");

    transaction.oncomplete = function(event){
      console.log("Adding task to database completed.")
      getTask()
    }

    var objectStore = transaction.objectStore("task");
    objectStore.oncomplete = function(event){
      console.log("Task added.");

    }

    objectStore.onabort = function(event){
      console.log("Transaction aborted.");
    }

    var request = objectStore.add({name: task});

    request.onsuccess = function(event){
      console.log("Request successful.");
    }

    transaction.onabort = function(event){
      console.log("transaction aborted.");
    }
  }

  /*function getTask(name){
    var transaction = db.transaction(["task"]);
    var objectStore = transaction.objectStore("task");
    var request = objectStore.get(name);

    request.onsuccess = function(event){
      var text = $("<p></p>").append(request.result.task);
      var dele = $("<button class='btn btn-danger deleBtn' data-task-id='"+request.result.id+"'>delete</button>");
      var li = $("<li class='d-flex justify-content-between list-group-item'></li>").append(text,dele);
      $(".list-group").append(li);
    }

    request.onabort = function(event){
      console.log("transaction aborted.");
    }

    request.onerror = function(event){
      console.log("transaction error.");
    }
  }*/


})
