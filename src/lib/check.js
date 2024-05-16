import { Api, HttpClient } from "tonapi-sdk-js";

const YOUR_TOKEN = "";

const check = async () => {
  const address = "";

  // Configure the HTTP client with your host and token
  const httpClient = new HttpClient({
    baseApiParams: {
      headers: {
        Authorization: `Bearer ${YOUR_TOKEN}`,
        "Content-type": "application/json",
      },
    },
  });

  // Initialize the API client
  const client = new Api(httpClient);

  try {
    const events = await client.accounts.getAccountEvents(address, {
      limit: 50,
    });
    console.log("events", events);
  } catch (e) {
    console.log(e);
  }
};

setInterval(() => check(), 1000);
