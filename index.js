import "./style.scss";
import { HttpService } from "./HttpService.js";

/**
 * Main Module to control TodoList functionality
 * Note: Uses HttpService as a dependency
 */
class TodoList {

  constructor(HttpService) {
    this.httpService = HttpService;
    this.btnCreateTask = document.getElementById("btnCreateTask");
    this.todoList = document.querySelector(".todo-list");
    this.taskInput = document.getElementById("taskTitle");
  }

  /**
   * Initializates list getting data from API 
   * and attaches events
   */
  initList = function() {
    this.loadTasksAPI()
      .then(function(tasks) {
        console.log('tasks -> ', tasks);
        tasks.forEach(function(currentTask) {
          this.appendItem(currentTask);
        });
      })
      .catch(function(error) {
        // Do nothing, if you want to debug, uncomment console.log.
        // console.log(error);
      });

    this.btnCreateTask.addEventListener("click", this.createTask.bind(this), false);
  };

  /**
   * Access API to load pre-defined tasks
   */
  loadTasksAPI = function() {
    return this.httpService.get();
  };

  /**
   * Capture the event to mark and unmark a task
   * as complete
   */
  toggleComplete = function(event) {
    var taskElement = event.currentTarget.closest("li"),
      isTaskDone = taskElement.dataset.done == "true",
      taskId = taskElement.dataset.id,
      btnEdit = taskElement.querySelector(".btn-edit"),
      editObject = { done: !isTaskDone };

    this.httpService.put(editObject, taskId)
      .then(function(data) {
        // Add or remove `completed` class based on current status
        taskElement.dataset.done = data.done;
      })
      .catch(function(error) {
        // Do nothing, if you want to debug, uncomment console.log.
        // console.log(error);
      });
  };

  /**
   * Capture the event to update the interface based
   * on the current edit state
   */
  toggleEditField = function(event) {
    var taskElement = event.currentTarget.closest("li");
    var taskTitle = taskElement.querySelector(".task-title");
    var editField = taskElement.querySelector("input");
    var editIcon = taskElement.querySelector(".btn-edit > i");
    var isSaveOperation = taskTitle.style.display === "none";

    // Update task view based on isSaveOperation result
    /* Tips: 
     * .fa-edit is used on the edit icon
     * .fa-save is used on the save icon
     * data.title holds the updated value from API
    */
    if (isSaveOperation) {
      this.updateTask(taskElement).then(function(data) {
        // do something
      });
    } else {
      editField.focus();
    }
  };

  /**
   * Capture the event to insert a new task 
   * and send it to the API
   */
  createTask = function(event) {
    event.preventDefault();

    console.log("createTask -> ", this.taskInput);
    
    var newItem = {
      title: this.taskInput.value,
      done: false
    };
    fetch(this.httpService.API_URL, {
      headers: { "Content-Type": "application/json; charset=utf-8" },
      method: "POST",
      body: JSON.stringify(newItem)
    })
      .then(function(response) {
        switch (response.status) {
          case 201:
            return response.json();
            break;
        }
      })
      .then(function(newTask) {
        this.appendItem(newTask);
        this.taskInput.value = "";
        this.taskInput.focus();
      })
      .catch(function(error) {
        // Do nothing, if you want to debug, uncomment console.log.
        // console.log(error);
      });

      // Implement loading screen overlay for this.
  };

  /**
   * Use item data to update task title
   * and send it to the API
   */
  updateTask = function(itemElement) {
    var editItem = {
      title: itemElement.dataset.value
    };
    var newValue = itemElement.querySelector("input").value;

    this.updateValue(editItem.title, newValue);
    return this.httpService.put(editItem, itemElement.dataset.id);
  };

  /**
   * Update an item field with a new value
   */
  updateValue = function(field, newValue) {
    field = newValue;
  };

  /**
   * Appends a new item based created using factory and attach events 
   * needed
   */
  appendItem = function(item) {
    var newItem = TodoList.ItemFactory.get(item.id, item.title, item.done);
    
    // Add event to ".js-toggle-complete" hook, use toggleComplete function.
    // Add event to ".js-edit" hook, use toggleEdit function.

    this.todoList.appendChild(newItem);
  };
};

/**
 * Module used to create items dynamically to the list
 */
TodoList.ItemFactory = (function() {
  /**
   * Creates html elements to be appended to the list
   * and sets data on it
   */
  var generateListItem = function(id, title, done) {
    var newListItem = document.createElement("div");
    newListItem.dataset.id = id;
    newListItem.dataset.done = done == true;
    newListItem.dataset.value = title;

    newListItem.classList.add("todo-task");

    if (done) {
      newListItem.classList.add("completed");
    }

    newListItem.innerHTML = `
      <button class="js-toggle-complete"><i class="fas fa-check-circle"></i></button>
      <span class="task-title">${title}</span>
      <input type="text" class="edit-field" value="${title}"></input>
      <div class="actions">
        <button class="js-edit btn-edit"><i class="fas fa-edit"></i></button>
      </div>
    `;

    return newListItem;
  };

  return {
    get: generateListItem
  };
})();

(function(TodoList) {
  var myTodoList = new TodoList(HttpService);
  myTodoList.initList();
})(TodoList);
