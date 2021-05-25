import json
import boto3

client = boto3.client("iot-data")

def lambda_handler(event, context):
    response = client.publish(
            topic="ttn/echo",
            qos=1,
            payload=json.dumps(event["body"]))
    return {
        'statusCode': 200,
        'body': json.dumps('Hello from Lambda!')
    }
