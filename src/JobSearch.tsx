import { createResource } from 'solid-js';

type Job = {
    VacancyID: number,
    OrganizationAcronym: string,
    OrganizationSiteURL: string,
    VacancyDetailURL: string,
    VacancyTitle: string,
    VacancyStatus: "P" | "F",
    VacancyLocation: string,
    VacancyDeadline: string | null,
    OrganizationID: number,
    CountryID: number,
}

export default function SearchPage(props: {search?: string, featured: boolean} = {featured: false}) {
  const [jobs] = createResource(fetchJobs)
  return (
    <>
      <h3>this is the search area for {jobs()?.Data.length}</h3>
    </>
  );
}

type JobAPIResponse = {
  Data: Job[]
}

async function fetchJobs(): Promise<JobAPIResponse> {
  const response = (await fetch('https://iocareers.state.gov/Main/Jobs/SearchWithFilters', {
    method: 'POST',
    mode: 'no-cors'
  }))
  console.log(response)
  const jobs = await response.json()
  console.log('total jobs: ', jobs.Data.length)
  return jobs
} 
