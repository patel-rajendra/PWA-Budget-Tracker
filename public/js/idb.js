let db;
// Establish connection to IndexedDB called 'budget_data' and set to version 1
const request = indexedDB.open('budget_data', 1);

// Upon first code execution, create the object store
request.onupgradeneeded = function (event) {
  const db = event.target.result;
  // create a table (in object store) called 'new_budget' and auto increment
  db.createObjectStore('new_budget', { autoIncrement: true });
};

// Below event executes every time we interact with the database (Upload data on reload)
request.onsuccess = function (event) {
  db = event.target.result;

  // Check if app is online, if yes, upload stored budget and push to to API database
  if (navigator.onLine) {
    uploadBudget();
  }
};

// Log the error
request.onerror = function (event) {
  console.log(event.target.errorCode);
};

// This will execute if a user attempts to submit a new budget and there's no internet connections
function saveRecord(record) {
  // Open transaction to database with read and write permissions
  const transaction = db.transaction(['new_budget'], 'readwrite');
  // Access the object store data
  const budgetObjectStore = transaction.objectStore('new_budget');
  // Add record to object store with add method
  budgetObjectStore.add(record);
}

// The function below will access the object store and execute a POST method to the server
function uploadBudget() {
  const transaction = db.transaction(['new_budget'], 'readwrite');
  const budgetObjectStore = transaction.objectStore('new_budget');
  const getAll = budgetObjectStore.getAll();

  getAll.onsuccess = function () {
    if (getAll.result.length > 0) {
      fetch('/api/transaction', {
        method: 'POST',
        body: JSON.stringify(getAll.result),
        headers: {
          Accept: 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
        },
      })
        .then((response) => response.json())
        .then((serverResponse) => {
          if (serverResponse.message) {
            throw new Error(serverResponse);
          }
          const transaction = db.transaction(['new_budget'], 'readwrite');
          const budgetObjectStore = transaction.objectStore('new_budget');
          budgetObjectStore.clear();
        
          alert('All saved budgets have been submitted!');
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
}

//  This will listen for the app coming back online
window.addEventListener('online', uploadBudget);
