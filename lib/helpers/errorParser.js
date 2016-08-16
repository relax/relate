export default function errorParser (error) {
  if (error && error.status === 400) {
    return (error.response && error.response.body && error.response.body.errors)
      || error.message
      || [{message: 'Unknown error'}];
  }
  return error && [error] || [{message: 'Unknown error'}];
}
