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
`

type Props = {
  jobs: Accessor<Job[]>
}

export function JobList(props: Props) {
  // ref holds the root node for the jobs list. It's used for two purposes: 
  // - to scroll to the top of the list when the page changes
  // - to measure the offsetWidth of the parent containing element. This is used to adapt the display to small screen sizes
  //   when it's just one element in a multi-column page layout on larger screens.
  let ref: HTMLElement

  // pagination
  const PAGE_SIZE = 25 // number of jobs per page
  const total = () => {
    return Math.ceil(props.jobs().length / PAGE_SIZE) // total pages
  }
  const [page, setPage] = createSignal(0)
  const paginatedJobs = () => {
    // returns PAGE_SIZE # of jobs at a time
    const next = page()+1
    if (next*PAGE_SIZE > props.jobs().length) {
      return props.jobs().slice(page()*PAGE_SIZE, props.jobs().length)
    }
    return props.jobs().slice(page()*PAGE_SIZE, next*PAGE_SIZE)
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
      <For each={paginatedJobs()}>{(job) =>
        <div class="job-item" role="listitem">
          <div class={ref?.offsetWidth <= 800 ? "title-container--small" :"title-container"}>
            <div class="title"><a onclick={() => {doMetrics(1, job.VacancyID, job.OrganizationID); return false;}} target="_blank" href={job.VacancyDetailURL}>{job.VacancyTitle}{job.VacancyLevel && <span> ({job.VacancyLevel})</span>}</a></div>
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
          <span style={{margin: '2rem'}}>{page()*PAGE_SIZE+1} - {Math.min((page()+1)*PAGE_SIZE, props.jobs().length)} of {props.jobs().length}</span>
          <button onclick={() => { setPage(p => p+1); ref.scrollIntoView() }} disabled={page() === total()-1}>Next »</button>
      </div>
    </div>
    </Show>
    </>
  ) 
}

const doMetrics = async (visitType: number, vacancyID: number, orgID: number) => {
  fetch('/Main/Jobs/UserClickedOnJobLink', {
    method: 'POST',
    body: JSON.stringify({"visitTypeID": visitType, "vacancyID": vacancyID, "orgID": orgID, "userID": 0})
  })
}
