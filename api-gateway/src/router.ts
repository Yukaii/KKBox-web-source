import Api from './api'

async function init () {
  await Api.initialize()
}

export async function handler(event, context, callback) {
  await init()

  callback(null, {
    statusCode: 200,
    body: JSON.stringify({
      message: 'Go Serverless v1.0! Your function executed successfully!',
      input: event,
    }),
  });
}
