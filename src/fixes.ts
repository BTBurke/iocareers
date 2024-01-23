import type { Job } from './JobSearch.jsx'

// removes duplicates, defined as two jobs that link to the same external job listing
const sortfn = (a: Job, b: Job) => {
  if (a.VacancyDetailURL === b.VacancyDetailURL) {
     // same position, now sort by whether one is featured
     return a.VacancyStatus === b.VacancyStatus ? 0 : a.VacancyStatus < b.VacancyStatus ? -1 : 1 
  } 
  return a.VacancyDetailURL < b.VacancyDetailURL ? -1 : 1
}
const duplicates = (jobs: Job[]): Job[] => {
  const sorted = jobs.sort(sortfn)
  sorted.forEach((job, i) => {
    if (i > 0 && job.VacancyDetailURL === sorted[i-1].VacancyDetailURL && job.VacancyStatus === 'F') {
      console.log('Dropped:', job, sorted[i-1])
    }
  })
  return sorted.filter((job, i) => (i === 0 || job.VacancyDetailURL !== sorted[i-1].VacancyDetailURL) ? true : false)
}

// replaces a substring in a field
const replace = (field: string, before: string, after: string) => (jobs: Job[]): Job[] => jobs.map(job => Object.assign(job, {[`${field}`]: job[field].replace(before, after)}))

// FAO lists vacancy temporary length in the location field
const fao = (jobs: Job[]): Job[] => jobs.map(job => (job.OrganizationAcronym === 'FAO') ? Object.assign(job, {'VacancyLocation': ''}) : job)

// IAEA sends VacancyLocation as a single space
const iaea = (jobs: Job[]): Job[] => jobs.map(job => (job.VacancyLocation === ' ') ? Object.assign(job, {'VacancyLocation': ''}) : job)

// converts locations with mixed UPPPERCASE to Title Case
function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    function (txt) {
      return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
    }
  );
}
const titlecase = (jobs: Job[]): Job[] => jobs.map(job => Object.assign(job, {'VacancyLocation': toTitleCase(job.VacancyLocation)}))

// removes redundant VacancyLevel information => jobs include it the title like `IAEA job (G6) (G-6)` so it looks for a short version of the 
// information in VacancyLevel and removes it if it's redundant
const redundantLevels = (jobs: Job[]): Job[] => jobs.map(job => {
  if (job.VacancyLevel) {
    const shortLevel = job.VacancyLevel.replace('-', '') // makes G-6 look like G6
    return Object.assign(job, {'VacancyTitle': job.VacancyTitle.replace(`(${shortLevel})`, '')})     
  } else {
    return job
  }
})

const regularLevels = (jobs: Job[]): Job[] => jobs.map(job => Object.assign(job, {'VacancyLevel': job.VacancyLevel?.replace('-', '')}))

// WFP links have URL-escaped &amp; instead of & in URLs
const wfpLinks = (jobs: Job[]): Job[] => jobs.map(job => Object.assign(job, {'VacancyDetailURL': job.VacancyDetailURL.replace('&amp;', '&')}))

export default [
  fao,
  replace('VacancyLocation', 'Korea (the Republic of)', 'South Korea'),
  replace('VacancyTitle', 'â??', '-'),
  replace('VacancyTitle', '&amp;', '&'),
  replace('VacancyTitle', '&#39;', "'"),
  iaea,
  replace('VacancyDeadline', '2050-01-01', ''),
  duplicates,
  titlecase,
  redundantLevels,
  regularLevels,
  wfpLinks,
]
