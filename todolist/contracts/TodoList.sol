// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

contract TodoList {
    //variabel state untuk menghitung jumlah task yang ada pada to do list
    uint public taskCount = 0;

    //tipe data struct sebagai kerangka dari setiap task
    struct Task {
        uint id; //identifier unik untuk setiap tipe data struct Task
        string content; // isi dari task dalam todolist
        bool completed; // status task tersebut sudah dieselesaikan atau belum
    }
    //melakukan mapping terhadap seluruh task terhadap jumlah taks yang ada
    mapping(uint => Task) public tasks;

    // event yang akan dijalankan ketika ada task baru yang dibuat
    event TaskCreated(
        uint id,
        string content,
        bool completed
    );

    //event yang akan dijalankan ketika ada task yang sudah selesai
    event TaskCompleted(
        uint id,
        bool completed
    );

    //constructor untuk menambahkan sebuah task ketika smart conntract dideploy
    constructor() public {
        createTask("Mengerjakan UAS Blockchain Lab");
    }
    //function untuk membuat sebuah task baru
    function createTask(string memory _content) public {
        taskCount ++;
        tasks[taskCount] = Task(taskCount, _content, false);
        emit TaskCreated(taskCount, _content, false);
    }
    //function untuk menyelesaikan sebuah task
    function toggleCompleted(uint _id) public {
        Task memory _task = tasks[_id];
        _task.completed = !_task.completed;
        tasks[_id] = _task;
        emit TaskCompleted(_id, _task.completed);
    }

}