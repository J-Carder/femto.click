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

export const handler = async(event) => {

  // get query "q" parameter form query string which is the shortID to lookup
  let postParams = new URLSearchParams(event.body);

  let shortID = postParams.get("shortID");

  let result;

  // query DynamoDB for that shortID
  try {
    var params = {
      Key: {
        "ShortURL": shortID
      }, 
      TableName: "URLShortener"
    };
    result = await ddb.get(params).promise()
  } catch (e) {
    console.log(e); 
  }

  let response;

  // try to extract items from result, assuming it exists, if not respond with 404 not found as no record could be found
  try {
    let responseBody = {
      clicks: result.Item.Clicks,
      longURL: result.Item.LongURL,
      shortURL: result.Item.ShortURL
    }

    response = {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin" : "*", 
        "Access-Control-Allow-Credentials" : true 
      },
      body: JSON.stringify(responseBody)
    };
  } catch {
    response = {
      statusCode: 404,
      headers: {
        "Access-Control-Allow-Origin" : "*", 
        "Access-Control-Allow-Credentials" : true 
      },
      body: `{"result": "Not found"}` 
    }
  }
 
  return response;
};


//console.log(await handler({queryStringParameters: "q=CE2"}));
