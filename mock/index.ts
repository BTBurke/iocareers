import type { MockConfig } from 'vite-plugin-mock'
import response from './out.json';

export default function mock(config?: MockConfig) {
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
