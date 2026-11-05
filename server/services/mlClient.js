const axios = require("axios");
const { GoogleAuth } = require("google-auth-library");

const ML_ENGINE_URL = (process.env.ML_ENGINE_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
const ML_ENGINE_AUTH = (process.env.ML_ENGINE_AUTH || "").toLowerCase();

let googleAuth;

/**
 * Call the ML service from one place so local Docker and private Cloud Run
 * deployments use the same route contract. Cloud Run requests use an ID token
 * whose audience is the ML service URL; local requests remain plain HTTP.
 */
async function requestMl(method, path, data) {
  const config = { method, url: `${ML_ENGINE_URL}${path}`, timeout: 10000 };
  if (data !== undefined) config.data = data;

  if (ML_ENGINE_AUTH === "gcp") {
    googleAuth ||= new GoogleAuth();
    const client = await googleAuth.getIdTokenClient(ML_ENGINE_URL);
    const response = await client.request(config);
    return response.data;
  }

  const response = await axios(config);
  return response.data;
}

module.exports = { ML_ENGINE_URL, requestMl };
