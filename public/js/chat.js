const socket = io()

// server(emit) -> client (receive) --> acknowledgement --> sever
// client(emit) -> server (receive) --> acknowledgement --> client


// ELEMENTS
const $messageForm = document.querySelector('#message-form')
const $messageFormInput = $messageForm.querySelector('input')
const $messageFormButton = $messageForm.querySelector('button')
const $sendLocationButton = document.querySelector('#message-location')
const $messages = document.querySelector('#messages')


//Templetes
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationMessageTemplate = document.querySelector('#location-message-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

const autoscroll = () => {
    // new message element 

    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Vissible height
    const visibleHHeight = $messages.scrollHeight

    // Heught of the Message Container
    const constainerHeight = $messages.scrollHeight

    // How far have i scolled?
    const scrollOffset = $messages.scrollTop + visibleHHeight

    if (constainerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }

}


socket.on("message", (message) => {
    console.log(message);
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createAt: moment(message.createAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()

})
socket.on("roomData", ({ room, users }) => {
        const html = Mustache.render(sidebarTemplate, {
            room,
            users
        })
        document.querySelector('#sidebar').innerHTML = html
    })
    // Url Render (Show the Top of app)
socket.on('locationMessage', (url) => {
    console.log(url);
    const html = Mustache.render(locationMessageTemplate, {
        username: url.username,
        url: url.url,
        createAt: moment(url.createAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
})

$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // disable
    $messageFormButton.setAttribute('disabled', 'disabled')


    // const message = document.querySelector('input').value
    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (error) => {
        // anable
        $messageFormButton.removeAttribute('disabled')
        $messageFormInput.value = ''
        $messageFormInput.focus()

        if (error) {
            return console.log(error);
        }
        console.log("Message was delivered!")
    })
})

//Geolocation find
$sendLocationButton.addEventListener('click', () => {
        if (!navigator.geolocation) {
            return alert("Geolocation is not suported by your browser")
        }

        $sendLocationButton.setAttribute('disabled', 'disabled')

        navigator.geolocation.getCurrentPosition((position) => {
            //console.log(position);
            socket.emit('send-location', {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude

            }, () => {
                $sendLocationButton.removeAttribute('disabled')
                console.log("Location shared!");
            })
        })


    })
    //Join Group Room
socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})



// socket.on('countUpdated', (count) => {
//     console.log("The count has been updated", count);
// })

// document.querySelector("#increment").addEventListener('click', () => {
//     console.log("clicked..")
//     socket.emit('increment')
// })