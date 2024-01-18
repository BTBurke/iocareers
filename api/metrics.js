export default function (request, response) {
  console.log('metric OK', JSON.parse(request.body))
  return response.status(200).send('OK')
}
