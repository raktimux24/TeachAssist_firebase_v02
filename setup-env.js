#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to .env and env.example files
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

// Check if files exist
const envExists = fs.existsSync(envPath);
const envExampleExists = fs.existsSync(envExamplePath);

// Function to create .env file from env.example
const createEnvFile = () => {
  try {
    if (!envExampleExists) {
      console.error('Error: env.example file not found. Cannot create .env file.');
      rl.close();
      return;
    }

    // Read env.example content
    const envExampleContent = fs.readFileSync(envExamplePath, 'utf8');
    
    // Write to .env file
    fs.writeFileSync(envPath, envExampleContent);
    
    console.log('\n.env file has been created successfully from env.example!');
    console.log('Please edit the .env file and add your actual API keys and configuration values.');
    rl.close();
  } catch (error) {
    console.error('Error creating .env file:', error);
    rl.close();
  }
};

console.log('Checking environment setup...');

if (envExists) {
  console.log('\nAn .env file already exists. No changes were made.');
  console.log('If you need to update your environment variables, please edit the .env file directly.');
  rl.close();
} else {
  console.log('\nNo .env file found. Creating one from env.example...');
  createEnvFile();
}
