import './node_modules/@uswds/uswds/dist/css/uswds.min.css';
import '@uswds/uswds';
import './index.css';
import JobSearch from './src/JobSearch.tsx'
import { customElement } from "solid-element";

customElement("job-search", {search: '', featured: ''}, JobSearch)

