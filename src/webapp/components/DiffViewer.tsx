import styled from "styled-components";

export const StyledDiffContainer = styled.div`
  font-family: monospace;
  font-size: 14px;
  line-height: 1.4;
  white-space: pre-wrap;
  word-wrap: break-word;
  max-height: 400px;
  overflow: auto;

  .jsondiffpatch-delta {
    padding: 1rem;
    background-color: #f9f9f9;
    border-radius: 8px;
    border: 1px solid #ccc;
  }

  .jsondiffpatch-property-name {
    font-weight: bold;
  }

  .jsondiffpatch-value {
    font-family: monospace;
  }

  .jsondiffpatch-added {
    background: #e6ffed;
    color: #22863a;
    text-decoration: underline;
  }

  .jsondiffpatch-deleted {
    background: #ffeef0;
    color: #b31d28;
    text-decoration: line-through;
  }

  .jsondiffpatch-modified {
    background: #fff5b1;
    color: #b08800;
  }

  .jsondiffpatch-movedestination {
    background: #f0f0ff;
  }

  .jsondiffpatch-unchanged {
    color: #aaa;
  }

  .jsondiffpatch-textdiff-added {
    background-color: #acf2bd;
  }

  .jsondiffpatch-textdiff-deleted {
    background-color: #fdb8c0;
  }
`;
