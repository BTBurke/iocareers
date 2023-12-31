import { Switch, Match, createResource, createSignal, createEffect } from 'solid-js';
import { JobList } from './joblist.tsx'
import fixes from './fixes.ts'
import FilterList from './filterlist.tsx'

export type Job = {
    VacancyID: number,
    OrganizationAcronym: string,
    OrganizationSiteURL: string,
    VacancyDetailURL: string,
    VacancyTitle: string,
    VacancyStatus: "P" | "F",
    VacancyLocation: string,
    VacancyDeadline: string | null,
    VacancyLevel: string,
    OrganizationID: number,
    CountryID: number,
}

export type Filter = (jobs: Job[]) => Job[]

export default function JobSearch(props: {search?: string, featured?: string}) {
  const [jobs] = createResource<Job[]>(fetchJobs)
  const [filters, setFilters] = createSignal<Map<string, Filter>>(getInitialFilters(props))
  const filteredJobs = (): Job[] => {
    // filtered jobs are the set: featured || (search && (loc[0] || loc[1] || ...) && (org[0] || org[1] || ...))
    return pipe([...filters().values()])(jobs())
  }
  createEffect(() => console.log('filters', filters()))
  const orgs: () => string[] = () => {
    return [...new Set(jobs()?.map((job) => {return job.OrganizationAcronym})).values()]
  }
  const locs: () => string[] = () => {
    return [...new Set(jobs()?.map((job) => { return job.VacancyLocation })).values()]
  }
  return (
    <Switch fallback={<p>Something went wrong. Please refresh the page.</p>}>
      <Match when={jobs.loading}>
        Loading...
      </Match>
      <Match when={!jobs.loading && jobs() && (props.search || props.featured)}>
        <JobList jobs={filteredJobs} />
      </Match>
      <Match when={!jobs.loading && jobs()}>
        <>
          <FilterList orgs={orgs()} locs={locs()} setFilters={setFilters} initialSearch={props.search} />
          <JobList jobs={filteredJobs} />
        </>
      </Match>
    </Switch>
  );
}

async function fetchJobs(): Promise<Job[]> {
  const response = (await fetch('/Main/Jobs/SearchWithFilters', {
    method: 'POST',
  }))
  const jobs = await response.json()
  console.log('jobs', jobs)
  return pipe(fixes)(jobs['Data'])
} 

// applies a series of functional transformations to a value
// pipe([a, b, c])(f) === c(b(a(f)))
const pipe = (fns: Filter[]) => (x) => fns.reduce((v, f) => f(v), x);

// returns a filtered list of jobs where job[field] is is one of the values
export const filterExact = (field: "OrganizationAcronym" | "VacancyLocation" | "VacancyStatus" , values: string[]) => (jobs: Job[]): Job[] => {
  return jobs.filter((job) => values.includes(job[field]))
}

// returns a filtered list of jobs where there's a case-insensitive substring match 
// for value in the job title
export const filterTitle = (value: string) => (jobs: Job[]): Job[] => {
  return jobs.filter((job) => job.VacancyTitle.toLowerCase().includes(value.toLowerCase()))
}

// sets an intital filter list based on a substring match, called two possible ways:
// 1. HTML markup <job-search search="value"> 
// 2. URL query parameter ?q=value
const getInitialFilters = (props: {search?: string, featured?: string}) => {
  const m = new Map()
  if (props.search) {
    m.set('search', filterTitle(props.search))
  }
  const urlParams = new URLSearchParams(window.location.search)
  const q = urlParams.get('q')
  if (q) {
    m.set('search', filterTitle(q))
  }
  if (props.featured) {
    m.set('featured', filterExact('VacancyStatus', ['F']))
  }
  return m
}
