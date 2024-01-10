import { createSignal, createEffect, For, Show } from 'solid-js'
import type { Setter, Accessor } from 'solid-js'
import type { Filter, Job } from './JobSearch.tsx'
import { filterExact, filterAny } from './JobSearch.tsx'


type Props = {
  jobs: Accessor<Job[]>
  setFilters: Setter<Map<string,Filter>>
  initialSearch: string | undefined
}

export default function FilterList(props: Props) {
  const [locFilter, setLocFilter] = createSignal<string[]>([])
  const [orgFilter, setOrgFilter] = createSignal<string[]>([])
  const [occFilter, setOccFilter] = createSignal<string[]>([])
  const [lvlFilter, setLvlFilter] = createSignal<string[]>([])
  const [search, setSearch] = createSignal<string>(props.initialSearch ?? '')
  const [value, setValue] = createSignal<string | null | undefined>()
  const orgs: () => string[] = () => {
    return [...new Set(props.jobs()?.map((job) => {return job.OrganizationAcronym})).values()]
  }
  const locs: () => string[] = () => {
    return [...new Set(props.jobs()?.map((job) => { return job.VacancyLocation })).values()]
  }
  const occs: () => string[] = () => {
    return [...new Set(props.jobs()?.map((job) => { return job.VacancyOccupation })).values()].filter(occ => occ !== null)
  }
  const lvls: () => string[] = () => {
    return [...new Set(props.jobs()?.map((job) => { return job.VacancyLevel })).values()].filter(lvl => lvl !== null)
  }
  const filteredOrgs = () => value() ? orgs().filter(org => org.toLowerCase().includes(value().toLowerCase())) : []
  const filteredLocs = () => value() ? locs().filter(loc => loc.toLowerCase().includes(value().toLowerCase())) : []
  const filteredOccs = () => value() ? occs().filter(occ => occ.toLowerCase().includes(value().toLowerCase())) : []
  const filteredLvls = () => value() ? lvls().filter(lvl => lvl.toLowerCase().includes(value().toLowerCase())) : []
  
  createEffect(() => {
    props.setFilters((prev) => {      
      const m = new Map(prev)
      if (locFilter().length > 0) {
        m.set('location', filterExact('VacancyLocation', locFilter()))
      } else { 
        m.delete('location') 
      }
      if (orgFilter().length > 0) {
        m.set('organization', filterExact('OrganizationAcronym', orgFilter()))
      } else {
        m.delete('organization')
      }
      if (occFilter().length > 0) {
        m.set('occupation', filterExact('VacancyOccupation', occFilter()))
      } else {
        m.delete('occupation')
      }
      if (lvlFilter().length > 0) {
        m.set('level', filterExact('VacancyLevel', lvlFilter()))
      } else {
        m.delete('level')
      }
      if (search().length > 0) {
        m.set('search', filterAny(search()))
      } else {
        m.delete('search')
      }
      return m
    })
  })
  createEffect(() => {
    // auto submit the form if you click into the datalist and select a completion
    if (isQuickClick(value())) {
      inputRef.blur()
      onSubmit(null)
    }
  })
  const addLoc = (loc: string) => setLocFilter([...locFilter(), loc])
  const rmLoc = (loc: string) => () => setLocFilter(locFilter().filter(l => l !== loc))
  const addOrg = (org: string) => setOrgFilter([...orgFilter(), org])
  const rmOrg = (org: string) => () => setOrgFilter(orgFilter().filter(o => o !== org))
  const addOcc = (occ: string) => setOccFilter([...occFilter(), occ])
  const rmOcc = (occ: string) => () => setOccFilter(occFilter().filter(l => l !== occ))
  const addLvl = (lvl: string) => setLvlFilter([...lvlFilter(), lvl])
  const rmLvl = (lvl: string) => () => setLvlFilter(lvlFilter().filter(l => l !== lvl))
  
  const onSubmit = (ev: SubmitEvent | null) => {
    ev?.preventDefault()

    const keyword = value()?.split(':')[0]
    const getValue = (): string => value()?.split(':')[1] as string

    console.log('value', value())
    console.log(value()?.split(':'))
    if (keyword.includes('Location')) {
      addLoc(getValue())
      setValue('')
    }
    if (keyword.includes('Organization')) {
      addOrg(getValue())
      setValue('')
    }
    if (keyword.includes('Category')) {
      console.log('got occupation', getValue())
      addOcc(getValue())
      setValue('')
    }
    if (keyword.includes('Level')) {
      console.log('got level', getValue())
      addLvl(getValue())
      setValue('')
    }
    if (value()?.length > 0) {
      if (keyword === "Search") {
        setSearch(getValue())
      } else {
        setSearch(value() as string)
      }
    }
    formRef.reset()
    setValue('')
  }
  let formRef: HTMLFormElement
  let inputRef: HTMLInputElement
  return (
    <>
      <style>{style}</style>
      <div id="filter-list">
      <form ref={el => formRef=el} onsubmit={onSubmit}>
        <input ref={el => inputRef=el} type="search" autocapitalize="off" autocomplete="off" name="filter" oninput={(v) => setValue(v.target.value)} list="filters"/>
        <button type="submit">Search</button> 
        <datalist id="filters">
          <Show when={!isQuickClick(value()) && value()?.length > 0}>
            <option value={`Search:${value()}`}>Position contains "{value()}"</option>
          </Show>
          <For each={filteredOrgs()}>{(org) =>
             <option value={`Job with Organization:${org}`}></option>
          }
          </For>
          <For each={filteredLocs()}>{(loc) =>
            <option value={`Job is in Location:${loc}`}></option>
          }
          </For>
          <For each={filteredOccs()}>{(occ) =>
            <option value={`Job is in Occupational Category:${occ}`}></option>
          }
          </For>
          <For each={filteredLvls()}>{(lvl) =>
            <option value={`Job is at Grade Level:${lvl}`}></option>
          }
          </For>
        </datalist>
      </form>
      </div>
      <Show when={locFilter().length > 0 || orgFilter().length > 0 || search().length > 0 || occFilter().length > 0 || lvlFilter().length > 0 } fallback={<div style={{height: '2rem', padding: '0.5rem 0'}}><em>Start typing the name of an organization, city, country, or keyword to filter the jobs list.</em></div>}>
        <div id="appliedfilters">
          <div>Filters:</div>
          <For each={locFilter()}>{(loc) => 
            <div class="filter-chip">📍{loc}<button onclick={rmLoc(loc)} title={`Remove ${loc} filter`}>✕</button></div>
          }
          </For>
          <For each={orgFilter()}>{(org) =>
            <div class="filter-chip">🏛 {org}<button onclick={rmOrg(org)} title={`Remove ${org} filter`}>✕</button></div>
          }
          </For>
          <For each={occFilter()}>{(occ) =>
            <div class="filter-chip">👤{occ}<button onclick={rmOcc(occ)} title={`Remove ${occ} filter`}>✕</button></div>
          }
          </For>
          <For each={lvlFilter()}>{(lvl) =>
            <div class="filter-chip">⇑{lvl}<button onclick={rmLvl(lvl)} title={`Remove ${lvl} filter`}>✕</button></div>
          }
          </For>
          <Show when={search()}>
            <div class="filter-chip">Position contains "{search()}"<button onclick={() => setSearch('')} title={`Remove search string ${search()}`}>✕</button></div>
          </Show>
        </div>
      </Show>
    </>
  )
}

