// Test Apps Script with POST request
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwAfVUwR5IXcpfG9Wa6wRAaKsG2_Xeu_-UXyuk_1kt3t9jxpZeq9V8OPBzSqZeoUIaW/exec";

const payload = {
  ocNo: "PRLS/25/12973",
  processStage: "CAD / Pattern",
  lineNo: "DBR_L1",
  factory: "Test Factory",
  actualQty: 1000
};

console.log("Testing Apps Script with POST request...");
console.log("URL:", WEB_APP_URL);
console.log("Payload:", JSON.stringify(payload, null, 2));
console.log("\n--- Sending Request ---\n");

fetch(WEB_APP_URL, {
  method: "POST",
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(payload)
})
.then(response => {
  console.log("Status:", response.status);
  console.log("Content-Type:", response.headers.get("content-type"));
  return response.text();
})
.then(text => {
  console.log("\n--- Response ---\n");
  console.log(text);
  
  // Try to parse as JSON
  try {
    const json = JSON.parse(text);
    console.log("\n--- Parsed JSON ---\n");
    console.log(JSON.stringify(json, null, 2));
    
    if (json.success) {
      console.log("\n✅ SUCCESS! Apps Script is working!");
    } else {
      console.log("\n❌ FAILED! Error:", json.error);
    }
  } catch (e) {
    console.log("\n❌ FAILED! Response is not JSON");
    console.log("Error:", e.message);
  }
})
.catch(error => {
  console.log("\n❌ FETCH FAILED!");
  console.log("Error:", error.message);
});
