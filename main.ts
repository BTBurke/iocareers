import './assets/css/uswds.css';
import '@uswds/uswds';
import './index.css';
import JobSearch from './src/JobSearch.tsx'
import PageNav from './src/pagenav.tsx';
import { customElement } from "solid-element";

customElement("job-search", {search: '', featured: ''}, JobSearch);
customElement("page-nav", {primary: "h1, h2", secondary: "h3"}, PageNav);

