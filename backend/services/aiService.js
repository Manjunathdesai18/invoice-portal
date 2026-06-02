const { OpenAI } = require('openai');

const apiKey = process.env.OPENAI_API_KEY;
let openai = null;

if (apiKey && apiKey !== 'your_openai_api_key_here') {
  try {
    openai = new OpenAI({ apiKey });
  } catch (e) {
    console.warn("OpenAI initialization failed:", e.message);
  }
} else {
  console.warn("No valid OPENAI_API_KEY found. AI features will run in Mock/Demo mode.");
}

exports.generateInvoiceDescription = async (prompt) => {
  if (!openai) {
    return `Professional services rendered for: ${prompt}`;
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a professional accountant assistant. Generate brief, professional invoice line item descriptions based on the user's prompt." },
        { role: "user", content: prompt }
      ],
      max_tokens: 150,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to generate description");
  }
};

exports.predictRevenue = async (historicalData) => {
  if (!openai) {
    return "Based on your current trajectory, revenue is projected to grow by 12% next month. Keep an eye on outstanding invoices to optimize cash flow.";
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a financial analyst AI. Given the historical revenue data of a company, provide a brief prediction and analysis for the next month." },
        { role: "user", content: JSON.stringify(historicalData) }
      ],
      max_tokens: 200,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to predict revenue");
  }
};

exports.getSmartInsights = async (financialData) => {
  if (!openai) {
    return "1. Follow up on overdue payments to improve liquidity.\n2. Consider early payment discounts to accelerate cash inflow.\n3. Keep operational expenses lean during slow periods.";
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are an AI financial advisor. Provide 3 smart, actionable insights or suggestions to improve cash flow based on the provided financial data (invoices, overdue, expenses)." },
        { role: "user", content: JSON.stringify(financialData) }
      ],
      max_tokens: 250,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to generate smart insights");
  }
};

exports.predictInventory = async (inventoryData) => {
  if (!openai) {
    return "Your most popular items are running low. We recommend placing a restock Purchase Order for your top 3 selling products within the next week to avoid stockouts.";
  }
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a supply chain AI analyst. Review the provided inventory data (stock levels) and predict which items might run out soon, suggesting restock priorities in 2 brief sentences." },
        { role: "user", content: JSON.stringify(inventoryData) }
      ],
      max_tokens: 200,
    });
    return response.choices[0].message.content;
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new Error("Failed to predict inventory");
  }
};
