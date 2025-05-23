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
        <i class="bi bi-pencil-square edit-icon ms-auto" style="cursor:pointer;"></i>
      `;
      chatWrapper.appendChild(userDiv);
      // --- Ensure user message is always visible above chat-input ---
      const chatInput = document.querySelector('.chat-input');
      if (chatInput) {
        const userRect = userDiv.getBoundingClientRect();
        const inputRect = chatInput.getBoundingClientRect();
        // If the bottom of the user message is below the top of chat-input, scroll so it is visible
        if (userRect.bottom > inputRect.top - 60) {
          const offset = userRect.bottom - (inputRect.top - 60);
          if (offset > 0) {
            window.scrollBy({
              top: offset,
              left: 0,
              behavior: 'auto'
            });
          }
        }
      }
      scrollChatToBottom();
      // --- Edit icon logic ---
      const editIcon = userDiv.querySelector('.edit-icon');
      if (editIcon) {
        editIcon.addEventListener('click', function() {
          // Prevent multiple edit boxes
          if (userDiv.querySelector('.edit-box')) return;
          const originalText = userDiv.querySelector('p').textContent;
          // Hide the p and show textarea
          userDiv.querySelector('p').style.display = 'none';
          editIcon.style.display = 'none';
          // Create edit box
          const editBox = document.createElement('div');
          editBox.className = 'edit-box';
          editBox.style.position = 'relative';
          editBox.innerHTML = `
            <textarea class="form-control" style="min-height:40px;resize:vertical;">${originalText}</textarea>
            <div style="position:absolute;right:0;bottom:-35px;display:flex;gap:8px;">
              <button class="btn btn-secondary btn-sm cancel-edit">Cancel</button>
              <button class="btn btn-primary btn-sm ask-edit">Ask</button>
            </div>
          `;
          userDiv.appendChild(editBox);
          const textarea = editBox.querySelector('textarea');
          textarea.focus();
          // Cancel button logic
          editBox.querySelector('.cancel-edit').onclick = function() {
            editBox.remove();
            userDiv.querySelector('p').style.display = '';
            editIcon.style.display = '';
          };
          // Ask button logic
          editBox.querySelector('.ask-edit').onclick = function() {
            const newText = textarea.value.trim();
            if (!newText) return;
            // Update user message
            userDiv.querySelector('p').textContent = newText;
            editBox.remove();
            userDiv.querySelector('p').style.display = '';
            editIcon.style.display = '';
            // Remove all messages below this userDiv
            let next = userDiv.nextElementSibling;
            while (next) {
              const toRemove = next;
              next = next.nextElementSibling;
              toRemove.remove();
            }
            // Get active chatId (if needed)
            const chatId = (typeof getActiveChatId === 'function') ? getActiveChatId() : null;
            // Call fetchBotResponse with the new user query and chatId
            fetchBotResponse(newText, chatId);
          };
        });
      }
    }

    // Add bot message and actions to chat with typing effect
    function appendBotMessageTyping(htmlContent) {
      const botMsg = document.createElement('div');
      botMsg.className = 'bot-msg bot-msg-content';
      botMsg.innerHTML = `
        <div class="bot-header">GALGOTIAS AI-Bot</div>
        <p class="bot-typing-content"></p>
        <div class="bot-actions" style="display:none;">
          <div class="reaction-group">
            <i class="bi bi-hand-thumbs-up" title="Like"></i>
            <span style="margin: 0; color: #bbb;">|</span>
            <i class="bi bi-hand-thumbs-down" title="Dislike"></i>
            <span style="margin: 0; color: #bbb;">|</span>
            <i class="bi bi-clipboard copy-bot-response" title="Copy"></i>
          </div>
          <button class="regenerate-btn">
            <i class="bi bi-arrow-repeat"> Regenerate</i>
          </button>
        </div>
      `;
      chatWrapper.appendChild(botMsg);
      scrollChatToBottom();
      const typingDiv = botMsg.querySelector('.bot-typing-content');
      const botActions = botMsg.querySelector('.bot-actions');
      // Parse HTML into nodes and type word by word with formatting
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = htmlContent;
      const nodes = Array.from(tempDiv.childNodes);
      let nodeIdx = 0, wordIdx = 0, currentNode = null, currentWords = [], typingNode = null;
      function typeNext() {
        if (!currentNode || wordIdx >= currentWords.length) {
          // Move to next node
          if (nodeIdx >= nodes.length) {
            // Done typing all nodes
            if (botActions) botActions.style.display = '';
            // Ensure last line is 50px above chat-input and scroll to bottom
            const chatInput = document.querySelector('.chat-input');
            if (chatInput) {
              const typingRect = typingDiv.getBoundingClientRect();
              const inputRect = chatInput.getBoundingClientRect();
              // Get the bot-actions element's bottom
              const botActionsRect = botActions ? botActions.getBoundingClientRect() : typingRect;
              const minGap = 50;
              // If the bottom of bot-actions is less than 50px above chat-input, scroll up
              const offset = botActionsRect.bottom - (inputRect.top - minGap);
              if (offset > 0) {
                window.scrollBy({
                  top: offset,
                  left: 0,
                  behavior: 'auto'
                });
              }
            }

            // Add copy event for this bot response
            const copyBtn = botMsg.querySelector('.copy-bot-response');
            if (copyBtn) {
              copyBtn.addEventListener('click', function() {
                // Get the HTML content of the bot response
                const temp = document.createElement('div');
                temp.innerHTML = typingDiv.innerHTML;
                // Convert <br> to newlines and strip HTML tags for plain text copy
                let text = temp.innerHTML.replace(/<br\s*\/?>(\s*)/gi, '\n');
                text = text.replace(/<[^>]+>/g, '');
                // Copy to clipboard
                navigator.clipboard.writeText(text).then(() => {
                  copyBtn.classList.add('copied');
                  copyBtn.title = 'Copied!';
                  setTimeout(() => {
                    copyBtn.classList.remove('copied');
                    copyBtn.title = 'Copy';
                  }, 1200);
                });
              });
            }
            // Add regenerate event for this bot response
            const regenerateBtn = botMsg.querySelector('.regenerate-btn');
            if (regenerateBtn) {
              regenerateBtn.addEventListener('click', function() {
                // Find the user message just before this bot message
                let prev = botMsg.previousElementSibling;
                let userMsg = null;
                while (prev) {
                  if (prev.classList.contains('user-msg')) {
                    userMsg = prev;
                    break;
                  }
                  prev = prev.previousElementSibling;
                }
                if (userMsg) {
                  // Get the user query text
                  const userText = userMsg.querySelector('p')?.textContent || '';
                  // Remove the current bot message
                  botMsg.remove();
                  // Get active chatId (if needed)
                  const chatId = (typeof getActiveChatId === 'function') ? getActiveChatId() : null;
                  // Call fetchBotResponse with the same user query and chatId
                  fetchBotResponse(userText, chatId);
                }
              });
            }
            // Remove scrollIntoView to prevent jumping to top after typing
            // typingDiv.scrollIntoView({ behavior: 'auto', block: 'end' });
            return;
          }
          currentNode = nodes[nodeIdx++];
          if (currentNode.nodeType === Node.TEXT_NODE) {
            currentWords = currentNode.textContent.split(/(\s+)/);
            typingNode = document.createTextNode('');
            typingDiv.appendChild(typingNode);
          } else if (currentNode.nodeType === Node.ELEMENT_NODE) {
            if (currentNode.tagName === 'BR') {
              typingDiv.appendChild(document.createElement('br'));
              // Continue to next node
              setTimeout(typeNext, 0);
              return;
            } else {
              typingNode = currentNode.cloneNode(false); // shallow clone
              typingDiv.appendChild(typingNode);
              currentWords = currentNode.textContent.split(/(\s+)/);
            }
          }
          wordIdx = 0;
        }
        if (wordIdx < currentWords.length) {
          if (typingNode.nodeType === Node.TEXT_NODE) {
            typingNode.textContent += currentWords[wordIdx];
          } else {
            typingNode.appendChild(document.createTextNode(currentWords[wordIdx]));
          }
          wordIdx++;
          scrollChatToBottom();
          // --- Scroll logic for 60px from chat-input, never below chat-input ---
          const chatInput = document.querySelector('.chat-input');
          if (chatInput) {
            const typingRect = typingDiv.getBoundingClientRect();
            const inputRect = chatInput.getBoundingClientRect();
            // If the bottom of the typingDiv would go below the top of chat-input, scroll so it stays above
            if (typingRect.bottom > inputRect.top - 60) {
              // Scroll so last line is 60px above chat-input, but never below
              const offset = typingRect.bottom - (inputRect.top - 60);
              if (offset > 0) {
                window.scrollBy({
                  top: offset,
                  left: 0,
                  behavior: 'auto'
                });
              }
            }
          }
          setTimeout(typeNext, currentWords[wordIdx-1].trim() === '' ? 0 : 55);
        } else {
          // Move to next node
          setTimeout(typeNext, 0);
        }
      }
      typeNext();
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


    // Get the active chatId (topmost chat history)
    function getActiveChatId() {
      // Find the first conversation item in the sidebar (topmost chat)
      const conversation = document.querySelector('.scrollable-conversations .conversations[data-chat-id]');
      if (conversation) {
        return conversation.getAttribute('data-chat-id');
      }
      return null;
    }

    // Handle sending user input
    function handleChatInput() {
      const message = inputField.value.trim();
      if (!message) return;

      // Get active chatId
      const chatId = getActiveChatId();
      showChatMessage(); // Show user message with animation
      appendUserMessage(message);
      inputField.value = '';
      fetchBotResponse(message, chatId);
    }

    // formating the response of the bot
    function formatResponse(text) {
        return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<span class="subheading">$1</span>')
        .replace(/\n/g, '<br>');
    }
    
    // Fetch bot response from backend
    function fetchBotResponse(userQuery, chatId) {
      const bodyObj = { message: userQuery };
      if (chatId) bodyObj.chat_id = chatId;
      fetch('/ask/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(bodyObj)
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
      .then((data) => {
        if (data && data.response) {
            const formattedText = formatResponse(data.response);
            appendBotMessageTyping(formattedText); // response with typing effect
        } else {
          appendBotMessageTyping("<p>Sorry, I didn't understand that. Please try again.</p>");
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


  document.addEventListener('DOMContentLoaded', () => {

  });