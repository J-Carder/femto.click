// Load the AWS SDK for JS
import AWS from "aws-sdk";
import * as dotenv from "dotenv";

dotenv.config();

AWS.config.update(
  {
    region: "us-west-2",
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET
  }
);

// Create the Service interface for dynamoDB
var ddb = new AWS.DynamoDB.DocumentClient({apiVersion: "2012-08-10"});

// 53-bit hash (public domain)
const cyrb53 = (str, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for(let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1  = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2  = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};


// converts a base 10 number to base 62
const convertToBase62 = (number) => {

  let text = "";
  let chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
  while (number > 0) {
    text = chars[number % chars.length] + text;
    number = Math.floor(number / chars.length);
  }

  return text;

}

export const handler = async(event) => {

  // get the request body (POST parameters), wrap in URLSearchParams to parse
  let postParams = new URLSearchParams(event.body);

  // will keep retrying if error, initially set to true to run
  let error = true;
  // amount of unsuccessful insertion tries
  let tries = 0;
  // length of the short URL ID
  let IDSize = 5;
  let shortID;

  const MAX_TRIES = 100

  let validURL;
  try {
    validURL = new URL(postParams.get("longURL"));
  } catch {
    const response = {
      statusCode: 400,
      headers: {
          "Access-Control-Allow-Origin" : "*", 
          "Access-Control-Allow-Credentials" : true 
        },
      body: `{\"result\": \"Invalid URL.\"}`
    };

    return response;
  }

  while (error) {

    // if tries more than MAX_TRIES times increase short URL ID length to find match
    if (tries > MAX_TRIES) {
      IDSize++;
      tries = 0;
    }
    console.log(validURL.origin) 
    // generate a short URL ID. https://example.com/r/test -> 3278943743 -> FDHyUDSid -> FDHyU
    shortID = convertToBase62(cyrb53(validURL.origin, tries)).substring(0, IDSize);
    console.log(shortID)
    // insertion params into dynamodb
    const ddbParams = {
      TableName: "URLShortener",
      Item: {
          "ShortURL": shortID, // the shortID
          "LongURL": postParams.get("longURL"), // the long URL
          "Clicks": 0 // keep track of GET requests on URL
      },
      // make sure key doesn't already exist
      ConditionExpression: 'attribute_not_exists(ShortURL)'
    };


    try {
      // try insertion operation (put)
      await ddb.put(ddbParams, (err, data) => {
        if (err) {
          // console.log(err);
        } else {
          error = false;
          console.log(data)
        }
      }).promise();
    } catch {
      // if failed insertion keep trying (error = true) and increment tries
      error = true;
      tries++;
    }
  }

  const response = {
    statusCode: 200,
    headers: {
        "Access-Control-Allow-Origin" : "*", 
        "Access-Control-Allow-Credentials" : true 
      },
    body: `{\"shortURL\": \"${shortID}\"}`
  };

  return response;
};

// testing
console.log(await handler({body: "longURL=https://test.com"}))
