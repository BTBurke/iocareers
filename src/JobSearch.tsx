import { Switch, Match, createResource, createSignal } from 'solid-js';

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

export default function JobSearch(props: {search?: string, featured: boolean} = {featured: false}) {
  const [jobs] = createResource(fetchJobs)
  const [filters, setFilter] = createSignal([])
  const filteredJobs = () => {
      return pipe(filters())(jobs())    
  }
  const orgs = () => {
    return new Set(jobs()?.map((job) => {return job.OrganizationAcronym}))
  }
  const locations = () => {
    return new Set(jobs()?.map((job) => { return job.VacancyLocation }))
  }
  return (
    <Switch fallback={<p>Something went wrong. Please refresh the page.</p>}>
      <Match when={jobs.loading}>
        Loading...
      </Match>
      <Match when={!jobs.loading && jobs()}>
        Got {filteredJobs()?.length} jobs with {orgs().size} orgs in {locations().size} places
      </Match>
    </Switch>
  );
}


async function fetchJobs(): Promise<Job[]> {
  const response = (await fetch('/Main/Jobs/SearchWithFilters', {
    method: 'POST',
  }))
  const jobs = await response.json()
  return jobs.data['Data']
} 

const pipe = (fns) => (x) => fns.reduce((v, f) => f(v), x);

const filterExact = (field: keyof Job, value: string) => (jobs: Job[]): Job[] => {
  return jobs.filter((job) => job[field] === value)
}

const filterTitle = (value: string) => (jobs: Job[]): Job[] => {
  return jobs.filter((job) => job.VacancyTitle.toLowerCase().includes(value))
}
