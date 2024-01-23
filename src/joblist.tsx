// A job list component used to render the basic list of jobs without user-facing filters.  It's used
// as a standalone component when the job list is short and simple (e.g., to show just featured or JPO positions.)
// Combined with the JobSearch and FilterList components it is part of a full UI for dynamically filtering jobs
// by organization or location and paginating results. Built on SolidJS and Solid-Element to create a web component.

import { createSignal, For, Show, createEffect } from 'solid-js'
import type { Accessor } from 'solid-js'
import type { Job } from './JobSearch.tsx'
import * as orgs from './orgs.json'  // mapping of short org acronyms to full names, i.e. NATO => North Atlantic Treaty Organization

// styles are injected in a script tag within the shadowDOM root. Colors and styles
// mimic the USWDS design system.  USWDS classes will not cross the shadowroot boundary.
const style = `
#joblist {
  padding: 0;
  font-size: 1rem;
}

.job-item {
  padding: 0.75rem 0 0.75rem 0;
  border-bottom: 1px solid #d9e8f6;
}

.title-container {
  display: flex;
  flex-direction: row;
  flex-wrap: no-wrap;
  align-items: flex-start;
  margin: 0;
  padding-bottom: 0;
}

.title {
  flex-grow: 1;
  font-size: 1.3rem;
}

.job-details {
  display: flex;
  flex-direction: row:
  flex-wrap: wrap;
  align-items: flex-start;
  padding-top: 0.5rem;
  gap: 0.5rem;
}

.title-container--small {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.job-details--small {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  padding-top: 0.5rem;
}

.dot--small {
  display: none;
}

@media (max-width: 800px) {
  .title-container {
    display: flex;
    flex-direction: column;
  }

  .job-details {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .dot {
    display: none;
  }
}

.title > a {
  color: rgb(0, 94, 162);
}

.closes {
  flex-shrink: 0;
  background: #e6e6e6;
  padding: 3px 5px 3px 5px;
  border-radius: 5px; 
}

.location {
  text-transform: capitalize;
}

button {
  background-color: transparent;
  box-shadow: inset 0 0 0 2px #005ea2;
  color: #005ea2;
  appearance: none;
  border: 0;
  border-radius: 0.25rem;
  cursor: pointer;
  display: inline-block;
  font-weight: 700;
  padding: 0.5rem 1rem;
  text-align: center;
  text-decoration: none;
}

button:hover {
  color: #0b4778;
  box-shadow: inset 0 0 0 2px #0b4778;
}

button:active {
  color: #112f4e;
  box-shadow: inset 0 0 0 2px #112f4e;
}

button:disabled {
  display: none;
}

#pagination {
  width: 100%;
  display: flex;
  justify-content: center;
}

#pagination > div {
  width: auto;
  margin: 0 auto;
  margin-top: 1rem;
}

.page-size {
  width: 100%;
  margin: 0 auto;
  margin-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 2px double #d9e8f6;
  padding-bottom: 0.5rem;
}

.page-size h3 {
  margin: 0;
  padding: 0;
}
`

type Props = {
  jobs: Accessor<Job[]>
  featured?: boolean
}

