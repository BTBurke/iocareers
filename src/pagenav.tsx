import { createEffect, createSignal, For } from 'solid-js';

type Props = {
    primary: "h1" | "h2" | "h3" | "h1, h2",
    secondary: "h2" | "h3" | "h4"
}

export default function PageNav(props: Props) {
    const [landmarks] = createSignal<Landmark[]>(getInitialLandmarks(props.primary, props.secondary))
    const [intersecting, setIntersecting] = createSignal<Map<HTMLElement, boolean>>(new Map())
    const [hold, setHold] = createSignal<HTMLElement>()
    createEffect(() => {
        let options = {
            root: null,
            rootMargin: "0px",
            threshold: 1.0,
        }
    
        const callback = (entries) => {
            entries.forEach((entry) => {
                setIntersecting(prev => {
                    const m = new Map(prev)
                    if (entry.isIntersecting) {
                        setHold(null)
                        m.set(entry.target, true)
                    } else {
                        // if this is the only thing left that was on the screen,
                        // hold it until a new one appears
                        if (m.size === 1) {
                            setHold(entry.target)
                        }
                        m.delete(entry.target)
                    }
                    return m
                })
            })
        }
        const observer = new IntersectionObserver(callback, options);
        landmarks().forEach(l => observer.observe(l.element))
    })

    return (
        <>
        <style>{style}</style>
        <aside class="in-page-nav">
            <nav aria-label="On this page" class="in-page__nav">
                <h1>On this page</h1>
                <ul>
                    <For each={landmarks()}>{(e: Landmark) =>
                        <li classList={{primary: e.type === 'primary', secondary: e.type === 'secondary', current: intersecting().get(e.element) || hold() === e.element}}>
                            <a onclick={() => { window.scrollTo(0,0); window.scrollTo(0, e.element.getBoundingClientRect().top-15); return false;}}>{e.element.innerText}</a>
                        </li>
                    }
                    </For>
                </ul>
            </nav>
        </aside>
        </>
    )
}

type Landmark = {
    type: "primary" | "secondary",
    element: HTMLElement,
    position: number
}

function getInitialLandmarks(primary: string, secondary: string): Landmark[] {
    const p = (Array.from(document.querySelectorAll(primary)) as HTMLElement[]).map(e => Object.assign({}, {type: "primary", element: e, position: position(e)}))
    const s  = (Array.from(document.querySelectorAll(secondary)) as HTMLElement[]).map(e => Object.assign({}, {type: "secondary", element: e, position: position(e)}))
    return p.concat(s).sort((a,b) => Math.sign(a.position-b.position)) as Landmark[]
}

const position = (elem) => {
    let top = 0; 
    do { 
        top += elem.offsetTop-elem.scrollTop; 
    } while ( elem = elem.offsetParent ); 
    return top 
}

const style = `

.in-page__nav {
    background-color rgb(255, 255, 255);
    border-radius 8px;
    box-sizing: border-box;
    color: rgb(27, 27, 27);
    display: block;
    font-family: "Source Sans Pro Web", "Helvetica Neue", Helvetica, Roboto, Arial, sans-serif;
    line-height 1.15rem;
}

.primary {
    font-weight: 700;
    color: #1a4480;
    padding: 0.5rem 1rem;
    text-decoration: none;
}

.secondary {
    color: #005ea2;
    padding: 0.5rem 1rem;
    text-decoration: none;
}

nav > h1 {
    font-size: 0.9rem;
    font-weight: 700;
    margin-bottom: 1rem;
    margin-block-end: 1rem;
}

nav > ul {
    border-left: 1px solid rgba(27, 27, 27, 0.25);
    list-style-type: none;
    font-size: 0.93rem;
    padding: 0;
}

nav > ul > li {
    cursor: pointer;
}

.current {
    border-left: 0.25rem solid #1b1b1b;
    margin-left: 0;
}
:not(.current) {
    margin-left: 0.25rem;
}
`