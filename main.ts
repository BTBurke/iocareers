import './assets/css/uswds.css';
import '@uswds/uswds';
import './index.css';
import JobSearch from './src/JobSearch.tsx'
import { customElement } from "solid-element";

customElement("job-search", {search: '', featured: ''}, JobSearch)