export function JobList(props: Props) {
  // ref holds the root node for the jobs list. It's used for two purposes: 
  // - to scroll to the top of the list when the page changes
  // - to measure the offsetWidth of the parent containing element. This is used to adapt the display to small screen sizes
  //   when it's just one element in a multi-column page layout on larger screens.
  let ref: HTMLElement

  // pagination
  const [page, setPage] = createSignal(0)
  const [pagesize, setPagesize] = createSignal(props.featured ? 10 : 25)
  const total = () => {
    return Math.ceil(props.jobs().length / pagesize()) // total pages
  }
  const paginatedJobs = () => {
    // returns pagesize() # of jobs at a time
    const next = page()+1
    if (next*pagesize() > props.jobs().length) {
      return props.jobs().slice(page()*pagesize(), props.jobs().length)
    }
    return props.jobs().slice(page()*pagesize(), next*pagesize())
  }
  createEffect(() => {
    // effect runs when jobs changes as a result of applying filters
    // we access jobs() here in the tracking scope to ensure it's subscribed,
    // but all we want is to reset the page back to 0 if someone has paged through results
    // and then applies more filters
    console.log('jobs changed', props.jobs()?.length)
    setPage(0)
  })
  
  return (
    <>
    <style>{style}</style>
    <Show when={props.jobs().length > 0} fallback={<div id="joblist"><h3>No jobs match your search</h3></div>}>
    <div id="joblist" ref={el => ref=el} class="usa-prose" role="list" aria-live="assertive" aria-atomic="true">
      <Show when={!props.featured}>
        <div class="page-size">
          <div>
            <h3>Found {props.jobs().length} jobs</h3>
          </div>
          <div>
            <form action="">
              <label for="jobs-per-page">Jobs per page </label>
              <select id="jobs-per-page" aria-label="jobs per page" onchange={(ev) => { setPagesize(parseInt(ev.target.value)); setPage(0); }} style={{"padding": "0.3rem"}}>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="100000">All</option>
              </select>
            </form>
          </div>
        </div>
      </Show>
      <For each={paginatedJobs()}>{(job) =>
        <div class="job-item" role="listitem">
          <div class={ref?.offsetWidth <= 800 ? "title-container--small" :"title-container"}>
            <div class="title"><a onclick={() => {doMetrics(props.featured, job.VacancyID, job.OrganizationID); return false;}} target="_blank" href={job.VacancyDetailURL}>{job.VacancyTitle}{job.VacancyLevel && <span> ({job.VacancyLevel})</span>}</a></div>
            <Show when={job.VacancyDeadline}>
              <div class="closes">Closes {job.VacancyDeadline}</div>
            </Show>
          </div>
          <div class={ref?.offsetWidth <= 800 ? "job-details--small" : "job-details"}>
            <Show when={orgs[job.OrganizationAcronym]} fallback={<div>🏛 {job.OrganizationAcronym}</div>}>
                <div>🏛 {orgs[job.OrganizationAcronym]} ({job.OrganizationAcronym})</div>
            </Show>
            <Show when={job.VacancyLocation}>
                <div class={ref?.offsetWidth <= 800 ? "dot--small" : "dot"}> • </div>
                <div class="location">📍{job.VacancyLocation.toLowerCase()}</div>
            </Show>
          </div>
        </div>
      }
      </For>
    </div>
    <div id="pagination">
      <div>
          <button onclick={() => { setPage(p => p-1); ref.scrollIntoView() }} disabled={page() === 0}>« Previous</button>
          <span style={{margin: '2rem'}}>{page()*pagesize()+1} - {Math.min((page()+1)*pagesize(), props.jobs().length)} of {props.jobs().length}</span>
          <button onclick={() => { setPage(p => p+1); ref.scrollIntoView() }} disabled={page() === total()-1}>Next »</button>
      </div>
    </div>
    </Show>
    </>
  ) 
}

// job list metrics endpoint
const doMetrics = async (featured: boolean, vacancyID: number, orgID: number) => {
  const visitType = featured ? 1 : 2
  fetch('/Main/Jobs/UserClickedOnJobLink', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({"visitTypeID": visitType, "vacancyID": vacancyID, "organizationID": orgID, "userID": 0})
  })
}

// intake metrics endpoint, add to global window object to call directly from HTML source
// typeID differentiates clicks for:
// 4 - Apply for advocacy
// 5 - Join Talent Network
// 6 - Other Opportunities (oversight roles)
const sendIntakeMetric = async (typeID: number) => {
  fetch('/Main/Home/LogUsage', {
    method: 'POST',
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({"usageTypeID": typeID, "userID": 0})
  })
}

const doIntakeMetric = (typeID: number): boolean => {
  sendIntakeMetric(typeID)
  // return false in the onclick handler so that the normal function of the anchor link takes over
  // target must be _blank to allow this send to happen in the background while the browser navigates
  return false
}
declare global {
    interface Window { doIntakeMetric: (typeID: number) => void; }
}
window.doIntakeMetric = doIntakeMetric;
