document.addEventListener("DOMContentLoaded", function() {
    post()
})

async function post() {
    fetch('http://localhost:5500/api/rooms', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => console.log(data))
    .catch(error => console.error('Error:', error));
}