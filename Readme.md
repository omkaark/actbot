<p align="center">
  <img src="https://fcit.usf.edu/matrix/wp-content/uploads/2016/12/Robot-01-A.png" height="300" alt="Simple Federated Learning" />
</p>

# ActBot - Interaction Agent

ActBot is a browser-based interaction agent script that helps users perform actions on web pages by simulating clicks and typing based on user requests. The end goal is for it to be used by companies to build chatbots that actually perform tasks for users offered as support bots.

The current version is extremely crude and a one day hack. If you are interested in taking this further, contact me.

A few ideas to improve:

- chrome extension instead of script
- allow location.href based navigation and other actions
- CSP overriding

## Features

- Click on elements based on user-provided selectors
- Type into input fields with a natural typing delay
- Handle multi-step tasks until the objective is complete
- Clean HTML representation of the DOM for better interaction understanding

## Getting Started

### Prerequisites

- A web browser
- An OpenAI API key

### Installation

1. Clone this repository or download the project files.

2. Add your OpenAI GPT API key in the provided field.

3. Open any website in your preferred web browser.

4. Copy/Paste the script into the website's console

### Usage

1. Click on the ActBot button (`+`) at the bottom-right corner of the page to open the chat interface.

2. Enter your request in the input field. For example:

   - "Change the theme to xyz"
   - "Create a document and share with with xyz"

3. ActBot will perform the action and update you on the progress in the chat window.

### Configuration

Replace `your-openai-api-key` with your actual OpenAI API key in the script:

```javascript
const apiKey = "your-openai-api-key";
```

### Troubleshooting

- If an action is not performed as expected, check the console logs for debugging information.

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests with improvements.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
