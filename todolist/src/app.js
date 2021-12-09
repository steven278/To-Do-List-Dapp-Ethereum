App = {
    loading: false,
    contracts: {},

    load: async () => {
    await App.loadWeb3()
    await App.loadAccount()
    await App.loadContract()
    await App.render()
    },

    //mengkoneksikan web dengan web3js melalui metamask
    loadWeb3: async () => {
    if (typeof web3 !== 'undefined') {
        App.web3Provider = web3.currentProvider
        web3 = new Web3(web3.currentProvider)
    } else {
        window.alert("Please connect to Metamask.")
    }
    // =untuk browser dapp modern
    if (window.ethereum) {
        window.web3 = new Web3(ethereum)
        try {
        // meminta akses akun wallet jika diperlukan
        await eth_requestAccounts()
        // expose account wallet
        web3.eth.sendTransaction({/* ... */})
        } catch (error) {//bila user menolak memberikan akses akun wallet
            console.log(error);
        }
    }
    // Untuk legacy dapp browser
    else if (window.web3) {
        App.web3Provider = web3.currentProvider
        window.web3 = new Web3(web3.currentProvider)
        // Acccounts always exposed
        web3.eth.sendTransaction({/* ... */})
    }
    // untuk browser yang bukan dapp
    else {
        console.log('Non-Ethereum browser detected. You should consider trying MetaMask!')
    }
    },
    //untuk mengambil akun yang sedang digunakan user
    loadAccount: async () => {
    App.account = web3.eth.accounts[0]
    },

    //untuk membuat versi javascript dari smart contract
    loadContract: async () => {
    const todoList = await $.getJSON('TodoList.json')
    App.contracts.TodoList = TruffleContract(todoList)
    App.contracts.TodoList.setProvider(App.web3Provider)
    App.todoList = await App.contracts.TodoList.deployed()
    },
    //untuk mencegah terjadinya rendering ganda / double
    render: async () => {
    if (App.loading) {
        return
    }

    //update loading state pada dapp
    App.setLoading(true)

    // untuk merender akun wallet
    $('#account').html(App.account)

    // untuk merender semua task
    await App.renderTasks()

    // untuk update loading state
    App.setLoading(false)
    },
    //untuk merender task
    renderTasks: async () => {
    // Load the total task count from the blockchain
    const taskCount = await App.todoList.taskCount()
    const $taskTemplate = $('.taskTemplate')

    // untuk merender masing-masing task
    for (var i = 1; i <= taskCount; i++) {
        //mengambil data task dari blockchain
        const task = await App.todoList.tasks(i)
        const taskId = task[0].toNumber()
        const taskContent = task[1]
        const taskCompleted = task[2]

        //buat html untuk task
        const $newTaskTemplate = $taskTemplate.clone()
        $newTaskTemplate.find('.content').html(taskContent)
        $newTaskTemplate.find('input')
                        .prop('name', taskId)
                        .prop('checked', taskCompleted)
                        .on('click', App.toggleCompleted)//apabila checkbox task ditekan
                        //maka task tersebut akan completed dengan syarat
                        //user telah membayar melalui metamask

        // memasukan task dalam list yang sesuai (dipisahkan untuk yang completed
        // dengan yang belum)
        if (taskCompleted) {
        $('#completedTaskList').append($newTaskTemplate)
        } else {
        $('#taskList').append($newTaskTemplate)
        }

        // Tampilkan task
        $newTaskTemplate.show()
    }
    },
    //membuat task
    createTask: async () => {
    App.setLoading(true)
    const content = $('#newTask').val()
    await App.todoList.createTask(content)
    window.location.reload()//reload setelah task baru dibuat
    },
    //menyelesaikan task
    toggleCompleted: async (e) => {
    App.setLoading(true)
    const taskId = e.target.name
    await App.todoList.toggleCompleted(taskId)
    window.location.reload()//reload 
    },
    //state saat app loading
    setLoading: (boolean) => {
    App.loading = boolean
    const loader = $('#loader')
    const content = $('#content')
    if (boolean) {//ketika app sedang loading maka isi dari setiap task tidak ditampilkan
        loader.show()
        content.hide()
    } else {//ketika appp selesai loading maka loader di hide dan task list ditampilkan
        loader.hide()
        content.show()
    }
    }
}

$(() => {
    $(window).load(() => {
    App.load()
    })
})