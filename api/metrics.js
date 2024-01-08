export default function (_, response) {
  console.log('metric OK')
  return response.status(200).send('OK')
}
