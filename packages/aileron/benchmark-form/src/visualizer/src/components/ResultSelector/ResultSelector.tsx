import { useEffect, useState } from 'react';

import styles from './ResultSelector.module.css';

interface ResultSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export function ResultSelector({ value, onChange }: ResultSelectorProps) {
  const [files, setFiles] = useState<string[]>([]);

  useEffect(() => {
    // results 디렉토리의 파일 목록을 가져옴
    fetch('/api/results')
      .then((res) => res.json())
      .then((data) => setFiles(data))
      .catch(console.error);
  }, []);

  return (
    <select
      className={styles.selector}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">결과 파일을 선택하세요</option>
      {files.map((file) => (
        <option key={file} value={file}>
          {file}
        </option>
      ))}
    </select>
  );
}
