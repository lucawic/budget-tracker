//create a variable 4 db connection
let db;
// establish a connection to IndexedDB database called 'budget_tracker' and set it to version 1
const request = indexedDB.open("Budget_tracker", 1);

//event to occur if the db version changes
request.onupgradeneeded = function (event) {
    //save a reference to the database
    const db = event.target.result;
    //create a table, set it to auto increment primary key of sorts
    db.createObjectStore("new_total", { autoIncrement: true });
};

//on successful attempt
request.onsuccess = function (event) {
    //when db is successfully created with its table (object store)
    db = event.target.result;

    //check if app is online, if yes run uploadTransaction
    if (navigator.onLine) {
        // ..
        uploadTransaction();
    }
};

request.onerror = function (event) {
    //log error
    console.log(event.target.errorCode);
};

//function to be executed if we attempt to submit a new transaction
function saveRecord(record) {
    //open a new transaction with the db 
    const transaction = db.transaction(["new_total"], "readwrite");

    // access the object store for `new_total`
    const transactionObjectStore = transaction.objectStore("new_total");
  
    // add record to your store with add method
    transactionObjectStore.add(record);
  }
  
  function uploadTransaction() {
    // open a transaction on your db
    const transaction = db.transaction(["new_total"], "readwrite");
  
    // access your object store
    const transactionObjectStore = transaction.objectStore("new_total");
  
    // get all records from store and set to a variable
    const getAll = transactionObjectStore.getAll();
  
    // upon a successful .getAll() execution, run this function
    getAll.onsuccess = function () {
      // if there was data in indexedDb's store, send it to the api server
      if (getAll.result.length > 0) {
        fetch("/api/transaction", {
          method: "POST",
          body: JSON.stringify(getAll.result),
          headers: {
            Accept: "application/json, text/plain, */*",
            "Content-Type": "application/json",
          },
        })
          .then((response) => response.json())
          .then((serverResponse) => {
            if (serverResponse.message) {
              throw new Error(serverResponse);
            }
            // open one more transaction
            const transaction = db.transaction(["new_total"], "readwrite");
            // access the new_total object store
            const transactionObjectStore = transaction.objectStore("new_total");
            // clear all items in your store
            transactionObjectStore.clear();
  
            alert("All saved transactions has been submitted!");
          })
          .catch((err) => {
            console.log(err);
          });
      }
    };

}