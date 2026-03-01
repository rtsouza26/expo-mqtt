const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../example/App.tsx');

if (!fs.existsSync(filePath)) {
    console.error('App.tsx not found at', filePath);
    process.exit(1);
}

let content = fs.readFileSync(filePath, 'utf8');

/**
 * Pattern for useState('value') or useState<Type>('value')
 * Group 1: 'const [key, setKey] = useState(' or 'const [key, setKey] = useState<Type>('
 * Group 2: Quote mark (' or ")
 */
const replaceValue = (content, key) => {
    const setKey = `set${key.charAt(0).toUpperCase() + key.slice(1)}`;
    // Matches both simple and generic useState
    const regex = new RegExp(`(const\\s+\\[${key},\\s+${setKey}\\]\\s*=\\s*useState(?:<[^>]*>)?\\(['"])[^'"]*(['"]\\))`, 'g');
    return content.replace(regex, '$1$2');
};

const keys = [
    'amqpUrl',
    'amqpUsername',
    'amqpPassword',
    'amqpExchange',
    'amqpExchangeType',
    'amqpRoutingKey',
    'amqpQueue',
    'amqpMessage',
    'mqttHost',
    'mqttPort',
    'mqttUsername',
    'mqttPassword',
    'mqttTopic',
    'mqttMessage'
];

let modified = false;
keys.forEach(key => {
    const newContent = replaceValue(content, key);
    if (newContent !== content) {
        content = newContent;
        modified = true;
    }
});

if (modified) {
    fs.writeFileSync(filePath, content);
    console.log('Successfully cleaned up sensitive values in example/App.tsx');
} else {
    console.log('No values to clean up in example/App.tsx');
}
