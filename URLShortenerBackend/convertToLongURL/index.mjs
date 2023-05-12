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

export const handler = async(event) => {

  let postParams = new URLSearchParams(event.body);

  let shortID = postParams.get("shortID");

  // update clicker count + 1
  try {
    var params = {
      Key: {
        "ShortURL": shortID
      },
      ExpressionAttributeValues:  {":inc": 1}, // inc is 1
      UpdateExpression: "ADD Clicks :inc", // increment by :inc 
      TableName: "URLShortener",
      ConditionExpression: 'attribute_exists(ShortURL)'
    }
    await ddb.update(params).promise();
  } catch (e) {
    console.log(e);
  }

  let result;

  // query DynamoDB for that shortID
  try {
    var params = {
      Key: {
        "ShortURL": shortID
      }, 
      TableName: "URLShortener"
    };
    result = await ddb.get(params).promise();
  } catch (e) {
    console.log(e); 
  }

  let response;

  // try to extract items from result, assuming it exists, if not respond with 404 not found as no record could be found
  try {
    let responseBody = {
      longURL: result.Item.LongURL,
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


// testing
//console.log(await handler({pathParameters: {shortid: "CEml2A"}}))
