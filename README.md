# AI Shopping Chatbot

## Overview
This project is a simple shopping chatbot that allows users to browse products,
ask product-related questions, add items to a cart, and confirm an order through chat.

## Live Demo

- Frontend (Vercel): ai-shopping-chatbot-livid.vercel.app
- Backend API (Render): https://ai-shopping-chatbot-v9yc.onrender.com
- 
## Setup Instructions

### Backend
1. Navigate to `backend`
2. Install dependencies:
   ```bash
   npm install

## Features
- Product data stored in JSON
- List available products
- Price and budget-based queries
- Product recommendations
- Add items to cart
- Checkout and order confirmation
- Conversational responses with safe Gemini API integration

## Tech Stack
- Node.js
- Express.js
- HTML, CSS, JavaScript
- Gemini API

## How to Run the Project
1. Open the backend folder
2. Install dependencies:
   npm install
3. Create a `.env` file and add your Gemini API key
4. Start the server:
   node server.js
5. Open `frontend/index.html` in a browser

## Example Chat Flow
User: show products  
Bot: lists products  

User: add backpack  
Bot: added to cart  

User: checkout  
Bot: order confirmed  

## Notes
Core shopping logic is handled manually for reliability, while Gemini API is used
for conversational fallback responses.
