import { css } from 'lit';

// these styles can be imported from any component
// for an example of how to use this, check /pages/about-about.ts
export const styles = css`
  @media(min-width: 1000px) {
    sl-card {
      max-width: 70vw;
    }
  }

  main {
    padding-top: 60px;
  }

  fluent-button::part(control) {
    border: none;
  }

  fluent-tab-panel {
    margin-top: 16px;
  }
`;