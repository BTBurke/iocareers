import response from './out.json';

export default function mock() {
  return [
  {
    url: '/Main/Jobs/SearchWithFilters',
    method: 'post',
    response: {
      code: 200,
      data: response
    },
  }
]}