const isQuickClick = (value: string | null | undefined): boolean => {
  const keyword = value?.split(':')[0]
  return keyword?.includes('Organization')
  || keyword?.includes('Category')
  || keyword?.includes('Search')
  || keyword?.includes('Location')
  || keyword?.includes ('Level')
} 

const style = `
#appliedfilters {
  padding: 1rem 0;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  transition: height 5s easeOutQuart 0;
  width: 100%;
}

#filter-list > form {
  width: 100%;
}

#filter-list > form > input {
  appearance: none;
  border: 2px solid rgb(92, 92, 92);
  border-right: 0;
  height: 3rem;
  font-size: 1.1rem;
  margin: 0;
  max-width: 480px;
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
  min-width: 50%;
}


#filter-list > form > button[type="submit"] {
  background-color: rgb(0, 94, 162);
  font-size: 1.1rem;
  line-height: 1.1rem;
  height: 3rem;
  padding: 0 1rem;
  color: #FFFFFF;
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}

#filter-list > form > input:focus {
  outline-color: rgb(36, 145, 255);
  outline-width: 4px;
  padding: 0 8px;
  color: rgb(27, 27, 27);
  
}

.filter-chip {
  background: #e6e6e6;
  border-radius: 0.25rem;
  padding-left: 0.5rem;
  flex-shrink: 0;
}

.filter-chip > button {
  margin-left: 0.1rem;
  background-color: transparent;
  box-shadow: none;
  color: rgb(27, 27, 27);
  appearance: none;
  border: 0;
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
  cursor: pointer;
  display: inline-block;
  font-weight: 400;
  padding: 0.5rem 0.5rem;
  text-align: center;
  text-decoration: none;
}
`
