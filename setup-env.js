#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env file
const envPath = path.join(__dirname, '.env');

// Check if .env file exists
const envExists = fs.existsSync(envPath);

// Function to update .env file
const updateEnvFile = (apiKey) => {
  try {
    let envContent = '';
    
    if (envExists) {
      // Read existing .env file
      envContent = fs.readFileSync(envPath, 'utf8');
      
      // Check if VITE_OPENAI_API_KEY already exists
      if (envContent.includes('VITE_OPENAI_API_KEY=')) {
        // Replace existing key
        envContent = envContent.replace(
          /VITE_OPENAI_API_KEY=.*/,
          `VITE_OPENAI_API_KEY=${apiKey}`
        );
      } else {
        // Add new key
        envContent += `\n# OpenAI API Key\nVITE_OPENAI_API_KEY=${apiKey}\n`;
      }
    } else {
      // Create new .env file with OpenAI API key
      envContent = `# Environment Variables\n\n# OpenAI API Key\nVITE_OPENAI_API_KEY=${apiKey}\n`;
    }
    
    // Write to .env file
    fs.writeFileSync(envPath, envContent);
    console.log('\nOpenAI API key has been added to .env file successfully!');
  } catch (error) {
    console.error('Error updating .env file:', error);
  }
};

console.log('This script will add the OpenAI API key to your .env file.');

// Prompt user for API key
rl.question('Please enter your OpenAI API key: ', (apiKey) => {
  if (!apiKey || apiKey.trim() === '') {
    console.log('Error: API key cannot be empty.');
    rl.close();
    return;
  }
  
  if (envExists) {
    console.log('\nAn .env file already exists. Do you want to update it? (y/n)');
    rl.question('> ', (answer) => {
      if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
        updateEnvFile(apiKey);
        rl.close();
      } else {
        console.log('Operation cancelled.');
        rl.close();
      }
    });
  } else {
    console.log('\nNo .env file found. Creating a new one...');
    updateEnvFile(apiKey);
    rl.close();
  }
});
