import { Show, For, Accessor } from 'solid-js'

type AddFilter = (string) => void
type RmFilter = (string) => () => void

type Props = {
    title?: string,
    class?: string,
    opts: Accessor<string[]>,
    filteredOpts: Accessor<string[]>,
    rmOpt: RmFilter,
    addOpt: AddFilter,
    optFilter: Accessor<string[]>
}

const onChange = (id: string, add: AddFilter, remove: RmFilter) => (ev: Event) => {
    const el = ev.target as HTMLFormElement
    if (el.checked) {
        console.log('got add')
        add(id)
    } else {
        console.log('got remove')
        remove(id)()
    }
} 

export default function AllFilters(props: Props) {
    return (
        <>
        <style>{style}</style>
        <form action="" class={props.class}>
            <fieldset>
            <Show when={props.title}><legend>{props.title}</legend></Show>
            <For each={props.filteredOpts().length > 0 ? props.filteredOpts() : props.opts()}>{(opt) =>
            <div class="checkbox-item">
                <label for={opt}>
                    <input type="checkbox" id={opt} onclick={onChange(opt, props.addOpt, props.rmOpt)} checked={props.optFilter().includes(opt)}></input>
                    {opt}
                </label>
            <br/>
            </div>
            }
            </For>
            </fieldset>
        </form>
        </>
    )
}

const style = `
    fieldset {
        border: 0;
    }
    fieldset > legend {
        font-weight: 700;
    }
    .checkbox-item {
        margin: 0.2rem 0;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: no-wrap;
        width: 100%;
    }
    .checkbox-item > label {
        white-space: nowrap;
    }
`