document.addEventListener('DOMContentLoaded', () => {
    
    const inputField = document.getElementById('chatInputBox');
    const sendBtn = document.getElementById('chatInputBtn');
    // const chatWrapper = document.querySelector('.chat-wrapper');
    const chatWrapper = document.getElementById('chatArea');
    const leftCards = document.getElementById('leftCardsSection');
    const centerText = document.getElementById('centerTextSection');
    const featureCard = document.querySelectorAll('.feature-card');
    const infoCard = document.querySelectorAll('.info-card');
    
    var ChatId = getActiveChatId();
    debugger;
    loadChatMessages(ChatId);
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
          // Create edit box (styled like ChatGPT, expands full width with smooth transition)
          const editBox = document.createElement('div');
          editBox.className = 'edit-box';
          editBox.style.display = 'flex';
          editBox.style.flexDirection = 'column';
          editBox.style.background = '#f7f7f8';
          editBox.style.border = '1.5px solid #d9d9e3';
          editBox.style.borderRadius = '12px';
          editBox.style.padding = '12px 12px 8px 12px';
          editBox.style.margin = '8px 0 0 10px';
          editBox.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          editBox.style.width = '0';
          editBox.style.maxWidth = '0';
          editBox.style.opacity = '0';
          editBox.style.transform = 'scaleX(0.90)';
          editBox.style.transition = 'width 0.45s cubic-bezier(.4,1.3,.6,1), max-width 0.45s cubic-bezier(.4,1.3,.6,1), opacity 0.25s, transform 0.25s';
          editBox.style.overflow = 'hidden';
          userDiv.appendChild(editBox);
          // Animate to full width after insertion
          setTimeout(() => {
            editBox.style.width = '90%';
            editBox.style.maxWidth = '90%';
            editBox.style.opacity = '1';
            editBox.style.transform = 'scaleX(1)';
          }, 10);
          editBox.innerHTML = `
            <textarea class="form-control" style="min-height:32px;max-height:100px;resize:vertical;border:none;background:transparent;font-size:0.9rem;line-height:1.4;outline:none;box-shadow:none;padding:0;width:100%;color:#222;">${originalText}</textarea>
            <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;width:100%;">
              <button class="cancel-edit" style="border-radius:7px;padding:4px 16px;font-weight:500;font-size:0.93rem;background:#f5f7fa;border:1.5px solid #bdbdbd;color:#1976d2;box-shadow:0 2px 8px rgba(0,123,255,0.10),0 1.5px 0 #e3e8f0 inset;transition:background 0.18s,border 0.18s,box-shadow 0.18s;cursor:pointer;">Cancel</button>
              <button class="ask-edit" style="border-radius:7px;padding:4px 16px;font-weight:500;font-size:0.93rem;background:linear-gradient(90deg,#0056b3 0%,#007bff 100%);border:none;color:#fff;box-shadow:0 2px 8px rgba(0,123,255,0.18),0 1.5px 0 #e3e8f0 inset;transition:background 0.18s,box-shadow 0.18s;cursor:pointer;">Ask</button>
            </div>
          `;
          const textarea = editBox.querySelector('textarea');
          textarea.focus();
          textarea.select();
          // Cancel button logic
          editBox.querySelector('.cancel-edit').onclick = function() {
            editBox.style.opacity = '0';
            editBox.style.transform = 'scaleX(0.90)';
            editBox.style.width = '0';
            editBox.style.maxWidth = '0';
            setTimeout(() => {
              editBox.remove();
              userDiv.querySelector('p').style.display = '';
              editIcon.style.display = '';
            }, 350);
          };
          // Ask button logic
          editBox.querySelector('.ask-edit').onclick = function() {
            const newText = textarea.value.trim();
            if (!newText) return;
            // Update user message
            userDiv.querySelector('p').textContent = newText;
            editBox.style.opacity = '0';
            editBox.style.transform = 'scaleX(0.90)';
            editBox.style.width = '0';
            editBox.style.maxWidth = '0';
            setTimeout(() => {
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
            }, 350);
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

    // Append bot message without typing effect (for loaded messages)
    function appendBotMessageNoTyping(htmlContent) {
      const botMsg = document.createElement('div');
      botMsg.className = 'bot-msg bot-msg-content';
      botMsg.innerHTML = `
        <div class="bot-header">GALGOTIAS AI-Bot</div>
        <p class="bot-typing-content">${htmlContent}</p>
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
    }

    // Ensure chat area always leaves 70px above chat-input
    function scrollChatToBottom() {
      // Add enough bottom padding to chatWrapper
      chatWrapper.style.paddingBottom = '90px'; // 70px + 20px buffer
      chatWrapper.scrollTop = chatWrapper.scrollHeight;
    }

    // Function to display the chat message

    
    function showChatMessage() {
      debugger;
        // If cards are visible, animate them out and show chat area with animation
        if (leftCards.style.display !== 'none' && centerText.style.display !== 'none') {
          debugger;
          centerText.classList.add('slide-fade-up');
          leftCards.classList.add('slide-fade-up');
          let transitioned = false;
          debugger
          function onTransitionEnd() {
            debugger
                if (transitioned) return;
                transitioned = true;
                leftCards.style.display = 'none';
                centerText.style.display = 'none';
                chatArea.style.display = 'flex';
                centerText.classList.remove('slide-fade-up');
                leftCards.classList.remove('slide-fade-up');
                centerText.removeEventListener('transitionend', onTransitionEnd);
                leftCards.removeEventListener('transitionend', onTransitionEnd);
                // First chat bubble with animation
            }
            debugger;
            leftCards.addEventListener('transitionend', onTransitionEnd);
            centerText.addEventListener('transitionend', onTransitionEnd);
        }
    } 


    // Get the active chatId (from the currently active chat-item)
    function getActiveChatId() {
      // Find the conversation item in the sidebar that is currently active
      const activeConversation = document.querySelector('.conversation-item.active');
      if (activeConversation && activeConversation.dataset.chatId) {
        return activeConversation.dataset.chatId;
      }
      // Fallback: try to find the first conversation with data-chat-id
      const conversation = document.querySelector('.scrollable-conversations .conversations[data-chat-id]');
      if (conversation) {
        return conversation.getAttribute('data-chat-id');
      }
      return null;
    }

    // Fetch and display chat messages for a given chatId
function loadChatMessages(chatId) {
  debugger;
  if (!chatId) return;
  debugger;
  chatWrapper.innerHTML = '';
  fetch(`/get-chat-messages/?chat_id=${encodeURIComponent(chatId)}`)
    .then(res => res.json())
    .then(data => {
      if (data && Array.isArray(data.messages) && data.messages.length > 0) {
        data.messages.forEach(msg => {
          showChatMessage();
          appendUserMessage(msg.input_query);
          appendBotMessageNoTyping(formatResponse(msg.bot_response));
        });
      } else {
        debugger;
        // Optionally handle empty chat (e.g., show a placeholder or do nothing)
        // chatWrapper.innerHTML = '<div class="empty-chat-msg">No messages yet.</div>';
      }
    });
    debugger;
    // Check if the chatId has messages; if not, show home page cards, else show messages
    fetch(`/get-chat-messages/?chat_id=${encodeURIComponent(chatId)}`)
      .then(res => res.json())
      .then(data => {
      if (data && Array.isArray(data.messages) && data.messages.length === 0) {
        showHomePageCards();
      } else {
        
        // Messages already loaded above, do nothing
      }
      });


} 

function showHomePageCards() {
  if (leftCards.style.display == 'none' && centerText.style.display == 'none') {
    leftCards.style.display = 'flex';
    centerText.style.display = 'block';
    chatArea.style.display = 'none';
    debugger;
  }
  
}
// Attach click event to conversation items to load messages
const convList = document.getElementById('conversationList');
let prevActiveChatId = getActiveChatId();

if (convList) {
  convList.addEventListener('click', function(e) {
    const item = e.target.closest('.conversation-item');
    if (item) {
      const chatId = item.getAttribute('data-chat-id');
      // If the clicked chat is already active, do nothing
      if (chatId === prevActiveChatId) return;
      // Update active class
      convList.querySelectorAll('.conversation-item').forEach(function(ci) {
        ci.classList.remove('active');
      });
      item.classList.add('active');
      prevActiveChatId = chatId;
      // Use a flag to delay only on the first click
      if (!window._firstChatLoadDone) {
        window._firstChatLoadDone = true;
        setTimeout(() => {
          loadChatMessages(chatId);
        }, 500); // Delay only for the first click
      } else {
        // Check if the selected chat has any messages in the database
        fetch(`/get-chat-messages/?chat_id=${encodeURIComponent(chatId)}`)
          .then(res => res.json())
          .then(data => {
            if (data && Array.isArray(data.messages) && data.messages.length === 0) {
              leftCards.style.display = '';
              centerText.style.display = '';
              chatArea.style.display = 'none';
            } else {
              loadChatMessages(chatId); // Load messages if chat is not empty
            }
          });
      }
    }
  });
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
        // Remove multiple spaces/tabs and newlines after a colon (e.g. ":  \n\n" or ": \n\n\n" or ":   \n\n\n\n") and keep only a single newline
        text = text.replace(/:(?:[ \t\r]*)?(\n[ \t\r]*){2,}/g, ':\n');
        // Convert patterns like \n\s*\*\s to bullets (e.g. "\n   * text")
        // We'll split lines and look for lines that start with * (optionally after whitespace)
        let lines = text.split(/\n/);
        let formatted = '';
        let inUl = false;
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            // If line is a bullet (optionally after whitespace)
            if (/^\s*\*\s+/.test(line)) {
                if (!inUl) { formatted += '<ul>'; inUl = true; }
                formatted += '<li>' + line.replace(/^\s*\*\s+/, '') + '</li>';
            } else {
                if (inUl) { formatted += '</ul>'; inUl = false; }
                formatted += line + (i < lines.length - 1 ? '\n' : '');
            }
        }
        if (inUl) formatted += '</ul>';
        // Improved URL regex: matches http(s):// or www. and ensures full URL match, excluding trailing punctuation
        const urlRegex = /(?:(?:https?:\/\/)|www\.)[a-zA-Z0-9\-._~:/?#@!$&'()*+,;=%]+/gi;
        // Find all unique URLs in the text
        const foundUrls = [];
        let match;
        let uniqueUrls = new Set();
        while ((match = urlRegex.exec(formatted)) !== null) {
            // Remove trailing punctuation
            let url = match[0];
            while (/[.,;:!?)]$/.test(url)) {
                url = url.slice(0, -1);
            }
            // Normalize for deduplication (ignore http/https and www)
            let norm = url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/$/, '');
            if (!uniqueUrls.has(norm)) {
                uniqueUrls.add(norm);
                foundUrls.push(url);
            }
        }
        // Replace all URLs in text with the first unique occurrence only
        let replaced = formatted;
        foundUrls.forEach(url => {
            // Remove trailing punctuation for display
            let displayUrl = url;
            let trailing = '';
            while (/[.,;:!?)]$/.test(displayUrl)) {
                trailing = displayUrl.slice(-1) + trailing;
                displayUrl = displayUrl.slice(0, -1);
            }
            // Build link HTML
            let href = displayUrl.startsWith('http') ? displayUrl : 'http://' + displayUrl;
            let linkHtml = `<a href="${href}" target="_blank" rel="noopener noreferrer" style="color:#1976d2;text-decoration:underline;word-break:break-all;">${displayUrl}</a>${trailing}`;
            // Replace all occurrences of this url (with or without http/https/www) with the link, only the first time
            let urlPattern = new RegExp(`((https?:\/\/)?(www\.)?)` + displayUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
            let replacedOnce = false;
            replaced = replaced.replace(urlPattern, function(match) {
                if (!replacedOnce) {
                    replacedOnce = true;
                    return linkHtml;
                } else {
                    return '';
                }
            });
        });
        return replaced
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
          'Content-Type': 'application/json',
          'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify({ message: userQuery, chat_id: chatId }),
      })
        .then(response => response.json())
        .then(data => {
          if (data && data.response) {
            const formattedText = formatResponse(data.response);
            appendBotMessageTyping(formattedText); // response with typing effect
          } else {
            appendBotMessageTyping("<p>Sorry, I didn't understand that. Please try again.</p>");
          }
          // --- Real-time sidebar heading update logic ---
          // Only update if this is the first message in the chat
          if (chatId) {
            // Find the sidebar chat item by data-chat-id
            const chatItem = document.querySelector(`.conversation-item[data-chat-id="${chatId}"]`);
            if (chatItem) {
              // Check if this chat only has one message (i.e., first message just sent)
              // We'll check if the chat heading is still the default (e.g., 'New Chat')
              const headingSpan = chatItem.querySelector('.conversation-heading, .chat-heading, span');
              if (headingSpan && (headingSpan.textContent.trim() === 'New Chat' || headingSpan.textContent.trim() === '' || headingSpan.textContent.trim().length < 5)) {
                // Use the first 22 chars of the bot response + '...'
                let newHeading = data.response ? (data.response.slice(0, 22) + '...') : '';
                headingSpan.textContent = newHeading;
              }
            }
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

    // Handle Info card clicks

        infoCard.forEach(function(card) {
          card.addEventListener('click', function() {
            const contentElem = card;
            const titleElem = card.querySelector('p');
            const featureCardContent = (contentElem ? contentElem.textContent : '') + (titleElem ? titleElem.textContent : '');
            const message = featureCardContent.trim();
            if (!message) return;

            // Get active chatId
            const chatId = getActiveChatId();
            showChatMessage(); // Show user message with animation
            appendUserMessage(message);
            fetchBotResponse(message, chatId);
            // Now you can use featureCardContent as needed, e.g., console.log(featureCardContent);
          });
        });

  });


  document.addEventListener('DOMContentLoaded', () => {
    const inputField = document.getElementById('chatInputBox'); // Ensure inputField is available in this scope
    // Soundwave icon as mic logic
    const soundwaveIcon = document.querySelector('.soundwave-icon, .bi-soundwave, .bi-mic, .bi-mic-fill, #chatInputMic');
    if (soundwaveIcon) {
      soundwaveIcon.style.cursor = 'pointer';
      soundwaveIcon.title = 'Speak your query';
      let recognition;
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'en-IN'; // Set the language for recognition
        recognition.interimResults = true; // Enable interim results for live transcription
        recognition.maxAlternatives = 1;
        let listening = false;
        let finalTranscript = '';
        let userStopped = false; // Track if user manually stopped
        soundwaveIcon.addEventListener('click', function() {
          if (!listening) {
            userStopped = false;
            recognition.start();
            soundwaveIcon.style.color = '#007bff';
            soundwaveIcon.style.animation = 'pulse-mic 1s infinite';
          } else {
            userStopped = true;
            recognition.stop();
            soundwaveIcon.style.color = '';
            soundwaveIcon.style.animation = '';
          }
          listening = !listening;
        });
        recognition.onresult = function(event) {
          let interimTranscript = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              finalTranscript += event.results[i][0].transcript;
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
          if (inputField) {
            const fullText = (finalTranscript + interimTranscript).replace(/^\s+/, '');
            // Always animate from current value to fullText, even if fullText grows
            if (window.speechLetterInterval) {
              clearInterval(window.speechLetterInterval);
              window.speechLetterInterval = null;
            }
            let current = inputField.value;
            let idx = 0;
            // If the transcript shrinks (e.g. user paused and resumed), reset to fullText
            if (current.length > fullText.length || !fullText.startsWith(current)) {
              current = '';
              inputField.value = '';
              if (inputField.tagName === 'TEXTAREA') {
                inputField.style.height = 'auto';
                inputField.style.height = (inputField.scrollHeight) + 'px';
              }
            }
            idx = current.length;
            window.speechLetterInterval = setInterval(() => {
              if (idx < fullText.length) {
                current += fullText[idx];
                inputField.value = current;
                // Auto-resize textarea if needed
                if (inputField.tagName === 'TEXTAREA') {
                  inputField.style.height = 'auto';
                  inputField.style.height = (inputField.scrollHeight) + 'px';
                }
                idx++;
              } else {
                clearInterval(window.speechLetterInterval);
                window.speechLetterInterval = null;
              }
            }, 22);
          }
        };
        recognition.onend = function() {
          soundwaveIcon.style.color = '';
          soundwaveIcon.style.animation = '';
          listening = false;
          if (window.speechLetterInterval) {
            clearInterval(window.speechLetterInterval);
            window.speechLetterInterval = null;
          }
          // If user did not manually stop, restart recognition for continuous listening
          if (!userStopped) {
            recognition.start();
            soundwaveIcon.style.color = '#007bff';
            soundwaveIcon.style.animation = 'pulse-mic 1s infinite';
            listening = true;
            return;
          }
          finalTranscript = '';
          // Ensure blinking cursor in input field after speech ends
          if (inputField) {
            inputField.focus();
            // Move cursor to end
            const val = inputField.value;
            inputField.value = '';
            inputField.value = val;
          }
        };
        recognition.onerror = function() {
          soundwaveIcon.style.color = '';
          soundwaveIcon.style.animation = '';
          listening = false;
          userStopped = true;
          finalTranscript = '';
        };
      } else {
        soundwaveIcon.addEventListener('click', function() {
          alert('Speech recognition is not supported in this browser.');
        });
      }
      // Add keyframes for mic animation if not already present
      if (!document.getElementById('mic-pulse-style')) {
        const style = document.createElement('style');
        style.id = 'mic-pulse-style';
        style.innerHTML = `@keyframes pulse-mic {0%{box-shadow:0 0 0 0 #007bff44;}70%{box-shadow:0 0 0 10px #007bff00;}100%{box-shadow:0 0 0 0 #007bff44;}}`;
        document.head.appendChild(style);
      }
    }
  });

  // Enhance chat input: auto-expand textarea logic
  const chatInputBox = document.getElementById('chatInputBox');
  if (chatInputBox && chatInputBox.tagName === 'TEXTAREA') {
    function autoResizeTextarea() {
      chatInputBox.style.height = 'auto';
      chatInputBox.style.height = (chatInputBox.scrollHeight) + 'px';
    }
    chatInputBox.addEventListener('input', autoResizeTextarea);
    // Initial resize
    autoResizeTextarea();
    chatInputBox.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' && !e.shiftKey) {
        setTimeout(() => {
          chatInputBox.value = '';
          chatInputBox.style.height = 'auto';
        }, 10);
      }
    });
  }