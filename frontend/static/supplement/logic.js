document.addEventListener('DOMContentLoaded', function() {
    const newChatBtn = document.querySelector('.new-chat-btn');
    if (newChatBtn) {
        newChatBtn.addEventListener('click', function(e) {
            e.preventDefault();
            fetch('/create-new-chat/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCSRFToken(),
                },
                credentials: 'same-origin',
            })
            .then(response => response.json())
            .then(data => {
                if (data.chat_id) {
                    // Optionally, update the UI to show the new chat as active
                    // For example, reload the conversation list or highlight the new chat
                    window.location.reload(); // Or update the sidebar dynamically
                } else if (data.error) {
                    alert(data.error);
                }
            })
            .catch(error => {
                console.error('Error creating new chat:', error);
            });
        });
    }
});

function getCSRFToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, 10) === ('csrftoken=')) {
                cookieValue = decodeURIComponent(cookie.substring(10));
                break;
            }
        }
    }
    return cookieValue;
}