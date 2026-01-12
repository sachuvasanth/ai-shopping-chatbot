require("dotenv").config();
const express = require("express");
const cors = require("cors");
const products = require("./products.json");

const app = express();
app.use(cors());
app.use(express.json());

// --------------------
// In-memory cart
// --------------------
let cart = [];

// --------------------
// Helper functions
// --------------------
function findProduct(msg) {
  return products.find(p => msg.includes(p.name.toLowerCase()));
}

function greetingMessage() {
  return "Hi 👋 I’m your shopping assistant. You can ask me to show products, check prices, get recommendations, or place an order.";
}

function helpMessage() {
  return (
    "Yes 😊 I can help you with:\n" +
    "- Showing available products\n" +
    "- Checking product prices\n" +
    "- Recommending products\n" +
    "- Adding items to cart\n" +
    "- Checkout and order confirmation\n\n" +
    "Try typing: 'show products' or 'what should I buy?'"
  );
}

function politeExitMessage() {
  return "You're welcome 😊 Have a nice day! Feel free to come back anytime.";
}

function recommendProducts() {
  const affordable = products.filter(p => p.price <= 3000 && p.stock > 0);

  if (affordable.length > 0) {
    const list = affordable
      .map(p => `${p.name} (₹${p.price})`)
      .join(", ");
    return `If you're looking for good value, I recommend: ${list}.`;
  }

  const list = products
    .filter(p => p.stock > 0)
    .map(p => `${p.name} (₹${p.price})`)
    .join(", ");

  return `Here are some products you might like: ${list}.`;
}

function unknownMessage() {
  return (
    "Hmm 🤔 I didn't quite understand that.\n" +
    "You can try things like:\n" +
    "- show products\n" +
    "- what should I buy?\n" +
    "- add backpack\n" +
    "- checkout"
  );
}

// --------------------
// Gemini API (SAFE, OPTIONAL)
// --------------------
let model = null;
try {
  const { GoogleGenerativeAI } = require("@google/generative-ai");
  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    model = genAI.getGenerativeModel({ model: "gemini-pro" });
  }
} catch (err) {
  console.log("Gemini unavailable. Using manual conversation logic.");
}

// --------------------
// Main chat route
// --------------------
app.post("/chat", async (req, res) => {
  const msg = req.body.message.toLowerCase().trim();

  // 1️⃣ Greetings
  if (msg === "hi" || msg === "hello" || msg === "hey" || msg === "hy") {
    return res.json({ reply: greetingMessage() });
  }

  // 2️⃣ Help
  if (msg.includes("can you help") || msg.includes("help me") || msg === "help") {
    return res.json({ reply: helpMessage() });
  }

  // 3️⃣ Thanks / OK / Bye
  if (
    msg === "ok" ||
    msg === "okay" ||
    msg === "thanks" ||
    msg === "thank you" ||
    msg === "bye"
  ) {
    return res.json({ reply: politeExitMessage() });
  }

  // 4️⃣ Show products
  if (msg.includes("show")) {
    return res.json({ reply: products });
  }

  // 5️⃣ Price question
  if (msg.includes("price")) {
    const product = findProduct(msg);
    if (product) {
      return res.json({
        reply: `${product.name} costs ₹${product.price}.`
      });
    }
    return res.json({ reply: "Please mention the product name." });
  }

  // 6️⃣ Budget question
  if (msg.includes("under")) {
    const budget = parseInt(msg.replace(/\D/g, ""));
    if (isNaN(budget)) {
      return res.json({ reply: "Please specify a valid amount." });
    }
    const filtered = products.filter(p => p.price <= budget);
    return res.json({ reply: filtered });
  }

  // 7️⃣ Recommendation
  if (
    msg.includes("what should i buy") ||
    msg.includes("recommend") ||
    msg.includes("suggest")
  ) {
    return res.json({ reply: recommendProducts() });
  }

  // 8️⃣ Add to cart
  if (msg.includes("add")) {
    const product = findProduct(msg);

    if (!product) {
      return res.json({ reply: "Product not found." });
    }

    if (product.stock <= 0) {
      return res.json({ reply: "Sorry, this product is out of stock." });
    }

    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: 1
    });

    product.stock -= 1;

    return res.json({
      reply: `${product.name} added to cart. Anything else?`
    });
  }

  // 9️⃣ Checkout
  if (msg.includes("checkout")) {
    if (cart.length === 0) {
      return res.json({ reply: "Your cart is empty." });
    }

    const total = cart.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    const order = {
      products: cart,
      totalPrice: total,
      status: "confirmed"
    };

    cart = [];

    return res.json({
      reply: `Order confirmed ✅ Total amount ₹${order.totalPrice}.`
    });
  }

  // 🔟 Gemini fallback (safe)
  if (model) {
    try {
      const result = await model.generateContent(
        "You are a shopping assistant. Reply simply: " + msg
      );
      return res.json({ reply: result.response.text() });
    } catch (err) {
      // continue to fallback
    }
  }

  // 1️⃣1️⃣ Clean fallback (UNKNOWN INPUT)
  return res.json({
    reply: unknownMessage()
  });
});

// --------------------
app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
