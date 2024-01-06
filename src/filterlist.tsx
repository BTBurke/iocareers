import { createSignal, createEffect, For, Show } from 'solid-js'
import type { Setter } from 'solid-js'
import type { Filter } from './JobSearch.tsx'
import { filterExact, filterTitle } from './JobSearch.tsx'


type Props = {
  orgs: string[],
  locs: string[],
  setFilters: Setter<Map<string,Filter>>
  initialSearch: string | undefined
}

export default function FilterList(props: Props) {
  const [locFilter, setLocFilter] = createSignal<string[]>([])
  const [orgFilter, setOrgFilter] = createSignal<string[]>([])
  const [search, setSearch] = createSignal<string>(props.initialSearch ?? '')
  const [value, setValue] = createSignal<string | null | undefined>()
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
      if (search().length > 0) {
        m.set('search', filterTitle(search()))
      } else {
        m.delete('search')
      }
      return m
    })
  })
  createEffect(() => {
    // auto submit the form if you click into the datalist and select a completion
    if (value()?.slice(0,4) === "loc:" || value()?.slice(0,4) === "org:") {
      inputRef.blur()
      onSubmit(null)
    }
  })
  const addLoc = (loc: string) => setLocFilter([...locFilter(), loc])
  const rmLoc = (loc: string) => () => setLocFilter(locFilter().filter(l => l !== loc))
  const addOrg = (org: string) => setOrgFilter([...orgFilter(), org])
  const rmOrg = (org: string) => () => setOrgFilter(orgFilter().filter(o => o !== org))
  const onSubmit = (ev: SubmitEvent | null) => {
    ev?.preventDefault()
    console.log('value', value())

    if (value()?.slice(0,4) === 'loc:') {
      addLoc(value()?.slice(4) as string)
      setValue('')
    }
    if (value()?.slice(0,4) === 'org:') {
      addOrg(value()?.slice(4) as string)
      setValue('')
    }
    if (value()?.length > 0) {
      setSearch(value() as string)
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
          <Show when={value()?.slice(0,4) !== 'org:' && value()?.slice(0,4) !== 'loc:' && value()?.length > 0}>
            <option value={value() as string}>Position contains "{value()}"</option>
          </Show>
          <For each={props.orgs}>{(org) =>
             <option value={`org:${org}`}>Job is with 🏛 {org}</option>
          }
          </For>
          <For each={props.locs}>{(loc) =>
            <option value={`loc:${loc}`}>Located in 📍 {loc}</option>
          }
          </For>
        </datalist>
      </form>
      </div>
      <Show when={locFilter().length > 0 || orgFilter().length > 0 || search().length > 0 } fallback={<div style={{height: '2rem', padding: '0.5rem 0'}}><em>Start typing the name of an organization, city, country, or keyword to filter the jobs list.</em></div>}>
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
          <Show when={search()}>
            <div class="filter-chip">Position contains "{search()}"<button onclick={() => setSearch('')} title={`Remove search string ${search()}`}>✕</button></div>
          </Show>
        </div>
      </Show>
    </>
  )
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
