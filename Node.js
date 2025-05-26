const http = require("http");
const https = require("https");
const querystring = require("querystring");

const hostname = "localhost";
const port = 3000;

const server = http.createServer((req, res) => {
  if (req.url.startsWith("/proxy")) {
    // Example input to simulate the HashMap equivalent
    const inputText = "Hello, GPT!";
    const mapnetwork = {
      text: inputText,
    };

    // Convert the object to a query string
    const queryParams = querystring.stringify(mapnetwork);

    // Construct the target URL with query parameters
    const targetUrl = `https://supremeapp.uz/apps/chat_gpt/demo/index.php?${queryParams}`;

    // Send the network request to the external server
    https
      .get(targetUrl, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            // Attempt to parse the response as JSON (equivalent to Gson's fromJson)
            const jsonResponse = JSON.parse(data);

            // Assuming the response has a structure that contains a "message" or "response" key
            const aiMessage = jsonResponse.message || jsonResponse.response; // Adjust based on actual response structure

            // Send the extracted message to the client
            res.writeHead(200, {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*", // CORS support
            });
            res.end(JSON.stringify({ ai_message: aiMessage }));
          } catch (error) {
            console.error("Error parsing JSON:", error);
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Failed to parse response from AI server." }));
          }
        });
      })
      .on("error", (err) => {
        console.error("Error:", err.message);
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "An error occurred while making the request to the server." }));
      });
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Route not found." }));
  }
});

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
