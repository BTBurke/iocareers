import type { Job } from './JobSearch.jsx'

// replaces a substring in a field
const replace = (field: string, before: string, after: string) => (jobs: Job[]): Job[] => jobs.map(job => Object.assign(job, {[`${field}`]: job[field].replace(before, after)}))

// FAO lists vacancy temporary length in the location field
const fao = (jobs: Job[]): Job[] => jobs.map(job => (job.OrganizationAcronym === 'FAO') ? Object.assign(job, {'VacancyLocation': ''}) : job)

// IAEA sends VacancyLocation as a single space
const iaea = (jobs: Job[]): Job[] => jobs.map(job => (job.VacancyLocation === ' ') ? Object.assign(job, {'VacancyLocation': ''}) : job)

export default [
  fao,
  replace('VacancyLocation', 'Korea (the Republic of)', 'South Korea'),
  replace('VacancyTitle', 'â??', '-'),
  iaea,
  replace('VacancyDeadline', '2050-01-01', '')
]
