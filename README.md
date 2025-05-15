# Rural Education Platform

A student-friendly educational web platform designed specifically for rural learners. The platform features a responsive design with accessibility in mind, multiple language support, and tools to help students learn effectively regardless of connectivity limitations.

## Features

- **Responsive Design**: Works well on all devices including low-end mobile phones
- **Multi-language Support**: English, Hindi, Kannada, and Telugu interfaces
- **Educational Resources**: Categorized learning materials across various subjects
- **Voice Converter**: Text-to-speech and speech-to-text capabilities
- **AI Learning Assistant**: Get immediate help with educational queries
- **Profile Management**: Save student information for personalized experience
- **Offline Content**: Access to resources even with limited connectivity
- **Career Guidance**: Information about career paths suitable for rural students

## Tech Stack

- HTML5, CSS3
- JavaScript (ES6+)
- Bootstrap 5
- Font Awesome
- Web Speech API
- Axios for API calls

## Setup Instructions

1. Clone this repository
2. No build tools required - simply open `index.html` in a modern web browser
3. For the best experience, use the latest version of Chrome, Firefox, or Edge

## Directory Structure

```
├── css/
│   └── style.css
├── js/
│   ├── main.js
│   ├── languageConverter.js
│   └── voiceConverter.js
└── index.html
```

## Using the Platform

- **Language Switching**: Use the Language dropdown in the navbar to change the interface language
- **Resource Exploration**: Browse through educational resource cards on the homepage
- **Profile Setup**: Click on Profile in the navbar to save your information
- **Voice Tools**: Access the Voice Converter from the bottom navbar to convert text to speech or speech to text
- **Feedback**: Submit your suggestions or issues via the Feedback form

## Offline Functionality

Some features of this platform will work offline after the initial load:

- Profile information (stored in local storage)
- Language preference (stored in local storage)
- Text-to-speech conversion
- Basic UI navigation

## Future Enhancements

- Full offline support with Service Workers
- Video content with adaptive streaming for low-bandwidth areas
- Integration with government educational schemes
- Community forums for peer-to-peer learning
- Mobile app version with enhanced offline capabilities

## Contributing

Contributions to enhance this platform for rural education are welcome. Please feel free to submit pull requests or open issues to discuss potential improvements.

## License

This project is open source, licensed under the MIT License. 