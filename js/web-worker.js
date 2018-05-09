// web-worker file


var db;

// Worker response
self.onmessage = function(e){
  var task = e.data;
  var result = indexedDB.open("todoApp", 2);
  result.onsuccess = function(e){
    db = e.target.result;
    addTask(task);
    getTask(task);
  }

  result.onerror = function(err){
    self.postMessage("database error. " + err.target.errorCode);
  }

  result.onupgradeneeded = function(e){
    var db = e.target.result;
    var objectStore = db.createObjectStore("task", {keyPath: "id", autoIncrement: true})
    objectStore.createIndex("by_name", "name");
  }
}

function addTask(task){
  var transaction = db.transaction(["task"], "readwrite");
  var objectStore = transaction.objectStore("task");
  objectStore.oncomplete = function(event){
    self.postMessage("Task added.");

  }

  objectStore.onabort = function(event){
    self.postMessage("transaction aborted.");
  }

  var request = objectStore.add({name: task});

  request.onsuccess = function(event){
    self.postMessage("request successful.");
  }

  transaction.onabort = function(event){
    self.postMessage("transaction aborted.");
  }
}

function getTask(name){
  var transaction = db.transaction(["task"]);
  var objectStore = transaction.objectStore("task");

  objectStore.openCursor().onsuccess = function(event){
    var cursor = event.target.result;
    if(cursor){
      self.postMessage({id:cursor.value.id,task:cursor.value.name});
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
