document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('chatInputBox');
    const sendBtn = document.getElementById('chatInputBtn');
    // const chatWrapper = document.querySelector('.chat-wrapper');
    const chatWrapper = document.getElementById('chatArea');
    const leftCards = document.getElementById('leftCardsSection');
    const centerText = document.getElementById('centerTextSection');

    // Add user message to chat
    function appendUserMessage(text) {
      const userDiv = document.createElement('div');
      userDiv.className = 'user-msg d-flex align-items-center';
      userDiv.innerHTML = `
        <i class="bi bi-person-circle user-icon"></i>
        <p class="flex-grow-1">${text}</p>
        <i class="bi bi-pencil-square edit-icon ms-auto"></i>
      `;
      chatWrapper.appendChild(userDiv);
      scrollChatToBottom();
    }

    // Add bot message and actions to chat
    function appendBotMessage(htmlContent) {
      const botMsg = document.createElement('div');
      botMsg.className = 'bot-msg bot-msg-content';
      botMsg.innerHTML = `
        <div class="bot-header">GALGOTIAS AI-Bot</div>
        <div>${htmlContent}</div>
        <div class="bot-actions">
          <div class="reaction-group">
            <i class="bi bi-hand-thumbs-up" title="Like"></i>
            <span style="margin: 0 6px; color: #bbb;">|</span>
            <i class="bi bi-hand-thumbs-down" title="Dislike"></i>
            <span style="margin: 0 6px; color: #bbb;">|</span>
            <i class="bi bi-clipboard" title="Copy"></i>
          </div>
          <div class="more-group">
            <i class="bi bi-three-dots-vertical"></i>
          </div>
          <button class="regenerate-btn">
            <i class="bi bi-arrow-repeat"> Regenerate</i>
          </button>
        </div>
      `;
      chatWrapper.appendChild(botMsg);
      scrollChatToBottom();
    }

    // Ensure chat area always leaves 70px above chat-input
    function scrollChatToBottom() {
      // Add enough bottom padding to chatWrapper
      chatWrapper.style.paddingBottom = '90px'; // 70px + 20px buffer
      chatWrapper.scrollTop = chatWrapper.scrollHeight;
    }

    // Function to display the chat message

    
    function showChatMessage() {
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
            }
            leftCards.addEventListener('transitionend', onTransitionEnd);
            centerText.addEventListener('transitionend', onTransitionEnd);
        } 
    }


    // Handle sending user input
    function handleChatInput() {
      const message = inputField.value.trim();
      if (!message) return;

      showChatMessage(); // Show user message with animation
      appendUserMessage(message);
      inputField.value = '';
      fetchBotResponse(message);
    }

    // formating the response of the bot
    function formatResponse(text) {
        return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<span class="subheading">$1</span>')
        .replace(/\n/g, '<br>');
    }
    
    // Fetch bot response from backend
    function fetchBotResponse(userQuery) {
      fetch('/ask/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userQuery }) // Fix: use 'message' key to match backend
      })
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.indexOf('application/json') !== -1) {
          return res.json();
        } else {
          throw new Error('Invalid server response');
        }
      })
      .then(data => {
        if (data && data.response) {
            const formattedText = formatResponse(data.response);
            appendBotMessage(formattedText); // response should be HTML-formatted
        } else {
          appendBotMessage("<p>Sorry, I didn't understand that. Please try again.</p>");
        }
      })
      .catch(error => {
        console.error('Bot error:', error);
        appendBotMessage("<p>Oops! Something went wrong. Please try again.</p>");
      });
    }

    // Get Cookie function

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

    // Events
    sendBtn.addEventListener('click', handleChatInput);
    inputField.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleChatInput();
    });
  });
