import { createSignal, For, Show } from 'solid-js'
import type { Accessor } from 'solid-js'
import type { Job } from './JobSearch.tsx'
import * as orgs from './orgs.json'

const style = `
#joblist {
  padding: 1rem 1rem 1rem 1rem;
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

.closes {
  flex-shrink: 0;
}

.title > a {
  color: rgb(0, 94, 162);
}

.featured {
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

#pagination {
  width: 100%;
  display: flex;
  justify-content: center;
}

#pagination > div {
  width: auto;
  margin: 0 auto;
}
`

type Props = {
  jobs: Accessor<Job[]>
}

export function JobList(props: Props) {
  let ref: HTMLElement
  const PAGE_SIZE = 25
  const total = () => {
    return Math.ceil(props.jobs().length / PAGE_SIZE)
  }
  const [page, setPage] = createSignal(0)
  const paginatedJobs = () => {
    const next = page()+1
    if (next*PAGE_SIZE > props.jobs().length) {
      return props.jobs().slice(page()*PAGE_SIZE, props.jobs().length)
    }
    return props.jobs().slice(page()*PAGE_SIZE, next*PAGE_SIZE)
  }
  return (
    <>
    <style>{style}</style>
    <div id="joblist" ref={el => ref=el} class="usa-prose">
      <For each={paginatedJobs()}>{(job) =>
        <div class="job-item">
          <div class="title-container">
            <div class="title"><a href={job.VacancyDetailURL}>{job.VacancyTitle}</a></div>
            <Show when={job.VacancyDeadline}>
              <div class="featured closes">Closes {job.VacancyDeadline}</div>
            </Show>
          </div>
          <div class="">
            <Show when={orgs[job.OrganizationAcronym]} fallback={<span>{job.OrganizationAcronym}</span>}>
                <span>{orgs[job.OrganizationAcronym]} ({job.OrganizationAcronym})</span>
            </Show>
            <Show when={job.VacancyLocation} fallback={<span style={{'font-size': '1.5rem'}}> </span>}>
                <span style={{'padding': '0 0.5rem 0 0.5rem', 'font-size': '1.5rem'}}> • </span>
                <span class="location">{job.VacancyLocation.toLowerCase()}</span>
            </Show>
          </div>
        </div>
      }
      </For>
    </div>
    <div id="pagination">
      <div>
        <button onclick={() => { setPage(page()-1); ref.scrollIntoView() }} disabled={page() === 0}>Previous page</button>
        <span style={{margin: '2rem'}}>{page()*PAGE_SIZE+1} - {(page()+1)*PAGE_SIZE} of {props.jobs().length}</span>
        <button onclick={() => { setPage(page()+1); ref.scrollIntoView() }} disabled={page() === total()}>Next page</button>
      </div>
    </div>
    </>
  ) 
}
