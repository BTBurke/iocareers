export default function (request, response) {
  console.log('metric OK', request.path)
  return response.status(200).send('OK')
}
