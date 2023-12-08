/* eslint-disable id-length */

import fs from 'node:fs';
import path from 'node:path';
import url from 'node:url';

type ReadDataFn = (opts: {
  importUrl: string;
  useTestData: boolean;
}) => string[];

export const readData: ReadDataFn = ({ importUrl, useTestData }) => {
  const sourceFilename = url.fileURLToPath(importUrl);
  const sourceDirName = path.dirname(sourceFilename);
  const dataFilename = useTestData ? 'test-data.txt' : 'data.txt';
  const dataPath = path.join(sourceDirName, dataFilename);

  const untypedData = fs.readFileSync(dataPath, 'utf8');
  const data = untypedData as string;

  return data.split('\n');
};
