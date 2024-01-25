import { createEffect, createSignal, For, Show } from 'solid-js';

type Props = {
    primary: "h1" | "h2" | "h3" | "h1, h2",
    secondary: "h2" | "h3" | "h4"
}

export default function PageNav(props: Props) {
    const [primary, setPrimary] = createSignal<HTMLElement[]>([])
    const [secondary, setSecondary] = createSignal<HTMLElement[]>([])
    createEffect(async () => {
        await new Promise(r => setTimeout(r, 5000));
        setPrimary(Array.from(document.querySelectorAll(props.primary)) as HTMLElement[])
        setSecondary(Array.from(document.querySelectorAll(props.secondary)) as HTMLElement[])
    })
    
    const sortedSecondary = () => {

        const position = (elem) => {
                let top = 0; 
            
                do { 
                    top += elem.offsetTop-elem.scrollTop; 
                } while ( elem = elem.offsetParent ); 
            
                return top 
        }
        const sorted = secondary().sort((a,b) => Math.sign(position(a)-position(b)))
        const withParents = sorted.map(s => {
            for (let i = 0; i < primary().length-1; i++) {
                console.log(s.innerText, position(s), primary()[i].innerText, position(primary()[i]), primary()[i+1].innerText)    
                if (position(s) > position(primary()[i]) && position(s) < position(primary()[i+1])) {
                    return {
                        element: s,
                        parent: primary()[i]
                    }
                }
            }
            return {
                element: s,
                parent: primary()[primary().length - 1]
            }
        })
        console.log(withParents.map(s => `${s.element.innerText} with parent ${s.parent.innerText}`))
        return withParents
    }

    return (
        <>
        <style>{style}</style>
        <aside>
            <nav aria-label="On this page">
                <ul>
                    <For each={primary()}>{(p: HTMLElement) =>
                        <>
                        <li class="">{p.innerText}</li>
                        <For each={sortedSecondary()}>{(s) => 
                            <Show when={s.parent === p}>
                                <li>{s.element.innerText}</li>    
                            </Show>
                        } 
                        </For>
                        </>
                    }
                    </For>
                </ul>
            </nav>
        </aside>
        </>
    )
}

const style = `

`