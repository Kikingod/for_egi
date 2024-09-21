(function() {
    function loadChatbot() {
        const chatbotConfig = window.embeddedChatbotConfig;
        if (!chatbotConfig || !chatbotConfig.chatbotId || !chatbotConfig.domain) {
            console.error('Chatbot configuration is missing');
            return;
        }
        const chatbox = document.getElementById('chatbox');
        const scrollToBottomButton = document.getElementById('scroll-to-bottom-button');
        const input = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-button');
        const chatbotContainer = document.getElementById('chatbot-container');
        const chatbotHeader = document.getElementById('chatbot-header');
        const closeChatButton = document.getElementById('close-chat');
        const maximizeButton = document.getElementById('maximize-chat');
        const refreshButton = document.getElementById('refresh-chat');
        const chatbotButton = document.getElementById('chatbot-button');

        let isMaximized = false;
        let isChatOpen = false;
        let originalSize = {
            width: '450px',
            height: '80%'
        };
        let originalPosition = {
            right: '20px',
            bottom: '90px'
        };

        const welcomeMessage = `🤖 Hey there! I'm Epo Bob, your AI assistant from Epomaker! How can I help you today? Let's make your day awesome! 🎯✨🚀`;

        const charLimit = 350;
        const scrollThreshold = 250;

        const maximizeIcon = "./static/assets/logos/maximize_logo1.svg";
        const minimizeIcon = "./static/assets/logos/minimize_logo1.svg";
        const closedWidgetIcon = "./static/assets/img/widget_logo1.png";
        const openWidgetIcon = "./static/assets/img/close_widget_logo1.png";

        // Set initial styles to prevent flickering
        chatbotContainer.style.visibility = 'hidden';
        chatbotContainer.style.display = 'none';
        chatbotContainer.style.width = originalSize.width;
        chatbotContainer.style.height = originalSize.height;
        chatbotContainer.style.right = originalPosition.right;
        chatbotContainer.style.bottom = originalPosition.bottom;

        // Use setTimeout to ensure styles are applied before making visible
        setTimeout(() => {
            chatbotContainer.style.visibility = 'visible';
        }, 0);


        function adjustChatbotHeight() {
            const windowHeight = window.innerHeight;
            const bottomMargin = 110; // 90px from bottom + 20px extra
            const maxHeight = windowHeight - bottomMargin;
            
            chatbotContainer.style.maxHeight = `${maxHeight}px`;
            
            // Ensure the chatbot doesn't become too small
            if (maxHeight < 300) {
                chatbotContainer.style.bottom = `${bottomMargin - (300 - maxHeight)}px`;
            } else {
                chatbotContainer.style.bottom = '90px';
            }
        }

        function adjustInputHeight() {
            input.style.height = 'auto';
            const maxHeight = 150; // Maximum height in pixels
            if (input.scrollHeight > maxHeight) {
                input.style.height = maxHeight + 'px';
                input.style.overflowY = 'auto';
            } else {
                input.style.height = input.scrollHeight + 'px';
                input.style.overflowY = 'hidden';
            }
        }

        window.addEventListener('resize', adjustChatbotHeight);

        function addInitialMessage() {
            if (chatbox.children.length === 0) {
                const initialMessage = createBotMessageElement(welcomeMessage);
                chatbox.appendChild(initialMessage);
                saveConversation();
            }
        }

        function updateSendButtonState() {
            if (input.value.trim() !== '') {
                sendButton.classList.add('active');
                sendButton.disabled = false;
                sendButton.style.cursor = 'pointer';
            } else {
                sendButton.classList.remove('active');
                sendButton.disabled = true;
                sendButton.style.cursor = 'not-allowed';
            }
        }

        function updateChatbotButtonIcon() {
            const iconElement = chatbotButton.querySelector('img') || chatbotButton.querySelector('svg');
            if (isChatOpen) {
                if (iconElement) {
                    iconElement.remove();
                }
                const img = document.createElement('img');
                img.src = openWidgetIcon;
                img.alt = "Close chat";
                img.style.width = "24px";
                img.style.height = "24px";
                chatbotButton.appendChild(img);
            } else {
                if (iconElement) {
                    iconElement.remove();
                }
                const img = document.createElement('img');
                img.src = closedWidgetIcon;
                img.alt = "Open chat";
                img.style.width = "24px";
                img.style.height = "24px";
                chatbotButton.appendChild(img);
            }
        }

        function updateCharCounter(remainingChars) {
            let charCounter = document.getElementById('char-counter');
            
            if (!charCounter) {
                // Create a character counter if it doesn't exist
                charCounter = document.createElement('div');
                charCounter.id = 'char-counter';
                charCounter.style.fontSize = '12px';
                charCounter.style.color = 'grey';
                input.parentNode.insertBefore(charCounter, input.nextSibling); // Place after textarea
            }
            
            // Update the counter text
            charCounter.textContent = `${remainingChars}`;

            if (remainingChars <= 20) { 
                charCounter.style.color = 'red'
            } else {
                charCounter.style.color = 'grey'
            }
        }

        input.addEventListener('input', function() {
            // Adjust the height of the input area
            adjustInputHeight();
        
            // Update the send button state (assuming it checks for character limits as well)
            updateSendButtonState();
        
            // If the input exceeds the character limit, truncate it
            if (input.value.length > charLimit) {
                input.value = input.value.substring(0, charLimit); // Truncate input
            }
        
            // Update the character counter
            const remainingChars = charLimit - input.value.length;
            console.log(remainingChars)
            updateCharCounter(remainingChars);
        });

        input.addEventListener('keydown', function(event) {
            if (event.key === 'Enter' && !event.shiftKey && input.value.trim() !== '') {
                event.preventDefault();
                sendMessage(input.value);
                // Reset the input height after sending the message
                input.style.height = 'auto';
            }
        });

        sendButton.addEventListener('click', function() {
            if (input.value.trim() !== '') {
                sendMessage(input.value);
            }
        });

        function createBotMessageElement(message, id) {
            const messageContainer = document.createElement('div');
            messageContainer.style.display = 'flex';
            messageContainer.style.alignItems = 'flex-start';
            messageContainer.style.marginBottom = '10px';
            messageContainer.id = 'mess';

            const logoContainer = document.createElement('div');
            logoContainer.style.width = '30px';
            logoContainer.style.height = '30px';
            logoContainer.style.borderRadius = '50%';
            logoContainer.style.overflow = 'hidden';
            logoContainer.style.marginRight = '10px';
            logoContainer.style.flexShrink = '0';

            const logoImg = document.createElement('img');
            logoImg.src = './static/assets/img/main_logo.png';
            logoImg.alt = 'Bot Logo';
            logoImg.style.width = '100%';
            logoImg.style.height = '100%';
            logoImg.style.objectFit = 'cover';

            logoContainer.appendChild(logoImg);

            const responseMessage = document.createElement('div');
            responseMessage.className = 'chat-message bot-message';
            responseMessage.style.whiteSpace = 'pre-wrap';
            responseMessage.id = `${id}`;
            responseMessage.textContent = message;
            messageContainer.appendChild(logoContainer);
            messageContainer.appendChild(responseMessage);

            return messageContainer;
        }
        
        function saveConversation() {
            const conversation = chatbox.innerHTML;
            localStorage.setItem('chatbotConversation', conversation);
        }

        function loadConversation() {
            const savedConversation = localStorage.getItem('chatbotConversation');
            if (savedConversation) {
                chatbox.innerHTML = savedConversation;
            } else {
                addInitialMessage();
            }
        }

        
        // Define the createTypingIndicator function first
        function createTypingIndicator() {
            const typingContainer = document.createElement('div');
            typingContainer.id = 'thinking-message'; // Same ID as before to easily remove it later
            typingContainer.style.display = 'flex';
            typingContainer.style.alignItems = 'center';
            typingContainer.style.marginBottom = '10px';

            const logoContainer = document.createElement('div');
            logoContainer.style.width = '30px';
            logoContainer.style.height = '30px';
            logoContainer.style.borderRadius = '50%';
            logoContainer.style.overflow = 'hidden';
            logoContainer.style.marginRight = '10px';
            logoContainer.style.flexShrink = '0';

            const logoImg = document.createElement('img');
            logoImg.src = './static/assets/img/main_logo.png'; // Assuming you have this bot logo
            logoImg.alt = 'Bot Logo';
            logoImg.style.width = '100%';
            logoImg.style.height = '100%';
            logoImg.style.objectFit = 'cover';
            logoContainer.appendChild(logoImg);

            // Create the bouncing dots animation
            const typingIndicator = document.createElement('div');
            typingIndicator.className = 'dots';
            typingIndicator.innerHTML = `
                <div></div>
                <div></div>
                <div></div>
            `;

            typingContainer.appendChild(logoContainer);
            typingContainer.appendChild(typingIndicator);

            return typingContainer;
        }
        
        async function sendMessage(message, isInitialization = false) {
            if (message.trim() === '') return;
        
            if (!isInitialization) {
                const userMessage = document.createElement('div');
                userMessage.className = 'chat-message user-message';
                userMessage.style.whiteSpace = 'pre-wrap';
                userMessage.textContent = message;
                chatbox.appendChild(userMessage);
            }
        
            input.value = '';
            input.style.height = 'auto';
            updateSendButtonState();
        
            // Add typing indicator
            const thinkingMessage = createTypingIndicator();
            thinkingMessage.id = 'thinking-message';
            chatbox.appendChild(thinkingMessage);
            chatbox.scrollTop = chatbox.scrollHeight;

            const body = document.getElementById('response');
            
            
            // Start the fetch API call
            const response = await fetch("/api/chat", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({message: input.value})
            });

            const reader = response.body.getReader();
            let output = "";
            const uniqueID = crypto.randomUUID();
            const botMessageElement = createBotMessageElement('',id =  uniqueID);
            chatbox.appendChild(botMessageElement);
            while (true) {
                const { done, value } = await reader.read();
                output += new TextDecoder().decode(value);  
                
                const but = document.getElementById(`${uniqueID}`);
                but.textContent = output
                
                
                
                
                const thinkingMsg = document.getElementById('thinking-message');
                if (thinkingMsg) {
                    chatbox.removeChild(thinkingMsg);
                }

                chatbox.scrollTop = chatbox.scrollHeight;
                saveConversation();
                

                if (done) {
                    return;
                }
            }
        }
        
        function toggleChat() {
            if (isChatOpen) {
                chatbotContainer.classList.add('popping-down');
                chatbotContainer.addEventListener('animationend', function animHandler() {
                    chatbotContainer.style.display = 'none';
                    chatbotContainer.classList.remove('popping-down');
                    isChatOpen = false;
                    isMaximized = false;
                    chatbotContainer.removeEventListener('animationend', animHandler);
                    
                    updateChatbotButtonIcon();
                }, { once: true });
            } else {
                loadConversation();
                chatbotContainer.style.display = 'flex';
                chatbotContainer.classList.add('popping-up');
                
                if (!isMaximized) {
                    chatbotContainer.style.width = originalSize.width;
                    chatbotContainer.style.height = originalSize.height;
                    chatbotContainer.style.right = originalPosition.right;
                    chatbotContainer.style.bottom = originalPosition.bottom;
                    chatbotContainer.style.left = '';
                    chatbotContainer.style.top = '';
                    adjustChatbotHeight();
                } else {
                    maximizeChat();
                }
                
                addInitialMessage();
                isChatOpen = true;
                
                chatbotContainer.addEventListener('animationend', function animHandler() {
                    chatbotContainer.classList.remove('popping-up');
                    chatbox.scrollTop = chatbox.scrollHeight;
                }, { once: true });
            }
            
            updateChatbotButtonIcon();
        }

        function resetChatPosition() {
            chatbotContainer.style.width = originalSize.width;
            chatbotContainer.style.height = originalSize.height;
            chatbotContainer.style.right = originalPosition.right;
            chatbotContainer.style.bottom = originalPosition.bottom;
            chatbotContainer.style.left = '';
            chatbotContainer.style.top = '';
            chatbotContainer.style.maxHeight = ''; // Reset maxHeight
            isMaximized = false;
            maximizeButton.querySelector('img').src = maximizeIcon;
            maximizeButton.classList.remove('minimized')
        }

        function maximizeChat() {
            if (isMaximized) {
                resetChatPosition();
                adjustChatbotHeight(); // Adjust height after resetting
                maximizeButton.classList.remove('minimized')
            } else {
                chatbotContainer.style.width = '100vw';
                chatbotContainer.style.height = '100vh';
                chatbotContainer.style.top = '0';
                chatbotContainer.style.left = '0';
                chatbotContainer.style.right = '0';
                chatbotContainer.style.bottom = '0';
                chatbotContainer.style.maxHeight = '100vh';
                maximizeButton.querySelector('img').src = minimizeIcon;
                maximizeButton.classList.add('minimized')
                isMaximized = true;
            }
        }

        function refreshConversation() {
            chatbox.innerHTML = '';
            input.value = '';
            addInitialMessage();
            updateSendButtonState();
            localStorage.removeItem('chatbotConversation');
            console.log('Conversation refreshed');
        }

        chatbotButton.addEventListener('click', toggleChat);

        closeChatButton.addEventListener('click', function() {
            // Apply the same animation used in the toggleChat function for closing
            if (isChatOpen) {
                chatbotContainer.classList.add('popping-down');
                chatbotContainer.addEventListener('animationend', function animHandler() {
                    chatbotContainer.style.display = 'none';
                    chatbotContainer.classList.remove('popping-down');
                    isChatOpen = false;
                    isMaximized = false;
                    maximizeButton.querySelector('img').src = maximizeIcon;
                    maximizeButton.classList.remove('minimized')
                    updateChatbotButtonIcon();
                    chatbotContainer.removeEventListener('animationend', animHandler);
                }, { once: true });
            }
        });


        scrollToBottomButton.addEventListener('click', () => {
            // Smoothly scroll to the bottom of the chatbox
            chatbox.scrollTo({
                top: chatbox.scrollHeight,
                behavior: 'smooth' // Enables smooth scrolling
            });
            
            scrollToBottomButton.classList.remove('show');
            scrollToBottomButton.classList.add('hide'); // Hide the button after click
        });
        
        chatbox.addEventListener('scroll', () => {
            if (chatbox.scrollTop < chatbox.scrollHeight - chatbox.clientHeight - scrollThreshold) {
                scrollToBottomButton.classList.remove('hide');
                scrollToBottomButton.classList.add('show'); // Show the button when scrolling up
            } else {
                scrollToBottomButton.classList.remove('show');
                scrollToBottomButton.classList.add('hide'); // Hide the button when at the bottom
            }
        });

        maximizeButton.addEventListener('click', maximizeChat);
        refreshButton.addEventListener('click', refreshConversation);

        let isDragging = false;
        let dragOffsetX, dragOffsetY;
        let startX, startY;

        const chatbotHeaderText = document.querySelector('#chatbot-header h3');

        // Prepare the container for high-performance transforms
        chatbotContainer.style.willChange = 'transform';
        chatbotContainer.style.transition = 'none';
        chatbotContainer.style.position = 'fixed';

        chatbotHeaderText.addEventListener('mousedown', initDrag, { passive: false });

        function initDrag(e) {
            isDragging = true;
            const rect = chatbotContainer.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
            startX = rect.left;
            startY = rect.top;

            document.addEventListener('mousemove', drag, { passive: false });
            document.addEventListener('mouseup', stopDrag);
            
            e.preventDefault();

            chatbotContainer.style.pointerEvents = 'none';
        }

        function drag(e) {
            if (!isDragging) return;
        
            requestAnimationFrame(() => {
                const newX = e.clientX - dragOffsetX;
                const newY = e.clientY - dragOffsetY;
        
                // Get the dimensions of the viewport and chatbot container
                const viewportWidth = window.innerWidth;
                const viewportHeight = window.innerHeight;
                const containerRect = chatbotContainer.getBoundingClientRect();
                const containerWidth = containerRect.width;
                const containerHeight = containerRect.height;
        
                // Clamp the new position to prevent going out of bounds
                const clampedX = Math.min(
                    Math.max(newX, 0),
                    viewportWidth - containerWidth
                );
                const clampedY = Math.min(
                    Math.max(newY, 0),
                    viewportHeight - containerHeight
                );
        
                // Apply the clamped values directly to the transform
                chatbotContainer.style.transform = `translate(${clampedX - startX}px, ${clampedY - startY}px)`;
            });
        
            e.preventDefault();
        }
        
        function stopDrag() {
            if (!isDragging) return;
        
            isDragging = false;
            document.removeEventListener('mousemove', drag);
            document.removeEventListener('mouseup', stopDrag);
        
            chatbotContainer.style.pointerEvents = 'auto';
        
            // Calculate final position based on the transform
            const transform = chatbotContainer.style.transform;
            let [deltaX, deltaY] = [0, 0];
            if (transform && transform.includes('translate')) {
                [deltaX, deltaY] = transform.match(/-?\d+\.?\d*/g).map(parseFloat);
            }
        
            // Update left and top positions directly from the final transform
            const finalLeft = startX + deltaX;
            const finalTop = startY + deltaY;
        
            chatbotContainer.style.transform = 'none';
            chatbotContainer.style.left = `${finalLeft}px`;
            chatbotContainer.style.top = `${finalTop}px`;
        
            // Update start positions for the next drag
            startX = finalLeft;
            startY = finalTop;
        }
        
        chatbotHeaderText.style.cursor = 'move';
        chatbotHeader.style.cursor = 'default';

        let isResizing = false;
        let resizeDirection = '';
        let startWidth, startHeight, startLeft, startTop;
        const resizeThreshold = 15;

        chatbotContainer.addEventListener('mousedown', initResize);
        document.addEventListener('mousemove', resize);
        document.addEventListener('mouseup', stopResize);

        function initResize(e) {
            if (e.target === chatbotHeader) return;

            const rect = chatbotContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (y <= resizeThreshold) resizeDirection += 'n';
            if (y >= rect.height - resizeThreshold) resizeDirection += 's';
            if (x <= resizeThreshold) resizeDirection += 'w';
            if (x >= rect.width - resizeThreshold) resizeDirection += 'e';

            if (resizeDirection) {
                isResizing = true;
                startX = e.clientX;
                startY = e.clientY;
                startWidth = rect.width;
                startHeight = rect.height;
                startLeft = rect.left;
                startTop = rect.top;
                e.preventDefault();
                e.stopPropagation();
            }
        }

        function resize(e) {
            if (isDragging) return;

            const rect = chatbotContainer.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (!isResizing) {
                let cursorStyle = '';

                if (y <= resizeThreshold) cursorStyle = 'ns-resize';
                else if (y >= rect.height - resizeThreshold) cursorStyle = 's-resize';

                if (x <= resizeThreshold) cursorStyle = cursorStyle ? 'nwse-resize' : 'ew-resize';
                else if (x >= rect.width - resizeThreshold) cursorStyle = cursorStyle ? 'nesw-resize' : 'ew-resize';

                chatbotContainer.style.cursor = cursorStyle || 'default';
                return;
            }

            const dx = e.clientX - startX;
            const dy = e.clientY - startY;

            if (resizeDirection.includes('e')) {
                const newWidth = Math.max(200, startWidth + dx);
                chatbotContainer.style.width = newWidth + 'px';
            }
            if (resizeDirection.includes('s')) {
                const newHeight = Math.max(300, startHeight + dy);
                const maxHeight = window.innerHeight - 110;
                chatbotContainer.style.height = Math.min(newHeight, maxHeight) + 'px';
            }
            if (resizeDirection.includes('w')) {
                const newWidth = Math.max(200, startWidth - dx);
                chatbotContainer.style.width = newWidth + 'px';
                chatbotContainer.style.left = (startLeft + startWidth - newWidth) + 'px';
            }
            if (resizeDirection.includes('n')) {
                const newHeight = Math.max(300, startHeight - dy);
                const maxHeight = window.innerHeight - 110;
                const adjustedHeight = Math.min(newHeight, maxHeight);
                chatbotContainer.style.height = adjustedHeight + 'px';
                chatbotContainer.style.top = (startTop + startHeight - adjustedHeight) + 'px';
            }
        }

        function stopResize() {
            isResizing = false;
            resizeDirection = '';
            chatbotContainer.style.cursor = 'default';
        }

        
        updateSendButtonState();
        adjustInputHeight();
        updateChatbotButtonIcon();
    }

    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        loadChatbot();
    } else {
        document.addEventListener('DOMContentLoaded', loadChatbot);
    }
})();