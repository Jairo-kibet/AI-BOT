// supplement/chatbot.js
// Handles chat UI and fetches bot responses from Django backend

document.addEventListener('DOMContentLoaded', function() {
    const chatInput = document.getElementById('chatInputBox');
    const chatBtn = document.getElementById('chatInputBtn');
    const chatArea = document.getElementById('chatArea');
    const leftCards = document.getElementById('leftCardsSection');
    const centerText = document.getElementById('centerTextSection');

    function appendChatBubble(msg, animate, sender) {
        const bubbleWrapper = document.createElement('div');
        bubbleWrapper.style.display = 'flex';
        bubbleWrapper.style.alignItems = 'flex-start';
        bubbleWrapper.style.gap = '10px';
        bubbleWrapper.style.maxWidth = '80%';

        if (sender === 'user') {
            // Profile icon (user)
            const profileIcon = document.createElement('span');
            profileIcon.innerHTML = '<i class="fa fa-user-circle" style="font-size:28px;color:#5c3bff;"></i>';
            profileIcon.style.flex = '0 0 auto';
            bubbleWrapper.appendChild(profileIcon);
        }

        const bubble = document.createElement('div');
        bubble.style.borderRadius = '18px 18px 4px 18px';
        bubble.style.margin = '6px 0';
        bubble.style.width = 'fit-content';
        bubble.style.maxWidth = '70vw';
        bubble.style.fontSize = '15px';
        bubble.style.textAlign = 'left';
        bubble.style.wordBreak = 'break-word';
        bubble.style.whiteSpace = 'pre-line';
        bubble.textContent = msg;
        if (sender === 'user') {
            bubble.style.background = '#5c3bff';
            bubble.style.color = 'black';
            bubble.style.alignSelf = 'flex-start';
            bubble.style.marginLeft = '0';
            bubble.style.marginRight = 'auto';
            bubble.style.padding = '10px 40px 18px 16px'; // extra right & bottom padding for icon
            bubble.style.position = 'relative';
            // Edit icon absolutely positioned inside bubble
            const editIcon = document.createElement('span');
            editIcon.innerHTML = '<i class="fa fa-edit" style="font-size:18px;color:#fff;cursor:pointer;"></i>';
            editIcon.style.position = 'absolute';
            editIcon.style.right = '12px';
            editIcon.style.bottom = '8px';
            editIcon.title = 'Edit message';
            bubble.appendChild(editIcon);
        } else {
            bubble.style.background = '#f3ecfc';
            bubble.style.color = '#222';
            bubble.style.alignSelf = 'flex-start';
            bubble.style.marginLeft = '40px';
            bubble.style.marginRight = 'auto';
            bubble.style.border = '3px solid rgb(47, 25, 73)';
            bubble.style.padding = '10px 16px 10px 16px';
        }
        if (animate) {
            bubble.classList.add('chat-bubble-animate-in');
        }
        bubbleWrapper.appendChild(bubble);

        // Add like icon just below the bot bubble
        if (sender === 'bot') {
            const likeRow = document.createElement('div');
            likeRow.style.display = 'flex';
            likeRow.style.justifyContent = 'center';
            likeRow.style.alignItems = 'center';
            likeRow.style.marginTop = '2px';
            likeRow.style.marginBottom = '6px';
            likeRow.innerHTML = '<i class="fa fa-thumbs-up" style="font-size:20px;color:#5c3bff;cursor:pointer;"></i>';
            bubbleWrapper.appendChild(likeRow);
        }

        chatArea.appendChild(bubbleWrapper);
        chatArea.scrollTop = chatArea.scrollHeight;
    }

    function appendBotBubbleTyping(msg) {
        // Typing effect: word by word
        let words = msg.split(' ');
        let i = 0;
        let bubbleWrapper = document.createElement('div');
        bubbleWrapper.style.display = 'flex';
        bubbleWrapper.style.alignItems = 'flex-start';
        bubbleWrapper.style.gap = '10px';
        bubbleWrapper.style.maxWidth = '80%';
        const bubble = document.createElement('div');
        bubble.style.borderRadius = '18px 18px 4px 18px';
        bubble.style.margin = '6px 0';
        bubble.style.width = 'fit-content';
        bubble.style.maxWidth = '70vw';
        bubble.style.fontSize = '15px';
        bubble.style.textAlign = 'left';
        bubble.style.background = '#f3ecfc';
        bubble.style.color = '#222';
        bubble.style.alignSelf = 'flex-start';
        bubble.style.marginLeft = '40px';
        bubble.style.marginRight = 'auto';
        bubble.style.border = '3px solid rgb(47, 25, 73)';
        bubble.style.padding = '10px 16px 10px 16px';
        bubble.style.wordBreak = 'break-word';
        bubble.style.whiteSpace = 'pre-line';
        bubble.textContent = '';
        bubble.classList.add('chat-bubble-animate-in');
        bubbleWrapper.appendChild(bubble);
        chatArea.appendChild(bubbleWrapper);
        chatArea.scrollTop = chatArea.scrollHeight;
        function typeWord() {
            if (i < words.length) {
                bubble.textContent += (i === 0 ? '' : ' ') + words[i];
                i++;
                chatArea.scrollTop = chatArea.scrollHeight;
                setTimeout(typeWord, 60);
            } else {
                // Add like icon after typing is done
                const likeRow = document.createElement('div');
                likeRow.style.display = 'flex';
                likeRow.style.justifyContent = 'center';
                likeRow.style.alignItems = 'center';
                likeRow.style.marginTop = '2px';
                likeRow.style.marginBottom = '6px';
                likeRow.innerHTML = '<i class="fa fa-thumbs-up" style="font-size:20px;color:#5c3bff;cursor:pointer;"></i>';
                bubbleWrapper.appendChild(likeRow);
            }
        }
        typeWord();
    }

    function showChatMessage(msg) {
        // If cards are visible, animate them out and show chat area with animation
        if (leftCards.style.display !== 'none' && centerText.style.display !== 'none') {
            leftCards.classList.add('slide-fade-up');
            centerText.classList.add('slide-fade-up');
            let transitioned = false;
            function onTransitionEnd() {
                if (transitioned) return;
                transitioned = true;
                leftCards.style.display = 'none';
                centerText.style.display = 'none';
                chatArea.style.display = 'flex';
                leftCards.classList.remove('slide-fade-up');
                centerText.classList.remove('slide-fade-up');
                leftCards.removeEventListener('transitionend', onTransitionEnd);
                centerText.removeEventListener('transitionend', onTransitionEnd);
                // First chat bubble with animation
                appendChatBubble(msg, true, 'user');
                // Bot response from backend
                setTimeout(function() {
                    fetchBotResponse(msg);
                }, 700);
            }
            leftCards.addEventListener('transitionend', onTransitionEnd);
            centerText.addEventListener('transitionend', onTransitionEnd);
        } else {
            // User message
            appendChatBubble(msg, true, 'user');
            // Bot response from backend
            setTimeout(function() {
                fetchBotResponse(msg);
            }, 700);
        }
    }

    function fetchBotResponse(userMsg) {
        fetch('/ask/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': getCookie('csrftoken'),
            },
            body: JSON.stringify({ message: userMsg })
        })
        .then(res => res.json())
        .then(data => {
            if (data && data.response) {
                appendBotBubbleTyping(data.response);
            } else {
                appendBotBubbleTyping('Sorry, I could not get a response.');
            }
        })
        .catch(() => {
            appendBotBubbleTyping('Oops! Something went wrong. Please try again.');
        });
    }

    function getCookie(name) {
        let cookieValue = null;
        if (document.cookie && document.cookie !== '') {
            const cookies = document.cookie.split(';');
            for (let i = 0; i < cookies.length; i++) {
                const cookie = cookies[i].trim();
                if (cookie.substring(0, name.length + 1) === (name + '=')) {
                    cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                    break;
                }
            }
        }
        return cookieValue;
    }

    function handleChatInput() {
        const val = chatInput.value.trim();
        if(val) {
            showChatMessage(val);
            chatInput.value = '';
        }
    }

    chatInput.addEventListener('keydown', function(e) {
        if(e.key === 'Enter') {
            handleChatInput();
        }
    });
    chatBtn.addEventListener('click', handleChatInput);
});
