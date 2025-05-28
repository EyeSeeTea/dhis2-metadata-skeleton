import styled from 'styled-components';

//Each "box" that will contain the JSON data

const JsonContainer = styled.div`
  flex: 1;
  margin: 1rem;
  padding: 1rem;
  background-color: #fafafa;
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: auto;
  min-height: 300px;
  max-height: 500px;
  white-space: pre-wrap;
  word-break: break-word;
  font-family: monospace;
`;

export default JsonContainer;