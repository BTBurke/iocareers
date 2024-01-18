export default function (request, response) {
  console.log('metric OK', request.body)
  return response.status(200).send('OK')
}
