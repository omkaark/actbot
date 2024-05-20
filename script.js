(function () {
    const VOID_ELEMENTS = new Set(['area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta', 'param', 'source', 'track', 'wbr']);
    const READABLE_ATTRIBUTES = new Set(['id', 'class', 'title', 'alt', 'href', 'placeholder', 'label', 'value', 'caption', 'summary', 'aria-label', 'aria-describedby', 'datetime', 'download', 'selected', 'checked', 'type']);
    const REMOVE_TAGS = new Set(['script', 'style', 'iframe']);

    async function waitForLoad() {
        console.log("Waiting for page to load...");
        return new Promise(resolve => {
            setTimeout(() => {
                console.log("Page load timeout.");
                resolve();
            }, 1000);
        });
    }

    function clickElement(selector) {
        console.log(`Attempting to click element with selector: ${selector}`);
        try {
            const element = document.querySelector(selector);
            if (element) {
                element.click();
                console.log("Element clicked.");
                return true;
            } else {
                console.error(`Element not found: ${selector}`);
                return false;
            }
        }
        catch (e) {
            return false;
        }
    }

    async function typeInElement(selector, text) {
        console.log(`Attempting to type in element with selector: ${selector}`);
        try {
            const element = document.querySelector(selector);
            if (element) {
                for (let char of text) {
                    element.value += char;
                    await new Promise(resolve => setTimeout(resolve, 50)); // Delay 50ms between characters
                }
                console.log(`Typed text: ${text}`);
                return true;
            } else {
                console.error(`Element not found: ${selector}`);
                return false;
            }
        }
        catch (e) {
            return false;
        }
    }

    class DOMNode {
        constructor(element) {
            this.element = element;
            this.nodeName = element.nodeName.toLowerCase();
            this.nodeValue = element.nodeValue ? this.cleanText(element.nodeValue) : null;
            this.attributes = this.getReadableAttributes(element);
            this.children = Array.from(element.childNodes)
                .filter(child => !REMOVE_TAGS.has(child.nodeName.toLowerCase()))
                .map(child => new DOMNode(child));
        }

        cleanText(text) {
            return text.replace(/\s+/g, ' ').trim();
        }

        getReadableAttributes(element) {
            const attributes = {};
            for (let attr of element.attributes || []) {
                if (READABLE_ATTRIBUTES.has(attr.name)) {
                    attributes[attr.name] = attr.value;
                }
            }
            return attributes;
        }

        toString(indent = 0) {
            if (this.nodeName === '#text') {
                return ' '.repeat(indent) + (this.nodeValue || '');
            }

            const attrStr = Object.entries(this.attributes).map(([k, v]) => `${k}="${v}"`).join(' ');
            const openTag = `<${this.nodeName}${attrStr ? ' ' + attrStr : ''}>`;
            const closeTag = VOID_ELEMENTS.has(this.nodeName) ? '' : `</${this.nodeName}>`;

            if (this.children.length === 0) {
                return ' '.repeat(indent) + openTag + closeTag;
            }

            if (this.children.length === 1 && this.children[0].nodeName === '#text') {
                return ' '.repeat(indent) + openTag + this.children[0].toString() + closeTag;
            }

            const childrenStr = this.children.map(child => child.toString(indent + 2)).join('\n');
            return ' '.repeat(indent) + openTag + '\n' + childrenStr + '\n' + ' '.repeat(indent) + closeTag;
        }
    }

    function cleanHTML() {
        const root = new DOMNode(document.body);
        return root.toString();
    }

    const style = document.createElement('style');
    style.innerHTML = `
        #chatbotButton {
            position: fixed;
            bottom: 150px;
            right: 20px;
            z-index: 1000;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            font-size: 20px;
            cursor: pointer;
        }
        #chatbotInterface {
            position: fixed;
            bottom: 80px;
            right: 20px;
            z-index: 1000;
            width: 400px;
            height: 600px;
            background-color: white;
            border: 1px solid #ccc;
            border-radius: 10px;
            display: none;
            flex-direction: column;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        #chatbotHeader {
            background-color: #007bff;
            color: white;
            padding: 10px;
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            text-align: center;
        }
        #chatbotMessages {
            flex: 1;
            padding: 10px;
            overflow-y: auto;
        }
        .chatbotMessage {
            padding: 10px;
            border-radius: 10px;
            margin-bottom: 10px;
            max-width: 70%;
            clear: both;
        }
        .userMessage {
            background-color: #007bff;
            color: white;
            margin-left: auto;
            text-align: right;
        }
        .systemMessage {
            background-color: #f1f1f1;
            color: black;
            margin-right: auto;
            text-align: left;
        }
        #chatbotInput {
            display: flex;
            padding: 10px;
            border-top: 1px solid #ccc;
        }
        #chatbotInput input {
            flex: 1;
            padding: 5px;
            border: 1px solid #ccc;
            border-radius: 5px;
            margin-right: 5px;
        }
        #chatbotInput button {
            padding: 5px 10px;
            background-color: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }
    `;
    document.head.appendChild(style);

    const chatbotButton = document.createElement('button');
    chatbotButton.id = 'chatbotButton';
    chatbotButton.innerHTML = '+';
    document.body.appendChild(chatbotButton);

    const chatbotInterface = document.createElement('div');
    chatbotInterface.id = 'chatbotInterface';
    chatbotInterface.innerHTML = `
        <div id="chatbotHeader">ActBot</div>
        <div id="chatbotMessages"></div>
        <div id="chatbotInput">
            <input type="text" style="color: black;" placeholder="Type a message..." />
            <button>Send</button>
        </div>
    `;
    document.body.appendChild(chatbotInterface);

    chatbotButton.addEventListener('click', () => {
        chatbotInterface.style.display = chatbotInterface.style.display === 'none' ? 'flex' : 'none';
    });

    const inputField = chatbotInterface.querySelector('input');
    const sendButton = chatbotInterface.querySelector('button');
    const messagesContainer = chatbotInterface.querySelector('#chatbotMessages');
    let chatHistory = [];

    // Task specific rules are to help short circuit the agent's reasoning on common tasks
    const taskSpecificRules = ""
    // For example, "If the user requests to change the theme color, click user-dropdown-toggle > click preferences > in color theme, click on user specified color"

    sendButton.addEventListener('click', async () => {
        const userMessage = inputField.value;
        if (!userMessage) return;

        const userMessageElement = document.createElement('div');
        userMessageElement.className = 'chatbotMessage userMessage';
        userMessageElement.innerHTML = `<strong>You:</strong> ${userMessage}`;
        messagesContainer.appendChild(userMessageElement);

        chatHistory.push({ role: "user", content: `THIS IS THE USER OBJECTIVE: ${userMessage}` });

        inputField.value = '';

        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        const apiKey = 'your-openai-api-key';

        async function performAction() {
            await waitForLoad();

            const currentDOMState = cleanHTML();

            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o',
                    response_format: { "type": "json_object" },
                    messages: [
                        {
                            role: 'system',
                            content: 'You are an interaction agent. You help users with their requests. \
                            You can take a websites DOM and understand what action to take next. The available \
                            actions are "click" and "type". For links and buttons, return click and for inputs, return type. \
                            Now you will return only json as a response. There are five REQUIRED keys to return and they are: \
                            action, chatMessage, typeContent, querySelector, objectiveComplete. action key is as explained above. \
                            chatMessage will be outputted to the user, so it describes what action the bot is going to perform, keep it short. \
                            typeContent is if action is type, then the content to type should be in this. querySelector is because we are using \
                            document.querySelector(selector); to get the element to click or type in, we need compatible html selector. objectiveComplete \
                            should be true if the objective is complete, false otherwise. You will be given a clean html dom output and based off that you will return the json and the right selector to complete the users objective. \
                            If the user message does not have an objective, ask them for it. Do not have ```json ``` in your output. All json keys should be wrapped in strings. \
                            If the systems actions performs exactly what the user message said, then objective is complete. Always return a JSON!\
                            DO NOT hallucinate UI elements like buttons or links. It is imperative to only choose from the given buttons/elements. \
                            Few rules on returning the selector: a selector cannot have "contains"'
                        },
                        ...chatHistory,
                        { role: 'user', content: `This is the current URL: ${document.location.href}` },
                        { role: 'user', content: `This is the DOM for the page the user is currently on. ${currentDOMState}` },
                        {
                            role: 'user',
                            content: `These are task specific rules, use them as a guide if user requests anything from this list: ${taskSpecificRules}`
                        },
                    ],
                    temperature: 0.7
                })
            });

            const data = await response.json();
            const botMessage = JSON.parse(data.choices[0].message.content);

            console.log('botMessage', botMessage);

            const botMessageElement = document.createElement('div');
            botMessageElement.className = 'chatbotMessage systemMessage';
            botMessageElement.innerHTML = `<strong>ActBot:</strong> ${botMessage.chatMessage}`;
            messagesContainer.appendChild(botMessageElement);

            chatHistory.push({ role: "system", content: botMessage.chatMessage });

            messagesContainer.scrollTop = messagesContainer.scrollHeight;

            let elementFound = false;
            if (botMessage.action === 'click') {
                console.log(`Executing click on selector: ${botMessage.querySelector}`);
                elementFound = clickElement(botMessage.querySelector);
                await waitForLoad();
                if (elementFound)
                    chatHistory.push({ role: "user", content: `Done executing click on selector: ${botMessage.querySelector}` });
                else chatHistory.push({ role: "user", content: `Selector ${botMessage.querySelector} is invalid` });
            } else if (botMessage.action === 'type') {
                console.log(`Typing "${botMessage.typeContent}" in selector: ${botMessage.querySelector}`);
                elementFound = typeInElement(botMessage.querySelector, botMessage.typeContent);
                await waitForLoad();
                if (elementFound)
                    chatHistory.push({ role: "user", content: `Done typing "${botMessage.typeContent}" in selector: ${botMessage.querySelector}` });
                else chatHistory.push({ role: "user", content: `Selector ${botMessage.querySelector} is invalid` });
            }

            return botMessage.objectiveComplete && elementFound;
        }

        let objectiveComplete = false;
        do {
            objectiveComplete = await performAction();
        } while (!objectiveComplete);

        const completionMessageElement = document.createElement('div');
        completionMessageElement.className = 'chatbotMessage systemMessage';
        completionMessageElement.innerHTML = `<strong>ActBot:</strong> Done performing action!`;
        messagesContainer.appendChild(completionMessageElement);
    });
})();